/**
 * The agent's half of the loop: a durable queue of human activity plus a wait
 * that blocks until there is some.
 *
 * The queue exists because the agent is not continuously connected. It runs a
 * turn, parks on a poll, is handed everything the human did, and goes away
 * again. Anything said while no agent is listening must still be waiting when
 * one returns — and must survive that poll being killed halfway through, which
 * is why the cursor advances only on the caller's explicit acknowledgement
 * rather than at the moment items are read.
 */

import { GLOBAL_THREAD_ID, type Session } from "./session.js";
import type { Comment, PollItem, PollResult, ServerEvent, Thread } from "./types.js";

/**
 * How long a poll blocks before reporting nothing happened.
 *
 * Long, because a human reviewing a page takes minutes, and a poll that gives
 * up early turns the agent's turn into a spin loop. Not infinite, so a forgotten
 * agent eventually notices and can decide to stop.
 */
export const DEFAULT_POLL_TIMEOUT_MS = 900_000;

/** Persisted form of the queue. */
export interface QueueSnapshot {
  /** Undelivered items, oldest first. */
  items: PollItem[];
  /** Highest `seq` the agent has acknowledged receiving. */
  deliveredSeq: number;
}

/** Options for {@link AgentChannel}. */
export interface AgentChannelOptions {
  /** Queue restored from disk. A fresh, empty queue when omitted. */
  queue?: QueueSnapshot;
  /** Returns the current time as an ISO string. Injectable for tests. */
  now?: () => string;
  /**
   * Called whenever the queue or its cursor changes.
   *
   * The cursor moves on acknowledgement, which no session event describes, so
   * persistence hooks in here rather than watching the session alone.
   */
  onChange?: () => void;
}

/** Options for a single {@link AgentChannel.poll}. */
export interface PollOptions {
  /** Milliseconds to block. Defaults to {@link DEFAULT_POLL_TIMEOUT_MS}. */
  timeoutMs?: number;
  /** Aborts the wait — used when the polling client disconnects. */
  signal?: AbortSignal;
}

/**
 * Watches a session and turns human activity into a queue the agent can drain.
 *
 * One channel per session. Construct it before the session takes any writes,
 * or the writes it missed are simply not queued.
 */
export class AgentChannel {
  /**
   * Called whenever the queue or its cursor changes.
   *
   * Assignable after construction so persistence can be wired up once both
   * halves exist, rather than forcing one to be built inside the other.
   */
  onChange: () => void;

  private readonly session: Session;
  private readonly now: () => string;
  private readonly unsubscribe: () => void;
  private readonly waiters = new Set<() => void>();
  /** Last known resolved flag per thread, so orphan churn is not mistaken for it. */
  private readonly resolvedState = new Map<string, boolean>();

  private items: PollItem[];
  private deliveredSeq: number;
  private seq: number;

  constructor(session: Session, options: AgentChannelOptions = {}) {
    this.session = session;
    this.now = options.now ?? (() => new Date().toISOString());
    this.onChange = options.onChange ?? ((): void => undefined);
    this.items = (options.queue?.items ?? []).map((item) => ({ ...item }));
    this.deliveredSeq = options.queue?.deliveredSeq ?? 0;
    this.seq = this.items.reduce((max, item) => Math.max(max, item.seq), this.deliveredSeq);

    for (const thread of session.getState().threads) {
      this.resolvedState.set(thread.id, thread.resolved);
    }

    this.unsubscribe = session.subscribe((event) => this.onEvent(event));
  }

  /** Stop watching the session and release anything blocked on a poll. */
  close(): void {
    this.unsubscribe();
    this.wake();
  }

  /** Items the agent has not acknowledged, oldest first. */
  pending(): PollItem[] {
    return this.items.filter((item) => item.seq > this.deliveredSeq).map((item) => ({ ...item }));
  }

  /** Serialisable state, for persistence. */
  snapshot(): QueueSnapshot {
    return { items: this.items.map((item) => ({ ...item })), deliveredSeq: this.deliveredSeq };
  }

  /**
   * Record that the agent has received everything up to `seq`.
   *
   * Called after the response has actually reached the client, never before —
   * that ordering is the whole durability guarantee.
   *
   * @param seq - Highest sequence number successfully delivered.
   */
  acknowledge(seq: number): void {
    if (seq <= this.deliveredSeq) return;
    this.deliveredSeq = seq;
    this.items = this.items.filter((item) => item.seq > this.deliveredSeq);
    this.onChange();
  }

