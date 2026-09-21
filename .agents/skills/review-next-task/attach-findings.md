# Attach review findings to the plan

The parent writes the plan. Subagents do not. Do not edit `intent.md`, `spec.md`, or any task you did not review and are not appending.

## Reviewable

A task is reviewable when `status` is `code_review` and no task with status `pending`, `blocked`, or `code_review` lists that id under `reviews`.

Those open review tasks are the follow-up. When every task that lists the id under `reviews` is `done`, the source task is reviewable again.

## Incomplete review

If a report has an empty `files_read`, or no verdict, leave that task `code_review`. Do not file tasks from it. Say the review did not finish.

## Status

Change only the reviewed task's `status` line.

| Report | Status |
| --- | --- |
| `approve` | `done` |
| `request changes`, and every Critical/Required finding is filed on a new review task | `code_review` |
| `needs human` | `blocked` |

`done` means the review found nothing required. `code_review` means required fixes are now their own tasks. Do not mark a task `done` to unblock those fixes.

On `needs human`, file no review task for that source. Put every finding from that report in the summary, including ones that look fixable, and name the decision the human has to make. A later review waits until a human sets the task back to `code_review`.

## Group

Collect Critical and Required findings with `human: no` from `request changes` reports in this close. Skip `needs human` reports.

Default: **one** new review task for the whole set, including findings from different source tasks in the wave.

Split into another review task when one agent would be doing too much:

- The fixes are unrelated (no shared behavior), or
- The combined edit is more than one sitting (about 300 lines, or more than a handful of independent defects)

Keep sharing one task while the fixes belong together, even across source tasks. Do not create one task per finding or per source task. Never put the same file in two new review tasks; if a split would share a file, keep one task and say it is large.

Do not file Optional, Nit, or FYI. Mention them in the summary. Fold an Optional into a review task only when that task already edits the same lines.

No Critical or Required findings: add no task.

## Where

Append each new task to the **reviewed wave**, after the last task in that wave, so it is the next `pending` work before later waves. Do not renumber later waves. Do not add a new wave heading.

`id` is `{slug}_{wave}_{n}` using the next free `n` in that wave. Slug and wave come from the source ids (`csv-export_1_1` → slug `csv-export`, wave `1`).

`depends_on` is `[]` unless one new review task must follow another new review task. Do not depend on the source ids. They stay `code_review` until a later clean review.

`reviews` lists every source id whose findings this task fixes. That field is how the next review skips sources that already have an open follow-up.

```markdown
id: csv-export_1_3
title: Strip path separators in the CSV filename helper
status: pending
reviews:
- csv-export_1_1
- csv-export_1_2
acceptance_criteria:
- csv-export_1_1 Required: src/lib/csvFilename.ts strips `/` and `..` before building the download name
- csv-export_1_2 Required: src/lib/csvFilename.test.ts covers a name containing `/` and `..`
files:
- src/lib/csvFilename.ts
- src/lib/csvFilename.test.ts
depends_on: []
```

Title says what to fix. Each acceptance bullet starts with the source id and severity, then a falsifiable outcome an implementer can meet without the review transcript. Include the remedy. `files` is the union of files those findings touch.

Leave the wave heading as it is.
