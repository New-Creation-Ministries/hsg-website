/**
 * Injection of the livepin overlay script tag into HTML documents.
 *
 * The proxy sees HTML as a stream, and dev servers are free to flush it in
 * arbitrary chunks — so the anchor we look for (`</head>`) can straddle a chunk
 * boundary. Everything here is therefore built around a buffer-until-anchor
 * transform rather than a per-chunk `String.replace`.
 */

import { Transform } from "node:stream";

/** URL the overlay bundle is served from, relative to the proxy root. */
export const OVERLAY_SCRIPT_PATH = "/__livepin/overlay.js";

/**
 * Attribute stamped on the injected tag. Lets us detect a document that has
 * already been through injection — a page can legitimately be proxied twice
 * (two livepin instances chained), and injecting the overlay twice would
 * mount two overlays.
 */
export const INJECTION_MARKER = "data-livepin";

/**
 * Upper bound on how much of a document we will hold in memory while hunting
 * for `</head>`. Beyond this we give up on the preferred anchor and fall back,
 * so a pathological document can never make the proxy buffer without limit.
 */
export const MAX_BUFFER_BYTES = 256 * 1024;

/**
 * Build the script tag injected into proxied documents.
 *
 * @param src - Script URL. Defaults to {@link OVERLAY_SCRIPT_PATH}.
 * @returns The full `<script>` tag, carrying {@link INJECTION_MARKER}.
 */
export function overlayScriptTag(src: string = OVERLAY_SCRIPT_PATH): string {
  return `<script ${INJECTION_MARKER} src="${src}" defer></script>`;
}

/**
 * True when `html` already contains a livepin-injected script tag.
 *
 * @param html - Document text, or any prefix of it.
 */
export function isAlreadyInjected(html: string): boolean {
  return html.includes(INJECTION_MARKER);
}

/**
 * Locate the byte offset at which the script tag should be inserted.
 *
 * Anchors are tried in descending order of correctness:
 * 1. before `</head>` — the tag lands where a script belongs
 * 2. before `<body` — no head in the document, but there is a body
 * 3. after the opening `<html ...>` tag
 * 4. offset 0 — a fragment with no document structure at all
 *
 * @param html - Document text to search.
 * @returns Insertion offset, always a valid index into `html`.
 */
export function findInjectionOffset(html: string): number {
  const headClose = html.search(/<\/head\s*>/i);
  if (headClose !== -1) return headClose;

  const bodyOpen = html.search(/<body[\s>]/i);
  if (bodyOpen !== -1) return bodyOpen;

  const htmlOpen = html.match(/<html[^>]*>/i);
  if (htmlOpen?.index !== undefined) return htmlOpen.index + htmlOpen[0].length;

  return 0;
}

/**
 * Insert `tag` into a complete HTML document.
 *
 * @param html - The full document text.
 * @param tag - Tag to insert, typically from {@link overlayScriptTag}.
 * @returns The document with `tag` inserted, or unchanged if already injected.
 */
export function injectIntoHtml(html: string, tag: string): string {
  if (isAlreadyInjected(html)) return html;
  const at = findInjectionOffset(html);
  return html.slice(0, at) + tag + html.slice(at);
}

/**
 * Insert `tag` into a document held as raw bytes, without ever decoding the
 * document itself.
 *
 * This exists because the streaming path may hold a buffer that ends part-way
 * through a multi-byte UTF-8 sequence. Decoding such a buffer and re-encoding
 * it replaces the split character with a replacement character — silently
 * corrupting any page with non-ASCII content near a chunk boundary.
 *
 * The buffer is scanned as `latin1` purely to find the anchor: that decoding is
 * one byte to one code unit, so string offsets equal byte offsets, and the
 * ASCII anchors we search for cannot false-match inside a multi-byte sequence
 * (UTF-8 continuation bytes are all >= 0x80). The tag is then spliced in at
 * that byte offset and the payload bytes are passed along untouched.
 *
 * Assumes an ASCII-compatible encoding, which covers UTF-8, ASCII and latin1.
 * A UTF-16-encoded document would not match the anchors and would fall through
 * to offset 0, which is harmless.
 *
 * @param buf - Document bytes, possibly a partial prefix.
 * @param tag - Tag to insert, typically from {@link overlayScriptTag}.
 * @returns New buffer with `tag` spliced in, or `buf` if already injected.
 */
export function injectIntoBuffer(buf: Buffer, tag: string): Buffer {
  const scan = buf.toString("latin1");
  if (isAlreadyInjected(scan)) return buf;
  const at = findInjectionOffset(scan);
  return Buffer.concat([buf.subarray(0, at), Buffer.from(tag, "utf8"), buf.subarray(at)]);
}

/**
 * True when a `content-type` header describes an HTML document.
 *
 * Deliberately narrow: only `text/html` and XHTML are rewritten. Anything else
 * — JSON, JS, CSS, images, RSC payloads, event streams — must pass through the
 * proxy byte-identical.
 *
 * @param contentType - Raw `content-type` header value, if any.
 */
export function isHtmlContentType(contentType: string | undefined): boolean {
  if (!contentType) return false;
  const type = contentType.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  return type === "text/html" || type === "application/xhtml+xml";
}

/**
 * Create a Transform that injects `tag` into the first HTML document flowing
 * through it, then passes every later byte straight through.
 *
 * Buffering strategy: hold chunks until `</head>` is found, the buffer exceeds
 * {@link MAX_BUFFER_BYTES}, or the stream ends — whichever comes first. Once
 * the tag is placed, the transform becomes a pass-through with no per-chunk
 * cost.
 *
 * The document payload is never decoded — see {@link injectIntoBuffer} — so a
 * multi-byte character split across two chunks survives intact.
 *
 * @param tag - Tag to insert, typically from {@link overlayScriptTag}.
 * @returns A Transform stream suitable for piping an HTML response through.
 */
export function createInjectionStream(tag: string): Transform {
  /** Chunks held back while hunting for the anchor. */
  let pending: Buffer[] = [];
  /** Total bytes currently held in `pending`. */
  let pendingBytes = 0;
  /** Once true, the transform is a pure pass-through. */
  let done = false;

  /** Splice the tag into everything buffered so far and release it. */
  const flushInjected = (): Buffer => {
    const buf = Buffer.concat(pending);
    pending = [];
    pendingBytes = 0;
    done = true;
    return injectIntoBuffer(buf, tag);
  };

  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      if (done) {
        callback(null, chunk);
        return;
      }

      pending.push(chunk);
      pendingBytes += chunk.length;

      // Search the whole buffer, not just this chunk: the anchor may span a
      // boundary. Scanned as latin1 so offsets stay byte-accurate; documents
      // are capped at MAX_BUFFER_BYTES so this stays cheap.
      const soFar = Buffer.concat(pending).toString("latin1");

      if (isAlreadyInjected(soFar) || /<\/head\s*>/i.test(soFar)) {
        callback(null, flushInjected());
        return;
      }

      if (pendingBytes >= MAX_BUFFER_BYTES) {
        // No `</head>` in a quarter megabyte. Fall back to whatever anchor
        // findInjectionOffset can reach rather than buffering the whole page.
        callback(null, flushInjected());
        return;
      }

      callback();
    },

    flush(callback) {
      if (done || pendingBytes === 0) {
        callback();
        return;
      }
      callback(null, flushInjected());
    },
  });
}
