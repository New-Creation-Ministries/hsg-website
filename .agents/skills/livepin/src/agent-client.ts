/**
 * Client the agent-facing verbs use to talk to a running proxy.
 *
 * Deliberately built on `node:http` rather than `fetch`: the global fetch in
 * Node aborts a request whose response headers take longer than five minutes to
 * arrive, and a long-poll that blocks for fifteen is the entire point of this
 * module. `http.request` has no such deadline, so the timeout stays ours to set.
 */

import http from "node:http";

import type { ServerPointer, SessionStore } from "./store.js";

/** Extra grace on top of the server's own poll timeout before giving up. */
export const CLIENT_TIMEOUT_MARGIN_MS = 30_000;

/** A parsed JSON response. */
export interface JsonResponse<T> {
  status: number;
  body: T;
}

/** Options for {@link requestJson}. */
export interface RequestOptions {
  method: "GET" | "POST";
  /** Path under the livepin namespace, e.g. `/agent/poll`. */
  path: string;
  /** Value to send as a JSON body. */
  body?: unknown;
  /** Abandon the request after this long. Omit for no client-side deadline. */
  timeoutMs?: number;
}

/**
 * Find the running server for this project.
 *
 * @param store - Store rooted at the host project.
 * @returns The pointer written by `livepin start`.
 * @throws With an actionable message when nothing is running here.
 */
export async function loadPointer(store: SessionStore): Promise<ServerPointer> {
  const pointer = await store.readPointer();
  if (!pointer) {
    throw new Error(
      `no livepin session found in ${store.root} — start one with ` +
        "`livepin start --target http://localhost:3000`",
    );
  }
  if (!pointer.running) {
    // The session is still on disk; it is the proxy in front of it that is gone.
    throw new Error(
      `the livepin proxy for session ${pointer.sessionId} has stopped — ` +
        `restart it with \`livepin start --target ${pointer.target}\``,
    );
  }
  return pointer;
}

/**
 * Send a request to the proxy's livepin namespace.
 *
 * @param pointer - Where the proxy is listening.
 * @param options - Method, path, body and timeout.
 * @returns Status and parsed body.
 * @throws If the server is unreachable, times out, or answers with non-JSON.
 */
export function requestJson<T>(
  pointer: ServerPointer,
  options: RequestOptions,
): Promise<JsonResponse<T>> {
  const payload = options.body === undefined ? null : JSON.stringify(options.body);

  return new Promise<JsonResponse<T>>((resolve, reject) => {
    const req = http.request(
      {
        host: pointer.host,
        port: pointer.port,
        method: options.method,
        // No keep-alive: these are one-shot processes, and a pooled socket kept
        // warm by the global agent would hold the CLI open after it has printed.
        agent: false,
        path: `/__livepin${options.path}`,
        headers: payload
          ? {
              "content-type": "application/json",
              "content-length": String(Buffer.byteLength(payload)),
            }
          : {},
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          try {
            resolve({ status: res.statusCode ?? 0, body: JSON.parse(text) as T });
          } catch {
            reject(new Error(`unexpected non-JSON reply from the proxy: ${text.slice(0, 200)}`));
          }
        });
      },
    );

    if (options.timeoutMs !== undefined) {
      req.setTimeout(options.timeoutMs, () => {
        req.destroy(new Error(`no reply from the proxy within ${options.timeoutMs}ms`));
      });
    }

    req.on("error", (error: NodeJS.ErrnoException) => {
      // The pointer file outlives the process it describes, so a refused
      // connection means a stale pointer far more often than a real fault.
      if (error.code === "ECONNREFUSED") {
        reject(
          new Error(
            `nothing is listening at ${pointer.host}:${pointer.port} — ` +
              "the livepin proxy is not running any more",
          ),
        );
        return;
      }
      reject(error);
    });

    if (payload) req.write(payload);
    req.end();
  });
}
