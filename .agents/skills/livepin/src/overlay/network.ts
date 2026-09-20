/**
 * Recording the requests the page makes.
 *
 * `fetch` and `XMLHttpRequest` are patched, because the proxy only sees traffic
 * to its own origin and application APIs routinely live somewhere else. The
 * proxy contributes what this cannot see — requests issued before the overlay
 * booted, and documents and RSC payloads that were never `fetch` calls.
 *
 * Two rules govern everything here:
 *
 * - **Never break the page.** Every patched path calls through to the original
 *   first and does its own work in a `try`. A recorder that breaks the app it is
 *   observing has destroyed the thing under review.
 * - **Never record livepin's own traffic.** The event stream is an open-ended
 *   response; cloning it to read a body would hold a clone forever, and the
 *   overlay watching itself is noise in every capture.
 */

import type { NetworkEntry } from "../types.js";

/** How many requests are kept. Oldest are dropped. */
export const MAX_ENTRIES = 50;

/** Longest body kept per request, in characters. */
export const MAX_BODY_CHARS = 2000;

/** Content types whose bodies are worth reading as text. */
const TEXTUAL = /\b(json|text|xml|javascript|graphql)\b/i;

/** Requests to livepin itself, which are never recorded. */
const OWN_TRAFFIC = /\/__livepin\//;

/** Shorten a body and report whether anything was cut. */
function clip(body: string): { text: string; truncated: boolean } {
  return body.length > MAX_BODY_CHARS
    ? { text: `${body.slice(0, MAX_BODY_CHARS)}…`, truncated: true }
    : { text: body, truncated: false };
}

