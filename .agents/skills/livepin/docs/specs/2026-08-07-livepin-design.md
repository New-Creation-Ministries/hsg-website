# livepin — live UI + data development surface

**Date:** 2026-08-07
**Status:** Approved design, not yet implemented

## Summary

`livepin` is a standalone CLI plus an injected browser overlay. It turns any running frontend dev
server into a surface where a human annotates real UI, optionally attaches the component data and
network traffic behind it, and a coding agent receives those annotations and builds against them.

It is framework-agnostic by construction: nothing in it knows about any particular application.

## Problem

Reviewing UI work with a coding agent today means one of two bad loops.

Either the agent drives a browser and reports back in prose, and the human has no way to point at
what is wrong — "the third card's badge wraps" costs a paragraph to express and is still ambiguous.

Or the agent produces a static artifact (screenshots in an HTML page) that the human can annotate,
but the annotations land on images. The agent gets a picture of a problem, not the problem: no
source location, no component state, no idea which request produced the data on screen.

Neither loop lets the human say "this list should also show the last visit date" and have the agent
immediately know which component that is, what props it already receives, and whether the field is
present in the response but unrendered.

## Goals

- Annotate real DOM in a live dev server, in a normal browser, with a real login session.
- Each annotation carries enough context that the agent can act without further investigation.
- Two-way: the agent replies into the page; the human sees it without reloading.
- A global chat panel for conversation that isn't anchored to any element.
- Works on any frontend that serves HTML. React gets extra fidelity; nothing else degrades.
- Installable as a skill into Claude Code or any coding agent.

## Non-goals

Authentication. Multi-user or concurrent reviewers. Cloud hosting or sharing. Persistence beyond a
local JSON file. Production use of any kind — this is a development-time tool.

## Architecture

Four components plus packaging.

### 1. Proxy

```
livepin start --target http://localhost:3000 --port 4850 [--open <path>] [--no-open]
```

A reverse proxy in front of the dev server. The human browses `localhost:4850` in their ordinary
browser, with their ordinary session.

On start it **opens the default browser automatically** at `--open <path>` (default `/`), so the
human never has to copy a URL. Implemented with `xdg-open` / `open` / `start` by platform, spawned
detached; failure to open is a warning, not an error, and the URL is always printed as well.
`--no-open` suppresses it — required for CI and integration tests, which must never spawn a browser.

The agent is expected to pass `--open` pointing at the route its change actually affects, so the
human lands on the right page rather than the app's root.

- Forwards all requests to `--target` unchanged.
- Passes websocket upgrades through untouched, so HMR keeps working. Next.js uses
  `/_next/webpack-hmr`; Vite uses the root path with an `Upgrade` header. Neither may be buffered,
  rewritten, or delayed.
- Injects `<script src="/__livepin/overlay.js" defer></script>` into responses whose content-type is
  `text/html`, immediately before `</head>`. Injection must handle chunked/streamed responses and
  documents with no `</head>` (fall back to before `</body>`, then to prepending to `<html>`).
- Serves overlay assets and the session API under `/__livepin/*`, chosen to be namespaced away from
  anything a host app is likely to route.

Choosing a proxy over CDP injection was deliberate: it works in any browser, keeps the human's real
login session, and does not require an automation-controlled window.

### 2. Overlay

Vanilla TypeScript, no framework, mounted in a **Shadow DOM** root. The shadow boundary is not
optional — a tool for reviewing CSS must not contribute CSS to the page under review, and must not
have its own layout distorted by the host's global styles.

Surfaces:

- **Inspect mode** — toggled by hotkey or toolbar. Hovering highlights the element under the cursor;
  clicking opens a comment composer anchored to it.
- **Pins** — numbered markers anchored to elements. Each pin is a thread: human comments, agent
  replies, resolve/unresolve.
- **Global chat panel** — right-hand side, free-form conversation not tied to any element.
- **Context toggle** — three states, `Off` / `Data` / `Data + Network`, in the toolbar, with a live
  payload size estimate beside it. Sets the default for new comments; the composer allows a
  per-comment override.
- **End session button** — in the toolbar, with a confirm step so a mis-click cannot discard a review
  in progress. Ending flushes any unsent draft as a final comment, so nothing the human typed is
  lost. After it, the overlay renders an ended state and stops accepting input.

Agent replies arrive over SSE and appear without a reload.

### 3. Capture

What a comment carries, by context level.

**Always:**

- CSS selector for the element, generated to be as stable as possible (prefer `data-testid`, then
  `id`, then a structural path).
- The element's visible text, truncated.
- Bounding box and the page URL.

**At `Data` and above** — recovered by walking the React fiber from the clicked DOM node:

- Source location: `_debugSource` gives `{fileName, lineNumber}`, producing `Strip.tsx:42`.
- Component stack: the chain of component display names from the node upward.
- Props and state of the node and its ancestors, truncated per-value and per-total.

React 18 dev builds expose `__reactFiber$*` keys on DOM nodes and `_debugSource` on fibers. On a
non-React app, or a production build, this section is simply absent and everything else still works.
No adapter interface is being designed until there is a second real implementation to design against.

**At `Data + Network`:**

- Requests made on the current route since load, capped in count and with bodies truncated.
- Captured at two points, because one is insufficient: the **proxy** sees same-origin traffic for
  free, but application APIs commonly live on a different origin, so the overlay also patches
  `window.fetch` and `XMLHttpRequest` to catch everything the page issues regardless of host.

Explicit request-attachment from a DevTools-style panel was considered and deferred. The automatic
recent-window bundle requires no correlation logic and therefore has no false-attachment failure
mode; a wrong attachment would send the agent confidently down the wrong path, which is worse than
the agent reading past a few irrelevant requests.

