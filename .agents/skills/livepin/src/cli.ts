#!/usr/bin/env node
/**
 * livepin command line entry point.
 *
 * Two audiences share one binary. `start` is run by a human (or by an agent on
 * the human's behalf) and stays in the foreground holding the proxy open. The
 * other verbs are run by the agent, once per turn, and talk to that proxy over
 * loopback — they are short-lived processes, which is why the session lives on
 * disk and the delivery cursor is durable.
 */

import { realpathSync } from "node:fs";
import type { Server } from "node:http";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { CLIENT_TIMEOUT_MARGIN_MS, loadPointer, requestJson } from "./agent-client.js";
import { AgentChannel, DEFAULT_POLL_TIMEOUT_MS } from "./channel.js";
import { compileConfig, loadConfig } from "./config.js";
import { NetworkLog } from "./network-log.js";
import { openInBrowser } from "./open-browser.js";
import { createProxyServer } from "./proxy.js";
import { Session } from "./session.js";
import { installSkill, readSkill } from "./skill.js";
import { persistSession, SessionStore, type Persistence } from "./store.js";
import type { PollResult, SessionState } from "./types.js";

/** Default port the proxy binds when `--port` is not given. */
export const DEFAULT_PORT = 4850;

/** Parsed form of a `livepin start` invocation. */
export interface StartOptions {
  target: string;
  port: number;
  host: string;
  /** Path the browser is opened at, e.g. `/patients/1182`. */
  openPath: string;
  /** Whether to open a browser at all. */
  open: boolean;
  /** Discard any stored session and begin a new one. */
  fresh: boolean;
  /** Continue a session the human had ended. */
  reopen: boolean;
  /** Host project directory, holding `.livepin/`. */
  dir: string;
}

/** Parsed form of an agent-facing verb. */
export interface AgentOptions {
  /** Thread to speak in. The global chat when omitted. */
  thread: string | undefined;
  /** Message posted before a poll blocks. */
  agentReply: string | undefined;
  /** How long the poll blocks, in milliseconds. */
  timeoutMs: number;
  /** Host project directory, holding `.livepin/`. */
  dir: string;
  /** Positional arguments, e.g. the message for `say`. */
  words: string[];
}

/** Everything `runStart` built, so callers can inspect and shut it down. */
export interface StartedProxy {
  server: Server;
  session: Session;
  channel: AgentChannel;
  store: SessionStore;
  persistence: Persistence;
  /** URL the review was opened at. */
  reviewUrl: string;
  /** Flush state, mark the pointer stopped, and close the port. */
  shutdown: () => Promise<void>;
}

const USAGE = `livepin — annotate a live dev server and loop a coding agent into the feedback

Usage
  livepin start --target <url> [options]
  livepin poll [--agent-reply <msg>] [--thread <id>] [--timeout <seconds>]
  livepin say <msg> [--thread <id>]
  livepin state
  livepin end
  livepin skill install [--dir <path>]

start options
  --target <url>    Dev server to proxy (required), e.g. http://localhost:3000
  --port <n>        Port for the proxy            (default: ${DEFAULT_PORT})
  --host <addr>     Address to bind               (default: 127.0.0.1)
  --open <path>     Path to open in the browser   (default: /)
  --no-open         Do not open a browser
  --fresh           Ignore any stored session and start a new one
  --reopen          Continue a session the human ended
  -h, --help        Show this help

poll options
  --agent-reply <m> Post this message, then wait for the human
  --thread <id>     Thread the reply belongs in   (default: the global chat)
  --timeout <s>     Seconds to block              (default: ${DEFAULT_POLL_TIMEOUT_MS / 1000})

poll blocks in the foreground until the human comments, resolves a thread, or
ends the session. Its output is JSON. Nothing it reports is lost if it is
killed — the next poll returns the same items.

skill
  install [--dir <path>]  Write SKILL.md where Claude Code finds it (default: .)
  print                   Write it to stdout, for any other agent
`;

/**
 * Turn argv into {@link StartOptions}.
 *
 * @param argv - Arguments after the subcommand.
 * @returns Normalised options.
 * @throws If `--target` is missing or `--port` is not a valid port number.
 */
