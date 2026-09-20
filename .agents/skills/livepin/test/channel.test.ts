import { describe, expect, it, vi } from "vitest";

import { AgentChannel, DEFAULT_POLL_TIMEOUT_MS } from "../src/channel.js";
import { GLOBAL_THREAD_ID, Session } from "../src/session.js";
import type { ElementRef } from "../src/types.js";

const ELEMENT: ElementRef = {
  selector: '[data-testid="row-91"]',
  text: "Dr. Okafor",
  bbox: [10, 20, 300, 40],
  tag: "li",
};

const NOW = "2026-08-07T00:00:00.000Z";

/** A session and a channel watching it. */
function setup(): { session: Session; channel: AgentChannel } {
  const session = new Session({ id: "s_test", now: () => NOW });
  return { session, channel: new AgentChannel(session, { now: () => NOW }) };
}

/** Resolve after `ms`, for letting a blocked poll actually park. */
function tick(ms = 20): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("queueing", () => {
  it("queues a new pin thread with its element and page", () => {
    const { session, channel } = setup();
    session.createThread(ELEMENT, "http://app/patients/1182", "this wraps");

    expect(channel.pending()).toEqual([
      {
        seq: 1,
        kind: "comment",
        threadId: "t_001",
        url: "http://app/patients/1182",
        text: "this wraps",
        createdAt: NOW,
        element: ELEMENT,
      },
    ]);
  });

  it("queues later human comments", () => {
    const { session, channel } = setup();
    session.addComment(GLOBAL_THREAD_ID, "human", "and another thing");

    expect(channel.pending().map((i) => i.text)).toEqual(["and another thing"]);
  });

  it("carries the page a global-chat message was written on", () => {
    const { session, channel } = setup();
    session.addComment(GLOBAL_THREAD_ID, "human", "make the header sticky", "http://app/patients");

    // The global thread has no url of its own; without the comment's, the agent
    // would not know which header was meant.
    expect(channel.pending()[0]?.url).toBe("http://app/patients");
  });

  it("falls back to the thread's page when a comment carries none", () => {
    const { session, channel } = setup();
    const thread = session.createThread(ELEMENT, "http://app/patients/1182", "this wraps");
    channel.acknowledge(1);

    session.addComment(thread.id, "human", "still wrapping");
    expect(channel.pending()[0]?.url).toBe("http://app/patients/1182");
  });

  it("does not queue the agent's own replies", () => {
    const { session, channel } = setup();
    session.addComment(GLOBAL_THREAD_ID, "agent", "on it");

    expect(channel.pending()).toEqual([]);
  });

  it("queues a resolve, and the reopen that undoes it", () => {
    const { session, channel } = setup();
    const thread = session.createThread(ELEMENT, "http://app/", "fix");
    channel.acknowledge(1);

    session.setResolved(thread.id, true);
    session.setResolved(thread.id, false);

    expect(channel.pending().map((i) => i.kind)).toEqual(["resolved", "unresolved"]);
  });

  it("ignores a resolve that changes nothing", () => {
    const { session, channel } = setup();
    const thread = session.createThread(ELEMENT, "http://app/", "fix");
    channel.acknowledge(1);

    session.setResolved(thread.id, false);

    expect(channel.pending()).toEqual([]);
  });

  it("ignores orphan bookkeeping, which the overlay emits repeatedly", () => {
    const { session, channel } = setup();
    const thread = session.createThread(ELEMENT, "http://app/", "fix");
    channel.acknowledge(1);

    session.setOrphaned(thread.id, true);
    session.setOrphaned(thread.id, false);
    session.setOrphaned(thread.id, true);

    // Losing track of an element is not something the human said.
    expect(channel.pending()).toEqual([]);
  });

  it("numbers items monotonically", () => {
    const { session, channel } = setup();
    session.addComment(GLOBAL_THREAD_ID, "human", "one");
    session.addComment(GLOBAL_THREAD_ID, "human", "two");

    expect(channel.pending().map((i) => i.seq)).toEqual([1, 2]);
  });

  it("stops queueing once closed", () => {
    const { session, channel } = setup();
    channel.close();
    session.addComment(GLOBAL_THREAD_ID, "human", "after");

    expect(channel.pending()).toEqual([]);
  });

  it("notifies on change, which is what persistence hangs off", () => {
    const { session, channel } = setup();
    const onChange = vi.fn();
    channel.onChange = onChange;

    session.addComment(GLOBAL_THREAD_ID, "human", "x");
    expect(onChange).toHaveBeenCalled();

    onChange.mockClear();
    channel.acknowledge(1);
    expect(onChange).toHaveBeenCalled();
  });
});

