---
name: review-next-task
description: Reviews one code_review task from the current wave of a feature plan.md against the spec and plan, using the code review skills, then attaches plan tasks that fix the findings. Use when the user asks to review the next task, code-review the next task, review one plan task, or names a task id or title waiting in code_review.
---

# Review next task

One reviewable `code_review` task from the current wave of `plan.md`. Do not implement. Do not rewrite the plan except that task's `status` and new review tasks from [attach-findings.md](attach-findings.md).

Build leaves finished implementation at `code_review`. This skill is the review gate. It does not mark work `done` while required findings are still open.

## Pick

Named plan, the one just specified, or `docs/index.md`. Ask once if several match. Stop if `plan.md` is missing or `Status: draft`.

**Current wave:** lowest-numbered wave with a `code_review` task. **Reviewable:** defined in [attach-findings.md](attach-findings.md).

If that wave has `code_review` tasks but none reviewable, stop and name the open review tasks. Do not skip to a later wave.

If the user names a task (`id` or title), review it only when it is reviewable in the current wave. Ask once if several match. If it is missing, outside the current wave, or not reviewable, stop and say why. Do not substitute another task.

If none named, take the first reviewable task in document order in the current wave. If the plan has no `code_review` task, stop and say whether it is finished or still `pending` / `blocked`.

## Do

This agent reviews. No subagent. Follow [review-task.md](review-task.md) for that task only.

## Close

Follow [attach-findings.md](attach-findings.md) for this task's findings only.
