---
name: review-next-wave
description: Reviews every reviewable code_review task in the next plan.md wave in parallel, one subagent per task, then attaches one or more plan tasks that fix the wave's findings. Use when the user asks to review the next wave, code-review a wave, or review all tasks waiting in the current wave.
---

# Review next wave

Every reviewable `code_review` task in **one** wave, each in its own subagent, in parallel. Do not implement. Do not start later waves. This agent does not review the code.

Build leaves finished implementation at `code_review`. This skill is the review gate for that wave. Required findings become plan tasks. One review task may cover findings from several tasks in the wave.

## Pick

Named plan, the one just specified, or `docs/index.md`. Ask once if several match. Read `plan.md` only to choose the wave. Stop if missing or `Status: draft`.

**Next wave:** lowest-numbered wave with a `code_review` task. **Reviewable:** defined in `.agents/skills/review-next-task/attach-findings.md`.

Dispatch every reviewable task in that wave. Leave `pending`, `blocked`, and `done` alone. If the wave has `code_review` tasks but none reviewable, stop and name the open review tasks. Do not skip the wave. If nothing is `code_review`, stop and name what is still `pending` or `blocked`.

## Dispatch

One `generalPurpose` subagent per reviewable task, one parallel batch. Description: `id` + short title.

Prompt: the plan path, the sibling `spec.md` path, the task block (`id`, `title`, `acceptance_criteria`, `files`, `depends_on`), and "follow `.agents/skills/review-next-task/review-task.md`; do not edit `plan.md`." Do not paste that file into the prompt.

## Close

When all return, follow `.agents/skills/review-next-task/attach-findings.md` for the whole wave. Group findings into as few review tasks as one agent can fix. Split when one agent would be doing too much. Summarize per reviewed task: id, verdict, new status. Then list review tasks added. If the wave still has `pending` tasks, name them.
