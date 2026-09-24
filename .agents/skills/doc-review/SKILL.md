---
name: doc-review
description: Review planning Markdown for duplicated information, unnecessary rationale, and non-declarative decisions. Use for an independent editorial review of intent, spec, plan, or associated ADR documents after writing or revision.
---

# Document review

## Inputs and scope

- Read the target documents and their supplied source documents; follow links only to verify information ownership or decision status.
- Review the supplied artifacts without editing them. Return findings to the writing agent.
- Preserve approved scope, requirements, constraints, and open questions; do not make new product or engineering decisions.

## Rules

| Check | Required result |
| --- | --- |
| One place per fact | Each substantive fact, requirement, decision, or scenario has one authoritative location. Replace repeated content within or across documents with precise links or identifiers. Navigation metadata and task references may recur; their explanations must not. |
| Necessary rationale only | Remove decision history, rejected-option narratives, and explanations that do not affect implementation or prevent a concrete mistake. Retain only actionable constraints, consequences, or tradeoffs needed to apply a decision correctly. |
| Declarative decisions | State selected behavior and constraints directly. Remove conversational framing, recommendations masquerading as decisions, and speculative alternatives. Keep genuinely unresolved matters explicitly labeled as open questions; never turn uncertainty into an approved decision. |

## Findings

- For each finding, report the path and heading or line, the violated rule, and a concrete edit.
- For duplication, identify the authoritative location and every occurrence to replace with a reference.
- Return `No findings` only when all three checks pass.
- On recheck, read the revised artifacts and report any remaining or newly introduced violations.