describe("acknowledgement", () => {
  it("drops items the agent has confirmed receiving", () => {
    const { session, channel } = setup();
    session.addComment(GLOBAL_THREAD_ID, "human", "one");
    session.addComment(GLOBAL_THREAD_ID, "human", "two");

    channel.acknowledge(1);
    expect(channel.pending().map((i) => i.text)).toEqual(["two"]);
  });

  it("ignores an acknowledgement that would move the cursor backwards", () => {
    const { session, channel } = setup();
    session.addComment(GLOBAL_THREAD_ID, "human", "one");
    channel.acknowledge(1);
    channel.acknowledge(0);

    expect(channel.snapshot().deliveredSeq).toBe(1);
  });

  it("keeps undelivered items across a restore, and does not reissue seq", () => {
    const first = setup();
    first.session.addComment(GLOBAL_THREAD_ID, "human", "survives");
    const queue = first.channel.snapshot();

    // Simulate a restart: same threads, a fresh channel, the old queue.
    const session = Session.restore(first.session.toSnapshot(), { now: () => NOW });
    const channel = new AgentChannel(session, { queue, now: () => NOW });

    expect(channel.pending().map((i) => i.text)).toEqual(["survives"]);

    session.addComment(GLOBAL_THREAD_ID, "human", "and the next one");
    expect(channel.pending().map((i) => i.seq)).toEqual([1, 2]);
  });

  it("does not requeue what was already delivered before the restart", () => {
    const first = setup();
    first.session.addComment(GLOBAL_THREAD_ID, "human", "already seen");
    first.channel.acknowledge(1);

    const session = Session.restore(first.session.toSnapshot(), { now: () => NOW });
    const channel = new AgentChannel(session, { queue: first.channel.snapshot(), now: () => NOW });

    expect(channel.pending()).toEqual([]);
    session.addComment(GLOBAL_THREAD_ID, "human", "new");
    expect(channel.pending().map((i) => i.seq)).toEqual([2]);
  });
});

