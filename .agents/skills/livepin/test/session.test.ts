import { describe, expect, it, vi } from "vitest";

import { GLOBAL_THREAD_ID, Session } from "../src/session.js";
import type { ElementRef, ServerEvent } from "../src/types.js";

const ELEMENT: ElementRef = {
  selector: "[data-testid=visit-list] > li",
  text: "Dr. Okafor — Follow-up",
  bbox: [10, 20, 300, 40],
  tag: "li",
};

/** A session with deterministic ids and timestamps. */
function makeSession() {
  let tick = 0;
  return new Session({
    id: "s_test",
    now: () => `2026-08-07T00:00:${String(tick++).padStart(2, "0")}.000Z`,
  });
}

describe("construction", () => {
  it("always has a global chat thread so the panel can write immediately", () => {
    const state = makeSession().getState();
    expect(state.threads).toHaveLength(1);
    expect(state.threads[0]?.id).toBe(GLOBAL_THREAD_ID);
    expect(state.threads[0]?.element).toBeNull();
  });

  it("generates an id when one is not supplied", () => {
    expect(new Session().id).toMatch(/^s_/);
  });
});

describe("createThread", () => {
  it("creates a pin thread carrying its first comment", () => {
    const session = makeSession();
    const thread = session.createThread(ELEMENT, "http://x/page", "padding is wrong");

    expect(thread.element).toEqual(ELEMENT);
    expect(thread.url).toBe("http://x/page");
    expect(thread.resolved).toBe(false);
    expect(thread.orphaned).toBe(false);
    expect(thread.comments).toHaveLength(1);
    expect(thread.comments[0]).toMatchObject({ author: "human", text: "padding is wrong" });
  });

  it("gives threads distinct ids", () => {
    const session = makeSession();
    const a = session.createThread(ELEMENT, "http://x/", "one");
    const b = session.createThread(ELEMENT, "http://x/", "two");
    expect(a.id).not.toBe(b.id);
  });

  it("returns a copy, so callers cannot mutate stored state", () => {
    const session = makeSession();
    const thread = session.createThread(ELEMENT, "http://x/", "one");
    thread.comments.push({ id: "x", author: "agent", text: "injected", createdAt: "" });
    expect(session.getThread(thread.id)?.comments).toHaveLength(1);
  });
});

describe("addComment", () => {
  it("appends to an existing thread", () => {
    const session = makeSession();
    const thread = session.createThread(ELEMENT, "http://x/", "one");
    session.addComment(thread.id, "agent", "fixed it");

    const comments = session.getThread(thread.id)?.comments ?? [];
    expect(comments.map((c) => [c.author, c.text])).toEqual([
      ["human", "one"],
      ["agent", "fixed it"],
    ]);
  });

  it("writes to the global chat thread", () => {
    const session = makeSession();
    session.addComment(GLOBAL_THREAD_ID, "human", "general question");
    expect(session.getThread(GLOBAL_THREAD_ID)?.comments).toHaveLength(1);
  });

  it("rejects an unknown thread", () => {
    expect(() => makeSession().addComment("nope", "human", "x")).toThrow(/unknown thread/);
  });
});

describe("resolve and orphan", () => {
  it("toggles resolved", () => {
    const session = makeSession();
    const thread = session.createThread(ELEMENT, "http://x/", "one");
    session.setResolved(thread.id, true);
    expect(session.getThread(thread.id)?.resolved).toBe(true);
    session.setResolved(thread.id, false);
    expect(session.getThread(thread.id)?.resolved).toBe(false);
  });

  it("flags a thread orphaned without removing it", () => {
    const session = makeSession();
    const thread = session.createThread(ELEMENT, "http://x/", "one");
    session.setOrphaned(thread.id, true);

    const stored = session.getThread(thread.id);
    expect(stored?.orphaned).toBe(true);
    // The comment must survive — losing it is the failure this guards against.
    expect(stored?.comments[0]?.text).toBe("one");
  });

  it("rejects resolving or orphaning an unknown thread", () => {
    const session = makeSession();
    expect(() => session.setResolved("nope", true)).toThrow(/unknown thread/);
    expect(() => session.setOrphaned("nope", true)).toThrow(/unknown thread/);
  });
});

