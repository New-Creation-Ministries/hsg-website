---
name: write-spec
description: Reads an intent.md and writes a compact requirements and design spec.md beside it, plus ADRs in docs/adr for cross-cutting decisions. Use when the user asks to write a spec, spec.md, requirements and design, take intent to spec, or after an intent is captured and needs engineering-ready design.
---

# Write spec

Read the intent.md file and produce a requirements and design spec for integrating it. Apply the skills available to you and relevant to design this nature of task. Document the spec fully as spec.md, ready to hand to the engineering team. Describe clearly any areas of concern, especially where you cannot satisfy contradicting policies. The spec should not be huge. Don't repeat information but describe the delta for what is being added. Keep it organized alongside the intent. Let the author review and update it.

Do not implement. If intent is missing or too thin, stop. Do not invent one.

## Locate

Use the named intent, the one just captured, or `docs/index.md`. Ask once if several match. Read `docs/<folder>/<slug>/intent.md` first.

## Skills

Load only matching skills. Do not paste their text into the spec. On policy conflict, record it; do not pick silently.

| Task | Skill |
| --- | --- |
| UI / UX | `.agents/skills/frontend-design/SKILL.md` |
| Backend / Auth / RLS | `.agents/skills/backend-design/SKILL.md` |
| Supabase | `.agents/skills/supabase/SKILL.md` |
| Postgres | `.agents/skills/supabase-postgres-best-practices/SKILL.md` |

## Spec

Write `docs/<folder>/<slug>/spec.md` beside the intent (overwrite only on revise). Structure it for this task. Under 300 lines. `Status: draft` until the author accepts.

Link `./intent.md`. Author from the intent, else `TBD`. List skills actually used, or `none`.

## ADRs

Put overall / durable design decisions in `docs/adr/NNNN-<kebab>.md` (4-digit id, start `0001`). `Status: proposed` until accepted. Index in `docs/adr/index.md`. Link them from the spec. Skip task-local choices.

## Index

Update the task row in `docs/index.md` with the spec link. Keep existing rows. Keep the Plan column; use `—` until a plan exists.
