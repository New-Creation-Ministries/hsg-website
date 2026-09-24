---
name: human-ui-review
description: >-
  Runs a human UI review on the live app with livepin, applies small fixes
  immediately, and records larger issues for later. Use when the user asks for a human review of the UI, to
  review one plan task or a wave with them, to look at the whole UI together,
  or to capture UI feedback with livepin.
---

# Human UI review

- Show the running UI to the human with livepin, apply small fixes immediately, and record larger issues for later.
- Do not edit `plan.md`, `intent.md`, or `spec.md`.

- Before starting, read `.agents/skills/livepin/SKILL.md` and follow it for install, start, poll, reply, and end.
- Use the triage rules below to decide whether to change code or defer an issue.

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

- Before `livepin poll`, tell them the scope (task id, wave number, or overall), routes, review URL, and that you are waiting.
- Explain that small fixes happen immediately without a feedback record; larger issues are recorded for later.

- Handle one comment at a time; read `data.source` before searching the repo.
- Ask one clarifying question in the thread when the requested outcome is ambiguous.
- Apply small, clear, localized fixes that can be verified during the review, such as a copy correction, spacing adjustment, or isolated style fix.
- Verify each immediate fix in the live UI and follow repository verification requirements before reporting it complete; reply in the thread with the result, then resume polling.
- Do not add successfully applied small fixes to feedback documents or create plan tasks for them.
- Record larger issues for later when they require broader changes, investigation, or product/design decisions; acknowledge the issue in its thread without implementing it during the review.
- If a small fix proves larger or cannot be completed and verified during the review, defer it and include its remaining work in the record.

They end with **End**, or you run `livepin end` when they say they are done. Do not restart an ended session.

## Record

- After the session ends, run `livepin state` and use it with the poll results to identify deferred issues.
- Write only deferred issues to the feedback record; exclude successfully applied small fixes from entries, counts, and themes.
- Create the `docs/feedback/` path only when there are deferred issues. If the file exists, append a new session without editing earlier sessions.

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

- If no issues remain deferred, do not create or append a feedback record.

## Close

- Briefly report the immediate fixes made.
- If issues were deferred, give the feedback file path, deferred counts, and each open issue in one line; otherwise say no issues were deferred.
- Do not turn comments into plan tasks unless they ask.