describe("poll", () => {
  it("returns at once when work is already queued", async () => {
    const { session, channel } = setup();
    session.addComment(GLOBAL_THREAD_ID, "human", "waiting for you");

    const result = await channel.poll({ timeoutMs: 5000 });
    expect(result).toMatchObject({ sessionId: "s_test", ended: false, timedOut: false });
    expect(result.items.map((i) => i.text)).toEqual(["waiting for you"]);
  });

  it("blocks until the human says something", async () => {
    const { session, channel } = setup();
    const pending = channel.poll({ timeoutMs: 5000 });

    await tick();
    session.addComment(GLOBAL_THREAD_ID, "human", "here I am");

    expect((await pending).items.map((i) => i.text)).toEqual(["here I am"]);
  });

  it("reports a timeout rather than an error when nothing happens", async () => {
    const { channel } = setup();

    const result = await channel.poll({ timeoutMs: 30 });
    expect(result).toMatchObject({ timedOut: true, ended: false, items: [] });
  });

  it("does not block on an ended session", async () => {
    const { session, channel } = setup();
    session.end();

    const result = await channel.poll({ timeoutMs: DEFAULT_POLL_TIMEOUT_MS });
    expect(result).toMatchObject({ ended: true, timedOut: false });
  });

  it("wakes on the end and delivers the last words with it", async () => {
    const { session, channel } = setup();
    const pending = channel.poll({ timeoutMs: 5000 });

    await tick();
    session.addComment(GLOBAL_THREAD_ID, "human", "one last thing");
    session.end();

    const result = await pending;
    expect(result.ended).toBe(true);
    expect(result.items.map((i) => i.text)).toEqual(["one last thing"]);
  });

  it("leaves items queued when the poll is abandoned unacknowledged", async () => {
    const { session, channel } = setup();
    const aborter = new AbortController();
    const pending = channel.poll({ timeoutMs: 5000, signal: aborter.signal });

    await tick();
    session.addComment(GLOBAL_THREAD_ID, "human", "not lost");
    aborter.abort();
    await pending;

    // Reading is not receiving. Without an acknowledge, the next poll repeats it.
    expect(channel.pending().map((i) => i.text)).toEqual(["not lost"]);
    expect((await channel.poll({ timeoutMs: 30 })).items.map((i) => i.text)).toEqual(["not lost"]);
  });

  it("returns immediately for a signal that is already aborted", async () => {
    const { channel } = setup();

    const result = await channel.poll({
      timeoutMs: DEFAULT_POLL_TIMEOUT_MS,
      signal: AbortSignal.abort(),
    });
    expect(result.timedOut).toBe(true);
  });

  it("releases a blocked poll when the channel closes", async () => {
    const { channel } = setup();
    const pending = channel.poll({ timeoutMs: DEFAULT_POLL_TIMEOUT_MS });

    await tick();
    channel.close();

    expect((await pending).timedOut).toBe(true);
  });

  it("wakes every waiting poll, not just the first", async () => {
    const { session, channel } = setup();
    const polls = [channel.poll({ timeoutMs: 5000 }), channel.poll({ timeoutMs: 5000 })];

    await tick();
    session.addComment(GLOBAL_THREAD_ID, "human", "everyone");

    for (const result of await Promise.all(polls)) {
      expect(result.items.map((i) => i.text)).toEqual(["everyone"]);
    }
  });
});

describe("say", () => {
  it("writes into the global chat by default", () => {
    const { session, channel } = setup();
    channel.say("moved the badge inline");

    expect(session.getThread(GLOBAL_THREAD_ID)?.comments).toEqual([
      { id: "c_001", author: "agent", text: "moved the badge inline", createdAt: NOW },
    ]);
  });

  it("writes into a named thread", () => {
    const { session, channel } = setup();
    const thread = session.createThread(ELEMENT, "http://app/", "fix this");

    channel.say("done", thread.id);
    expect(session.getThread(thread.id)?.comments.at(-1)).toMatchObject({
      author: "agent",
      text: "done",
    });
  });

  it("refuses to speak into an ended session", () => {
    const { session, channel } = setup();
    session.end();

    expect(() => channel.say("hello?")).toThrow(/session has ended/);
  });
});

describe("captured context", () => {
  const DATA = {
    source: { file: "components/VisitRow.tsx", line: 42 },
    componentStack: ["VisitRow"],
    components: [{ name: "VisitRow", props: { id: 91 } }],
    truncated: false,
  };

  it("delivers the capture with the comment that opened the thread", () => {
    const { session, channel } = setup();
    session.createThread(ELEMENT, "http://app/", "show the last visit date", DATA);

    expect(channel.pending()[0]?.data).toEqual(DATA);
  });

  it("repeats it on later comments, so a poll never needs a follow-up fetch", () => {
    const { session, channel } = setup();
    const thread = session.createThread(ELEMENT, "http://app/", "first", DATA);
    channel.acknowledge(1);

    session.addComment(thread.id, "human", "and another thing");
    expect(channel.pending()[0]?.data).toEqual(DATA);
  });

  it("omits the key when the thread has no capture", () => {
    const { session, channel } = setup();
    session.createThread(ELEMENT, "http://app/", "no context");

    expect(channel.pending()[0]).not.toHaveProperty("data");
  });
});
