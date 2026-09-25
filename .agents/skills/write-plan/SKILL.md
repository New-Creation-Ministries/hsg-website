---
name: write-plan
description: Reads intent.md and spec.md and writes an implementation plan.md beside them. Use when the user asks to write a plan, implementation plan, plan.md, take spec to plan, or after a spec is ready and needs sequenced engineering work.
---

# Write plan

Take an intent and spec file and convert them into an implementation plan. Identify possible breakage, the most risky step, and implementation exclusions. An engineer must be able to implement from the plan and its linked source documents without this conversation.

Do not implement. If intent or spec is missing or too thin, stop. Do not invent either.

## Locate

Use the named task, the one just specified, or `docs/index.md`. Ask once if several match. Read `docs/<folder>/<slug>/intent.md` and `docs/<folder>/<slug>/spec.md` first. Read linked ADRs.

## Analyze

Read the real files, types, tests, and call sites the spec names. Load only matching skills (frontend, backend, supabase, postgres, playwright). Do not paste skill text into the plan.

## Critique (required, every draft)

Answer in the plan, not as chat asides:

1. What the change could break
2. Which step is most risky
3. Which implementation options are excluded, if any

Then rewrite until all of these are true:

- An engineer with only `intent.md`, `spec.md`, and `plan.md` can implement without this conversation
- No "as discussed", "the user said", or leftover chat context
- Waves have explicit file-level tasks and dependencies
- Acceptance criteria are concrete scenarios, not goals

Stop after at most 3 rewrite passes; leave `Status: draft` for human review.

## Plan

Write `docs/<folder>/<slug>/plan.md` beside the spec (overwrite only on revise). Under 250 lines. `Status: draft` until the author accepts.

Link `./intent.md` and `./spec.md`. Author from the spec, else `TBD`.

Use this structure. Keep these headings. Replace `feature_slug` with the task slug.

```markdown
# Plan: feature_slug
Author:  Status: 
Links: [intent](./intent.md) · [spec](./spec.md)

## Files that change

## Order of work
This should parallelize work that doesn't interfere with each other. All tasks that can be executed in parallel should be grouped under a wave. So we can have something like wave 1(3 parallel tasks) -> wave 2(4 parallel tasks that all depend on some task in wave 1) etc. Max wave size to be 5

## Risks
Calout any risks spotted when analyzing the code only if any spotted.

## Acceptance criteria
These should be specific and concrete test scenarios for all the changes including unit tests, e2e tests, browser/screenshot validations for UI etc. Callout any infrastructure missing. Get it reviewed by humans
```

### Files that change

List every path that will be added, edited, or deleted. One line per path: action, path, owning task id(s). Keep implementation details in the owning task. No glob-only lists.

### Order of work

Group independent tasks into waves. Wave N may depend only on earlier waves. Max 5 tasks per wave. Every task uses this schema in markdown (not JSON):

Each implementation task owns its expected test paths and test scenarios. Do not create a separate task whose only purpose is to test another task; the build and test gates split that work by status.

| Field | Rules |
| --- | --- |
| `id` | `{slug}_{wave}_{n}` e.g. `csv-export_1_1`. `n` is 1-indexed within the wave. |
| `title` | One line. What to do. |
| `status` | `pending` on write. Lifecycle: `pending` → `testing` → `code_review` → `done`; `blocked` means human intervention is required. |
| `acceptance_criteria` | Concrete, falsifiable bullets for this task only. |
| `files` | Paths this task adds, edits, or deletes. |
| `depends_on` | Task ids. Same plan or another feature (`featureslug_wave_task`). `[]` if none. |

```markdown
### Wave 1 (2 parallel)

id: csv-export_1_1
title: Update CSV filename to use DDMMYY HH:MM format
status: pending
acceptance_criteria:
- CSV download filename follows DDMMYY HH:MM {Name} format
- Filename is generated using sanitized user input
files:
- src/components/TableViewer.tsx
depends_on: []

id: csv-export_1_2
title: Add CSV filename formatting helper
status: pending
acceptance_criteria:
- Helper covers midnight, single-digit day/month, and sanitized name
files:
- src/lib/csvFilename.ts
- src/lib/csvFilename.test.ts
depends_on:
- other-feature_2_1
```

Mark the most risky step in its wave; keep its risk details under Risks. Record only exclusions that constrain implementation as a short "Not doing" list, linking existing intent or spec constraints instead of restating them. Omit rejected-option history and unnecessary justifications.

### Risks

Only risks found by reading this repo's code. Omit the section body (keep the heading) if none. Include breakage from the critique. Do not invent generic project risks.

### Acceptance criteria

Concrete, falsifiable scenarios. Cover every change. Include unit tests, e2e tests, and browser/screenshot validations for UI. Name the command, file, route, or fixture when known. Call out missing infrastructure (no e2e harness, no test DB, no screenshot baseline, etc.). Per-task criteria live on the task; this section is cross-cutting and anything not owned by a single task.

## Index

Update the task row in `docs/index.md` with the plan link. Keep existing rows. Keep the Plan column; use `—` until a plan exists.

## Done when

- `plan.md` is at the classified path
- `docs/index.md` includes the plan link
- Critique answers are in the plan
- A new engineer could implement from the plan and linked source documents
- Every wave task has `id`, `title`, `status`, `acceptance_criteria`, `files`, `depends_on`

## Independent document review

- After writing or revising the document and updating its index, spawn an independent subagent with no inherited conversation history.
- Give it the written artifact paths, their source-document paths, and `.agents/skills/doc-review/SKILL.md`; instruct it to use that skill. Include any ADRs created or revised in this run.
- Run exactly one review round and apply its findings in one fix pass. Do not request a recheck or repeat the review after fixes. If review is unavailable or a finding needs a user decision, report the blocker and leave the documents as drafts.
- Keep review findings in the conversation, outside the generated documents. Editorial review does not change their approval status.
