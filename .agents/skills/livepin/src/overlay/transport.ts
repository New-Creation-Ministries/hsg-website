/**
 * The overlay's client for the livepin API.
 *
 * Isolated from the UI so it can be tested without a DOM, and so the UI never
 * builds a URL or parses a response inline.
 */

import type {
  AddCommentRequest,
  CapturedData,
  Comment,
  CreateThreadRequest,
  ElementRef,
  ServerEvent,
  SessionState,
  Thread,
} from "../types.js";

/** Base path the API is mounted at. Mirrors the server's prefix. */
export const API_BASE = "/__livepin";

/** An SSE payload: either a full-state sync or an incremental event. */
export type StreamMessage = { type: "sync"; state: SessionState } | ServerEvent;

/** POST JSON and parse the response, throwing on a non-2xx. */
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`livepin ${path} failed (${res.status}): ${detail}`);
  }
  return (await res.json()) as T;
}

/** Fetch the whole session. */
export async function fetchState(): Promise<SessionState> {
  const res = await fetch(`${API_BASE}/api/state`);
  if (!res.ok) throw new Error(`livepin state failed (${res.status})`);
  return (await res.json()) as SessionState;
}

/** Fetch the project's redaction rules. */
export async function fetchConfig(): Promise<{ redactUrls: string[]; redactFields: string[] }> {
  const res = await fetch(`${API_BASE}/api/config`);
  if (!res.ok) throw new Error(`livepin config failed (${res.status})`);
  return (await res.json()) as { redactUrls: string[]; redactFields: string[] };
}

/**
 * Open a thread.
 *
 * @param element - Element the pin anchors to, or null for a global message.
 * @param text - First comment.
 * @param data - Fiber capture, when the context toggle was on.
 */
export function createThread(
  element: ElementRef | null,
  text: string,
  data?: CapturedData,
): Promise<Thread> {
  const body: CreateThreadRequest = {
    element,
    url: location.href,
    text,
    ...(data ? { data } : {}),
  };
  return post<Thread>("/api/thread", body);
}

/**
 * Append a comment to a thread.
 *
 * The current page goes with it: the global chat belongs to no route, so
 * without this the agent gets the remark and not the screen it was about.
 */
export function addComment(threadId: string, text: string): Promise<Comment> {
  const body: AddCommentRequest = { threadId, text, url: location.href };
  return post<Comment>("/api/comment", body);
}

/** Mark a thread resolved or unresolved. */
export function setResolved(threadId: string, resolved: boolean): Promise<unknown> {
  return post("/api/resolve", { threadId, resolved });
}

/** Flag a thread whose element could not be found again. */
export function setOrphaned(threadId: string, orphaned: boolean): Promise<unknown> {
  return post("/api/orphan", { threadId, orphaned });
}

/** End the session. */
export function endSession(): Promise<unknown> {
  return post("/api/end", {});
}

/**
 * Subscribe to the server's event stream.
 *
 * `EventSource` reconnects on its own, and each reconnect begins with a `sync`
 * message, so a dropped connection heals without the UI having to detect it.
 *
 * @param onMessage - Called for every parsed message.
 * @returns A function that closes the stream.
 */
export function openEventStream(onMessage: (message: StreamMessage) => void): () => void {
  const source = new EventSource(`${API_BASE}/api/events`);

  source.onmessage = (event: MessageEvent<string>) => {
    try {
      onMessage(JSON.parse(event.data) as StreamMessage);
    } catch {
      // A malformed frame is not worth tearing the stream down for.
    }
  };

  return () => source.close();
}
