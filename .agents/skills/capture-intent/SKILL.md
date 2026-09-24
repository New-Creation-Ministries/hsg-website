---
name: capture-intent
description: Captures user intent into a classified task folder’s intent.md (under 120 lines) and updates docs/index.md. Use when the user describes a feature, bug, fix, improvement, chore, or asks to capture intent / write intent.md.
---

# Capture intent

Turn a request into classified planning intent. Do not implement.

## Classify

Pick exactly one:

| Kind | Folder |
| --- | --- |
| feature (new capability) | `docs/features/` |
| fix (bug, bugfix, regression) | `docs/fixes/` |
| improvement | `docs/improvements/` |
| chore | `docs/chores/` |

If classification is ambiguous, ask once, then proceed.

## Path

1. Title: short noun phrase for the work.
2. Slug: lowercase kebab-case from the title (ASCII, max ~60 chars).
3. Create `docs/<folder>/<slug>/` if missing.
4. Write `intent.md` there. Overwrite only when the user is revising that intent.

## File rules

- Keep the file under 120 lines.
- Fill every section. Use `TBD` only for unknown facts; put those under Open questions.
- `Status:` `draft` until the user accepts; then `ready`.
- `Author:` the requesting user if known, else `TBD`.

## Template

Use this structure. Replace the example title with the real one. Keep these headings:

```markdown
# Intent: claims status self-service
Author:  Status: 
## Problem
## Proposed outcome
## Affected users and systems
## Constraints
## Open questions
```

## Index

After create or revise, update `docs/index.md` so every task in every category is listed and searchable (category, slug, title, status, intent link, spec link, plan link). Keep the Spec and Plan columns; use `—` until those files exist. Sort by category, then slug.

## Done when

- `intent.md` is at the classified path
- `docs/index.md` includes the task
- Problem and proposed outcome are specific enough to plan from

## Independent document review

- After writing or revising the document and updating its index, spawn an independent subagent with no inherited conversation history.
- Give it the written artifact paths, their source-document paths, and `.agents/skills/doc-review/SKILL.md`; instruct it to use that skill. Include any ADRs created or revised in this run.
- Apply its findings, then have it recheck the revised artifacts. Complete only after it reports no remaining findings; if review is unavailable or a finding needs a user decision, report the blocker and leave the documents as drafts.
- Keep review findings in the conversation, outside the generated documents. Editorial review does not change their approval status.
