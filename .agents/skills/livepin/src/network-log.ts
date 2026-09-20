/**
 * What the proxy saw, kept so a pin can include traffic the page could not
 * report itself.
 *
 * The overlay's patched `fetch` misses two things: requests made before it
 * booted, and responses that were never `fetch` calls — the document itself, and
 * a framework's streamed payloads. Those come through here.
 *
 * Metadata only, deliberately. Recording bodies would mean buffering every
 * response in the proxy, and the proxy's one hard requirement is that it forward
 * bytes without holding them. The page-side recorder is where bodies come from;
 * this says what happened, not what was in it.
 */

import type { NetworkEntry } from "./types.js";

/** How many requests are kept. Oldest are dropped. */
export const MAX_PROXY_ENTRIES = 50;

/**
 * Content types worth recording.
 *
 * Modules, stylesheets, images and fonts are excluded — a Vite dev server serves
 * hundreds of separate module requests per page, and a log full of those would
 * push out the one API call the human is asking about.
 */
const INTERESTING = /\b(json|html|x-component|xml|plain)\b/i;

/**
 * Media types that are never data, whatever their subtype says.
 *
 * Checked first because `image/svg+xml` would otherwise match on `xml` — and a
 * page's icons alone would fill the log.
 */
const CARRIED_ASSET = /^\s*(image|font|audio|video)\//i;

/**
 * Whether a response is worth logging.
 *
 * @param contentType - The response's content-type header, if any.
 * @returns True for documents and data.
 */
export function isInterestingContentType(contentType: string | undefined): boolean {
  if (!contentType) return false;
  if (CARRIED_ASSET.test(contentType)) return false;
  return INTERESTING.test(contentType);
}

/** A bounded log of requests seen by the proxy. */
export class NetworkLog {
  private entries: NetworkEntry[] = [];

  /**
   * Record a request.
   *
   * @param entry - What was observed. `via` is set here.
   */
  record(entry: Omit<NetworkEntry, "via">): void {
    this.entries.push({ ...entry, via: "proxy" });
    if (this.entries.length > MAX_PROXY_ENTRIES) this.entries.shift();
  }

  /** The requests seen, oldest first. */
  recent(): NetworkEntry[] {
    return this.entries.map((entry) => ({ ...entry }));
  }

  /** Forget everything recorded so far. */
  clear(): void {
    this.entries = [];
  }
}

/** Path of a URL, or the whole string when it will not parse. */
function pathOf(url: string): string {
  try {
    return new URL(url, "http://placeholder.invalid").pathname;
  } catch {
    return url;
  }
}

/**
 * Combine what the page reported with what the proxy saw.
 *
 * A same-origin request is visible to both. The page's version is kept because
 * it carries bodies; the proxy's duplicate is dropped. Nothing is merged field by
 * field — two records of one request would be guesswork, and one complete record
 * beats two half ones.
 *
 * @param fromPage - Entries the overlay reported.
 * @param fromProxy - Entries the proxy logged.
 * @returns One list, page entries first.
 */
export function mergeEntries(fromPage: NetworkEntry[], fromProxy: NetworkEntry[]): NetworkEntry[] {
  const seen = new Set(fromPage.map((entry) => `${entry.method} ${pathOf(entry.url)}`));
  return [
    ...fromPage,
    ...fromProxy.filter((entry) => !seen.has(`${entry.method} ${pathOf(entry.url)}`)),
  ];
}