export function parseStartArgs(argv: string[]): StartOptions {
  const { values } = parseArgs({
    args: argv,
    options: {
      target: { type: "string" },
      port: { type: "string" },
      host: { type: "string" },
      open: { type: "string" },
      "no-open": { type: "boolean" },
      fresh: { type: "boolean" },
      reopen: { type: "boolean" },
    },
    strict: true,
  });

  if (!values.target) {
    throw new Error("--target is required, e.g. --target http://localhost:3000");
  }

  // Reject a malformed target here rather than letting it surface later as an
  // opaque failure on the first proxied request.
  let target: URL;
  try {
    target = new URL(values.target);
  } catch {
    throw new Error(`--target is not a valid URL: ${values.target}`);
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    throw new Error(`--target must be http or https, got ${target.protocol}`);
  }

  // Number("") is 0, so an empty --port would silently mean "any free port".
  // Reject it; an explicit --port 0 still works and is what tests use.
  const rawPort = values.port?.trim();
  const port = rawPort === undefined ? DEFAULT_PORT : rawPort === "" ? NaN : Number(rawPort);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`--port must be an integer between 0 and 65535, got "${values.port}"`);
  }

  const openPath = values.open ?? "/";

  return {
    target: target.origin,
    port,
    host: values.host ?? "127.0.0.1",
    openPath: openPath.startsWith("/") ? openPath : `/${openPath}`,
    open: values["no-open"] !== true,
    fresh: values.fresh === true,
    reopen: values.reopen === true,
    dir: process.cwd(),
  };
}

/**
 * Turn argv into {@link AgentOptions}.
 *
 * @param argv - Arguments after the subcommand.
 * @returns Normalised options.
 * @throws If `--timeout` is not a positive number of seconds.
 */
export function parseAgentArgs(argv: string[]): AgentOptions {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      thread: { type: "string" },
      "agent-reply": { type: "string" },
      timeout: { type: "string" },
    },
    allowPositionals: true,
    strict: true,
  });

  const rawTimeout = values.timeout?.trim();
  const seconds = rawTimeout === undefined || rawTimeout === "" ? NaN : Number(rawTimeout);
  if (rawTimeout !== undefined && (!Number.isFinite(seconds) || seconds <= 0)) {
    throw new Error(`--timeout must be a positive number of seconds, got "${values.timeout}"`);
  }

  return {
    thread: values.thread,
    agentReply: values["agent-reply"],
    timeoutMs: Number.isFinite(seconds) ? seconds * 1000 : DEFAULT_POLL_TIMEOUT_MS,
    dir: process.cwd(),
    words: positionals,
  };
}

/** Outcome of {@link openSession}. */
interface OpenedSession {
  session: Session;
  channel: AgentChannel;
  resumed: boolean;
  /** Set when a stored session was left alone because it was for another app. */
  abandonedTarget?: string;
}

/**
 * Load the stored session for a project, or build a new one.
 *
 * @param store - Store rooted at the host project.
 * @param options - Start options, for `--target`, `--fresh` and `--reopen`.
 * @returns The session and the channel watching it.
 * @throws If the stored session was ended and neither flag was passed.
 */
async function openSession(
  store: SessionStore,
  options: Pick<StartOptions, "target" | "fresh" | "reopen">,
): Promise<OpenedSession> {
  const pointer = options.fresh ? null : await store.readPointer();

  // A review is anchored to the app it was made against — its pins name that
  // app's elements and routes. Carrying them to a different dev server would
  // orphan every one of them, so a changed target means a new review.
  if (pointer && pointer.target !== options.target) {
    const session = new Session();
    return {
      session,
      channel: new AgentChannel(session),
      resumed: false,
      abandonedTarget: pointer.target,
    };
  }

  const stored = pointer ? await store.readSession(pointer.sessionId) : null;

  if (!stored) {
    const session = new Session();
    return { session, channel: new AgentChannel(session), resumed: false };
  }

  const session = Session.restore(stored.session);

  if (session.isEnded) {
    // The human dismissing a review is a decision. Reviving it silently would
    // let an agent keep talking after being told to stop.
    if (!options.reopen) {
      throw new Error(
        `session ${session.id} was ended — pass --reopen to continue it, or --fresh to start a new one`,
      );
    }
    session.reopen();
  }

  return { session, channel: new AgentChannel(session, { queue: stored.queue }), resumed: true };
}

/**
 * Explain why the port could not be bound.
 *
 * A bare EADDRINUSE is unhelpful when the thing in the way is livepin itself —
 * which is the common case, since reopening or re-pointing a review means
 * replacing a proxy that is still running. Naming it turns a puzzle into an
 * instruction.
 *
 * @param store - Store rooted at the host project.
 * @param options - Start options, for the address that failed.
 * @param error - The listen error.
 * @returns The error to throw.
 */
