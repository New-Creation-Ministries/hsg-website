# Resolve review findings

## Ownership and scope

- The parent fixes findings and writes the plan; review subagents return reports without edits.
- Resolve findings in the same run; do not append review tasks or new waves.
- Change only reviewed tasks' `status` lines in `plan.md`.
- Do not edit `intent.md`, `spec.md`, or unrelated task implementations.

## Reviewable

- A task is reviewable when its status is `code_review` and no unfinished task lists its id under `reviews`.
- Honor existing follow-up tasks: a source becomes reviewable again when all tasks listing its id under `reviews` are `done`.

## Fix and verify

- If a report has an empty `files_read` or no verdict, complete the review before fixing or closing the task; leave it `code_review` if the review cannot finish.
- Fix every finding that does not need a human decision, at every severity: Critical, Required, Optional, Nit, and FYI. Include unmet acceptance criteria.
- Consolidate duplicate findings before editing shared code.
- Read applicable implementation skills and repository instructions before changing code.
- Keep fixes within the reviewed task's requirements and affected code, tests, and direct callers.
- Do not leave Optional, Nit, or FYI findings unfixed.
- Do not guess a human decision; complete independent fixes and report the unresolved decision.
- Run verification required by repository instructions and targeted checks for the defects fixed.
- Recheck changed code against the spec, acceptance criteria, and findings using [review-task.md](review-task.md); include all reviewed tasks affected by shared edits.
- Continue fixing and rechecking until no finding remains except an unresolved human decision, and required checks pass, or a concrete blocker prevents further progress.

## Status

| Final result | Status |
| --- | --- |
| Complete review, all acceptance criteria met, no open findings except an unresolved human decision below Critical/Required, required verification passes | `done` |
| Incomplete review, any unfixed finding that does not need a human decision, or incomplete/failing verification | `code_review` |
| An unresolved Critical/Required finding needs a human decision | `blocked` |

- Mark a task `done` only from the final verified result, never merely because fixes were attempted.
- For `blocked`, name the decision required; a later review waits until the task returns to `code_review`.
- Summarize fixes, verification results, remaining human decisions or blockers, and the final status of each reviewed task.
