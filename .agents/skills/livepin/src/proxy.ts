/**
 * The reverse proxy that sits in front of the host project's dev server.
 *
 * Two paths matter and they have opposite requirements:
 *
 * - **Requests** are forwarded, and HTML responses are rewritten to carry the
 *   overlay script. Rewriting means the response can no longer be compressed or
 *   length-declared upstream, so both are neutralised.
 * - **Upgrades** (websockets — HMR, and whatever else the app opens) are piped
 *   through raw. Nothing is parsed, buffered, or rewritten; if this path is not
 *   byte-transparent, hot reload dies and the tool is useless.
 */

import http from "node:http";
import https from "node:https";
import type {
  IncomingHttpHeaders,
  IncomingMessage,
  OutgoingHttpHeaders,
  ServerResponse,
} from "node:http";
import type { Duplex } from "node:stream";

import { createApiHandler, LIVEPIN_PREFIX } from "./api.js";
import { AgentChannel } from "./channel.js";
import type { CompiledConfig } from "./config.js";
import { createInjectionStream, isHtmlContentType, overlayScriptTag } from "./inject.js";
import type { NetworkLog } from "./network-log.js";
import { isInterestingContentType } from "./network-log.js";
import { loadOverlayBundle } from "./overlay-bundle.js";
import { Session } from "./session.js";

export { LIVEPIN_PREFIX };

/**
 * Headers that describe a single hop and must not be forwarded. Passing these
 * on confuses keep-alive and, in the case of `transfer-encoding`, makes Node
 * emit a body framed two different ways at once.
 */
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

/** Options for {@link createProxyServer}. */
export interface ProxyOptions {
  /** Origin of the dev server being proxied, e.g. `http://localhost:3000`. */
  target: string;
  /** Script tag injected into HTML responses. Defaults to the overlay tag. */
  scriptTag?: string;
  /** Review session. A fresh one is created when omitted. */
  session?: Session;
  /** The agent's queue. One watching `session` is created when omitted. */
  channel?: AgentChannel;
  /** Project root, for shortening captured source paths. Defaults to the cwd. */
  projectRoot?: string;
  /**
   * Where same-origin traffic is logged, for pins that ask for network context.
   *
   * Omit to record nothing — which is what the tests that only care about
   * forwarding do.
   */
  networkLog?: NetworkLog;
  /** Compiled redaction rules, passed to the API. Nothing is redacted when omitted. */
  config?: CompiledConfig;
  /**
   * Supplies the overlay bundle. Injectable so tests need not run esbuild and
   * so `npm run dev` can force a rebuild on every request.
   */
  getOverlayBundle?: () => Promise<string>;
}

/**
 * Copy headers for forwarding, dropping hop-by-hop entries and anything named
 * in `drop`.
 *
 * @param headers - Source headers.
 * @param drop - Extra lowercase header names to omit.
 */
function forwardableHeaders(
  headers: IncomingHttpHeaders,
  drop: string[] = [],
): OutgoingHttpHeaders {
  const dropSet = new Set(drop);
  const out: OutgoingHttpHeaders = {};
  for (const [name, value] of Object.entries(headers)) {
    const lower = name.toLowerCase();
    if (HOP_BY_HOP.has(lower) || dropSet.has(lower) || value === undefined) continue;
    out[name] = value;
  }
  return out;
}

/** Pick the transport module matching a target URL's protocol. */
function transportFor(url: URL): typeof http | typeof https {
  return url.protocol === "https:" ? https : http;
}

/**
 * Serialise an upstream 101 response back to the client verbatim.
 *
 * The handshake headers (`upgrade`, `connection`, `sec-websocket-accept`) are
 * exactly the ones {@link HOP_BY_HOP} strips elsewhere, so this path
 * deliberately does not filter anything.
 *
 * @param res - The upstream response carrying the upgrade.
 */
function serialiseHandshake(res: IncomingMessage): string {
  const lines = [`HTTP/${res.httpVersion} ${res.statusCode} ${res.statusMessage ?? ""}`.trimEnd()];
  for (const [name, value] of Object.entries(res.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) lines.push(`${name}: ${v}`);
    } else {
      lines.push(`${name}: ${value}`);
    }
  }
  return lines.join("\r\n") + "\r\n\r\n";
}

/**
 * Forward one request upstream and stream the response back, injecting the
 * overlay tag when the response is HTML.
 */
