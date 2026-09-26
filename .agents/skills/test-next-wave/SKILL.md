---
name: test-next-wave
description: Writes and runs comprehensive automated tests for every implementation-complete task in one plan.md wave within one agent, then hands green tasks to code review. Use when asked to test the next wave, test all tasks in the current wave, or run the plan testing gate.
---

# Test next wave

Test every testable `testing` task in one wave. This agent owns the whole wave and does not delegate individual tasks. Do not start a later wave or edit production implementation.

## Pick

Use the named plan, the plan just specified, or `docs/index.md`. Ask once if several plans match. Read `plan.md` only to select the wave. Stop if it is missing or `Status: draft`.

**Current wave:** the lowest-numbered wave containing any task not `done`. **Testable:** `testing`, in that wave, with every `depends_on` task `done` (resolve foreign ids through `docs/index.md`).

If that wave has `testing` tasks but none are testable, stop and name their blockers. If no task is `testing`, report whether work remains in `pending`, `code_review`, or `blocked`; do not skip to a later wave.

## Execute

- Assign expected test and fixture paths across all testable tasks before editing. Consolidate shared coverage and avoid conflicting or duplicate tests.
- For each task, follow `.agents/skills/test-next-task/test-task.md` directly. Read the four testing skills and only the relevant references it names.
- Work through the wave in an efficient order. Process tasks sequentially when they share a test file, fixture, snapshot, runner configuration, dependency manifest, or behavior under test.
- Keep production defects demonstrated by tests unfixed and record the affected task's recommended status as `pending`.

## Close

After all testable tasks have been handled, change only those tasks' status lines in `plan.md`:

| Result | Status |
| --- | --- |
| Comprehensive tests and required verification pass | `code_review` |
| Tests prove production work is missing or wrong | `pending` |
| Human input or an unavailable external dependency is required | `blocked` |
| Test work or verification remains incomplete | `testing` |

Never mark a task `done`. Summarize each task's criterion coverage, changed test paths, verification, defects or gaps, and new status.
