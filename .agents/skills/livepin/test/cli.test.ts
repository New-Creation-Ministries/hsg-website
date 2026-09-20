import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_PORT,
  isEntryPoint,
  parseAgentArgs,
  parseStartArgs,
  runEnd,
  runPoll,
  runSay,
  runStart,
  runSkill,
  runState,
  type AgentOptions,
  type StartedProxy,
  type StartOptions,
} from "../src/cli.js";
import { GLOBAL_THREAD_ID } from "../src/session.js";
import { LIVEPIN_DIR } from "../src/store.js";
import type { PollResult, SessionState } from "../src/types.js";

let dir: string;
const running: StartedProxy[] = [];

/** Start a proxy in the temp project, tracked for teardown. */
async function start(overrides: Partial<StartOptions> = {}): Promise<StartedProxy> {
  const started = await runStart({
    target: "http://127.0.0.1:1",
    port: 0,
    host: "127.0.0.1",
    openPath: "/",
    open: false,
    fresh: false,
    reopen: false,
    dir,
    ...overrides,
  });
  running.push(started);
  return started;
}

/** Agent options pointing at the temp project. */
function agentOptions(overrides: Partial<AgentOptions> = {}): AgentOptions {
  return {
    thread: undefined,
    agentReply: undefined,
    timeoutMs: 2000,
    dir,
    words: [],
    ...overrides,
  };
}

/** Capture stdout for the duration of one call. */
async function captureStdout(run: () => Promise<unknown>): Promise<string> {
  const lines: string[] = [];
  const spy = vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    lines.push(args.join(" "));
  });
  try {
    await run();
  } finally {
    spy.mockRestore();
  }
  return lines.join("\n");
}

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "livepin-cli-"));
});

afterEach(async () => {
  while (running.length) await running.pop()?.shutdown();
  await rm(dir, { recursive: true, force: true });
});

describe("parseStartArgs", () => {
  it("requires a target", () => {
    expect(() => parseStartArgs([])).toThrow(/--target is required/);
  });

  it("rejects a malformed target early rather than at first request", () => {
    expect(() => parseStartArgs(["--target", "not a url"])).toThrow(/not a valid URL/);
  });

  it("rejects a non-http target", () => {
    expect(() => parseStartArgs(["--target", "ftp://example.com"])).toThrow(/must be http/);
  });

  it("applies defaults", () => {
    expect(parseStartArgs(["--target", "http://localhost:3000"])).toEqual({
      target: "http://localhost:3000",
      port: DEFAULT_PORT,
      host: "127.0.0.1",
      openPath: "/",
      open: true,
      fresh: false,
      reopen: false,
      dir: process.cwd(),
    });
  });

  it("normalises the target to an origin, dropping any path", () => {
    expect(parseStartArgs(["--target", "http://localhost:3000/some/path"]).target).toBe(
      "http://localhost:3000",
    );
  });

  it("accepts an explicit port, host and open path", () => {
    const opts = parseStartArgs([
      "--target",
      "http://localhost:3000",
      "--port",
      "5000",
      "--host",
      "0.0.0.0",
      "--open",
      "/patients/1182",
    ]);
    expect(opts.port).toBe(5000);
    expect(opts.host).toBe("0.0.0.0");
    expect(opts.openPath).toBe("/patients/1182");
  });

  it("adds a leading slash to a bare open path", () => {
    expect(parseStartArgs(["--target", "http://x", "--open", "dash"]).openPath).toBe("/dash");
  });

  it("honours --no-open", () => {
    expect(parseStartArgs(["--target", "http://x", "--no-open"]).open).toBe(false);
  });

  it("reads --fresh and --reopen", () => {
    const opts = parseStartArgs(["--target", "http://x", "--fresh", "--reopen"]);
    expect(opts.fresh).toBe(true);
    expect(opts.reopen).toBe(true);
  });

  it.each([["70000"], ["abc"], ["3.5"], [""]])("rejects invalid port %s", (port) => {
    expect(() => parseStartArgs(["--target", "http://x", "--port", port])).toThrow(
      /--port must be/,
    );
  });

  it("rejects a negative port", () => {
    // Written with `=` because a bare `--port -1` is ambiguous to Node's
    // parseArgs and rejected earlier, by the parser rather than by us.
    expect(() => parseStartArgs(["--target", "http://x", "--port=-1"])).toThrow(/--port must be/);
  });

  it("rejects unknown flags rather than ignoring them", () => {
    expect(() => parseStartArgs(["--target", "http://x", "--wat"])).toThrow();
  });
});