function proxyRequest(
  req: IncomingMessage,
  res: ServerResponse,
  target: URL,
  scriptTag: string,
  log: NetworkLog | null,
): void {
  const startedAt = Date.now();
  const upstream = transportFor(target).request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port,
      method: req.method,
      path: req.url,
      headers: {
        ...forwardableHeaders(req.headers),
        // Force an uncompressed response so HTML can be rewritten. The dev
        // server is on loopback, so compression buys nothing anyway.
        "accept-encoding": "identity",
      },
    },
    (upstreamRes) => {
      const contentType = upstreamRes.headers["content-type"];
      const html = isHtmlContentType(contentType);

      if (log && isInterestingContentType(contentType)) {
        // Recorded from the headers alone; the body keeps streaming untouched.
        log.record({
          method: req.method ?? "GET",
          url: req.url ?? "/",
          status: upstreamRes.statusCode ?? 0,
          ms: Date.now() - startedAt,
          startedAt: new Date(startedAt).toISOString(),
          ...(contentType ? { contentType } : {}),
        });
      }

      // Injection changes the body, so any header describing the original body
      // becomes a lie. content-length would truncate the page; etag would let
      // the browser cache a copy of the un-injected document.
      const drop = html ? ["content-length", "etag"] : [];
      res.writeHead(upstreamRes.statusCode ?? 502, forwardableHeaders(upstreamRes.headers, drop));

      if (html) {
        const injector = createInjectionStream(scriptTag);
        upstreamRes.pipe(injector).pipe(res);
        injector.on("error", () => res.destroy());
      } else {
        upstreamRes.pipe(res);
      }
      upstreamRes.on("error", () => res.destroy());
    },
  );

  upstream.on("error", (err: NodeJS.ErrnoException) => {
    if (res.headersSent) {
      res.destroy();
      return;
    }
    res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    res.end(`livepin: cannot reach ${target.origin} (${err.code ?? err.message})\n`);
  });

  req.pipe(upstream);
  req.on("error", () => upstream.destroy());
}

/**
 * Pipe a websocket (or any other protocol) upgrade straight through.
 *
 * Nothing on this path is inspected. `head` — bytes the client already sent
 * past the request line — is pushed back onto the client socket so the plain
 * socket-to-socket pipe carries it upstream in order.
 */
function proxyUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer, target: URL): void {
  const upstream = transportFor(target).request({
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port,
    method: req.method,
    path: req.url,
    // Upgrade and connection must survive here; they are the handshake.
    headers: req.headers,
  });

  upstream.on("upgrade", (upstreamRes, upstreamSocket, upstreamHead) => {
    socket.write(serialiseHandshake(upstreamRes));
    if (upstreamHead?.length) socket.write(upstreamHead);
    if (head?.length) socket.unshift(head);

    const teardown = () => {
      upstreamSocket.destroy();
      socket.destroy();
    };
    upstreamSocket.on("error", teardown);
    socket.on("error", teardown);

    upstreamSocket.pipe(socket);
    socket.pipe(upstreamSocket);
  });

  // Upstream answered a normal response instead of upgrading: relay it and
  // close, rather than leaving the client hanging on a handshake.
  upstream.on("response", (upstreamRes) => {
    socket.write(serialiseHandshake(upstreamRes));
    upstreamRes.pipe(socket);
  });

  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());

  upstream.end();
}

/**
 * Build the proxy server.
 *
 * The returned server is not listening; the caller chooses the port so that
 * tests can bind port 0 and read back whatever they were given.
 *
 * @param options - Target origin and injection settings.
 * @returns An unstarted `http.Server`.
 */
export function createProxyServer(options: ProxyOptions): http.Server {
  const target = new URL(options.target);
  const scriptTag = options.scriptTag ?? overlayScriptTag();
  const session = options.session ?? new Session();
  const channel = options.channel ?? new AgentChannel(session);
  const handleOwnRoute = createApiHandler({
    session,
    channel,
    getOverlayBundle: options.getOverlayBundle ?? (() => loadOverlayBundle()),
    ...(options.projectRoot ? { projectRoot: options.projectRoot } : {}),
    ...(options.config ? { config: options.config } : {}),
    ...(options.networkLog ? { networkLog: options.networkLog } : {}),
  });

  const log = options.networkLog ?? null;

  const server = http.createServer((req, res) => {
    void handleOwnRoute(req, res)
      .then((handled) => {
        if (!handled) proxyRequest(req, res, target, scriptTag, log);
      })
      .catch(() => {
        if (!res.headersSent) res.writeHead(500, { "content-type": "text/plain" });
        res.end("livepin: internal error\n");
      });
  });

  server.on("upgrade", (req, socket, head) => {
    proxyUpgrade(req, socket as Duplex, head, target);
  });

  return server;
}
