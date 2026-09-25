---
name: build-next-wave
description: Implements production code for all runnable pending tasks in the current plan.md wave, without writing tests, using one subagent per task. Use when the user asks to build the next wave, run the next wave, implement a wave of tasks, or execute all pending tasks in the current wave.
---

# Build next wave

Every runnable `pending` task in **one** wave, each in its own subagent, in parallel. Do not rewrite the plan. Do not start later waves. This agent does not implement.

## Pick

Named plan, the one just specified, or `docs/index.md`. Ask once if several match. Read `plan.md` only. Stop if missing or `Status: draft`.

**Current wave:** lowest-numbered wave containing any task not `done`. **Runnable:** `pending`, in that wave, and every `depends_on` is `done` (foreign ids via `docs/index.md` → that plan).

Dispatch every runnable task in that wave. If the wave has `pending` but none runnable, stop and name blockers; do not skip the wave. If nothing is `pending`, stop.

## Dispatch

One `generalPurpose` subagent per runnable task, one parallel batch. Description: `id` + short title.

Prompt: the task block (`id`, `title`, `acceptance_criteria`, `files`, `depends_on`) and “follow `.agents/skills/build-next-task/execute-task.md`; do not edit `plan.md`.” Do not paste that file into the prompt.

## Close

When all return, in `plan.md` change only dispatched `status` lines: implementation complete and required checks pass → `testing`; needs human → `blocked`; else leave `pending`. Never `code_review` or `done`. Summarize per task: id, production files, verification, new status.
