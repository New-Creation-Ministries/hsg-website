---
name: build-next-task
description: Implements production code for one runnable pending task from the current wave of a feature plan.md without writing tests. Use when the user asks to build the next task, do the next task, pick up the next queued task, implement one plan task, or names a task id or title in the current wave.
---

# Build next task

One runnable `pending` task from the current wave of `plan.md`. Do not rewrite the plan. Do not start other tasks.

## Pick

Named plan, the one just specified, or `docs/index.md`. Ask once if several match. Stop if `plan.md` is missing or `Status: draft`.

**Current wave:** lowest-numbered wave containing any task not `done`. **Runnable:** `pending`, in that wave, and every `depends_on` is `done` (foreign ids via `docs/index.md` → that plan). Leave `testing`, `blocked`, and `code_review` to their owning stages.

If the user names a task (`id` or title), execute that task only when it is runnable in the current wave. Ask once if the name matches several. If it is missing, outside the current wave, or not runnable, stop and say why. Do not substitute another task.

If none named, take the first runnable task in document order in the current wave. If none runnable, stop and name blockers (or that the plan is finished).

## Do

This agent implements. No subagent. Follow [execute-task.md](execute-task.md) for that task only.

## Close

In `plan.md`, change only this task's `status`: implementation complete and required checks pass → `testing`; needs human → `blocked`; otherwise leave `pending`. Never `code_review` or `done`. Do not edit intent, spec, or other tasks.
