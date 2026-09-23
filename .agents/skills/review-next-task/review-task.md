# Review one plan task

Wave subagents: do not edit `plan.md` or production code. Return findings. The parent fixes findings in the same run using [resolve-findings.md](resolve-findings.md).

## Read

Paths only. Do not paste skill bodies or dump whole files.

Required:

- Sibling `spec.md` (what the change must do)
- This task in `plan.md` (`id`, `title`, `acceptance_criteria`, `files`, `depends_on`)
- The task's `files` and their tests
- `.agents/skills/code-review-and-quality/SKILL.md`
- `.agents/skills/code-simplification/SKILL.md` (judge clarity; do not rewrite)

Also read:

- ADRs linked from the spec
- `intent.md` only when the spec does not answer a requirement you must judge
- Matching domain skills, only when the task's files need them:

| Work | Skill |
| --- | --- |
| UI / UX | `.agents/skills/frontend-design/SKILL.md` |
| React / Next | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| Backend / Auth / RLS | `.agents/skills/backend-design/SKILL.md` |
| Supabase | `.agents/skills/supabase/SKILL.md` |
| Postgres | `.agents/skills/supabase-postgres-best-practices/SKILL.md` |
| Browser / E2E | `.agents/skills/playwright/SKILL.md` or `.agents/skills/browser-testing-with-devtools/SKILL.md` |

Stay on this task's `files`, the tests that cover them, and direct callers when a finding depends on one. Do not review the rest of the repo. Do not review other plan tasks.

## Judge

Follow the code-review skill. Read the spec and acceptance criteria before the code. Review tests before implementation. Apply all five axes: correctness, readability, architecture, security, performance. Use the simplification skill for structural smells. Propose the remedy, not only the problem.

Severity, in this order: **Critical**, **Required**, **Optional**, **Nit**, **FYI**.

- **Critical**, **Required**, **Optional**, **Nit**, and **FYI** are fixed in the same run after this review pass.
- A finding with `human: yes` is not guessed.
- A missed acceptance criterion or spec behavior is **Required** at minimum.
- A human decision (contradicting spec, product call, secret, destructive choice) is **Critical** or **Required** with `human: yes`. Do not invent the resolution.

Do not rubber-stamp. Approve only when required work is actually done and you read the files. Tests passing is not sufficient. Keep this review pass read-only; apply fixes afterward through [resolve-findings.md](resolve-findings.md).

## Return

```
id:
verdict: approve | request changes | needs human
files_read:
- path
findings:
- severity: Critical | Required | Optional | Nit | FYI
  file:
  defect:
  remedy:
  human: yes | no
criteria_unmet:
- criterion, or none
```

`needs human` when any Critical or Required finding has `human: yes`. That verdict wins over the others. Otherwise `request changes` when any finding is Critical or Required. `approve` only when every Critical and Required slot is empty. List Optional, Nit, and FYI even on approve.
