/**
 * In-memory store for a review session.
 *
 * Deliberately free of I/O: it holds state and notifies listeners, and knows
 * nothing about HTTP, SSE, or the filesystem. Persistence (`store.ts`) and the
 * blocking-poll semantics (`channel.ts`) wrap this rather than changing it.
 */

import type {
  Author,
  CapturedData,
  Comment,
  ElementRef,
  ServerEvent,
  SessionState,
  Thread,
} from "./types.js";

/** Identifier of the single global-chat thread. */
export const GLOBAL_THREAD_ID = "global";

/** Called for every state change. Used to drive SSE and, later, the poll. */
export type SessionListener = (event: ServerEvent) => void;

/** Injectable dependencies, so tests get deterministic ids and timestamps. */
export interface SessionOptions {
  /** Returns the current time as an ISO string. */
  now?: () => string;
  /** Session identifier. Generated when omitted. */
  id?: string;
}

/**
 * Everything needed to rebuild a session verbatim.
 *
 * `counter` is part of the snapshot because ids must not be reissued after a
 * restart — a second `t_003` would silently merge two unrelated threads.
 */
export interface SessionSnapshot extends SessionState {
  counter: number;
}

/**
 * Holds the threads, comments and ended-flag for one review.
 *
 * Ending is one-way and enforced here rather than at the HTTP layer, so no
 * route can accidentally accept input into a closed session.
 */
export class Session {
  readonly id: string;

  private readonly now: () => string;
  private readonly listeners = new Set<SessionListener>();
  private readonly threads = new Map<string, Thread>();
  private counter = 0;
  private ended = false;

  constructor(options: SessionOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.id = options.id ?? `s_${Math.random().toString(36).slice(2, 10)}`;

    // The global chat always exists, so the panel has somewhere to write
    // before any element has been annotated.
    this.threads.set(GLOBAL_THREAD_ID, {
      id: GLOBAL_THREAD_ID,
      element: null,
      url: "",
      resolved: false,
      orphaned: false,
      createdAt: this.now(),
      comments: [],
    });
  }

  /**
   * Rebuild a session from a persisted snapshot.
   *
   * A snapshot missing the global thread is treated as partially corrupt: the
   * threads it does carry are kept and the global chat is recreated empty,
   * because refusing to load would lose the human's comments entirely.
   *
   * @param snapshot - Previously produced by {@link toSnapshot}.
   * @param options - Injectable clock. The id comes from the snapshot.
   * @returns The restored session.
   */
  static restore(snapshot: SessionSnapshot, options: Omit<SessionOptions, "id"> = {}): Session {
    const session = new Session({ ...options, id: snapshot.id });

    for (const thread of snapshot.threads) {
      session.threads.set(thread.id, structuredClone(thread));
    }
    session.counter = snapshot.counter;
    session.ended = snapshot.ended;

    return session;
  }

  /** Whether the session has been ended. */
  get isEnded(): boolean {
    return this.ended;
  }

  /** Serialisable form, including the id counter. */
  toSnapshot(): SessionSnapshot {
    return { ...this.getState(), counter: this.counter };
  }

  /**
   * Subscribe to state changes.
   *
   * @param listener - Called for each event.
   * @returns Unsubscribe function.
   */
  subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Snapshot of everything, safe to serialise. */
  getState(): SessionState {
    return {
      id: this.id,
      ended: this.ended,
      threads: [...this.threads.values()].map((t) => structuredClone(t)),
    };
  }

  /**
   * Look up a thread.
   *
   * @param id - Thread identifier.
   * @returns The thread, or undefined if unknown.
   */
  getThread(id: string): Thread | undefined {
    const thread = this.threads.get(id);
    return thread ? structuredClone(thread) : undefined;
  }

  /**
   * Open a new thread with its first comment.
   *
   * @param element - Element the pin is anchored to, or null for global chat.
   * @param url - Page URL the thread was opened on.
   * @param text - The first comment's body.
   * @param data - Fiber capture, when the human had context turned on.
   * @returns The created thread.
   * @throws If the session has ended.
   */
  createThread(element: ElementRef | null, url: string, text: string, data?: CapturedData): Thread {
    this.assertOpen();

    const thread: Thread = {
      id: this.nextId("t"),
      element,
      url,
      ...(data ? { data } : {}),
      resolved: false,
      orphaned: false,
      createdAt: this.now(),
      comments: [{ id: this.nextId("c"), author: "human", text, createdAt: this.now() }],
    };

    this.threads.set(thread.id, thread);
    this.emit({ type: "thread-created", thread: structuredClone(thread) });
    return structuredClone(thread);
  }

  /**
   * Append a comment to an existing thread.
   *
   * @param threadId - Target thread.
   * @param author - Who is speaking.
   * @param text - Message body.
   * @param url - Page the comment was written on, when known.
   * @returns The created comment.
   * @throws If the session has ended or the thread is unknown.
   */
  addComment(threadId: string, author: Author, text: string, url?: string): Comment {
    this.assertOpen();

    const thread = this.threads.get(threadId);
    if (!thread) throw new Error(`unknown thread: ${threadId}`);

    const comment: Comment = {
      id: this.nextId("c"),
      author,
      text,
      createdAt: this.now(),
      ...(url ? { url } : {}),
    };
    thread.comments.push(comment);
    this.emit({ type: "comment-added", threadId, comment: structuredClone(comment) });
    return structuredClone(comment);
  }

  /**
   * Mark a thread resolved or unresolved.
   *
   * @param threadId - Target thread.
   * @param resolved - Desired state.
   * @throws If the session has ended or the thread is unknown.
   */
  setResolved(threadId: string, resolved: boolean): void {
    this.assertOpen();

    const thread = this.threads.get(threadId);
    if (!thread) throw new Error(`unknown thread: ${threadId}`);

    thread.resolved = resolved;
    this.emit({
      type: "thread-updated",
      threadId,
      resolved,
      orphaned: thread.orphaned,
    });
  }

  /**
   * Flag a thread whose element could not be found again after a code change.
   *
   * Orphaning is not deletion: the comment stays visible in the panel so the
   * human can see what was lost track of.
   *
   * @param threadId - Target thread.
   * @param orphaned - Desired state.
   */
  setOrphaned(threadId: string, orphaned: boolean): void {
    const thread = this.threads.get(threadId);
    if (!thread) throw new Error(`unknown thread: ${threadId}`);

    thread.orphaned = orphaned;
    this.emit({
      type: "thread-updated",
      threadId,
      resolved: thread.resolved,
      orphaned,
    });
  }

  /**
   * End the session.
   *
   * Idempotent: ending an already-ended session is a no-op rather than an
   * error, because the browser and the agent can both trigger it.
   */
  end(): void {
    if (this.ended) return;
    this.ended = true;
    this.emit({ type: "session-ended" });
  }

  /**
   * Reopen an ended session, keeping its threads.
   *
   * Only reachable through `livepin start --reopen`, never from the browser or
   * the agent's own verbs: a human ending a review is a decision, and an agent
   * that could undo it would be able to talk past being dismissed.
   */
  reopen(): void {
    this.ended = false;
  }

  /** Generate a short, stable, human-readable id. */
  private nextId(prefix: string): string {
    this.counter += 1;
    return `${prefix}_${String(this.counter).padStart(3, "0")}`;
  }

  /** Reject writes to a closed session. */
  private assertOpen(): void {
    if (this.ended) throw new Error("session has ended");
  }

  /** Notify listeners, isolating each from the others' failures. */
  private emit(event: ServerEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // A broken SSE connection must not stop the others from being told.
      }
    }
  }
}
