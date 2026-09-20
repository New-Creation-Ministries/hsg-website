// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  estimateSize,
  formatSize,
  MAX_BODY_CHARS,
  MAX_ENTRIES,
  NetworkRecorder,
} from "../../src/overlay/network.js";

let recorder: NetworkRecorder;
let originalFetch: typeof window.fetch;

/**
 * What the stubbed fetch does next.
 *
 * Reassigned rather than replacing `window.fetch`, because replacing it would
 * throw away the recorder's patch and the test would measure nothing.
 */
let respond: () => Promise<Response>;

/** Make the stub answer with this body and content type. */
function replyWith(body: string, contentType = "application/json"): void {
  respond = async () =>
    new Response(body, { status: 200, headers: { "content-type": contentType } });
}

/** Wait for the background body read to land. */
function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

beforeEach(() => {
  originalFetch = window.fetch;
  replyWith('{"visits":[]}');
  window.fetch = vi.fn(async () => respond()) as typeof window.fetch;

  recorder = new NetworkRecorder();
  recorder.install();
});

afterEach(() => {
  recorder.uninstall();
  window.fetch = originalFetch;
});

describe("fetch", () => {
  it("records method, url, status and timing", async () => {
    await window.fetch("https://api.example.com/visits", { method: "POST" });

    expect(recorder.recent()).toHaveLength(1);
    expect(recorder.recent()[0]).toMatchObject({
      method: "POST",
      url: "https://api.example.com/visits",
      status: 200,
      via: "page",
      contentType: "application/json",
    });
  });

  it("defaults to GET", async () => {
    await window.fetch("https://api.example.com/visits");
    expect(recorder.recent()[0]?.method).toBe("GET");
  });

  it("reads the method from a Request object", async () => {
    await window.fetch(new Request("https://api.example.com/visits", { method: "DELETE" }));
    expect(recorder.recent()[0]?.method).toBe("DELETE");
  });

  it("accepts a URL instance", async () => {
    await window.fetch(new URL("https://api.example.com/visits"));
    expect(recorder.recent()[0]?.url).toBe("https://api.example.com/visits");
  });

  it("captures the response body without consuming it", async () => {
    const response = await window.fetch("https://api.example.com/visits");
    await settle();

    expect(recorder.recent()[0]?.responseBody).toBe('{"visits":[]}');
    // The app must still be able to read its own response.
    expect(await response.json()).toEqual({ visits: [] });
  });

  it("captures a string request body", async () => {
    await window.fetch("https://api.example.com/visits", {
      method: "POST",
      body: '{"note":"hello"}',
    });
    expect(recorder.recent()[0]?.requestBody).toBe('{"note":"hello"}');
  });

  it("caps a long body and flags it", async () => {
    replyWith("z".repeat(MAX_BODY_CHARS * 2));
    await window.fetch("https://api.example.com/big");
    await settle();

    const recorded = recorder.recent()[0];
    expect(recorded?.responseBody).toHaveLength(MAX_BODY_CHARS + 1);
    expect(recorded?.truncated).toBe(true);
  });

  it("skips the body of a non-textual response", async () => {
    replyWith("binary", "application/octet-stream");
    await window.fetch("https://api.example.com/blob");
    await settle();

    expect(recorder.recent()[0]?.responseBody).toBeUndefined();
    expect(recorder.recent()[0]?.status).toBe(200);
  });

  it("skips the body of a redacted url but keeps that it happened", async () => {
    recorder.setRedactedUrls((url) => url.includes("/patients/"));
    await window.fetch("https://api.example.com/patients/1182");
    await settle();

    // Never held in the page at all — the server redacts too, but later.
    expect(recorder.recent()[0]?.responseBody).toBeUndefined();
    expect(recorder.recent()[0]?.url).toBe("https://api.example.com/patients/1182");
  });

  it("ignores livepin's own traffic", async () => {
    await window.fetch("/__livepin/api/state");
    // Recording the event stream would clone an open-ended response forever.
    expect(recorder.recent()).toEqual([]);
  });

  it("records a failed request and still rejects", async () => {
    respond = async () => {
      throw new Error("offline");
    };

    await expect(window.fetch("https://api.example.com/gone")).rejects.toThrow("offline");
    expect(recorder.recent()[0]).toMatchObject({ status: 0, url: "https://api.example.com/gone" });
  });

  it("drops the oldest entry once full", async () => {
    for (let i = 0; i < MAX_ENTRIES + 3; i += 1) {
      await window.fetch(`https://api.example.com/${i}`);
    }

    const urls = recorder.recent().map((entry) => entry.url);
    expect(urls).toHaveLength(MAX_ENTRIES);
    expect(urls[0]).toBe("https://api.example.com/3");
  });

  it("restores the original on uninstall", () => {
    const patched = window.fetch;
    recorder.uninstall();
    expect(window.fetch).not.toBe(patched);
  });

  it("hands out copies, so a caller cannot rewrite the log", async () => {
    await window.fetch("https://api.example.com/visits");
    recorder.recent()[0]!.url = "tampered";
    expect(recorder.recent()[0]?.url).toBe("https://api.example.com/visits");
  });

  it("clears", async () => {
    await window.fetch("https://api.example.com/visits");
    recorder.clear();
    expect(recorder.recent()).toEqual([]);
  });
});

