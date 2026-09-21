---
name: build-next-task
description: Executes the next unblocked pending task from a feature plan.md. Use when the user asks to build the next task, do the next task, pick up the next queued task, or implement one plan task.
---

# Build next task

One runnable `pending` task from `plan.md`. Do not rewrite the plan. Do not start other tasks.

## Pick

Named plan, the one just specified, or `docs/index.md`. Ask once if several match. Stop if `plan.md` is missing or `Status: draft`.

Queue is document order (Wave 1 onward). **Runnable:** `pending`, and every `depends_on` is `done` (foreign ids via `docs/index.md` → that plan). Skip `blocked` and `code_review`.

If none runnable, stop and name blockers (or that the plan is finished).

## Do

This agent implements. No subagent. Follow [execute-task.md](execute-task.md) for that task only.

## Close

In `plan.md`, change only this task's `status`: pass → `code_review`; needs human → `blocked`; else leave `pending`. Never `done`. Do not edit intent, spec, or other tasks.
