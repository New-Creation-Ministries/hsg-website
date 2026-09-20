// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  addComment,
  API_BASE,
  createThread,
  endSession,
  fetchState,
  openEventStream,
  setOrphaned,
  setResolved,
} from "../../src/overlay/transport.js";
import type { ElementRef } from "../../src/types.js";

const ELEMENT: ElementRef = {
  selector: '[data-testid="row-91"]',
  text: "Dr. Okafor",
  bbox: [1, 2, 3, 4],
  tag: "li",
};

/** Replace global fetch with a stub returning `body`. */
function stubFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  // Parameters are declared so `mock.calls` carries their types.
  const stub = vi.fn(async (_url: string | URL, _init?: RequestInit) => ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  }));
  vi.stubGlobal("fetch", stub);
  return stub;
}

/** Read the JSON body from a recorded fetch call. */
function bodyOf(stub: ReturnType<typeof stubFetch>, call = 0): unknown {
  const init = stub.mock.calls[call]?.[1] as { body?: string } | undefined;
  return JSON.parse(init?.body ?? "null");
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("reads", () => {
  it("fetches state from the namespaced path", async () => {
    const stub = stubFetch({ id: "s_1", ended: false, threads: [] });
    const state = await fetchState();

    expect(stub.mock.calls[0]?.[0]).toBe(`${API_BASE}/api/state`);
    expect(state.id).toBe("s_1");
  });

  it("throws on a failed state fetch", async () => {
    stubFetch({}, { ok: false, status: 503 });
    await expect(fetchState()).rejects.toThrow(/503/);
  });
});

describe("writes", () => {
  it("posts a thread with the current page URL", async () => {
    const stub = stubFetch({ id: "t_001" });
    await createThread(ELEMENT, "padding is wrong");

    expect(stub.mock.calls[0]?.[0]).toBe(`${API_BASE}/api/thread`);
    expect(bodyOf(stub)).toEqual({
      element: ELEMENT,
      url: location.href,
      text: "padding is wrong",
    });
  });

  it("posts a global thread with a null element", async () => {
    const stub = stubFetch({ id: "t_002" });
    await createThread(null, "general");
    expect((bodyOf(stub) as { element: unknown }).element).toBeNull();
  });

  it("posts a comment with the page it was written on", async () => {
    const stub = stubFetch({ id: "c_1" });
    await addComment("t_001", "reply");
    expect(stub.mock.calls[0]?.[0]).toBe(`${API_BASE}/api/comment`);
    // The page matters for global chat, which belongs to no thread url.
    expect(bodyOf(stub)).toEqual({ threadId: "t_001", text: "reply", url: location.href });
  });

  it("posts resolve, orphan and end", async () => {
    const stub = stubFetch({ ok: true });
    await setResolved("t_001", true);
    await setOrphaned("t_001", false);
    await endSession();

    expect(stub.mock.calls.map((c) => c[0])).toEqual([
      `${API_BASE}/api/resolve`,
      `${API_BASE}/api/orphan`,
      `${API_BASE}/api/end`,
    ]);
    expect(bodyOf(stub, 0)).toEqual({ threadId: "t_001", resolved: true });
    expect(bodyOf(stub, 1)).toEqual({ threadId: "t_001", orphaned: false });
  });

  it("surfaces the server's error detail on a failed post", async () => {
    stubFetch({ error: "session has ended" }, { ok: false, status: 409 });
    await expect(addComment("t_001", "late")).rejects.toThrow(/409.*session has ended/);
  });
});

describe("openEventStream", () => {
  /** Minimal EventSource stand-in that records construction and close. */
  class FakeEventSource {
    static last: FakeEventSource | null = null;
    onmessage: ((event: MessageEvent<string>) => void) | null = null;
    closed = false;

    constructor(readonly url: string) {
      FakeEventSource.last = this;
    }

    close(): void {
      this.closed = true;
    }
  }

  beforeEach(() => {
    FakeEventSource.last = null;
    vi.stubGlobal("EventSource", FakeEventSource);
  });

  it("connects to the events route", () => {
    openEventStream(() => {});
    expect(FakeEventSource.last?.url).toBe(`${API_BASE}/api/events`);
  });

  it("parses and forwards each frame", () => {
    const received: unknown[] = [];
    openEventStream((message) => received.push(message));

    FakeEventSource.last?.onmessage?.({
      data: JSON.stringify({ type: "session-ended" }),
    } as MessageEvent<string>);

    expect(received).toEqual([{ type: "session-ended" }]);
  });

  it("ignores a malformed frame rather than tearing down the stream", () => {
    const received: unknown[] = [];
    openEventStream((message) => received.push(message));

    expect(() =>
      FakeEventSource.last?.onmessage?.({ data: "not json" } as MessageEvent<string>),
    ).not.toThrow();
    expect(received).toEqual([]);
  });

  it("closes the stream when the returned function is called", () => {
    const close = openEventStream(() => {});
    close();
    expect(FakeEventSource.last?.closed).toBe(true);
  });
});
