---
name: human-ui-review
description: >-
  Runs a human UI review on the live app with livepin and records the comments
  for later analysis. Use when the user asks for a human review of the UI, to
  review one plan task or a wave with them, to look at the whole UI together,
  or to capture UI feedback with livepin.
---

# Human UI review

Show the running UI to the human with livepin, collect their comments, and write them down. Do not implement. Do not edit `plan.md`, `intent.md`, or `spec.md`.

Before starting, read `.agents/skills/livepin/SKILL.md` and follow it for install, start, poll, reply, and end. Where that skill says to change the code, this skill wins: acknowledge or ask, then record.

## Scope

The user names one. If they do not, ask once.

| Scope | What they see | Record |
| --- | --- | --- |
| task | One task in one wave | `docs/feedback/<feature_slug>/<task_id>.md` |
| wave | Every UI task in one wave | `docs/feedback/<feature_slug>/wave-<n>.md` |
| overall | The whole UI, no plan | `docs/feedback/overall.md` |

`<feature_slug>` is the plan folder name (`docs/features/csv-export` → `csv-export`), including fixes, improvements, and chores. Same slug in two categories: ask once which plan.

## Pick

**Overall.** No plan. Open the route they name, or ask once which path. Do not dump them on `/` to hunt.

**Task or wave.** Named plan, the one just specified, or `docs/index.md`. Ask once if several match. Stop if `plan.md` is missing or `Status: draft`.

**Current wave:** lowest-numbered wave with a UI task in `code_review`. If they name a wave or a task id/title, use that instead. A named task must be `code_review` or `done`. If it is missing, `pending`, or `blocked`, stop and say why. Do not substitute another task.

**UI task:** acceptance criteria or files name a route, page, component, or style. Skip tests, migrations, and server-only tasks. For a wave, review every UI task in that wave and list the skipped ones in the record. If the wave has no UI task, stop.

If they do not name a task, take the first UI task in document order in the current wave. If none are in `code_review`, stop. Do not reopen `done` work unless they name it.

## Routes

Read that task's acceptance criteria and the sibling `spec.md` for a path. Open that path with livepin. Several paths: start on the first, and in the opening message list the rest and ask them to visit each. One session covers the scope. Unknown path: ask once. Do not guess a route.

The dev server must already be running. Start it only if this repo has a known dev command and the port is clear. Otherwise ask which port.

## Session

Tell them the scope (task id, wave number, or overall), the routes, the review URL, and that you are waiting. Say comments are recorded and not built in this session. Say that before `livepin poll`.

One comment at a time. Read `data.source` before searching the repo. Reply in that thread: confirm you have it, or ask one clarifying question if it is ambiguous. Then poll again. Do not edit application code. If they ask for a fix, say it will be in the record.

They end with **End**, or you run `livepin end` when they say they are done. Do not restart an ended session.

## Record

After the session ends, run `livepin state` and write from that plus the poll results. Create the `docs/feedback/` path if needed. If the file exists, append a new session. Do not edit earlier sessions.

Keep each comment's `text` verbatim. Keep `[redacted]` as redacted. Attribute a comment to a task when its url or `data.source.file` matches that task's route or `files`; otherwise `—`.

```markdown
# UI feedback: <task title | Wave N | Overall>
Scope: task | wave | overall
Feature: <feature_slug> | overall
Plan: <path> | —
Wave: <n> | —
Tasks: <ids in this review>
Skipped: <non-UI task ids> | —
Routes: <paths opened>

## Session <YYYY-MM-DD>

### <seq>. <threadId>
- kind: comment | resolved | unresolved
- url:
- element: <tag> — <text>
- source: <file:line> | —
- component: <name> | —
- task: <id> | —
- resolved: yes | no
- text: |
    <verbatim>

## Session summary
- comments: <n>  resolved: <n>  open: <n>
- open: <one line each, or none>
- themes: <two or three sentences on what they asked for>
```

A session with no comments is still written: `comments: 0` and `themes: no comments`.

## Close

Tell them the file path, the counts, and each open comment in one line. The file is the record for later analysis. Do not turn comments into plan tasks unless they ask.
