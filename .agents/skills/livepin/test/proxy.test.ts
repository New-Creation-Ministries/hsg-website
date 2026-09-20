import http from "node:http";
import net from "node:net";
import type { AddressInfo } from "node:net";
import { gzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { WebSocket, WebSocketServer } from "ws";

import { INJECTION_MARKER } from "../src/inject.js";
import { createProxyServer, LIVEPIN_PREFIX } from "../src/proxy.js";

/**
 * A stand-in for a framework dev server.
 *
 * Real Next and Vite fixtures live under `fixtures/` for hand-testing, but CI
 * drives this instead: it can be made to stream, stall, compress, or upgrade on
 * demand, which is exactly the behaviour the proxy has to survive and exactly
 * what a real dev server will not reproduce on request.
 */
let upstream: http.Server;
let upstreamPort: number;
let proxy: http.Server;
let proxyPort: number;
/** Headers the upstream last received, for asserting what the proxy forwards. */
let lastUpstreamHeaders: http.IncomingHttpHeaders = {};

const HTML = "<html><head><title>fixture</title></head><body><h1>hi</h1></body></html>";
const CSS = "body{color:red}";

beforeAll(async () => {
  upstream = http.createServer((req, res) => {
    lastUpstreamHeaders = req.headers;
    const path = (req.url ?? "").split("?", 1)[0];

    switch (path) {
      case "/":
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(HTML);
        return;

      case "/chunked":
        res.writeHead(200, { "content-type": "text/html" });
        // Split mid-anchor to force the buffering path.
        res.write("<html><head><title>x</title></he");
        res.write("ad><body>streamed</body></html>");
        res.end();
        return;

      case "/unicode":
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end("<html><head></head><body>café ☕ 日本語</body></html>");
        return;

      case "/api.json":
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, items: [1, 2, 3] }));
        return;

      case "/app.css":
        // Explicit content-length: the proxy must keep it on non-HTML, where
        // the body is untouched. Node would otherwise default to chunked and
        // the assertion would prove nothing.
        res.writeHead(200, {
          "content-type": "text/css",
          "content-length": String(Buffer.byteLength(CSS)),
        });
        res.end(CSS);
        return;

      case "/gzipped": {
        // Answers gzip only if the client asked for it. The proxy must not ask.
        const accepts = String(req.headers["accept-encoding"] ?? "");
        if (accepts.includes("gzip")) {
          res.writeHead(200, { "content-type": "text/html", "content-encoding": "gzip" });
          res.end(gzipSync(Buffer.from(HTML)));
        } else {
          res.writeHead(200, { "content-type": "text/html" });
          res.end(HTML);
        }
        return;
      }

      case "/echo": {
        const chunks: Buffer[] = [];
        req.on("data", (c: Buffer) => chunks.push(c));
        req.on("end", () => {
          res.writeHead(200, { "content-type": "application/json" });
          res.end(
            JSON.stringify({ method: req.method, body: Buffer.concat(chunks).toString("utf8") }),
          );
        });
        return;
      }

      case "/status-418":
        res.writeHead(418, { "content-type": "text/plain" });
        res.end("teapot");
        return;

      case "/dies-midway":
        // Headers land, then the connection drops. The proxy has already
        // committed a status line, so it cannot answer 502 — it must abort.
        res.writeHead(200, { "content-type": "text/plain" });
        res.write("partial");
        setTimeout(() => res.destroy(), 10);
        return;

      case "/multi-cookie":
        // Array-valued headers take a different serialisation path on the
        // upgrade handler than single-valued ones.
        res.writeHead(200, {
          "content-type": "text/plain",
          "set-cookie": ["a=1; Path=/", "b=2; Path=/"],
        });
        res.end("cookies");
        return;

      case "/never-upgrades":
        res.writeHead(200, { "content-type": "text/plain" });
        res.end("plain response");
        return;

      default:
        res.writeHead(404, { "content-type": "text/plain" });
        res.end("not found");
    }
  });

  // Stands in for an HMR socket.
  const wss = new WebSocketServer({ server: upstream, path: "/_hmr" });
  wss.on("connection", (ws) => {
    ws.on("message", (data) => ws.send(`echo:${String(data)}`));
    ws.send("hello");
  });

  await new Promise<void>((resolve) => upstream.listen(0, "127.0.0.1", resolve));
  upstreamPort = (upstream.address() as AddressInfo).port;

  proxy = createProxyServer({ target: `http://127.0.0.1:${upstreamPort}` });
  await new Promise<void>((resolve) => proxy.listen(0, "127.0.0.1", resolve));
  proxyPort = (proxy.address() as AddressInfo).port;
});

