# Execute one plan task

For each task -
1. Ask the agent or subagent responsible to first write the tests that form the acceptance criteria of the task.
2. Attach pointers to relevant context needed for that particular task.
3. Let them build out the code

Wave subagents: do not edit `plan.md`.

## Pointers

Paths only; do not paste skill bodies or dump whole files:

- `docs/<folder>/<slug>/intent.md`, `spec.md`, `plan.md` (this `id`)
- ADRs linked from the spec
- task `files` plus neighboring tests
- matching skills only:

| Work | Skill |
| --- | --- |
| UI / UX | `.agents/skills/frontend-design/SKILL.md` |
| React / Next | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| Backend / Auth / RLS | `.agents/skills/backend-design/SKILL.md` |
| Supabase | `.agents/skills/supabase/SKILL.md` |
| Postgres | `.agents/skills/supabase-postgres-best-practices/SKILL.md` |
| Browser / E2E | `.agents/skills/playwright/SKILL.md` or `.agents/skills/browser-testing-with-devtools/SKILL.md` |

Stay in this task's `files` except a forced adjacent edit (import, type, test helper). No other plan tasks.

## Tests, then code

Write tests from `acceptance_criteria` before production code. Run them; they should fail first.

Unit for logic; E2E when criteria are flows; browser when UI. If the harness cannot cover a criterion, say what is missing and add the closest automated test. Do not skip tests.

Then implement until those tests pass. Match patterns in the listed files. Load matching skills; do not paste them.

`make build` (must end "Build succeeded"), `make test` (all green; never skip or delete a failing test), `make lint` (zero warnings). Fix code, not tests. For UI, exercise the changed flow in the browser.

## Return

`id`, title, test paths, files changed, verify outcomes, unmet criteria, recommended status (`code_review` | `blocked` | `pending`).
