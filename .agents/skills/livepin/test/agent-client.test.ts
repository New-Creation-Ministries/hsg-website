import http from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadPointer, requestJson } from "../src/agent-client.js";
import { SessionStore, type ServerPointer } from "../src/store.js";

let server: http.Server;
let pointer: ServerPointer;

/** Stand up a server with a fixed behaviour and point at it. */
async function serve(handler: http.RequestListener): Promise<void> {
  server = http.createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

  pointer = {
    sessionId: "s_test",
    host: "127.0.0.1",
    port: (server.address() as AddressInfo).port,
    target: "http://localhost:3000",
    pid: process.pid,
    startedAt: "2026-08-07T00:00:00.000Z",
    running: true,
  };
}

afterEach(async () => {
  if (server?.listening) {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

describe("requestJson", () => {
  it("sends a JSON body and parses the reply", async () => {
    let received = "";
    await serve((req, res) => {
      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => {
        received = Buffer.concat(chunks).toString("utf8");
        res.writeHead(201, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, path: req.url }));
      });
    });

    const { status, body } = await requestJson<{ ok: boolean; path: string }>(pointer, {
      method: "POST",
      path: "/agent/say",
      body: { text: "hello" },
    });

    expect(status).toBe(201);
    expect(body).toEqual({ ok: true, path: "/__livepin/agent/say" });
    expect(JSON.parse(received)).toEqual({ text: "hello" });
  });

  it("reports a non-JSON reply as such, rather than as a parse crash", async () => {
    // This is what hitting the host app instead of livepin looks like.
    await serve((_req, res) => {
      res.writeHead(200, { "content-type": "text/html" });
      res.end("<!doctype html><title>the app</title>");
    });

    await expect(requestJson(pointer, { method: "GET", path: "/api/state" })).rejects.toThrow(
      /non-JSON reply/,
    );
  });

  it("gives up after the client timeout when the server never answers", async () => {
    await serve(() => {
      // Deliberately no response: a wedged proxy must not hang the agent's turn.
    });

    await expect(
      requestJson(pointer, { method: "GET", path: "/api/state", timeoutMs: 60 }),
    ).rejects.toThrow(/no reply from the proxy within 60ms/);
  });

  it("explains a refused connection as a proxy that is gone", async () => {
    await serve((_req, res) => res.end("{}"));
    const port = (server.address() as AddressInfo).port;
    await new Promise<void>((resolve) => server.close(() => resolve()));

    await expect(
      requestJson({ ...pointer, port }, { method: "GET", path: "/api/state" }),
    ).rejects.toThrow(/not running any more/);
  });

  it("passes any other socket error through unchanged", async () => {
    await serve((_req, res) => res.end("{}"));

    // An unresolvable host fails with ENOTFOUND, which is not ours to reword.
    await expect(
      requestJson({ ...pointer, host: "no-such-host.invalid" }, { method: "GET", path: "/x" }),
    ).rejects.toThrow(/no-such-host\.invalid/);
  });
});

describe("loadPointer", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "livepin-client-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("returns a live pointer", async () => {
    const store = new SessionStore(dir);
    await store.writePointer({
      sessionId: "s_test",
      host: "127.0.0.1",
      port: 4850,
      target: "http://localhost:3000",
      pid: 1,
      startedAt: "2026-08-07T00:00:00.000Z",
      running: true,
    });

    expect((await loadPointer(store)).sessionId).toBe("s_test");
  });

  it("says how to start one when none exists", async () => {
    await expect(loadPointer(new SessionStore(dir))).rejects.toThrow(/no livepin session found/);
  });

  it("names the target to restart with when the proxy has stopped", async () => {
    const store = new SessionStore(dir);
    await store.writePointer({
      sessionId: "s_test",
      host: "127.0.0.1",
      port: 4850,
      target: "http://localhost:3000",
      pid: 1,
      startedAt: "2026-08-07T00:00:00.000Z",
      running: false,
    });

    await expect(loadPointer(store)).rejects.toThrow(
      /has stopped — restart it with `livepin start --target http:\/\/localhost:3000`/,
    );
  });
});
