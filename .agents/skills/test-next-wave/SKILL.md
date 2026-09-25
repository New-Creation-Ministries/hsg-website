---
name: test-next-wave
description: Writes and runs comprehensive automated tests for every implementation-complete task in one plan.md wave, using one test agent per task and handing green tasks to code review. Use when asked to test the next wave, test all tasks in the current wave, or run the plan testing gate.
---

# Test next wave

Test every testable `testing` task in one wave. Each task gets its own subagent. Do not start a later wave or edit production implementation.

## Pick

Use the named plan, the plan just specified, or `docs/index.md`. Ask once if several plans match. Read `plan.md` only to select the wave. Stop if it is missing or `Status: draft`.

**Current wave:** the lowest-numbered wave containing any task not `done`. **Testable:** `testing`, in that wave, with every `depends_on` task `done` (resolve foreign ids through `docs/index.md`).

If that wave has `testing` tasks but none are testable, stop and name their blockers. If no task is `testing`, report whether work remains in `pending`, `code_review`, or `blocked`; do not skip to a later wave.

## Dispatch

- Assign expected test and fixture paths before dispatch. Tasks that may edit the same test file, fixture, snapshot, runner config, or dependency manifest run sequentially; all other tasks run in one parallel batch.
- Use one subagent per task. Pass the repository root, plan and spec paths, the full task block, assigned test paths, and: “Follow `.agents/skills/test-next-task/test-task.md`; do not edit `plan.md` or production files.”
- Do not paste skill bodies into prompts. Let each task agent load the four testing skills and relevant references named by `test-task.md`.

## Close

After all agents return, change only dispatched tasks' status lines in `plan.md`:

| Result | Status |
| --- | --- |
| Comprehensive tests and required verification pass | `code_review` |
| Tests prove production work is missing or wrong | `pending` |
| Human input or an unavailable external dependency is required | `blocked` |
| Test work or verification remains incomplete | `testing` |

Never mark a task `done`. Summarize each task's criterion coverage, changed test paths, verification, defects or gaps, and new status.
