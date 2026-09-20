/**
 * HTTP surface for livepin, served under `/__livepin/*`.
 *
 * The proxy hands every request here first; anything not recognised falls
 * through to the host application. Keeping the namespace tight matters — these
 * routes shadow whatever the proxied app might have at the same paths.
 *
 * Two groups of routes, split by who they are for and what they may claim to be:
 *
 * - `/api/*` is the browser's door. Comments arriving here are always attributed
 *   to the human, whatever the request says.
 * - `/agent/*` is the CLI's door, and is the only way to speak as the agent.
 *
 * The split is about honest attribution in the transcript, not security: this is
 * a loopback dev tool and authentication is an explicit non-goal.
 */

import type { IncomingMessage, ServerResponse } from "node:http";

import { DEFAULT_POLL_TIMEOUT_MS, type AgentChannel } from "./channel.js";
import { compileConfig, DEFAULT_CONFIG, type CompiledConfig } from "./config.js";
import { mergeEntries, type NetworkLog } from "./network-log.js";
import { redactCapture } from "./redact.js";
import type { Session } from "./session.js";
import type { AddCommentRequest, CapturedData, CreateThreadRequest, ServerEvent } from "./types.js";

/** Namespace under which livepin serves its own assets and API. */
export const LIVEPIN_PREFIX = "/__livepin";

/**
 * Rewrite a captured source path to be relative to the project.
 *
 * React reports an absolute path. The agent runs in the project root, so a
 * relative path is both what it wants to open and one less way to leak the
 * shape of someone's home directory into a transcript. A path from somewhere
 * else entirely — a linked package, say — is left alone rather than mangled.
 *
 * @param data - Capture from the overlay, possibly absent.
 * @param root - Project root the proxy was started in.
 * @returns The capture with `source.file` shortened where it applies.
 */
export function relativiseSource(
  data: CapturedData | undefined,
  root: string,
): CapturedData | undefined {
  if (!data?.source) return data;

  const prefix = root.endsWith("/") ? root : `${root}/`;
  if (!data.source.file.startsWith(prefix)) return data;

  return { ...data, source: { ...data.source, file: data.source.file.slice(prefix.length) } };
}

/** Largest request body accepted, to bound memory on a malformed client. */
const MAX_BODY_BYTES = 1024 * 1024;

/** Interval between SSE keep-alive comments, in milliseconds. */
const SSE_KEEPALIVE_MS = 30_000;

/** Read and parse a JSON request body. */
async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) throw new Error("request body too large");
    chunks.push(chunk as Buffer);
  }

  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) throw new Error("empty request body");
  return JSON.parse(text) as T;
}

/** Read a JSON body, treating an absent one as `{}`. */
async function readOptionalJsonBody<T>(req: IncomingMessage): Promise<Partial<T>> {
  try {
    return await readJsonBody<T>(req);
  } catch (err) {
    if (err instanceof Error && err.message === "empty request body") return {};
    throw err;
  }
}

/**
 * Write a JSON response.
 *
 * @param res - Response to write.
 * @param status - HTTP status.
 * @param body - Value to serialise.
 * @param onFlushed - Called once the payload has actually left, and only then.
 *   The poll's delivery cursor hangs off this.
 */
function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  onFlushed?: () => void,
): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": String(Buffer.byteLength(payload)),
    "cache-control": "no-store",
  });
  res.end(payload, () => onFlushed?.());
}

/**
 * Hold a Server-Sent Events connection open and forward session events to it.
 *
 * @param session - Session to subscribe to.
 * @param res - Response to stream into.
 */
function streamEvents(session: Session, req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-store",
    connection: "keep-alive",
    // Proxies and browsers will otherwise buffer an event stream into
    // uselessness.
    "x-accel-buffering": "no",
  });

  const send = (event: ServerEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // Tell a reconnecting overlay what it missed before any live event arrives.
  res.write(`data: ${JSON.stringify({ type: "sync", state: session.getState() })}\n\n`);

  const unsubscribe = session.subscribe(send);
  const keepAlive = setInterval(() => res.write(": keep-alive\n\n"), SSE_KEEPALIVE_MS);

  const cleanup = () => {
    clearInterval(keepAlive);
    unsubscribe();
  };
  req.on("close", cleanup);
  res.on("close", cleanup);
  res.on("error", cleanup);
}

/** Options for {@link createApiHandler}. */
export interface ApiHandlerOptions {
  session: Session;
  /** The agent's queue. Serves `/agent/*`. */
  channel: AgentChannel;
  /** Returns the overlay bundle source. Called per request so edits show up. */
  getOverlayBundle: () => Promise<string>;
  /** Project root, for shortening captured source paths. Defaults to the cwd. */
  projectRoot?: string;
  /** Compiled redaction rules. Nothing is redacted when omitted. */
  config?: CompiledConfig;
  /** Same-origin traffic the proxy saw, merged into network captures. */
  networkLog?: NetworkLog;
}

/** Body of `POST /__livepin/agent/poll`. */
export interface AgentPollRequest {
  /** Milliseconds to block. The channel's default when omitted. */
  timeoutMs?: number;
  /** Message to post before blocking, so a reply and a wait are one call. */
  reply?: { text: string; threadId?: string };
}

