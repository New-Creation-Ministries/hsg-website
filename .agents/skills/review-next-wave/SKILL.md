---
name: review-next-wave
description: Reviews every reviewable code_review task in one plan.md wave within one agent, fixes every finding in the same run, including Optional, Nit, and FYI, and marks verified tasks done. Use when the user asks to review the next wave, code-review a wave, or review all tasks waiting in the current wave.
---

# Review next wave

- Review every reviewable `code_review` task in **one** wave within this agent. Do not delegate individual tasks.
- Complete read-only review passes before coordinating fixes and verification across the wave.
- Do not start later waves or create follow-up tasks.

Testing leaves comprehensively tested implementation at `code_review`. This skill is the review gate for that wave. Every finding that does not need a human decision is fixed before the reviewed tasks move to `done`, including Optional, Nit, and FYI.

## Pick

Named plan, the one just specified, or `docs/index.md`. Ask once if several match. Read `plan.md` only to choose the wave. Stop if missing or `Status: draft`.

**Current wave:** lowest-numbered wave containing any task not `done`. **Reviewable:** a `code_review` task in that wave that meets `.agents/skills/review-next-task/resolve-findings.md`.

Review every reviewable task in that wave. Leave `pending`, `testing`, `blocked`, and `done` alone. If the wave has `code_review` tasks but none reviewable, stop and name the open review tasks. Do not skip the wave. If nothing is `code_review`, stop and name what is still `pending`, `testing`, or `blocked`.

## Review

- Follow `.agents/skills/review-next-task/review-task.md` directly for each reviewable task.
- Keep every task's initial review pass read-only. Record its verdict, files read, findings, and unmet criteria before applying any fixes.
- Review shared files once in enough context to judge every affected task. Attribute findings to each task whose acceptance criteria or behavior they affect.

## Close

- After every initial review pass, follow `.agents/skills/review-next-task/resolve-findings.md` for the whole wave.
- Fix findings sequentially, combining duplicate findings and shared-file fixes.
- Recheck every reviewed task affected by a shared fix before marking it `done`.
- Summarize per reviewed task: id, fixes, verification, remaining findings, and new status.
- If the wave still has `pending` tasks, name them.