describe("ending", () => {
  it("rejects writes once ended", () => {
    const session = makeSession();
    session.end();
    expect(session.isEnded).toBe(true);
    expect(() => session.createThread(ELEMENT, "http://x/", "x")).toThrow(/session has ended/);
    expect(() => session.addComment(GLOBAL_THREAD_ID, "human", "x")).toThrow(/session has ended/);
    expect(() => session.setResolved(GLOBAL_THREAD_ID, true)).toThrow(/session has ended/);
  });

  it("is idempotent — browser and agent can both end it", () => {
    const session = makeSession();
    const events: ServerEvent[] = [];
    session.subscribe((e) => events.push(e));

    session.end();
    session.end();

    expect(events.filter((e) => e.type === "session-ended")).toHaveLength(1);
  });

  it("still allows orphaning, which is bookkeeping rather than input", () => {
    const session = makeSession();
    const thread = session.createThread(ELEMENT, "http://x/", "one");
    session.end();
    expect(() => session.setOrphaned(thread.id, true)).not.toThrow();
  });
});

describe("subscriptions", () => {
  it("emits an event per state change", () => {
    const session = makeSession();
    const events: ServerEvent[] = [];
    session.subscribe((e) => events.push(e));

    const thread = session.createThread(ELEMENT, "http://x/", "one");
    session.addComment(thread.id, "agent", "two");
    session.setResolved(thread.id, true);
    session.end();

    expect(events.map((e) => e.type)).toEqual([
      "thread-created",
      "comment-added",
      "thread-updated",
      "session-ended",
    ]);
  });

  it("stops delivering after unsubscribe", () => {
    const session = makeSession();
    const listener = vi.fn();
    const off = session.subscribe(listener);
    off();
    session.createThread(ELEMENT, "http://x/", "one");
    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps notifying other listeners when one throws", () => {
    const session = makeSession();
    const healthy = vi.fn();
    // A dropped SSE connection must not stop the rest being told.
    session.subscribe(() => {
      throw new Error("dead connection");
    });
    session.subscribe(healthy);

    session.createThread(ELEMENT, "http://x/", "one");
    expect(healthy).toHaveBeenCalledTimes(1);
  });
});

describe("snapshot and restore", () => {
  it("round-trips threads, comments and the ended flag", () => {
    const session = makeSession();
    session.createThread(ELEMENT, "http://app/patients/1182", "this wraps");
    session.addComment("t_001", "agent", "fixed");
    session.end();

    const restored = Session.restore(session.toSnapshot());
    expect(restored.getState()).toEqual(session.getState());
    expect(restored.isEnded).toBe(true);
  });

  it("does not reissue ids that are already in use", () => {
    const session = makeSession();
    session.createThread(ELEMENT, "http://app/", "first");

    const restored = Session.restore(session.toSnapshot());
    // A second t_001 would silently merge two unrelated threads.
    const second = restored.createThread(ELEMENT, "http://app/", "second");
    expect(second.id).not.toBe("t_001");
    expect(restored.getThread("t_001")?.comments[0]?.text).toBe("first");
  });

  it("recreates the global chat when a snapshot has lost it", () => {
    const session = makeSession();
    session.createThread(ELEMENT, "http://app/", "keep me");
    const snapshot = session.toSnapshot();
    snapshot.threads = snapshot.threads.filter((t) => t.id !== GLOBAL_THREAD_ID);

    const restored = Session.restore(snapshot);
    // The pin survives and the panel still has somewhere to write.
    expect(restored.getThread("t_001")?.comments[0]?.text).toBe("keep me");
    expect(restored.getThread(GLOBAL_THREAD_ID)?.comments).toEqual([]);
  });

  it("reopens an ended session, keeping its threads", () => {
    const session = makeSession();
    session.createThread(ELEMENT, "http://app/", "before the end");
    session.end();

    session.reopen();
    expect(session.isEnded).toBe(false);
    expect(session.addComment("t_001", "human", "and now this").text).toBe("and now this");
  });
});

describe("captured context", () => {
  const DATA = {
    source: { file: "components/VisitRow.tsx", line: 42 },
    componentStack: ["VisitRow", "VisitList"],
    components: [{ name: "VisitRow", props: { id: 91 } }],
    truncated: false,
  };

  it("stores a capture on the thread it was taken for", () => {
    const thread = makeSession().createThread(ELEMENT, "http://app/", "this wraps", DATA);
    expect(thread.data).toEqual(DATA);
  });

  it("omits the key entirely when there is no capture", () => {
    // An absent key and an empty capture mean different things to the agent.
    expect(makeSession().createThread(ELEMENT, "http://app/", "x")).not.toHaveProperty("data");
  });

  it("survives a snapshot round-trip", () => {
    const session = makeSession();
    session.createThread(ELEMENT, "http://app/", "x", DATA);

    expect(Session.restore(session.toSnapshot()).getThread("t_001")?.data).toEqual(DATA);
  });
});