### 4. Agent channel

```
livepin poll [--agent-reply "<message>"]   # long-polls, blocks until the human acts
livepin say "<message>" [--thread <id>]    # non-blocking reply
livepin state                              # dump current threads as JSON
livepin end                                # end the session
```

`poll` is the mechanism that makes the loop two-way: the agent's turn parks on a long-poll until the
human comments, replies, or ends the session. `--agent-reply` piggybacks the agent's outbound message
onto the same call, so the conversation reads naturally in the panel.

Queued feedback is durable — if a poll is killed or times out, re-running it loses nothing.

**Ending from the browser.** The human ending a session via the overlay button is the normal case,
not an exception. Its semantics:

- The final flush is still delivered — a blocked poll returns any queued feedback together with
  `{"ended": true}` exactly once, so the last thing the human said is never swallowed by the end.
- Subsequent `poll` calls return `{"ended": true}` immediately rather than blocking, so an agent
  cannot park forever on a dead session.
- The agent must not restart a human-ended session on its own. `livepin start` against an ended
  session refuses and explains, and requires `--reopen` to override.

### 5. Skill packaging

`SKILL.md` ships inside the npm package and is version-matched to the CLI, so the instructions can
never drift from the commands they describe.

```
npx livepin skill install [--dir <path>]   # writes SKILL.md where Claude Code finds it
npx livepin skill print                    # stdout, for Cursor rules / AGENTS.md / any agent
```

## Data model

A comment delivered to the agent:

```jsonc
{
  "threadId": "t_04",
  "url": "http://localhost:4850/patients/1182",
  "text": "this list should also show the last visit date",
  "createdAt": "2026-08-07T09:14:22.113Z",
  "element": {
    "selector": "[data-testid=visit-list] > li:nth-child(3)",
    "text": "Dr. Okafor — Follow-up",
    "bbox": [412, 288, 520, 64],
  },
  "source": {
    "file": "components/VisitList/VisitRow.tsx",
    "line": 42,
    "componentStack": ["VisitRow", "VisitList", "PatientOverview"],
  },
  "data": {
    "props": { "visit": { "id": 91, "provider": "Dr. Okafor", "last_visit_at": "2026-07-30" } },
    "truncated": false,
  },
  "network": [
    {
      "method": "GET",
      "url": "https://api.example.com/patients/1182/visits",
      "status": 200,
      "ms": 214,
      "responseBody": "…",
    },
  ],
}
```

Session state persists to `.livepin/<session>.json` in the working directory, so threads and chat
survive a restart. `--fresh` starts a clean session.

## Privacy and data handling

Capturing response bodies means application data is written to disk and sent to an agent. On the
first codebase this will run against, that data is patient records. This is designed in, not bolted
on:

- Response-body capture is **off by default** — the context toggle starts at `Off`.
- Body size is capped and values are truncated.
- Redaction is configured in `livepin.config.json` in the host project root, holding `redactUrls`
  (glob patterns whose bodies are dropped entirely) and `redactFields` (field names replaced with
  `"[redacted]"` at any depth). Redaction runs before anything is written to disk or sent to the
  agent, never after.
- The tool writes `.livepin/` into the host project's `.gitignore` on first run.

## Build phases

Each phase is independently useful and independently verifiable.

1. **Proxy + HMR passthrough.** Verified against fixture Next _and_ Vite apps. First because it is
   the most likely thing to break and everything else sits on top of it.
2. **Overlay shell.** Shadow DOM, inspect mode, pins, threads, SSE transport.
3. **Agent channel.** Long-poll, replies, session store, durability across a killed poll.
4. **Fiber capture.** Source location, component stack, props/state.
5. **Network capture + context toggle.** Proxy-side and `fetch`/`XHR` patching, redaction, size
   estimate in the UI.
6. **Skill packaging.** `SKILL.md`, install and print verbs.

## Risks

**Pin re-anchoring is the hardest problem.** Elements move, change, and disappear between edits — and
edits are the entire point of the tool, so this is the common case rather than an edge case.
Strategy: re-anchor on source location first, then selector, then text content. When all three miss,
mark the pin **orphaned** and surface it in the panel. Silently dropping a human's comment is the one
unacceptable outcome.

**Proxy versus HMR** is the highest-risk unknown in the stack. Websocket upgrade passthrough is a
well-understood pattern, but each framework's dev server does it slightly differently. This is why
phase 1 exists and why it is verified against two frameworks rather than one.

**Fiber internals are private API.** `__reactFiber$` and `_debugSource` are undocumented and
`_debugSource` was removed in React 19. Capture must be defensive — wrapped, feature-detected, and
degrading to selector-only rather than throwing.

## Testing

Vitest, following standard practice for a fresh TypeScript package. Coverage above 90%.

Unit:

- HTML injection: chunked and streamed responses, missing `</head>`, non-HTML content types,
  already-injected documents.
- Selector generation: stability preferences, collisions, deep trees.
- Fiber resolution: React 18 shapes, missing `_debugSource`, non-React nodes.
- Redaction: URL patterns, field names, truncation boundaries.
- Session store: append, resolve, persistence, `--fresh`.
- Poll semantics: blocks when empty, wakes on write, durable across a killed poll.

Integration:

- Fixture Next app and fixture Vite app behind the proxy: overlay loads, HMR still triggers a
  reload, pins re-anchor after an edit.

## Open questions

None blocking. The package name `livepin` has not been checked for npm availability and is trivially
changeable before first publish.