async function describeListenFailure(
  store: SessionStore,
  options: StartOptions,
  error: unknown,
): Promise<Error> {
  const listenError = error as NodeJS.ErrnoException;
  if (listenError?.code !== "EADDRINUSE") {
    return error instanceof Error ? error : new Error(String(error));
  }

  const pointer = await store.readPointer();
  if (pointer?.running && pointer.host === options.host && pointer.port === options.port) {
    return new Error(
      `a livepin proxy is already running on ${options.host}:${options.port} ` +
        `for session ${pointer.sessionId} (pid ${pointer.pid}) — stop it first, ` +
        "or pass --port to run a second one alongside it",
    );
  }

  return new Error(
    `${options.host}:${options.port} is already in use by something else — pass --port`,
  );
}

/**
 * Start the proxy and, unless suppressed, open the review URL.
 *
 * @param options - Parsed start options.
 * @returns The running proxy and its parts.
 */
export async function runStart(options: StartOptions): Promise<StartedProxy> {
  const store = new SessionStore(options.dir);
  const { session, channel, resumed, abandonedTarget } = await openSession(store, options);

  // Load redaction rules before the port is open, so there is no window in which
  // the proxy is accepting captures it does not yet know how to clear.
  const config = compileConfig(await loadConfig(store.root));
  const networkLog = new NetworkLog();

  const server = createProxyServer({
    target: options.target,
    session,
    channel,
    // The directory holding `.livepin/` is also the root captured source paths
    // are reported relative to.
    projectRoot: store.root,
    config,
    networkLog,
  });

  try {
    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(options.port, options.host, resolve);
    });
  } catch (error) {
    throw await describeListenFailure(store, options, error);
  }

  const address = server.address();
  const boundPort = typeof address === "object" && address !== null ? address.port : options.port;
  const reviewUrl = `http://${options.host}:${boundPort}${options.openPath}`;

  await store.ensureIgnored();
  await store.writePointer({
    sessionId: session.id,
    host: options.host,
    port: boundPort,
    target: options.target,
    pid: process.pid,
    startedAt: new Date().toISOString(),
    running: true,
  });

  const persistence = persistSession({ store, session, channel });
  // Write once up front so `poll` in another process has a file to find even if
  // the human never touches the page.
  await persistence.flush();

  console.log(`livepin  proxying ${options.target}`);
  console.log(`          session ${session.id}${resumed ? " (resumed)" : ""}`);
  if (config.raw.redactUrls.length || config.raw.redactFields.length) {
    // Worth stating: someone reading the transcript later needs to know which
    // rules were in force when it was captured.
    console.log(
      `          redacting ${config.raw.redactFields.length} field(s), ` +
        `${config.raw.redactUrls.length} url pattern(s)`,
    );
  }
  if (abandonedTarget) {
    // Say it rather than quietly starting over: the previous review still
    // exists, and knowing why it was not resumed is the difference between a
    // sensible default and a lost afternoon.
    console.log(`          (new review — the stored one was for ${abandonedTarget})`);
  }
  console.log(`          review at ${reviewUrl}`);

  if (options.open) {
    const opened = await openInBrowser(reviewUrl);
    if (!opened) {
      // Not an error: headless boxes are a normal place to run this, and the
      // URL is on screen either way.
      console.log("          (could not open a browser — open the URL above)");
    }
  }

  return {
    server,
    session,
    channel,
    store,
    persistence,
    reviewUrl,
    shutdown: async (): Promise<void> => {
      channel.close();
      await persistence.stop();
      await store.markStopped();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}

/**
 * Block until the human acts, printing the result as JSON.
 *
 * @param options - Parsed agent options.
 * @returns Process exit code.
 */
export async function runPoll(options: AgentOptions): Promise<number> {
  const pointer = await loadPointer(new SessionStore(options.dir));

  const { status, body } = await requestJson<PollResult & { error?: string }>(pointer, {
    method: "POST",
    path: "/agent/poll",
    body: {
      timeoutMs: options.timeoutMs,
      reply: options.agentReply
        ? { text: options.agentReply, threadId: options.thread }
        : undefined,
    },
    timeoutMs: options.timeoutMs + CLIENT_TIMEOUT_MARGIN_MS,
  });

  if (status !== 200) throw new Error(body.error ?? `proxy answered ${status}`);

  console.log(JSON.stringify(body, null, 2));
  return 0;
}

/**
 * Post a message as the agent without blocking.
 *
 * @param options - Parsed agent options; the message is positional.
 * @returns Process exit code.
 */
export async function runSay(options: AgentOptions): Promise<number> {
  const text = options.words.join(" ").trim();
  if (!text) throw new Error('say needs a message, e.g. livepin say "moved the badge inline"');

  const pointer = await loadPointer(new SessionStore(options.dir));
  const { status, body } = await requestJson<{ id?: string; error?: string }>(pointer, {
    method: "POST",
    path: "/agent/say",
    body: { text, threadId: options.thread },
    timeoutMs: 10_000,
  });

  if (status !== 201) throw new Error(body.error ?? `proxy answered ${status}`);

  console.log(
    JSON.stringify({ ok: true, commentId: body.id, threadId: options.thread ?? "global" }),
  );
  return 0;
}

/**
 * Print the whole session as JSON.
 *
 * @param options - Parsed agent options.
 * @returns Process exit code.
 */
export async function runState(options: AgentOptions): Promise<number> {
  const pointer = await loadPointer(new SessionStore(options.dir));
  const { status, body } = await requestJson<SessionState & { error?: string }>(pointer, {
    method: "GET",
    path: "/api/state",
    timeoutMs: 10_000,
  });

  if (status !== 200) throw new Error(body.error ?? `proxy answered ${status}`);

  console.log(JSON.stringify(body, null, 2));
  return 0;
}

/**
 * Install or print the agent instructions.
 *
 * @param argv - Arguments after `skill`.
 * @returns Process exit code.
 * @throws If the subcommand is unknown.
 */
export async function runSkill(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: { dir: { type: "string" } },
    allowPositionals: true,
    strict: true,
  });

  const [action] = positionals;

  if (action === "print") {
    console.log(await readSkill());
    return 0;
  }

  if (action === "install") {
    const { file, overwritten } = await installSkill(values.dir ?? process.cwd());
    console.log(`livepin  ${overwritten ? "updated" : "installed"} ${file}`);
    return 0;
  }

  throw new Error(
    `unknown skill command "${action ?? ""}" — use \`livepin skill install\` or ` +
      "`livepin skill print`",
  );
}