describe("XMLHttpRequest", () => {
  /** A fake XHR transport, since happy-dom would make a real request. */
  let handlers: (() => void)[];

  beforeEach(() => {
    handlers = [];
    // Replace the prototype methods the recorder wraps, then re-install so the
    // recorder patches these rather than happy-dom's networking.
    recorder.uninstall();
    XMLHttpRequest.prototype.open = function open(): void {};
    XMLHttpRequest.prototype.send = function send(this: XMLHttpRequest): void {
      Object.defineProperty(this, "status", { value: 200, configurable: true });
      Object.defineProperty(this, "responseText", { value: '{"ok":1}', configurable: true });
      Object.defineProperty(this, "responseType", { value: "", configurable: true });
      this.getResponseHeader = () => "application/json";
      handlers.push(() => this.dispatchEvent(new Event("loadend")));
    };
    recorder = new NetworkRecorder();
    recorder.install();
  });

  /** Fire every pending loadend. */
  function finish(): void {
    for (const fire of handlers.splice(0)) fire();
  }

  it("records an XHR with its status and body", () => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.example.com/legacy");
    xhr.send();
    finish();

    expect(recorder.recent()[0]).toMatchObject({
      method: "GET",
      url: "https://api.example.com/legacy",
      status: 200,
      responseBody: '{"ok":1}',
      via: "page",
    });
  });

  it("records a request body", () => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.example.com/legacy");
    xhr.send('{"note":"x"}');
    finish();

    expect(recorder.recent()[0]?.requestBody).toBe('{"note":"x"}');
  });

  it("uppercases the method", () => {
    const xhr = new XMLHttpRequest();
    xhr.open("post", "https://api.example.com/legacy");
    xhr.send();
    expect(recorder.recent()[0]?.method).toBe("POST");
  });

  it("ignores livepin's own traffic", () => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/__livepin/api/state");
    xhr.send();
    expect(recorder.recent()).toEqual([]);
  });

  it("skips the body of a redacted url", () => {
    recorder.setRedactedUrls((url) => url.includes("/patients/"));
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.example.com/patients/1182");
    xhr.send();
    finish();

    expect(recorder.recent()[0]?.responseBody).toBeUndefined();
  });

  it("records nothing for a send with no open", () => {
    // Not a real sequence, but it must not throw.
    const xhr = new XMLHttpRequest();
    expect(() => xhr.send()).not.toThrow();
  });
});

describe("estimateSize", () => {
  it("counts the characters of the JSON that would be sent", () => {
    expect(estimateSize({ a: 1 })).toBe('{"a":1}'.length);
  });

  it("returns zero for something unserialisable rather than throwing", () => {
    const cycle: Record<string, unknown> = {};
    cycle.self = cycle;
    expect(estimateSize(cycle)).toBe(0);
  });

  it("returns zero for undefined", () => {
    expect(estimateSize(undefined)).toBe(0);
  });
});

describe("formatSize", () => {
  it.each([
    [0, "0 B"],
    [999, "999 B"],
    [1000, "1.0 kB"],
    [3456, "3.5 kB"],
    [42_000, "42 kB"],
  ])("%s -> %s", (chars, expected) => {
    expect(formatSize(chars)).toBe(expected);
  });
});
