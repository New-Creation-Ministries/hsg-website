import { Readable } from "node:stream";
import { text } from "node:stream/consumers";
import { describe, expect, it } from "vitest";

import {
  createInjectionStream,
  findInjectionOffset,
  injectIntoHtml,
  INJECTION_MARKER,
  isAlreadyInjected,
  isHtmlContentType,
  MAX_BUFFER_BYTES,
  overlayScriptTag,
  OVERLAY_SCRIPT_PATH,
} from "../src/inject.js";

const TAG = overlayScriptTag();

/** Pipe `chunks` through a fresh injection stream and return the result. */
async function pipeChunks(chunks: (string | Buffer)[]): Promise<string> {
  const source = Readable.from(chunks.map((c) => (typeof c === "string" ? Buffer.from(c) : c)));
  return text(source.pipe(createInjectionStream(TAG)));
}

describe("overlayScriptTag", () => {
  it("carries the marker and the default overlay path", () => {
    expect(TAG).toContain(INJECTION_MARKER);
    expect(TAG).toContain(OVERLAY_SCRIPT_PATH);
    expect(TAG).toContain("defer");
  });

  it("accepts a custom src", () => {
    expect(overlayScriptTag("/custom.js")).toContain('src="/custom.js"');
  });
});

describe("isHtmlContentType", () => {
  it.each([
    ["text/html", true],
    ["text/html; charset=utf-8", true],
    ["TEXT/HTML", true],
    ["application/xhtml+xml", true],
    ["application/json", false],
    ["text/javascript", false],
    ["text/css", false],
    ["text/event-stream", false],
    ["image/png", false],
    [undefined, false],
    ["", false],
  ])("%s -> %s", (input, expected) => {
    expect(isHtmlContentType(input)).toBe(expected);
  });
});

describe("findInjectionOffset", () => {
  it("prefers the closing head tag", () => {
    const html = "<html><head><title>x</title></head><body></body></html>";
    expect(findInjectionOffset(html)).toBe(html.indexOf("</head>"));
  });

  it("tolerates whitespace inside the closing head tag", () => {
    const html = "<html><head></head ></html>";
    expect(findInjectionOffset(html)).toBe(html.indexOf("</head >"));
  });

  it("falls back to the body open tag when there is no head", () => {
    const html = "<html><body><p>hi</p></body></html>";
    expect(findInjectionOffset(html)).toBe(html.indexOf("<body>"));
  });

  it("falls back to just after the html open tag when there is no body", () => {
    const html = '<html lang="en"><p>hi</p></html>';
    expect(findInjectionOffset(html)).toBe('<html lang="en">'.length);
  });

  it("falls back to offset zero for a bare fragment", () => {
    expect(findInjectionOffset("<p>hi</p>")).toBe(0);
  });
});

describe("injectIntoHtml", () => {
  it("inserts before the closing head tag", () => {
    const out = injectIntoHtml("<html><head></head><body></body></html>", TAG);
    expect(out).toBe(`<html><head>${TAG}</head><body></body></html>`);
  });

  it("is idempotent — an already-injected document is untouched", () => {
    const once = injectIntoHtml("<html><head></head></html>", TAG);
    expect(injectIntoHtml(once, TAG)).toBe(once);
  });

  it("injects into a fragment with no document structure", () => {
    expect(injectIntoHtml("<p>hi</p>", TAG)).toBe(`${TAG}<p>hi</p>`);
  });
});

describe("isAlreadyInjected", () => {
  it("detects the marker", () => {
    expect(isAlreadyInjected(`<head>${TAG}</head>`)).toBe(true);
  });

  it("returns false for an untouched document", () => {
    expect(isAlreadyInjected("<head><script src='/a.js'></script></head>")).toBe(false);
  });
});

describe("createInjectionStream", () => {
  it("injects into a single-chunk document", async () => {
    const out = await pipeChunks(["<html><head></head><body>hi</body></html>"]);
    expect(out).toBe(`<html><head>${TAG}</head><body>hi</body></html>`);
  });

  it("injects when the anchor straddles a chunk boundary", async () => {
    const out = await pipeChunks(["<html><head></he", "ad><body>hi</body></html>"]);
    expect(out).toBe(`<html><head>${TAG}</head><body>hi</body></html>`);
  });

  it("injects when the anchor is split one character at a time", async () => {
    const html = "<html><head></head><body>hi</body></html>";
    const out = await pipeChunks([...html]);
    expect(out).toBe(`<html><head>${TAG}</head><body>hi</body></html>`);
  });

  it("passes later chunks straight through after injecting", async () => {
    const tail = "x".repeat(5000);
    const out = await pipeChunks(["<html><head></head><body>", tail, "</body></html>"]);
    expect(out).toBe(`<html><head>${TAG}</head><body>${tail}</body></html>`);
  });

  it("falls back to the body anchor when the document has no head", async () => {
    const out = await pipeChunks(["<html><body>hi</body></html>"]);
    expect(out).toBe(`<html>${TAG}<body>hi</body></html>`);
  });

  it("injects on flush for a document that never contains an anchor", async () => {
    const out = await pipeChunks(["plain text, no tags"]);
    expect(out).toBe(`${TAG}plain text, no tags`);
  });

  it("emits nothing for an empty stream", async () => {
    expect(await pipeChunks([])).toBe("");
  });

  it("does not inject twice into an already-injected document", async () => {
    const html = `<html><head>${TAG}</head><body></body></html>`;
    const out = await pipeChunks([html]);
    expect(out).toBe(html);
    expect(out.split(INJECTION_MARKER)).toHaveLength(2);
  });

  it("stops buffering once past the cap and still injects", async () => {
    // A head that never closes: the transform must give up at the cap rather
    // than hold the whole document, and fall back to the <body> anchor.
    const filler = "<!-- " + "z".repeat(MAX_BUFFER_BYTES) + " -->";
    const out = await pipeChunks(["<html><head>", filler, "<body>hi</body></html>"]);
    expect(out).toContain(INJECTION_MARKER);
    expect(out).toContain("hi");
    // Injected once, and the original bytes are all still present.
    expect(out.split(INJECTION_MARKER)).toHaveLength(2);
    expect(out.length).toBe(
      "<html><head>".length + filler.length + "<body>hi</body></html>".length + TAG.length,
    );
  });

  it("preserves multi-byte characters split across a chunk boundary", async () => {
    // "é" is two bytes in UTF-8; split it down the middle.
    const full = Buffer.from("<html><head></head><body>café</body></html>", "utf8");
    const cut = full.indexOf(Buffer.from("é", "utf8")) + 1;
    const out = await pipeChunks([full.subarray(0, cut), full.subarray(cut)]);
    expect(out).toBe(`<html><head>${TAG}</head><body>café</body></html>`);
  });
});
