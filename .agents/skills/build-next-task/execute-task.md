# Execute one plan task

Implement the production behavior for one task. Tests belong to the separate testing gate.

Wave subagents: do not edit `plan.md`.

## Pointers

Paths only; do not paste skill bodies or dump whole files:

- `docs/<folder>/<slug>/intent.md`, `spec.md`, `plan.md` (this `id`)
- ADRs linked from the spec
- task production `files`, direct callers, and neighboring implementation patterns
- matching skills only:

| Work | Skill |
| --- | --- |
| UI / UX | `.agents/skills/frontend-design/SKILL.md` |
| React / Next | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| Backend / Auth / RLS | `.agents/skills/backend-design/SKILL.md` |
| Supabase | `.agents/skills/supabase/SKILL.md` |
| Postgres | `.agents/skills/supabase-postgres-best-practices/SKILL.md` |

Stay in this task's production files except a forced adjacent implementation edit such as an import or shared type. No other plan tasks.

## Production implementation only

- Implement every acceptance criterion assigned to this task.
- Do not add, edit, delete, regenerate, or update tests, test fixtures, snapshots, test-only helpers, test runner configuration, or testing dependencies, even when those paths appear under the task's `files`.
- Do not weaken existing tests. Run relevant existing checks to catch regressions, but leave all new test authoring to `test-next-task`.
- If correct implementation requires a product decision, credential, destructive action, or scope outside the task, stop and recommend `blocked` rather than encoding a guess.

Match patterns in the listed files and load only matching implementation skills. Run `make build` (must end "Build succeeded"), `make test` (all existing tests green), and `make lint` (zero warnings). Fix production code, not tests.

## Return

`id`, title, production files changed, verification outcomes, unmet criteria, recommended status (`testing` | `blocked` | `pending`).