afterAll(async () => {
  await new Promise<void>((resolve) => proxy.close(() => resolve()));
  await new Promise<void>((resolve) => upstream.close(() => resolve()));
});

/** Fetch a path through the proxy. */
function viaProxy(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`http://127.0.0.1:${proxyPort}${path}`, init);
}

describe("HTML rewriting", () => {
  it("injects the overlay tag into an HTML response", async () => {
    const body = await (await viaProxy("/")).text();
    expect(body).toContain(INJECTION_MARKER);
    expect(body).toContain(`${LIVEPIN_PREFIX}/overlay.js`);
    expect(body).toContain("<h1>hi</h1>");
  });

  it("injects into a chunked response whose anchor spans a chunk", async () => {
    const body = await (await viaProxy("/chunked")).text();
    expect(body).toContain(INJECTION_MARKER);
    expect(body).toContain("streamed");
    expect(body.indexOf(INJECTION_MARKER)).toBeLessThan(body.indexOf("</head>"));
  });

  it("preserves multi-byte characters", async () => {
    const body = await (await viaProxy("/unicode")).text();
    expect(body).toContain("café ☕ 日本語");
    expect(body).toContain(INJECTION_MARKER);
  });

  it("drops content-length so the grown body is not truncated", async () => {
    const res = await viaProxy("/");
    expect(res.headers.get("content-length")).toBeNull();
    const body = await res.text();
    expect(body.length).toBeGreaterThan(HTML.length);
  });

  it("asks upstream for an uncompressed body so HTML can be rewritten", async () => {
    const body = await (await viaProxy("/gzipped")).text();
    expect(lastUpstreamHeaders["accept-encoding"]).toBe("identity");
    expect(body).toContain(INJECTION_MARKER);
  });

  it("injects only once", async () => {
    const body = await (await viaProxy("/")).text();
    expect(body.split(INJECTION_MARKER)).toHaveLength(2);
  });
});

describe("pass-through", () => {
  it("leaves JSON byte-identical", async () => {
    const res = await viaProxy("/api.json");
    expect(await res.text()).toBe(JSON.stringify({ ok: true, items: [1, 2, 3] }));
    expect(res.headers.get("content-type")).toBe("application/json");
  });

  it("leaves CSS byte-identical and keeps its content-length", async () => {
    const res = await viaProxy("/app.css");
    expect(await res.text()).toBe(CSS);
    expect(res.headers.get("content-length")).toBe(String(Buffer.byteLength(CSS)));
  });

  it("forwards the request method and body", async () => {
    const res = await viaProxy("/echo", { method: "POST", body: "payload=1" });
    expect(await res.json()).toEqual({ method: "POST", body: "payload=1" });
  });

  it("preserves non-2xx status codes", async () => {
    const res = await viaProxy("/status-418");
    expect(res.status).toBe(418);
    expect(await res.text()).toBe("teapot");
  });

  it("preserves the original Host header so the app generates proxy URLs", async () => {
    await viaProxy("/api.json");
    expect(lastUpstreamHeaders.host).toBe(`127.0.0.1:${proxyPort}`);
  });
});

describe("livepin's own routes", () => {
  it("serves the overlay script rather than proxying it", async () => {
    const res = await viaProxy(`${LIVEPIN_PREFIX}/overlay.js`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("javascript");
    expect(await res.text()).toContain("livepin");
  });

  it("answers a health check carrying the session id", async () => {
    expect(await (await viaProxy(`${LIVEPIN_PREFIX}/health`)).json()).toMatchObject({
      ok: true,
      ended: false,
    });
  });

  it("proxies unknown paths under its own prefix rather than swallowing them", async () => {
    const res = await viaProxy(`${LIVEPIN_PREFIX}/nope`);
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("not found");
  });
});

describe("websocket upgrades — the HMR path", () => {
  it("relays a full websocket conversation through the proxy", async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${proxyPort}/_hmr`);
    const received: string[] = [];

    await new Promise<void>((resolve, reject) => {
      ws.on("error", reject);
      ws.on("message", (data) => {
        received.push(String(data));
        if (received.length === 1) ws.send("ping");
        if (received.length === 2) resolve();
      });
    });

    ws.close();
    // Server-initiated push, then a round trip: both directions are live.
    expect(received).toEqual(["hello", "echo:ping"]);
  });

  it("supports concurrent websocket clients", async () => {
    const open = (): Promise<string> =>
      new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://127.0.0.1:${proxyPort}/_hmr`);
        ws.on("error", reject);
        ws.on("message", (data) => {
          ws.close();
          resolve(String(data));
        });
      });

    expect(await Promise.all([open(), open(), open()])).toEqual(["hello", "hello", "hello"]);
  });
});

