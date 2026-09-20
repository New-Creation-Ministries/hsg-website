---
name: livepin
description: >-
  Review UI changes with the human on a live dev server. Opens their browser on the running app,
  where they click elements and comment on them; you receive those comments with the component's
  source location, props and network traffic attached, and reply into the page. Use when the user
  asks to review, check, or iterate on UI "with livepin", or wants to look at a page together.
---

# livepin

A two-way review loop over a running dev server. The human annotates real UI in their own browser;
you get their comments with enough context to act, and answer in the same page.

Use it when the user says something like "review the new benefit strip with livepin", "let's look at
this page together", or "check the dashboard changes with me". Do not use it for changes with no
visual surface — there is nothing to point at.

## Getting the tool

Installing this skill did not install the CLI. Before anything else, make sure it is there:

```bash
livepin --help >/dev/null 2>&1 || npm i -g github:rajatgng/livepin
```

That is idempotent, so running it at the start of every session is fine. Every command below then
works as written.

If installing globally is not possible, put `npx -y github:rajatgng/livepin` wherever these
instructions say `livepin` — same tool, resolved per call, a few seconds slower the first time.

## The shape of a session

```
you:   livepin start --target <dev server> --open <route>     # opens their browser, stays running
you:   livepin poll                                           # BLOCKS until they say something
human: clicks an element, types a comment
you:   read the comment, make the change, then poll again with a reply
human: clicks End, or you run livepin end
```

You drive every step except the clicking. The human does not run commands.

## Starting

The dev server must already be running — start it if it is not, or ask which port it is on. Then:

```bash
livepin start --target http://localhost:3000 --open /patients/1182
```

Point `--open` at the route your change actually affects. Landing them on the app's root and making
them navigate wastes the first minute of the review.

`start` **stays in the foreground**. Run it in the background (or a separate shell) so you can keep
working, and check its output for the review URL before you do anything else.

If it refuses:

- `session … was ended` — they ended a previous review. `--reopen` continues it with its comments
  intact, `--fresh` starts clean. Ask which unless it is obvious.
- `a livepin proxy is already running` — one is up already. Use it rather than starting a second.

## Polling

```bash
livepin poll
livepin poll --agent-reply "moved the badge inline — take a look"
livepin poll --thread t_002 --agent-reply "fixed, reload and check"
```

**`poll` blocks in the foreground until the human acts.** That is the point of it: your turn parks
there while they look at the page. Do not treat a long wait as a hang, and do not fire off a second
poll alongside the first. It returns when they comment, resolve a thread, or end the session — or
after `--timeout` seconds, having reported that nothing happened.

Tell the human the URL and that you are waiting **before** you block. A blocked poll with no
explanation looks like a crash.

`--agent-reply` posts your message and then waits, in one call, so the panel reads as a conversation
rather than a log.

Nothing they say is lost. A comment is marked delivered only once a poll has actually received it, so
a killed or timed-out poll costs nothing — run it again and the same items come back.

### If your tooling cannot run a command for fifteen minutes

Some agents cap how long a shell command may run. If yours does, poll in a loop with a timeout inside
that cap instead of one long block:

```bash
livepin poll --timeout 45
```

A timed-out poll answers `{"timedOut": true, "items": []}` and changes nothing, so repeating it is
free. Keep going until `items` is non-empty or `"ended": true` — and say what you are doing, so the
human is not watching you appear to do nothing. Prefer one long block where you can: it is the same
loop with fewer round trips.

## What a comment carries

```jsonc
{
  "seq": 1,
  "kind": "comment",
  "threadId": "t_002",
  "url": "http://127.0.0.1:4850/patients/1182",
  "text": "this list should also show the last visit date",
  "element": { "selector": "…", "text": "Dr. Okafor — Follow-up", "tag": "li" },
  "data": {
    "source": { "file": "src/components/VisitList.jsx", "line": 40 },
    "componentStack": ["VisitRow", "VisitList", "App"],
    "components": [{ "name": "VisitRow", "props": { "visit": { "last_visit_at": "2026-07-30" } } }],
    "network": [{ "method": "GET", "url": "…/visits", "status": 200, "responseBody": "…" }],
  },
}
```

`data` is present only when the human turned the Context toggle on, and `source` only on React
development builds. **Read it before searching the codebase** — it usually contains the answer. In the
example above, `last_visit_at` is already in the props, so the field exists and is simply unrendered.

`kind` is `comment`, `resolved` or `unresolved`. A resolve is them saying that one is done.

`element.selector` names what they clicked. It is a hint about which component to edit, not a thing to
put in code.

Fields may be missing or read `[redacted]` — the project's `livepin.config.json` decides what leaves
the browser. Do not ask the human to disable redaction so you can see more.

## Replying

```bash
livepin say "moved it inline; the wrap is gone at 1280 too" --thread t_002
```

Replies appear in their page immediately, no reload. Reply in the thread the comment came from —
`--thread` — so the conversation stays where they are looking. Without it you are writing in the
global chat, which is right for anything not about a specific element.

After making a change, say so and poll again rather than assuming they saw it. Hot reload means they
often have not.

## Ending

The human usually ends it with the **End** button. Your blocked poll returns their last words
together with `"ended": true`; later polls return immediately.

```bash
livepin end     # if they say they are done rather than clicking
```

Do not restart an ended session on your own. `start` refuses without `--reopen`, and that is
deliberate: they decided the review was over.

## Other commands

```bash
livepin state   # every thread and comment as JSON, when you need the history
```

## Working rules

- Run every command from the project root. The session lives in `.livepin/` there, and the verbs
  find it by that directory.
- One comment at a time. Make the change, reply, poll. Batching several into one silent burst of
  edits leaves them watching a page that changes for reasons they cannot follow.
- If a comment is ambiguous, ask in the thread and poll. You have a live human — use them.
- Their comment is about what they see. Match it to the component through `data.source` first, the
  component stack second, the selector last.