/** Resolve whatever `fetch` was given into a plain URL string. */
function urlOf(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/**
 * A bounded log of the requests the page has made.
 *
 * One instance per overlay. `install` patches the globals and returns nothing;
 * `uninstall` puts them back, and must be called on teardown or a hot reload
 * leaves a stack of patches behind.
 */
export class NetworkRecorder {
  private entries: NetworkEntry[] = [];
  private restore: (() => void)[] = [];

  /**
   * URLs whose bodies must not be recorded, from the project's config.
   *
   * Checked here as well as on the server so a redacted body is never held in
   * the page at all. The server still redacts; that is the pass that counts.
   */
  private isRedactedUrl: (url: string) => boolean = () => false;

  /** Never record bodies for these URLs. */
  setRedactedUrls(matcher: (url: string) => boolean): void {
    this.isRedactedUrl = matcher;
  }

  /** The requests seen, oldest first. */
  recent(): NetworkEntry[] {
    return this.entries.map((entry) => ({ ...entry }));
  }

  /** Forget everything recorded so far. */
  clear(): void {
    this.entries = [];
  }

  /** Patch `fetch` and `XMLHttpRequest`. */
  install(): void {
    this.patchFetch();
    this.patchXhr();
  }

  /** Put the originals back. */
  uninstall(): void {
    for (const undo of this.restore.splice(0)) undo();
  }

  /** Append an entry, dropping the oldest once full. */
  private add(entry: NetworkEntry): NetworkEntry {
    this.entries.push(entry);
    if (this.entries.length > MAX_ENTRIES) this.entries.shift();
    return entry;
  }

  /** Whether this request's body may be recorded. */
  private mayRecordBody(url: string, contentType: string | null): boolean {
    if (this.isRedactedUrl(url)) return false;
    return contentType === null || TEXTUAL.test(contentType);
  }

  /** Wrap `window.fetch`. */
  private patchFetch(): void {
    const original = window.fetch;
    if (typeof original !== "function") return;

    // An arrow function so `this` stays the recorder; the patched fetch has no
    // meaningful receiver of its own.
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = urlOf(input);
      if (OWN_TRAFFIC.test(url)) return original.call(window, input, init);

      const started = Date.now();
      const method = (
        init?.method ?? (input instanceof Request ? input.method : "GET")
      ).toUpperCase();

      let entry: NetworkEntry | null = null;
      try {
        entry = this.add({
          method,
          url,
          status: 0,
          ms: 0,
          startedAt: new Date(started).toISOString(),
          via: "page",
        });

        if (typeof init?.body === "string" && this.mayRecordBody(url, null)) {
          const clipped = clip(init.body);
          entry.requestBody = clipped.text;
          if (clipped.truncated) entry.truncated = true;
        }
      } catch {
        // Recording is best effort; the request is not.
      }

      let response: Response;
      try {
        response = await original.call(window, input, init);
      } catch (error) {
        if (entry) entry.ms = Date.now() - started;
        throw error;
      }

      try {
        if (entry) {
          entry.status = response.status;
          entry.ms = Date.now() - started;

          const contentType = response.headers.get("content-type");
          if (contentType) entry.contentType = contentType;

          if (this.mayRecordBody(url, contentType)) {
            // Clone first: the app must still get an unread body. Read it in the
            // background so a slow response does not delay the page.
            void response
              .clone()
              .text()
              .then((text) => {
                const clipped = clip(text);
                entry.responseBody = clipped.text;
                if (clipped.truncated) entry.truncated = true;
              })
              .catch(() => undefined);
          }
        }
      } catch {
        // Same again: never let observation change the outcome.
      }

      return response;
    };

    this.restore.push(() => {
      window.fetch = original;
    });
  }

  /** Wrap `XMLHttpRequest.open` and `.send`. */
  private patchXhr(): void {
    const proto = window.XMLHttpRequest?.prototype;
    if (!proto) return;

    // Bound helpers rather than an alias: the patched methods need `this` to be
    // the XMLHttpRequest, so the recorder has to arrive by closure.
    const add = (entry: NetworkEntry): NetworkEntry => this.add(entry);
    const mayRecordBody = (url: string, contentType: string | null): boolean =>
      this.mayRecordBody(url, contentType);
    const originalOpen = proto.open;
    const originalSend = proto.send;

    /** Per-request state, kept off the entry so a failed open records nothing. */
    const pending = new WeakMap<XMLHttpRequest, { method: string; url: string }>();

    proto.open = function patchedOpen(
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      ...rest: unknown[]
    ): void {
      try {
        pending.set(this, { method: String(method).toUpperCase(), url: String(url) });
      } catch {
        // Ignore and fall through: opening must still work.
      }

      return (originalOpen as (...args: unknown[]) => void).call(this, method, url, ...rest);
    } as typeof proto.open;

    proto.send = function patchedSend(this: XMLHttpRequest, body?: unknown): void {
      const info = pending.get(this);

      if (info && !OWN_TRAFFIC.test(info.url)) {
        const started = Date.now();
        try {
          const entry = add({
            method: info.method,
            url: info.url,
            status: 0,
            ms: 0,
            startedAt: new Date(started).toISOString(),
            via: "page",
          });

          if (typeof body === "string" && mayRecordBody(info.url, null)) {
            const clipped = clip(body);
            entry.requestBody = clipped.text;
            if (clipped.truncated) entry.truncated = true;
          }

          this.addEventListener("loadend", () => {
            try {
              entry.status = this.status;
              entry.ms = Date.now() - started;

              const contentType = this.getResponseHeader("content-type");
              if (contentType) entry.contentType = contentType;

              // responseText throws for some responseTypes; only text is useful.
              if (this.responseType === "" || this.responseType === "text") {
                if (mayRecordBody(info.url, contentType)) {
                  const clipped = clip(this.responseText ?? "");
                  entry.responseBody = clipped.text;
                  if (clipped.truncated) entry.truncated = true;
                }
              }
            } catch {
              // A response we cannot read is simply not recorded.
            }
          });
        } catch {
          // Recording is best effort; the request is not.
        }
      }

      return (originalSend as (this: XMLHttpRequest, body?: unknown) => void).call(this, body);
    } as typeof proto.send;

    this.restore.push(() => {
      proto.open = originalOpen;
      proto.send = originalSend;
    });
  }
}

/**
 * Rough size of what would be attached, for the toolbar's estimate.
 *
 * Serialised length rather than a byte count: it is the number that predicts what
 * the agent pays to read it, which is the decision the human is making.
 *
 * @param value - The capture, or anything else about to be sent.
 * @returns Characters of JSON.
 */
export function estimateSize(value: unknown): number {
  try {
    return JSON.stringify(value)?.length ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Format a size for the toolbar.
 *
 * @param chars - Character count from {@link estimateSize}.
 * @returns A short human-readable size.
 */
export function formatSize(chars: number): string {
  if (chars < 1000) return `${chars} B`;
  return `${(chars / 1000).toFixed(chars < 10_000 ? 1 : 0)} kB`;
}
