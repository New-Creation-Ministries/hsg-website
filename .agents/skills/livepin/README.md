# livepin

Annotate a live dev server and loop a coding agent into the feedback.

[![skills.sh](https://skills.sh/b/rajatgng/livepin)](https://skills.sh/rajatgng/livepin)

`livepin` proxies whatever frontend you are already running, injects an overlay into it, and gives
you a way to click a real element, say what is wrong, and have a coding agent receive that comment
with the source location, the component's props, and the requests behind it attached.

It knows nothing about your project. Any dev server that serves HTML will do.

Works with any coding agent that can run a shell command. React dev builds get extra fidelity —
source location and props — and nothing else degrades without them.

[The design document](docs/specs/2026-08-07-livepin-design.md) explains why each piece is built the
way it is, including the parts that were considered and rejected.

## Requirements

Node 20 or newer. That is the whole list — no browser extension, no changes to your project.

## Install

One command. It writes the instructions into every coding agent it knows about — around eighty of
them, including Claude Code, Cursor, Codex, Copilot, Cline, Continue, Gemini CLI, Windsurf and Zed:

```bash
npx skills add rajatgng/livepin --all
```

The agent installs the CLI itself the first time it runs a review, so this is the only thing you type.

Then the human says:

> review the new benefit strip with livepin

and the agent does the rest — starts the proxy on the right route, waits, reads the comments, makes
the changes, replies in the page. They never type a command.

`SKILL.md` ships inside the package and is read from the same install as the binary, so the
instructions cannot describe a version of the commands you do not have. A test asserts that every
command it names actually exists.

To use it yourself rather than through an agent:

```bash
npm i -g github:rajatgng/livepin          # then `livepin start --target …`
npx -y github:rajatgng/livepin start --target http://localhost:3000   # or per-call
```

From a checkout, for working on livepin itself:

```bash
npm install
npm run dev -- start --target http://localhost:3000    # from source, no build
npm link                                               # or put `livepin` on your PATH
```

### Installing the instructions by hand

If you would rather not use `skills`:

```bash
livepin skill install         # writes .claude/skills/livepin/SKILL.md
livepin skill print           # stdout, for Cursor rules, AGENTS.md, anything else
```

## Use

```bash
livepin start --target http://localhost:3000
```

Your default browser opens on the proxy and you carry on as normal — same app, same login session.

```
--target <url>    Dev server to proxy (required)
--port <n>        Port for the proxy            (default: 4850)
--host <addr>     Address to bind               (default: 127.0.0.1)
--open <path>     Path to open in the browser   (default: /)
--no-open         Do not open a browser
--fresh           Ignore the stored session and start a new one
--reopen          Continue a session you had ended
```

### The agent's side

`start` stays in the foreground. The agent runs these from the same directory, one per turn:

```bash
livepin poll [--agent-reply "<msg>"] [--thread <id>] [--timeout <seconds>]
livepin say "<msg>" [--thread <id>]
livepin state
livepin end
```

`poll` **blocks** until you comment, resolve a thread, or end the session, then prints JSON:

```jsonc
{
  "sessionId": "s_b8l8t9ap",
  "ended": false,
  "timedOut": false,
  "items": [
    {
      "seq": 1,
      "kind": "comment",
      "threadId": "t_002",
      "url": "http://127.0.0.1:4850/patients/1182",
      "text": "this list should also show the last visit date",
      "createdAt": "2026-08-07T09:14:22.113Z",
      "element": {
        "selector": "…",
        "text": "Dr. Okafor — Follow-up",
        "bbox": [412, 288, 520, 64],
        "tag": "li",
      },
    },
  ],
}
```

`--agent-reply` posts a message and waits in one call, so the panel reads as a conversation.

Nothing you say is lost. Items are only marked delivered once a poll's response has actually reached
the agent — kill a poll mid-wait and the next one repeats everything. The session lives in
`.livepin/` in your project, so it also survives restarting the proxy.

Ending the review from the page is the normal way to finish. A blocked poll gets your last words
together with `{"ended": true}`, later polls return immediately rather than parking on a dead
session, and `livepin start` refuses to revive it without `--reopen`.

### Context: what the pin knows

The toolbar's **Context** button cycles through three levels:

| Level     | A new pin carries                                       |
| --------- | ------------------------------------------------------- |
| `off`     | selector, visible text, position, page (the default)    |
| `data`    | …plus source location, component stack, props and state |
| `network` | …plus the recent requests, with bodies                  |

At `network` the button also shows the current payload size (`Context: network (~3.4 kB)`), and the
composer shows what one pin would actually cost before you commit to it:

```
VisitList.jsx:40 · VisitRow ← VisitList ← App · props · 12 requests · ~8.1 kB
```

At `data` and above, a pin carries React's view of the element:

```jsonc
"data": {
  "source": { "file": "src/VisitList.jsx", "line": 40 },
  "componentStack": ["VisitRow", "VisitList", "App"],
  "components": [
    { "name": "VisitRow", "props": { "visit": { "id": 91, "last_visit_at": "2026-07-30" } } },
  ],
  "truncated": false,
}
```

That is the difference between "this list should show the last visit date" costing the agent a search
and costing it nothing — the field is right there, already in the props, just unrendered.

**It is off by default and not remembered between page loads.** Props are the application's data, and
they are also most of what a comment costs an agent to read. Turn it on for the pin that needs it.
The composer tells you what was actually collected before you commit to it, because this only works
on React **development** builds — production builds and non-React pages have nothing to give, and
you should know that rather than guess.

Everything here comes from React's private internals (`__reactFiber$…`, `_debugSource`), which are
undocumented and version-specific: `_debugSource` was removed in React 19. Capture is written to
return less rather than fail, so the worst case is a pin with only its selector — still a working
annotation.

At `network`, the pin also carries the requests behind the screen:

```jsonc
"network": [
  {
    "method": "GET",
    "url": "https://api.example.com/patients/1182/visits",
    "status": 200,
    "ms": 214,
    "via": "page",
    "responseBody": "{\"visits\":[…]}",
  },
]
```

Two sources feed it. `via: "page"` comes from patched `fetch` and `XMLHttpRequest`, which catch every
origin your app talks to — most APIs are not on the dev server. `via: "proxy"` comes from the proxy,
which catches what the overlay could not see: requests made before it booted, and the documents and
streamed payloads that were never `fetch` calls. A request both saw is kept once, in the page's
version, because that is the one with a body.

### Redaction

Response bodies mean application data leaves the browser, gets written to `.livepin/`, and is read by
an agent. Put the rules in `livepin.config.json` in your project root:

```json
{
  "redactUrls": ["*/patients/*"],
  "redactFields": ["ssn", "dob", "mrn"]
}
```

`redactUrls` drops the bodies of matching requests entirely, keeping only that the request happened.
`redactFields` replaces those field names with `"[redacted]"` at any depth, in props, in state, and in
bodies, case-insensitively.

Redaction runs **server-side, before anything is stored or sent** — there is no path into a session
that skips it. The overlay also fetches `redactUrls` and declines to record those bodies at all, so
they are never held in the page; that is an extra layer, not the one that counts.

Two consequences worth knowing:

- A body that is not JSON cannot be inspected field by field, so once any `redactFields` rule exists,
  non-JSON bodies are **dropped** rather than passed through untouched. A body we cannot read is a
  body we cannot clear.
- Bodies are capped at 2000 characters, requests at the 50 most recent.

## Project structure

```
src/                    Server side. No runtime dependencies — Node builtins only.
  cli.ts                Argument parsing and every verb. The only executable entry point.
  skill.ts              Installing SKILL.md where a coding agent will find it.
  proxy.ts              The reverse proxy: request forwarding, HTML rewriting, websocket passthrough.
  inject.ts             Where the script tag goes and how it survives a chunked response.
  api.ts                Routes under /__livepin/*: the browser's door and the agent's.
  session.ts            In-memory threads and comments. No I/O — it holds state and notifies.
  channel.ts            The agent's queue and the blocking poll. Where durability is enforced.
  store.ts              Persistence to .livepin/, and the pointer the agent verbs find it by.
  agent-client.ts       HTTP client for the verbs. node:http, because fetch times out long polls.
  config.ts             Reading livepin.config.json from the project root.
  redact.ts             Clearing captured data. Runs before anything is stored or sent.
  network-log.ts        What the proxy saw, and merging it with what the page reported.
  types.ts              Shapes shared by server and browser. No Node or DOM imports.
  overlay-bundle.ts     Serving the overlay: prebuilt from dist, or esbuilt from source in dev.
  open-browser.ts       Opening the review URL in the default browser, per platform.

src/overlay/            Browser side. Bundled by esbuild into dist/overlay.js.
  index.ts              Bootstrap: mount, and tear down any instance a hot reload left behind.
  ui.ts                 The overlay itself — shadow root, inspect mode, pins, panel, composers.
  selector.ts           Generating a selector that survives the agent editing the page.
  anchor.ts             Finding a pinned element again afterwards. The hardest problem here.
  fiber.ts              Reading React's private internals for source, stack and props. Never throws.
  network.ts            Patched fetch and XHR. Must never break the page it observes.
  transport.ts          The API client: fetch calls and the EventSource stream.
  styles.ts             Shadow-root CSS. Fixed dark palette — it sits on an unknown app.

test/                   Vitest. One file per src module, mirroring the source layout.
                        Node environment for server modules, happy-dom for anything in overlay/.

fixtures/               Real framework apps, for the checks a synthetic upstream cannot prove.
  vite-app/             Minimal Vite + React app on :5199. Run by hand; not used in CI.

SKILL.md                Instructions for the coding agent. Ships in the package.

docs/specs/             The approved design. Read this before changing architecture.

dist/                   Build output (gitignored). Created by `npm run build`.

.livepin/              Written into the project being reviewed, not this repo. Added to its
                        .gitignore on first run.
  current.json          Which session, and where the proxy is listening. Kept after shutdown with
                        running:false, because it also records what to resume.
  <session>.json        The review: threads, comments, and the agent's delivery cursor.
```

Config lives in the root: `tsconfig.json` typechecks everything including tests;
`tsconfig.build.json` narrows to `src/` and is the only one that emits. `vitest.config.ts` holds the
coverage thresholds and disables file parallelism, because the integration tests bind real ports.

### Where to start reading

`src/inject.ts` is the smallest file and explains the core problem. `src/proxy.ts` is where the two
paths — rewritten requests and raw upgrades — diverge, and its header comment explains why they have
opposite requirements. On the browser side, `src/overlay/anchor.ts` is the one to understand: it
decides what happens to a comment when the element it was attached to no longer exists.
`src/channel.ts` is the equivalent on the agent's side: it decides when a comment counts as
delivered, which is the only thing standing between a killed poll and lost feedback.

## How it works

A reverse proxy sits in front of your dev server. HTML responses get an overlay script injected
before `</head>`; everything else — JSON, assets, RSC payloads — passes through byte-identical.
Websocket upgrades are piped through raw, so hot reload keeps working.

Two consequences worth knowing about:

- The proxy asks your dev server for **uncompressed** responses, because a gzipped body cannot be
  rewritten. On loopback this costs nothing.
- The original `Host` header is **preserved**, so URLs your app generates point at the proxy rather
  than sending you back to the unproxied port.

### The two-way channel

The browser talks to the proxy over `fetch` plus an SSE stream, so an agent's reply appears without a
reload. The agent talks to the same proxy over loopback HTTP, as separate short-lived processes.

That asymmetry is why the session is on disk and why `poll` acknowledges rather than just reads: the
browser is always connected and the agent almost never is, so anything said while no agent is
listening has to still be waiting when one comes back.

Comments arriving on `/__livepin/api/*` are always attributed to the human, whatever the request
body claims; only `/__livepin/agent/*` can speak as the agent. That is about keeping the transcript
honest, not about security — this is a loopback dev tool with no authentication by design.

### Logging in

The proxy runs on a different port from your app. Cookies ignore port, so a cookie-based session
carries over and you stay logged in. `localStorage` is scoped per port, so if your app keeps its
auth token there you will log in once on the proxy port. That is expected, not a bug.

## Development

```bash
npm install
npm run dev -- start --target http://localhost:3000   # run from source, no build
npm test                                              # unit + integration
npm run coverage                                      # enforces > 90%
npm run lint                                          # eslint + prettier
```

CI drives a synthetic upstream that can be made to stream, stall, compress, or upgrade on demand.
Real framework fixtures live in `fixtures/` for hand-testing the things a mock cannot prove:

```bash
cd fixtures/vite-app && npm install && npm run dev    # :5199
npm run dev -- start --target http://127.0.0.1:5199   # in the repo root
```

Then edit a file in the fixture and confirm the proxied page hot-reloads.

## Licence

MIT