describe("upgrades that are not websockets", () => {
  // A dedicated pair: the main fixture has a WebSocketServer bound to it, and
  // `ws` answers every upgrade itself, so an upstream that simply declines to
  // upgrade is unreachable there.
  let plainUpstream: http.Server;
  let plainProxy: http.Server;
  let plainProxyPort: number;

  beforeAll(async () => {
    plainUpstream = http.createServer((req, res) => {
      if ((req.url ?? "") === "/multi-cookie") {
        res.writeHead(200, {
          "content-type": "text/plain",
          "set-cookie": ["a=1; Path=/", "b=2; Path=/"],
        });
        res.end("cookies");
        return;
      }
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("plain response");
    });
    await new Promise<void>((resolve) => plainUpstream.listen(0, "127.0.0.1", resolve));
    const port = (plainUpstream.address() as AddressInfo).port;

    plainProxy = createProxyServer({ target: `http://127.0.0.1:${port}` });
    await new Promise<void>((resolve) => plainProxy.listen(0, "127.0.0.1", resolve));
    plainProxyPort = (plainProxy.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => plainProxy.close(() => resolve()));
    await new Promise<void>((resolve) => plainUpstream.close(() => resolve()));
  });

  /** Send a raw request with an Upgrade header and collect the whole reply. */
  function rawUpgrade(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const socket = net.connect(plainProxyPort, "127.0.0.1", () => {
        socket.write(
          `GET ${path} HTTP/1.1\r\n` +
            `Host: 127.0.0.1:${plainProxyPort}\r\n` +
            "Connection: Upgrade\r\n" +
            "Upgrade: something-else\r\n\r\n",
        );
      });
      const chunks: Buffer[] = [];
      socket.on("data", (c: Buffer) => chunks.push(c));
      socket.on("error", reject);
      socket.on("close", () => resolve(Buffer.concat(chunks).toString("utf8")));
      // Upstream keeps the connection open; end it once the reply has landed.
      setTimeout(() => socket.end(), 150);
    });
  }

  it("relays a normal response when upstream declines to upgrade", async () => {
    const raw = await rawUpgrade("/never-upgrades");
    expect(raw).toContain("200");
    expect(raw).toContain("plain response");
  });

  it("serialises repeated headers individually", async () => {
    const raw = await rawUpgrade("/multi-cookie");
    expect(raw).toContain("a=1; Path=/");
    expect(raw).toContain("b=2; Path=/");
    // Two separate header lines, not one comma-joined value.
    expect(raw).not.toContain("a=1; Path=/,b=2");
  });
});

describe("upstream failure", () => {
  it("answers 502 with a useful message when the dev server is down", async () => {
    const orphan = createProxyServer({ target: "http://127.0.0.1:1" });
    await new Promise<void>((resolve) => orphan.listen(0, "127.0.0.1", resolve));
    const port = (orphan.address() as AddressInfo).port;

    const res = await fetch(`http://127.0.0.1:${port}/`);
    expect(res.status).toBe(502);
    expect(await res.text()).toContain("cannot reach");

    await new Promise<void>((resolve) => orphan.close(() => resolve()));
  });

  it("aborts the response when upstream dies after headers were sent", async () => {
    const res = await viaProxy("/dies-midway");
    // Status line already went out, so this is a 200 with a broken body rather
    // than a 502 — the proxy cannot retract a committed response.
    expect(res.status).toBe(200);
    await expect(res.text()).rejects.toThrow();
  });

  it("tears down both sockets when an established websocket is reset", async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${proxyPort}/_hmr`);
    await new Promise<void>((resolve, reject) => {
      ws.on("open", () => resolve());
      ws.on("error", reject);
    });

    const closed = new Promise<void>((resolve) => ws.on("close", () => resolve()));
    // terminate() resets rather than closing politely, so the proxy sees an
    // error on the client socket and must destroy the upstream one too.
    ws.terminate();
    await closed;

    // The proxy survives the reset and still serves other clients.
    expect(await (await viaProxy(`${LIVEPIN_PREFIX}/health`)).json()).toMatchObject({ ok: true });
  });

  it("closes the socket when an upgrade cannot reach upstream", async () => {
    const orphan = createProxyServer({ target: "http://127.0.0.1:1" });
    await new Promise<void>((resolve) => orphan.listen(0, "127.0.0.1", resolve));
    const port = (orphan.address() as AddressInfo).port;

    const failed = await new Promise<boolean>((resolve) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}/_hmr`);
      ws.on("error", () => resolve(true));
      ws.on("open", () => resolve(false));
    });
    expect(failed).toBe(true);

    await new Promise<void>((resolve) => orphan.close(() => resolve()));
  });
});