  /**
   * Speak into the review as the agent.
   *
   * @param text - Message body.
   * @param threadId - Thread to reply in. Defaults to the global chat.
   * @returns The created comment.
   * @throws If the session has ended or the thread is unknown.
   */
  say(text: string, threadId: string = GLOBAL_THREAD_ID): Comment {
    return this.session.addComment(threadId, "agent", text);
  }

  /**
   * Wait for human activity, then report it.
   *
   * Returns immediately when there is already queued work, or when the session
   * has ended — an agent must never be able to park forever on a dead session.
   *
   * @param options - Timeout and abort signal.
   * @returns Queued items, the ended flag, and whether the wait elapsed.
   */
  async poll(options: PollOptions = {}): Promise<PollResult> {
    if (!this.hasNews()) {
      await this.wait(options.timeoutMs ?? DEFAULT_POLL_TIMEOUT_MS, options.signal);
    }

    const items = this.pending();
    return {
      sessionId: this.session.id,
      ended: this.session.isEnded,
      timedOut: items.length === 0 && !this.session.isEnded,
      items,
    };
  }

  /** Whether a poll would return right now rather than block. */
  private hasNews(): boolean {
    return this.session.isEnded || this.items.some((item) => item.seq > this.deliveredSeq);
  }

  /** Block until woken, aborted, or the timeout elapses. */
  private wait(timeoutMs: number, signal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve) => {
      let settled = false;
      const finish = (): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.waiters.delete(finish);
        signal?.removeEventListener("abort", finish);
        resolve();
      };

      const timer = setTimeout(finish, timeoutMs);
      this.waiters.add(finish);

      if (signal?.aborted) finish();
      else signal?.addEventListener("abort", finish, { once: true });
    });
  }

  /** Release every blocked poll. */
  private wake(): void {
    for (const waiter of [...this.waiters]) waiter();
  }

  /** Translate a session event into queued work for the agent. */
  private onEvent(event: ServerEvent): void {
    switch (event.type) {
      case "thread-created": {
        // createThread emits only this event, with the human's first comment
        // already inside it, so the comment is queued from here.
        this.resolvedState.set(event.thread.id, event.thread.resolved);
        const first = event.thread.comments[0];
        if (first?.author === "human") {
          this.enqueue("comment", event.thread, first.text, { createdAt: first.createdAt });
        }
        break;
      }

      case "comment-added": {
        // The agent's own replies are not news to the agent.
        if (event.comment.author !== "human") return;
        const thread = this.session.getThread(event.threadId);
        if (!thread) return;
        this.enqueue("comment", thread, event.comment.text, {
          createdAt: event.comment.createdAt,
          // The global chat has no page of its own; the comment does.
          url: event.comment.url,
        });
        break;
      }

      case "thread-updated": {
        // This event also fires for orphan bookkeeping, which the overlay can
        // emit repeatedly; only an actual change of resolved state is news.
        const previous = this.resolvedState.get(event.threadId);
        this.resolvedState.set(event.threadId, event.resolved);
        if (previous === event.resolved) return;

        const thread = this.session.getThread(event.threadId);
        if (!thread) return;
        this.enqueue(
          event.resolved ? "resolved" : "unresolved",
          thread,
          event.resolved ? "thread marked resolved" : "thread reopened",
        );
        break;
      }

      case "session-ended":
        // Nothing to queue: `ended` on the poll result carries this. Waking
        // matters though, so a parked agent learns the review is over.
        this.wake();
        return;
    }

    this.wake();
  }

  /**
   * Append an item and give it the next sequence number.
   *
   * @param kind - What happened.
   * @param thread - Thread it happened in.
   * @param text - What to tell the agent.
   * @param context - Per-comment time and page, when they differ from the thread's.
   */
  private enqueue(
    kind: PollItem["kind"],
    thread: Thread,
    text: string,
    context: { createdAt?: string | undefined; url?: string | undefined } = {},
  ): void {
    this.seq += 1;
    this.items.push({
      seq: this.seq,
      kind,
      threadId: thread.id,
      url: context.url ?? thread.url,
      text,
      createdAt: context.createdAt ?? this.now(),
      element: thread.element,
      // Carried on every item in the thread, not just the first: the agent polls
      // once and should not have to fetch state to find out what it is looking at.
      ...(thread.data ? { data: thread.data } : {}),
    });
    this.onChange();
  }
}
