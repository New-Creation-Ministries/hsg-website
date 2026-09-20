/**
 * Types shared between the CLI/server and the browser overlay.
 *
 * This module must stay free of Node and DOM imports: it is bundled into the
 * overlay and imported by the server, so anything platform-specific here breaks
 * one side or the other.
 */

/** Who wrote a comment. */
export type Author = "human" | "agent";

/** Identifies the DOM element a thread is anchored to. */
export interface ElementRef {
  /** CSS selector, generated to be as stable as reasonably possible. */
  selector: string;
  /** Visible text of the element, truncated. Used as a re-anchoring fallback. */
  text: string;
  /** Viewport-relative box at capture time: `[x, y, width, height]`. */
  bbox: [number, number, number, number];
  /** Tag name, lowercase. */
  tag: string;
}

/** Where in the source a clicked element is written. */
export interface SourceRef {
  /** Path as React reported it, made project-relative when possible. */
  file: string;
  line: number;
}

/** A component near the clicked element, with its data. */
export interface ComponentCapture {
  name: string;
  /** Props, truncated. Absent when there were none worth sending. */
  props?: unknown;
  /** Class-component state, truncated. Absent for function components. */
  state?: unknown;
}

/**
 * How much context a new pin carries.
 *
 * Three states rather than a checkbox because the two extra things have very
 * different costs: component props are small, a window of request and response
 * bodies is not.
 */
export type ContextLevel = "off" | "data" | "network";

/** One observed HTTP request. */
export interface NetworkEntry {
  method: string;
  url: string;
  /** HTTP status, or 0 when the request never completed. */
  status: number;
  /** Round trip in milliseconds. */
  ms: number;
  startedAt: string;
  /**
   * Where it was seen.
   *
   * `page` is the overlay's patched `fetch`/`XHR`, which catches every origin the
   * app talks to. `proxy` is the reverse proxy, which catches same-origin traffic
   * the overlay could not see — anything issued before it booted, and documents
   * and RSC payloads that are not `fetch` calls at all.
   */
  via: "page" | "proxy";
  contentType?: string;
  requestBody?: string;
  responseBody?: string;
  /** A body was dropped by a `redactUrls` rule. */
  redacted?: boolean;
  /** A body was shortened to fit the cap. */
  truncated?: boolean;
}

/**
 * What the page could tell us about the element beyond its selector.
 *
 * Only present when the human turned context on, and only on React dev builds —
 * everything here comes from private fiber internals, so its absence is a normal
 * outcome rather than a failure.
 */
export interface CapturedData {
  source?: SourceRef;
  /** Component display names from the element upward. */
  componentStack: string[];
  /** Nearest components and their data, innermost first. */
  components: ComponentCapture[];
  /** Requests behind the screen. Present only at the `network` level. */
  network?: NetworkEntry[];
  /** True when something was dropped or shortened to bound the payload. */
  truncated: boolean;
}

/** A single message within a thread. */
export interface Comment {
  id: string;
  author: Author;
  text: string;
  createdAt: string;
  /**
   * Page the comment was written on.
   *
   * Recorded per comment, not just per thread, because the global chat spans
   * every route the human visits — without this the agent is told "make the
   * header sticky" with no way to know which header.
   */
  url?: string;
}

/**
 * A conversation. Either anchored to an element (a pin) or not (the global
 * chat), which is the only difference between the two surfaces.
 */
export interface Thread {
  id: string;
  /** `null` for the global chat thread. */
  element: ElementRef | null;
  /** Page URL the thread was opened on. */
  url: string;
  /** React's view of the element. Absent unless the human turned context on. */
  data?: CapturedData;
  resolved: boolean;
  /**
   * Set when re-anchoring failed after a code change. The thread is kept and
   * shown rather than dropped — losing a human's comment is the one outcome
   * this tool must never produce.
   */
  orphaned: boolean;
  createdAt: string;
  comments: Comment[];
}

/** Everything the server knows about the current review. */
export interface SessionState {
  id: string;
  ended: boolean;
  threads: Thread[];
}

/** Events broadcast to connected overlays over SSE. */
export type ServerEvent =
  | { type: "thread-created"; thread: Thread }
  | { type: "comment-added"; threadId: string; comment: Comment }
  | { type: "thread-updated"; threadId: string; resolved: boolean; orphaned: boolean }
  | { type: "session-ended" };

/** Body of `POST /__livepin/api/thread` — opens a pin or a global message. */
export interface CreateThreadRequest {
  element: ElementRef | null;
  url: string;
  text: string;
  /** Fiber capture, when the context toggle was on. */
  data?: CapturedData;
}

/** Body of `POST /__livepin/api/comment`. */
export interface AddCommentRequest {
  threadId: string;
  text: string;
  /** Page the human was on. Optional so a bare `curl` still works. */
  url?: string;
}

/**
 * One thing the human did that the agent has not been told about yet.
 *
 * Flattened deliberately: the agent reads this and should not have to join it
 * against anything to know what was said, where, and about which element.
 */
export interface PollItem {
  /** Monotonic within a session. The agent's cursor is a `seq`. */
  seq: number;
  kind: "comment" | "resolved" | "unresolved";
  threadId: string;
  /** Page the human was on. */
  url: string;
  /** Comment body, or a short description for resolve events. */
  text: string;
  createdAt: string;
  /** `null` for global-chat messages. */
  element: ElementRef | null;
  /**
   * Source location, component stack, props and state of the pinned element.
   *
   * Absent unless the human turned context on for the comment, so the agent must
   * treat it as a bonus rather than something to wait for.
   */
  data?: CapturedData;
}

/** Answer to `livepin poll`. */
export interface PollResult {
  sessionId: string;
  /** The human (or the agent) ended the review. Further polls will not block. */
  ended: boolean;
  /** True when the wait elapsed with nothing to report. */
  timedOut: boolean;
  items: PollItem[];
}