/** Body of `POST /__livepin/agent/say`. */
export interface AgentSayRequest {
  text: string;
  threadId?: string;
}

/**
 * Build the request handler for livepin's own routes.
 *
 * @param options - Session and overlay bundle source.
 * @returns A handler returning true when it took ownership of the request.
 */
export function createApiHandler(
  options: ApiHandlerOptions,
): (req: IncomingMessage, res: ServerResponse) => Promise<boolean> {
  const { session, channel, getOverlayBundle } = options;
  const projectRoot = options.projectRoot ?? process.cwd();
  const config = options.config ?? compileConfig(DEFAULT_CONFIG);
  const networkLog = options.networkLog ?? null;

  /**
   * Everything that has to happen to a capture before it is stored.
   *
   * One function, called from one place, so there is no route through which a
   * capture reaches the session unredacted.
   */
  const prepare = (data: CapturedData | undefined): CapturedData | undefined => {
    if (!data) return undefined;

    // Only a pin that asked for network context gets the proxy's view too.
    const withProxy =
      data.network && networkLog
        ? { ...data, network: mergeEntries(data.network, networkLog.recent()) }
        : data;

    return redactCapture(relativiseSource(withProxy, projectRoot), config);
  };

  return async function handle(req, res): Promise<boolean> {
    const path = (req.url ?? "").split("?", 1)[0] ?? "";
    if (!path.startsWith(`${LIVEPIN_PREFIX}/`)) return false;

    const route = path.slice(LIVEPIN_PREFIX.length);

    try {
      switch (`${req.method} ${route}`) {
        case "GET /overlay.js": {
          const source = await getOverlayBundle();
          res.writeHead(200, {
            "content-type": "text/javascript; charset=utf-8",
            "cache-control": "no-store",
          });
          res.end(source);
          return true;
        }

        case "GET /health":
          sendJson(res, 200, { ok: true, session: session.id, ended: session.isEnded });
          return true;

        case "GET /api/state":
          sendJson(res, 200, session.getState());
          return true;

        case "GET /api/config":
          // The overlay uses `redactUrls` to avoid holding a redacted body in
          // the page at all. The server still redacts; this is the earlier of
          // two passes, not a replacement for it.
          sendJson(res, 200, config.raw);
          return true;

        case "GET /api/events":
          streamEvents(session, req, res);
          return true;

        case "POST /api/thread": {
          const body = await readJsonBody<CreateThreadRequest>(req);
          const thread = session.createThread(
            body.element,
            body.url,
            body.text,
            prepare(body.data),
          );
          sendJson(res, 201, thread);
          return true;
        }

        case "POST /api/comment": {
          const body = await readJsonBody<AddCommentRequest>(req);
          const comment = session.addComment(body.threadId, "human", body.text, body.url);
          sendJson(res, 201, comment);
          return true;
        }

        case "POST /api/resolve": {
          const body = await readJsonBody<{ threadId: string; resolved: boolean }>(req);
          session.setResolved(body.threadId, body.resolved);
          sendJson(res, 200, { ok: true });
          return true;
        }

        case "POST /api/orphan": {
          const body = await readJsonBody<{ threadId: string; orphaned: boolean }>(req);
          session.setOrphaned(body.threadId, body.orphaned);
          sendJson(res, 200, { ok: true });
          return true;
        }

        case "POST /api/end":
          session.end();
          sendJson(res, 200, { ok: true, ended: true });
          return true;

        case "POST /agent/poll": {
          const body = await readOptionalJsonBody<AgentPollRequest>(req);

          // Post the agent's message first, so the panel reads as a
          // conversation rather than showing the reply after the human's next
          // remark.
          if (body.reply?.text) channel.say(body.reply.text, body.reply.threadId);

          // A client that hangs up must not leave a waiter parked forever.
          const aborter = new AbortController();
          const abort = (): void => aborter.abort();
          req.on("close", abort);

          try {
            const result = await channel.poll({
              timeoutMs: body.timeoutMs ?? DEFAULT_POLL_TIMEOUT_MS,
              signal: aborter.signal,
            });

            // The client hung up while we waited. Say nothing and acknowledge
            // nothing: the queue is the agent's, and it keeps its contents.
            if (res.destroyed) return true;

            const highest = result.items.reduce((max, item) => Math.max(max, item.seq), 0);

            sendJson(res, 200, result, () => {
              // Only now is the payload really the agent's. If the socket died
              // mid-flight the items stay queued for the next poll.
              if (highest > 0 && res.writableFinished) channel.acknowledge(highest);
            });
          } finally {
            req.off("close", abort);
          }
          return true;
        }

        case "POST /agent/say": {
          const body = await readJsonBody<AgentSayRequest>(req);
          if (typeof body.text !== "string" || body.text === "") {
            throw new Error("text is required");
          }
          sendJson(res, 201, channel.say(body.text, body.threadId));
          return true;
        }

        default:
          // Unknown paths under the prefix belong to the host app, not us.
          return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // "session has ended" is the client racing the end button, not a bug —
      // 409 tells the overlay to stop rather than retry.
      const status = message === "session has ended" ? 409 : 400;
      sendJson(res, status, { error: message });
      return true;
    }
  };
}