/**
 * End the review.
 *
 * @param options - Parsed agent options.
 * @returns Process exit code.
 */
export async function runEnd(options: AgentOptions): Promise<number> {
  const pointer = await loadPointer(new SessionStore(options.dir));
  const { status, body } = await requestJson<{ error?: string }>(pointer, {
    method: "POST",
    path: "/api/end",
    body: {},
    timeoutMs: 10_000,
  });

  if (status !== 200) throw new Error(body.error ?? `proxy answered ${status}`);

  console.log(JSON.stringify({ ok: true, ended: true }));
  return 0;
}

/** Entry point. Exported for testing; invoked below when run as a binary. */
export async function main(argv: string[]): Promise<number> {
  const [subcommand, ...rest] = argv;

  if (!subcommand || subcommand === "-h" || subcommand === "--help" || subcommand === "help") {
    console.log(USAGE);
    return subcommand ? 0 : 1;
  }

  try {
    switch (subcommand) {
      case "start": {
        const started = await runStart(parseStartArgs(rest));
        // Leave the session file and pointer consistent on Ctrl-C, so the next
        // `poll` gets an honest answer instead of a stale address.
        for (const signal of ["SIGINT", "SIGTERM"] as const) {
          process.once(signal, () => {
            void started.shutdown().then(() => process.exit(0));
          });
        }
        return 0;
      }
      case "poll":
        return await runPoll(parseAgentArgs(rest));
      case "say":
        return await runSay(parseAgentArgs(rest));
      case "state":
        return await runState(parseAgentArgs(rest));
      case "end":
        return await runEnd(parseAgentArgs(rest));
      case "skill":
        return await runSkill(rest);
      default:
        console.error(`livepin: unknown command "${subcommand}"\n`);
        console.error(USAGE);
        return 1;
    }
  } catch (err) {
    console.error(`livepin: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
}

/**
 * Whether a module is the program being run, rather than an import.
 *
 * Both sides are resolved through symlinks before comparing. Every real install
 * reaches the CLI through one — `npm link`, `npm i -g` and a git dependency all
 * put `node_modules/.bin/livepin` in front of `dist/cli.js` — so comparing
 * `argv[1]` to `import.meta.url` directly matches only when the file is invoked
 * by its own path, and the binary silently does nothing everywhere else.
 *
 * @param entry - `process.argv[1]`, the path node was asked to run.
 * @param moduleUrl - The module's own `import.meta.url`.
 * @returns True when this module is the entry point.
 */
export function isEntryPoint(entry: string | undefined, moduleUrl: string): boolean {
  if (!entry) return false;

  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(moduleUrl));
  } catch {
    // A path that cannot be resolved is not this file.
    return false;
  }
}

// Only self-invoke as a binary, so importing this module in tests is inert.
if (isEntryPoint(process.argv[1], import.meta.url)) {
  const code = await main(process.argv.slice(2));
  // A successful `start` keeps the event loop alive via the listening server.
  if (code !== 0) process.exit(code);
}