describe("parseAgentArgs", () => {
  it("defaults to the global thread and the standard poll timeout", () => {
    const opts = parseAgentArgs([]);
    expect(opts.thread).toBeUndefined();
    expect(opts.timeoutMs).toBeGreaterThan(0);
  });

  it("reads a reply, a thread and a timeout in seconds", () => {
    const opts = parseAgentArgs(["--agent-reply", "done", "--thread", "t_002", "--timeout", "30"]);
    expect(opts.agentReply).toBe("done");
    expect(opts.thread).toBe("t_002");
    expect(opts.timeoutMs).toBe(30_000);
  });

  it("keeps positionals, which is how say receives its message", () => {
    expect(parseAgentArgs(["move", "the", "badge"]).words).toEqual(["move", "the", "badge"]);
  });

  // Written with `=` because a bare `--timeout -5` (or an empty value) is
  // ambiguous to Node's parseArgs and rejected by the parser before we see it.
  it.each([["0"], ["-5"], ["abc"], [""]])("rejects invalid timeout %s", (timeout) => {
    expect(() => parseAgentArgs([`--timeout=${timeout}`])).toThrow(/--timeout must be/);
  });
});

describe("runStart", () => {
  it("binds a port and serves the health route without opening a browser", async () => {
    const { server } = await start();

    const port = (server.address() as AddressInfo).port;
    const res = await fetch(`http://127.0.0.1:${port}/__livepin/health`);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  it("names the livepin proxy already holding the port, since that is the usual cause", async () => {
    const { server, session } = await start();
    const port = (server.address() as AddressInfo).port;

    // Reopening or re-pointing a review means replacing a live proxy, so this
    // needs to say what to stop rather than just "address already in use".
    await expect(start({ port })).rejects.toThrow(
      new RegExp(`already running on 127\\.0\\.0\\.1:${port} for session ${session.id}`),
    );
  });

  it("reports a foreign listener as something else's port", async () => {
    const other = http.createServer();
    await new Promise<void>((resolve) => other.listen(0, "127.0.0.1", resolve));
    const port = (other.address() as AddressInfo).port;

    try {
      await expect(start({ port })).rejects.toThrow(/in use by something else/);
    } finally {
      await new Promise<void>((resolve) => other.close(() => resolve()));
    }
  });

  it("writes a pointer the agent verbs can find it by", async () => {
    const { server, session } = await start();

    const pointer = JSON.parse(
      await readFile(path.join(dir, LIVEPIN_DIR, "current.json"), "utf8"),
    ) as { sessionId: string; port: number };
    expect(pointer.sessionId).toBe(session.id);
    expect(pointer.port).toBe((server.address() as AddressInfo).port);
  });

  it("marks the pointer stopped on shutdown, keeping which session it served", async () => {
    const started = await start();
    running.pop();
    await started.shutdown();

    const pointer = JSON.parse(
      await readFile(path.join(dir, LIVEPIN_DIR, "current.json"), "utf8"),
    ) as { running: boolean; sessionId: string };
    expect(pointer.running).toBe(false);
    expect(pointer.sessionId).toBe(started.session.id);
  });

  it("resumes the previous session, keeping its comments", async () => {
    const first = await start();
    first.session.createThread(null, "http://app/list", "keep me");
    await first.persistence.flush();
    running.pop();
    await first.shutdown();

    const second = await start();
    expect(second.session.id).toBe(first.session.id);
    const texts = second.session.getState().threads.flatMap((t) => t.comments.map((c) => c.text));
    expect(texts).toContain("keep me");
  });

  it("starts a new session when the target has changed", async () => {
    const first = await start({ target: "http://127.0.0.1:1" });
    first.session.createThread(null, "http://app/list", "about the other app");
    await first.persistence.flush();
    running.pop();
    await first.shutdown();

    // Pins name one app's elements; resuming them against another orphans them all.
    const second = await start({ target: "http://127.0.0.1:2" });
    expect(second.session.id).not.toBe(first.session.id);
    expect(second.session.getState().threads).toHaveLength(1);
  });

  it("does not refuse an ended session that belonged to a different target", async () => {
    const first = await start({ target: "http://127.0.0.1:1" });
    first.session.end();
    await first.persistence.flush();
    running.pop();
    await first.shutdown();

    // Nothing is being revived, so --reopen has nothing to say about it.
    await expect(start({ target: "http://127.0.0.1:2" })).resolves.toBeTruthy();
  });

  it("starts a new session for --fresh rather than resuming", async () => {
    const first = await start();
    running.pop();
    await first.shutdown();

    const second = await start({ fresh: true });
    expect(second.session.id).not.toBe(first.session.id);
  });

  it("refuses to reopen a session the human ended", async () => {
    const first = await start();
    first.session.end();
    await first.persistence.flush();
    running.pop();
    await first.shutdown();

    await expect(start()).rejects.toThrow(/--reopen/);
  });

  it("continues an ended session when --reopen is given", async () => {
    const first = await start();
    first.session.createThread(null, "http://app/list", "before the end");
    first.session.end();
    await first.persistence.flush();
    running.pop();
    await first.shutdown();

    const second = await start({ reopen: true });
    expect(second.session.id).toBe(first.session.id);
    expect(second.session.isEnded).toBe(false);
  });

  it("refuses to load a corrupt session file rather than discarding it", async () => {
    const first = await start();
    const file = path.join(dir, LIVEPIN_DIR, `${first.session.id}.json`);
    running.pop();
    await first.shutdown();
    await writeFile(file, "{ not json");

    await expect(start()).rejects.toThrow(/not readable JSON/);
  });
});

describe("agent verbs", () => {
  it("polls, printing queued comments as JSON", async () => {
    const { session } = await start();
    session.createThread(null, "http://app/list", "the badge wraps");

    const out = await captureStdout(() => runPoll(agentOptions()));
    const result = JSON.parse(out) as PollResult;
    expect(result.items.map((i) => i.text)).toEqual(["the badge wraps"]);
  });

  it("posts --agent-reply into the thread it names", async () => {
    const { session } = await start();
    const thread = session.createThread(null, "http://app/list", "fix this");

    await captureStdout(() =>
      runPoll(agentOptions({ agentReply: "fixed it", thread: thread.id, timeoutMs: 500 })),
    );

    expect(session.getThread(thread.id)?.comments.at(-1)).toMatchObject({
      author: "agent",
      text: "fixed it",
    });
  });

  it("reports a timeout instead of failing when nobody said anything", async () => {
    await start();

    const out = await captureStdout(() => runPoll(agentOptions({ timeoutMs: 100 })));
    expect((JSON.parse(out) as PollResult).timedOut).toBe(true);
  });

  it("says a message as the agent", async () => {
    const { session } = await start();

    await captureStdout(() => runSay(agentOptions({ words: ["moved", "the", "badge"] })));

    expect(session.getThread(GLOBAL_THREAD_ID)?.comments.at(-1)).toMatchObject({
      author: "agent",
      text: "moved the badge",
    });
  });

  it("refuses to say nothing", async () => {
    await start();
    await expect(runSay(agentOptions())).rejects.toThrow(/needs a message/);
  });

  it("dumps the session state", async () => {
    const { session } = await start();
    session.createThread(null, "http://app/list", "look here");

    const out = await captureStdout(() => runState(agentOptions()));
    const state = JSON.parse(out) as SessionState;
    expect(state.id).toBe(session.id);
    expect(state.threads).toHaveLength(2);
  });

  it("ends the session", async () => {
    const { session } = await start();

    await captureStdout(() => runEnd(agentOptions()));
    expect(session.isEnded).toBe(true);
  });

  it("installs the skill where an agent will find it", async () => {
    const out = await captureStdout(() => runSkill(["install", "--dir", dir]));

    const file = path.join(dir, ".claude", "skills", "livepin", "SKILL.md");
    expect(out).toContain(file);
    expect(await readFile(file, "utf8")).toContain("name: livepin");
  });

  it("says when it replaced an existing copy", async () => {
    await runSkill(["install", "--dir", dir]);
    expect(await captureStdout(() => runSkill(["install", "--dir", dir]))).toContain("updated");
  });

  it("prints the skill for agents that do not read .claude", async () => {
    expect(await captureStdout(() => runSkill(["print"]))).toContain("# livepin");
  });

  it("rejects an unknown skill command with the two that exist", async () => {
    await expect(runSkill(["frobnicate"])).rejects.toThrow(/skill install.*skill print/s);
  });

  it("rejects a bare `skill` with no action", async () => {
    await expect(runSkill([])).rejects.toThrow(/unknown skill command/);
  });

  it("explains itself when no session has been started here", async () => {
    await expect(runState(agentOptions())).rejects.toThrow(/no livepin session found/);
  });

  it("says the proxy has stopped rather than timing out against a dead port", async () => {
    const started = await start();
    running.pop();
    await started.shutdown();

    await expect(runState(agentOptions())).rejects.toThrow(/has stopped/);
  });

  it("reports a pointer that claims to be live but is not", async () => {
    const started = await start();
    const port = (started.server.address() as AddressInfo).port;
    running.pop();
    await started.shutdown();

    // A killed proxy never got to mark itself stopped; the pointer still says
    // running, and the error must still be comprehensible.
    await writeFile(
      path.join(dir, LIVEPIN_DIR, "current.json"),
      JSON.stringify({
        sessionId: started.session.id,
        host: "127.0.0.1",
        port,
        target: "x",
        running: true,
      }),
    );

    await expect(runState(agentOptions())).rejects.toThrow(/not running any more/);
  });
});

describe("isEntryPoint", () => {
  it("matches when invoked by its own path", () => {
    const self = fileURLToPath(import.meta.url);
    expect(isEntryPoint(self, import.meta.url)).toBe(true);
  });

  it("matches through a symlink, which is how every install invokes the binary", async () => {
    // Regression: comparing argv[1] to import.meta.url as strings failed here, so
    // `npm link`, `npm i -g` and a git dependency all ran a binary that silently
    // did nothing and exited 0.
    const self = fileURLToPath(import.meta.url);
    const link = path.join(dir, "livepin-link");
    await symlink(self, link);

    expect(isEntryPoint(link, import.meta.url)).toBe(true);
  });

  it("does not match a different file", () => {
    expect(isEntryPoint(path.join(dir, "elsewhere.js"), import.meta.url)).toBe(false);
  });

  it("does not match when there is no entry path", () => {
    expect(isEntryPoint(undefined, import.meta.url)).toBe(false);
  });

  it("does not match an unresolvable path rather than throwing", () => {
    expect(isEntryPoint(path.join(dir, "no", "such", "file"), import.meta.url)).toBe(false);
  });
});
