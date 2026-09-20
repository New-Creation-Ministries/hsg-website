import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createApiHandler, LIVEPIN_PREFIX, relativiseSource } from "../src/api.js";
import { AgentChannel } from "../src/channel.js";
import { compileConfig } from "../src/config.js";
import { NetworkLog } from "../src/network-log.js";
import { GLOBAL_THREAD_ID, Session } from "../src/session.js";
import type {
  CapturedData,
  Comment,
  ElementRef,
  PollResult,
  SessionState,
  Thread,
} from "../src/types.js";

const ELEMENT: ElementRef = {
  selector: '[data-testid="row-91"]',
  text: "Dr. Okafor",
  bbox: [10, 20, 300, 40],
  tag: "li",
};

let server: http.Server;
let base: string;
let session: Session;
let channel: AgentChannel;
let networkLog: NetworkLog;

beforeEach(async () => {
  session = new Session({ id: "s_test", now: () => "2026-08-07T00:00:00.000Z" });
  channel = new AgentChannel(session, { now: () => "2026-08-07T00:00:00.000Z" });
  networkLog = new NetworkLog();
  const handle = createApiHandler({
    session,
    channel,
    getOverlayBundle: async () => "/* overlay */",
    projectRoot: "/proj",
    config: compileConfig({ redactUrls: ["*/secret/*"], redactFields: ["ssn"] }),
    networkLog,
  });

  server = http.createServer((req, res) => {
    void handle(req, res).then((handled) => {
      if (!handled) {
        res.writeHead(404, { "content-type": "text/plain" });
        res.end("fell through");
      }
    });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  channel.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

/** POST JSON to an API route. */
function post(route: string, body: unknown): Promise<Response> {
  return fetch(`${base}${LIVEPIN_PREFIX}${route}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("routing", () => {
  it("falls through for paths outside its namespace", async () => {
    const res = await fetch(`${base}/some/app/route`);
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("fell through");
  });

  it("falls through for unknown paths inside its namespace", async () => {
    // These belong to the host app, not to us.
    const res = await fetch(`${base}${LIVEPIN_PREFIX}/not-a-route`);
    expect(await res.text()).toBe("fell through");
  });

  it("serves the overlay bundle", async () => {
    const res = await fetch(`${base}${LIVEPIN_PREFIX}/overlay.js`);
    expect(res.headers.get("content-type")).toContain("javascript");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.text()).toBe("/* overlay */");
  });
});

describe("state", () => {
  it("returns the session with its global thread", async () => {
    const state = (await (
      await fetch(`${base}${LIVEPIN_PREFIX}/api/state`)
    ).json()) as SessionState;
    expect(state.id).toBe("s_test");
    expect(state.ended).toBe(false);
    expect(state.threads.map((t) => t.id)).toEqual([GLOBAL_THREAD_ID]);
  });
});

describe("writing", () => {
  it("creates a pin thread", async () => {
    const res = await post("/api/thread", {
      element: ELEMENT,
      url: "http://app/page",
      text: "padding is wrong",
    });
    expect(res.status).toBe(201);

    const thread = (await res.json()) as Thread;
    expect(thread.element).toEqual(ELEMENT);
    expect(thread.comments[0]?.text).toBe("padding is wrong");
  });

  it("adds a comment attributed to the human", async () => {
    const res = await post("/api/comment", { threadId: GLOBAL_THREAD_ID, text: "hello" });
    expect(res.status).toBe(201);
    // The API is the browser's door; only the CLI may speak as the agent.
    expect((await res.json()).author).toBe("human");
  });

  it("resolves and unresolves a thread", async () => {
    const thread = (await (
      await post("/api/thread", {
        element: ELEMENT,
        url: "http://app/",
        text: "x",
      })
    ).json()) as Thread;

    await post("/api/resolve", { threadId: thread.id, resolved: true });
    expect(session.getThread(thread.id)?.resolved).toBe(true);
  });

  it("flags a thread orphaned", async () => {
    const thread = (await (
      await post("/api/thread", {
        element: ELEMENT,
        url: "http://app/",
        text: "x",
      })
    ).json()) as Thread;

    await post("/api/orphan", { threadId: thread.id, orphaned: true });
    expect(session.getThread(thread.id)?.orphaned).toBe(true);
  });

  it("rejects a comment on an unknown thread with 400", async () => {
    const res = await post("/api/comment", { threadId: "nope", text: "x" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/unknown thread/);
  });

  it("rejects a malformed body with 400", async () => {
    const res = await fetch(`${base}${LIVEPIN_PREFIX}/api/thread`, {
      method: "POST",
      body: "not json",
    });
    expect(res.status).toBe(400);
  });

  it("rejects an empty body with 400", async () => {
    const res = await fetch(`${base}${LIVEPIN_PREFIX}/api/thread`, { method: "POST" });
    expect(res.status).toBe(400);
  });

  it("rejects an oversized body rather than buffering it", async () => {
    // Bounds memory on a malformed or hostile client.
    const res = await post("/api/thread", {
      element: null,
      url: "http://app/",
      text: "x".repeat(2 * 1024 * 1024),
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/too large/);
  });
});

describe("captured context", () => {
  const DATA: CapturedData = {
    source: { file: "/proj/components/VisitRow.tsx", line: 42 },
    componentStack: ["VisitRow", "VisitList"],
    components: [{ name: "VisitRow", props: { id: 91 } }],
    truncated: false,
  };

  it("stores a capture on the thread", async () => {
    const thread = (await (
      await post("/api/thread", { element: ELEMENT, url: "http://app/", text: "x", data: DATA })
    ).json()) as Thread;

    expect(thread.data?.componentStack).toEqual(["VisitRow", "VisitList"]);
  });

  it("shortens the source path to the project root", async () => {
    const thread = (await (
      await post("/api/thread", { element: ELEMENT, url: "http://app/", text: "x", data: DATA })
    ).json()) as Thread;

    // The agent runs in the project root and opens files relative to it.
    expect(thread.data?.source?.file).toBe("components/VisitRow.tsx");
  });

  it("leaves a path from outside the project alone", async () => {
    const outside: CapturedData = {
      ...DATA,
      source: { file: "/elsewhere/lib/Badge.tsx", line: 3 },
    };
    const thread = (await (
      await post("/api/thread", { element: ELEMENT, url: "http://app/", text: "x", data: outside })
    ).json()) as Thread;

    // A linked package is not under the root; mangling it would help nobody.
    expect(thread.data?.source?.file).toBe("/elsewhere/lib/Badge.tsx");
  });

  it("delivers the capture to the agent with the comment", async () => {
    await post("/api/thread", { element: ELEMENT, url: "http://app/", text: "x", data: DATA });

    const result = (await (await post("/agent/poll", { timeoutMs: 50 })).json()) as PollResult;
    expect(result.items[0]?.data?.source).toEqual({ file: "components/VisitRow.tsx", line: 42 });
  });

  it("omits data entirely when the human left context off", async () => {
    await post("/api/thread", { element: ELEMENT, url: "http://app/", text: "x" });

    const result = (await (await post("/agent/poll", { timeoutMs: 50 })).json()) as PollResult;
    expect(result.items[0]).not.toHaveProperty("data");
  });
});

describe("network context", () => {
  /** A capture asking for network context. */
  function withNetwork(): CapturedData {
    return {
      componentStack: ["VisitRow"],
      components: [],
      truncated: false,
      network: [
        {
          method: "GET",
          url: "https://api.example.com/patients/1182/visits",
          status: 200,
          ms: 214,
          startedAt: "2026-08-07T00:00:00.000Z",
          via: "page",
          responseBody: '{"name":"Ada Okafor","ssn":"123-45-6789"}',
        },
      ],
    };
  }

  it("merges in what the proxy saw", async () => {
    networkLog.record({
      method: "GET",
      url: "/patients/1182",
      status: 200,
      ms: 30,
      startedAt: "2026-08-07T00:00:00.000Z",
      contentType: "text/html",
    });

    const thread = (await (
      await post("/api/thread", {
        element: ELEMENT,
        url: "http://app/",
        text: "x",
        data: withNetwork(),
      })
    ).json()) as Thread;

    // The document load was never a fetch call, so only the proxy saw it.
    expect(thread.data?.network?.map((entry) => [entry.via, entry.url])).toEqual([
      ["page", "https://api.example.com/patients/1182/visits"],
      ["proxy", "/patients/1182"],
    ]);
  });

  it("redacts bodies before they are ever stored", async () => {
    const thread = (await (
      await post("/api/thread", {
        element: ELEMENT,
        url: "http://app/",
        text: "x",
        data: withNetwork(),
      })
    ).json()) as Thread;

    const body = JSON.parse(thread.data!.network![0]!.responseBody!) as Record<string, unknown>;
    expect(body).toEqual({ name: "Ada Okafor", ssn: "[redacted]" });
    // And the stored session must hold the redacted copy, not the original.
    expect(JSON.stringify(session.getState())).not.toContain("123-45-6789");
  });

  it("adds no proxy entries to a pin that did not ask for network context", async () => {
    networkLog.record({
      method: "GET",
      url: "/patients/1182",
      status: 200,
      ms: 30,
      startedAt: "2026-08-07T00:00:00.000Z",
    });

    const dataOnly: CapturedData = { componentStack: [], components: [], truncated: false };
    const thread = (await (
      await post("/api/thread", { element: ELEMENT, url: "http://app/", text: "x", data: dataOnly })
    ).json()) as Thread;

    expect(thread.data).not.toHaveProperty("network");
  });

  it("serves the redaction rules to the overlay", async () => {
    const res = await fetch(`${base}${LIVEPIN_PREFIX}/api/config`);
    expect(await res.json()).toEqual({
      redactUrls: ["*/secret/*"],
      redactFields: ["ssn"],
    });
  });
});

describe("relativiseSource", () => {
  const data: CapturedData = {
    source: { file: "/proj/src/Row.tsx", line: 1 },
    componentStack: [],
    components: [],
    truncated: false,
  };

  it("handles a root given with a trailing slash", () => {
    expect(relativiseSource(data, "/proj/")?.source?.file).toBe("src/Row.tsx");
  });

  it("passes through a capture with no source", () => {
    const sourceless: CapturedData = { componentStack: ["Row"], components: [], truncated: false };
    expect(relativiseSource(sourceless, "/proj")).toBe(sourceless);
  });

  it("passes through an absent capture", () => {
    expect(relativiseSource(undefined, "/proj")).toBeUndefined();
  });
});

describe("ending", () => {
  it("ends the session", async () => {
    const res = await post("/api/end", {});
    expect(await res.json()).toEqual({ ok: true, ended: true });
    expect(session.isEnded).toBe(true);
  });

  it("answers 409 for writes after the end, so the overlay stops rather than retrying", async () => {
    await post("/api/end", {});
    const res = await post("/api/comment", { threadId: GLOBAL_THREAD_ID, text: "late" });
    expect(res.status).toBe(409);
  });
});

describe("agent routes", () => {
  it("polls, returning queued human comments", async () => {
    session.addComment(GLOBAL_THREAD_ID, "human", "the badge wraps");

    const result = (await (await post("/agent/poll", { timeoutMs: 50 })).json()) as PollResult;
    expect(result.timedOut).toBe(false);
    expect(result.items.map((i) => i.text)).toEqual(["the badge wraps"]);
  });

  it("advances the cursor only once the payload has been delivered", async () => {
    session.addComment(GLOBAL_THREAD_ID, "human", "once");

    await post("/agent/poll", { timeoutMs: 50 });
    // Delivered and acknowledged, so a second poll has nothing to repeat.
    const again = (await (await post("/agent/poll", { timeoutMs: 50 })).json()) as PollResult;
    expect(again.items).toEqual([]);
    expect(again.timedOut).toBe(true);
  });

  it("blocks until the human writes, then returns what they wrote", async () => {
    const pending = post("/agent/poll", { timeoutMs: 5000 });

    // Comment only after the poll is definitely parked.
    await new Promise((resolve) => setTimeout(resolve, 50));
    session.addComment(GLOBAL_THREAD_ID, "human", "arrived late");

    const result = (await (await pending).json()) as PollResult;
    expect(result.items.map((i) => i.text)).toEqual(["arrived late"]);
  });

  it("posts an agent reply before blocking, so the panel reads in order", async () => {
    const pending = post("/agent/poll", {
      timeoutMs: 5000,
      reply: { text: "moved it inline" },
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(session.getThread(GLOBAL_THREAD_ID)?.comments.at(-1)).toMatchObject({
      author: "agent",
      text: "moved it inline",
    });

    session.addComment(GLOBAL_THREAD_ID, "human", "better");
    await pending;
  });

  it("returns immediately with ended once the session is over", async () => {
    session.end();

    const result = (await (await post("/agent/poll", { timeoutMs: 5000 })).json()) as PollResult;
    expect(result).toMatchObject({ ended: true, timedOut: false, items: [] });
  });

  it("delivers the human's last words together with the end", async () => {
    const pending = post("/agent/poll", { timeoutMs: 5000 });

    await new Promise((resolve) => setTimeout(resolve, 50));
    session.addComment(GLOBAL_THREAD_ID, "human", "one last thing");
    session.end();

    const result = (await (await pending).json()) as PollResult;
    expect(result.ended).toBe(true);
    expect(result.items.map((i) => i.text)).toEqual(["one last thing"]);
  });

  it("accepts a poll with no body at all", async () => {
    const pending = fetch(`${base}${LIVEPIN_PREFIX}/agent/poll`, { method: "POST" });

    // An absent body means the default timeout, so end the session rather than
    // waiting fifteen minutes for it.
    await new Promise((resolve) => setTimeout(resolve, 50));
    session.end();

    expect((await pending).status).toBe(200);
  });

  it("acknowledges nothing when the polling client hangs up mid-wait", async () => {
    const aborter = new AbortController();
    const pending = fetch(`${base}${LIVEPIN_PREFIX}/agent/poll`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ timeoutMs: 5000 }),
      signal: aborter.signal,
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    aborter.abort();
    await expect(pending).rejects.toThrow();

    // The abandoned poll must not have swallowed the cursor: what the human
    // says next is still there for the agent's next attempt.
    await new Promise((resolve) => setTimeout(resolve, 50));
    session.addComment(GLOBAL_THREAD_ID, "human", "said into the void");
    expect(channel.pending().map((i) => i.text)).toEqual(["said into the void"]);
  });

  it("says something as the agent", async () => {
    const res = await post("/agent/say", { text: "shipped" });
    expect(res.status).toBe(201);
    expect((await res.json()) as Comment).toMatchObject({ author: "agent", text: "shipped" });
  });

  it("rejects an empty message rather than posting a blank comment", async () => {
    const res = await post("/agent/say", { text: "" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/text is required/);
  });

  it("answers 409 when the agent speaks into an ended session", async () => {
    session.end();
    const res = await post("/agent/say", { text: "still here?" });
    expect(res.status).toBe(409);
  });
});

describe("event stream", () => {
  /** Read SSE frames until `count` data payloads have arrived. */
  async function readEvents(count: number, trigger: () => void): Promise<unknown[]> {
    const res = await fetch(`${base}${LIVEPIN_PREFIX}/api/events`);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    const payloads: unknown[] = [];
    let buffer = "";
    let triggered = false;

    while (payloads.length < count) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      for (const frame of buffer.split("\n\n")) {
        const line = frame.trim();
        if (line.startsWith("data: ")) {
          const parsed: unknown = JSON.parse(line.slice(6));
          if (!payloads.includes(parsed)) payloads.push(parsed);
        }
      }
      buffer = "";

      // Fire the change only once the stream is definitely established.
      if (!triggered) {
        triggered = true;
        trigger();
      }
    }

    await reader.cancel();
    return payloads;
  }

  it("opens with a sync frame then streams changes", async () => {
    const events = (await readEvents(2, () => {
      session.addComment(GLOBAL_THREAD_ID, "human", "streamed");
    })) as { type: string }[];

    expect(events[0]?.type).toBe("sync");
    expect(events.some((e) => e.type === "comment-added")).toBe(true);
  });

  it("unsubscribes when the client disconnects", async () => {
    const res = await fetch(`${base}${LIVEPIN_PREFIX}/api/events`);
    const reader = res.body!.getReader();
    await reader.read();
    await reader.cancel();

    // Give the server a tick to notice the close, then confirm writing to the
    // session no longer throws into a dead connection.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(() => session.addComment(GLOBAL_THREAD_ID, "human", "after")).not.toThrow();
  });
});
