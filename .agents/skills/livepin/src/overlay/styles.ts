/**
 * Styles for the overlay, injected into its shadow root.
 *
 * Everything is scoped by the shadow boundary, so no selector here can reach
 * the page and no page selector can reach in. `all: initial` on the host is the
 * belt to that braces: it stops inherited properties (font, colour, direction)
 * from leaking across, which is the one thing the boundary does not block.
 *
 * Colours are fixed rather than theme-aware. The overlay sits on top of an
 * unknown application and has to stay legible against any background, so it
 * commits to one dark, high-contrast treatment.
 */

export const OVERLAY_CSS = `
:host {
  all: initial;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --pp-bg: #12161c;
  --pp-bg-2: #1b2129;
  --pp-line: #2c3542;
  --pp-ink: #e8edf4;
  --pp-muted: #93a0b0;
  --pp-accent: #4d93ff;
  --pp-accent-ink: #080d14;
  --pp-danger: #f0837a;
  --pp-ok: #4cc38a;
  --pp-z: 2147483000;
}

*, *::before, *::after { box-sizing: border-box; }

button {
  font: inherit;
  cursor: pointer;
  border: 1px solid var(--pp-line);
  background: var(--pp-bg-2);
  color: var(--pp-ink);
  border-radius: 6px;
  padding: 6px 10px;
  transition: background 120ms ease, border-color 120ms ease;
}
button:hover { background: #232b35; border-color: #3a4655; }
button:focus-visible { outline: 2px solid var(--pp-accent); outline-offset: 2px; }
button[data-variant="primary"] {
  background: var(--pp-accent);
  border-color: var(--pp-accent);
  color: var(--pp-accent-ink);
  font-weight: 600;
}
button[data-variant="primary"]:hover { background: #6aa5ff; }
button[data-variant="danger"] { color: var(--pp-danger); }
button[data-variant="ghost"] { background: transparent; border-color: transparent; color: var(--pp-muted); }
button[data-variant="ghost"]:hover { background: var(--pp-bg-2); color: var(--pp-ink); }
button[aria-pressed="true"] {
  background: var(--pp-accent);
  border-color: var(--pp-accent);
  color: var(--pp-accent-ink);
}

/* ---- toolbar ---- */
.toolbar {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: var(--pp-z);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--pp-bg);
  border: 1px solid var(--pp-line);
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
  color: var(--pp-ink);
  font-size: 13px;
}
.toolbar .brand {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--pp-muted);
  padding: 0 4px 0 6px;
}
.toolbar .divider { width: 1px; align-self: stretch; background: var(--pp-line); }
.count {
  font-variant-numeric: tabular-nums;
  color: var(--pp-muted);
  font-size: 12px;
  padding: 0 2px;
}

/* ---- inspect highlight ---- */
.highlight {
  position: fixed;
  z-index: calc(var(--pp-z) - 2);
  pointer-events: none;
  border: 2px solid var(--pp-accent);
  background: rgba(77, 147, 255, 0.14);
  border-radius: 2px;
  transition: all 60ms linear;
}
.highlight-label {
  position: absolute;
  top: -22px;
  left: -2px;
  background: var(--pp-accent);
  color: var(--pp-accent-ink);
  font: 600 11px/1.6 ui-monospace, monospace;
  padding: 1px 6px;
  border-radius: 3px 3px 0 0;
  white-space: nowrap;
}

/* ---- pins ---- */
.pin {
  position: fixed;
  z-index: calc(var(--pp-z) - 1);
  width: 24px;
  height: 24px;
  border-radius: 50% 50% 50% 2px;
  background: var(--pp-accent);
  color: var(--pp-accent-ink);
  border: 2px solid var(--pp-bg);
  display: grid;
  place-items: center;
  font: 700 11px/1 ui-sans-serif, system-ui, sans-serif;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}
.pin[data-resolved="true"] { background: var(--pp-ok); }
.pin[data-orphaned="true"] { background: var(--pp-danger); }
.pin:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

/* ---- panel ---- */
.panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 100vw;
  z-index: var(--pp-z);
  background: var(--pp-bg);
  border-left: 1px solid var(--pp-line);
  color: var(--pp-ink);
  display: flex;
  flex-direction: column;
  font-size: 13px;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.35);
}
.panel[hidden] { display: none; }
.panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--pp-line);
}
.panel-title { font-weight: 600; flex: 1; }
.panel-body { flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column; gap: 12px; }
.panel-foot { border-top: 1px solid var(--pp-line); padding: 10px 14px; display: flex; flex-direction: column; gap: 8px; }

.thread {
  border: 1px solid var(--pp-line);
  border-radius: 8px;
  background: var(--pp-bg-2);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.thread[data-resolved="true"] { opacity: 0.55; }
.thread-head { display: flex; align-items: baseline; gap: 8px; }
.thread-badge {
  font: 700 10px/1.6 ui-sans-serif, system-ui, sans-serif;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--pp-accent);
  color: var(--pp-accent-ink);
  text-align: center;
}
.thread[data-orphaned="true"] .thread-badge { background: var(--pp-danger); }
.thread-target {
  font: 11px/1.5 ui-monospace, monospace;
  color: var(--pp-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.orphan-note {
  font-size: 11px;
  color: var(--pp-danger);
  border-left: 2px solid var(--pp-danger);
  padding-left: 6px;
}
.page-note {
  font-size: 11px;
  color: var(--pp-muted);
  border-left: 2px solid var(--pp-line);
  padding-left: 6px;
  font-family: ui-monospace, monospace;
}
.comment { display: flex; flex-direction: column; gap: 2px; }
.comment-author {
  font: 600 10px/1.6 ui-sans-serif, system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--pp-muted);
}
.comment[data-author="agent"] .comment-author { color: var(--pp-accent); }
.comment-text { white-space: pre-wrap; word-break: break-word; line-height: 1.5; }

textarea {
  font: inherit;
  width: 100%;
  min-height: 62px;
  resize: vertical;
  background: var(--pp-bg-2);
  color: var(--pp-ink);
  border: 1px solid var(--pp-line);
  border-radius: 6px;
  padding: 8px;
}
textarea:focus-visible { outline: 2px solid var(--pp-accent); outline-offset: -1px; }
textarea::placeholder { color: var(--pp-muted); }

.row { display: flex; gap: 8px; align-items: center; }
.row > .grow { flex: 1; }
.empty { color: var(--pp-muted); font-size: 12px; line-height: 1.6; }

/* ---- composer popover ---- */
.composer {
  position: fixed;
  z-index: calc(var(--pp-z) + 1);
  width: 320px;
  max-width: calc(100vw - 24px);
  background: var(--pp-bg);
  border: 1px solid var(--pp-accent);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
  color: var(--pp-ink);
  font-size: 13px;
}
.composer-target {
  font: 11px/1.5 ui-monospace, monospace;
  color: var(--pp-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* What the context toggle collected. Wraps rather than truncates — a component
   stack is the useful part and eliding it defeats the point. */
.composer-context,
.source-note {
  margin: 0;
  font: 11px/1.5 ui-monospace, monospace;
  color: var(--pp-accent);
  word-break: break-word;
}

/* ---- ended state ---- */
.ended {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: var(--pp-z);
  background: var(--pp-bg);
  border: 1px solid var(--pp-line);
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--pp-muted);
  font-size: 13px;
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
`;
