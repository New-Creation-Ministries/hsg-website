---
name: review-next-task
description: Reviews one code_review task from the current wave of a feature plan.md against the spec and plan, using the code review skills, fixes every finding in the same run, including Optional, Nit, and FYI, and marks the task done after verification. Use when the user asks to review the next task, code-review the next task, review one plan task, or names a task id or title waiting in code_review.
---

# Review next task

- Review and fix one reviewable `code_review` task from the current wave of `plan.md`.
- Change only that task's `status` in the plan; do not create follow-up tasks.

Testing leaves comprehensively tested implementation at `code_review`. This skill is the review gate. It does not mark work `done` while a finding that does not need a human decision is still open, including Optional, Nit, and FYI.

## Pick

Named plan, the one just specified, or `docs/index.md`. Ask once if several match. Stop if `plan.md` is missing or `Status: draft`.

**Current wave:** lowest-numbered wave containing any task not `done`. **Reviewable:** a `code_review` task in that wave that meets [resolve-findings.md](resolve-findings.md).

If that wave has `code_review` tasks but none reviewable, stop and name the open review tasks. Do not skip to a later wave.

If the user names a task (`id` or title), review it only when it is reviewable in the current wave. Ask once if several match. If it is missing, outside the current wave, or not reviewable, stop and say why. Do not substitute another task.

If none named, take the first reviewable task in document order in the current wave. If the current wave has no `code_review` task, stop and say whether it is finished or still `pending`, `testing`, or `blocked`.

## Do

This agent reviews. No subagent. Follow [review-task.md](review-task.md) for that task only.

## Close

Fix and recheck this task's findings in the same run using [resolve-findings.md](resolve-findings.md).
