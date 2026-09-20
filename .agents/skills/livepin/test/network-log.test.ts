import { describe, expect, it } from "vitest";

import {
  isInterestingContentType,
  MAX_PROXY_ENTRIES,
  mergeEntries,
  NetworkLog,
} from "../src/network-log.js";
import type { NetworkEntry } from "../src/types.js";

/** A minimal entry. */
function entry(overrides: Partial<NetworkEntry> = {}): NetworkEntry {
  return {
    method: "GET",
    url: "/api/visits",
    status: 200,
    ms: 12,
    startedAt: "2026-08-07T00:00:00.000Z",
    via: "page",
    ...overrides,
  };
}

describe("isInterestingContentType", () => {
  it.each([
    ["application/json", true],
    ["text/html; charset=utf-8", true],
    ["text/x-component", true],
    ["application/xml", true],
    ["text/plain", true],
  ])("records %s", (contentType, expected) => {
    expect(isInterestingContentType(contentType)).toBe(expected);
  });

  it.each([
    ["text/javascript", false],
    ["application/javascript", false],
    ["text/css", false],
    ["image/svg+xml", false],
    ["font/woff2", false],
  ])("skips %s, so module requests cannot flood the log", (contentType, expected) => {
    // A Vite dev server serves hundreds of module requests per page.
    expect(isInterestingContentType(contentType)).toBe(expected);
  });

  it("skips a response with no content type at all", () => {
    expect(isInterestingContentType(undefined)).toBe(false);
  });
});

describe("NetworkLog", () => {
  it("records what it is given, tagged as coming from the proxy", () => {
    const log = new NetworkLog();
    log.record({ method: "GET", url: "/api/x", status: 200, ms: 5, startedAt: "t" });

    expect(log.recent()).toEqual([
      { method: "GET", url: "/api/x", status: 200, ms: 5, startedAt: "t", via: "proxy" },
    ]);
  });

  it("drops the oldest once full, rather than growing without bound", () => {
    const log = new NetworkLog();
    for (let i = 0; i < MAX_PROXY_ENTRIES + 5; i += 1) {
      log.record({ method: "GET", url: `/api/${i}`, status: 200, ms: 1, startedAt: "t" });
    }

    const urls = log.recent().map((e) => e.url);
    expect(urls).toHaveLength(MAX_PROXY_ENTRIES);
    expect(urls[0]).toBe("/api/5");
  });

  it("hands out copies, so a caller cannot rewrite the log", () => {
    const log = new NetworkLog();
    log.record({ method: "GET", url: "/api/x", status: 200, ms: 5, startedAt: "t" });

    log.recent()[0]!.url = "/api/tampered";
    expect(log.recent()[0]?.url).toBe("/api/x");
  });

  it("clears", () => {
    const log = new NetworkLog();
    log.record({ method: "GET", url: "/api/x", status: 200, ms: 5, startedAt: "t" });
    log.clear();
    expect(log.recent()).toEqual([]);
  });
});

describe("mergeEntries", () => {
  it("keeps the page's version of a request both sides saw", () => {
    const fromPage = [
      entry({ url: "http://127.0.0.1:4850/api/visits", responseBody: '{"visits":[]}' }),
    ];
    const fromProxy = [entry({ url: "/api/visits", via: "proxy" })];

    const merged = mergeEntries(fromPage, fromProxy);
    // The page's entry carries a body; the proxy's carries nothing extra.
    expect(merged).toHaveLength(1);
    expect(merged[0]?.responseBody).toBe('{"visits":[]}');
  });

  it("keeps a proxy entry the page never saw", () => {
    const merged = mergeEntries(
      [entry({ url: "http://api.example.com/other" })],
      [entry({ url: "/patients/1182", via: "proxy" })],
    );

    expect(merged.map((e) => e.url)).toEqual(["http://api.example.com/other", "/patients/1182"]);
  });

  it("treats a different method on the same path as a different request", () => {
    const merged = mergeEntries(
      [entry({ method: "GET", url: "/api/visits" })],
      [entry({ method: "POST", url: "/api/visits", via: "proxy" })],
    );
    expect(merged).toHaveLength(2);
  });

  it("compares paths, so a query string does not defeat the match", () => {
    const merged = mergeEntries(
      [entry({ url: "http://127.0.0.1:4850/api/visits?page=2" })],
      [entry({ url: "/api/visits?page=2", via: "proxy" })],
    );
    expect(merged).toHaveLength(1);
  });

  it("survives a url that will not parse", () => {
    const merged = mergeEntries(
      [entry({ url: "::nonsense" })],
      [entry({ url: "::nonsense", via: "proxy" })],
    );
    expect(merged).toHaveLength(1);
  });

  it("returns the proxy's entries when the page reported none", () => {
    expect(mergeEntries([], [entry({ via: "proxy" })])).toHaveLength(1);
  });
});
