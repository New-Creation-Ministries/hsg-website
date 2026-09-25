---
name: test-next-task
description: Writes comprehensive automated tests for one implementation-complete task in the current plan.md wave, then moves it to code review only when the tests and required verification pass. Use when asked to test the next task, add tests for one plan task, or test a named task whose status is testing.
---

# Test next task

Test one `testing` task from the current wave of `plan.md`. Own test code and test infrastructure, not production implementation.

## Pick

Use the named plan, the plan just specified, or `docs/index.md`. Ask once if several plans match. Stop if `plan.md` is missing or `Status: draft`.

**Current wave:** the lowest-numbered wave containing any task not `done`. **Testable:** `testing`, in that wave, with every `depends_on` task `done` (resolve foreign ids through `docs/index.md`). Leave `pending`, `blocked`, `code_review`, and `done` tasks alone.

If the user names a task by id or title, test only that task when it is testable in the current wave. If no task is named, take the first testable task in document order. Do not substitute a different task when a named task is missing or ineligible.

## Do

This agent tests. No subagent. Follow [test-task.md](test-task.md) for this task only.

## Close

Change only this task's `status` in `plan.md`:

| Result | Status |
| --- | --- |
| Comprehensive tests and required verification pass | `code_review` |
| A production defect or unmet criterion needs implementation work | `pending` |
| A human decision, credential, or unavailable external dependency is required | `blocked` |
| Test work or verification is incomplete for another concrete reason | `testing` |

Never mark the task `done`. Do not edit intent, spec, or other tasks.
