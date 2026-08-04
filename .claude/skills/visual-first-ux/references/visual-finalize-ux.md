# Finalize Prototype-Led UX

The outcome is a frozen, connected, visually approved journey and documentation derived from it. The prototype remains authoritative when prose disagrees.

## Prove readiness

Load the selected run's brief, inventory, decision log, approved records, prototype, visual evidence, and memlog. Load `references/lavish-review.md`. Run `uv run scripts/validate-prototype-state.py {doc_workspace} --mode working`; fix structural findings and use its prototype digest for the freeze record.

Walk the primary journey end to end. For every relevant screen and interaction, visually review desktop and mobile behavior plus happy, loading, empty, validation, success, failure, and recovery states. Resolve inconsistencies in navigation, hierarchy, components, tokens, and interaction patterns one screen at a time. Unresolved questions must be explicit and classified as blocking or accepted trade-offs.

Every in-scope screen must have explicit Lavish approval, a durable screenshot, and an approved record containing the Lavish receipt. Run configured `{workflow.finalize_reviewers}` when present; degrade to a sequential review if parallel reviewers are unavailable. Resume the required Lavish poll with an end-to-end review request that asks the user to inspect the connected journey and Layout issues inbox, then send final approval and end the session. Do not freeze until that response returns.

## Freeze

After final Lavish approval, respect a user-ended session or end it as the agent, then export `{doc_workspace}/{workflow.lavish_artifact}` to `{doc_workspace}/{workflow.lavish_export}`. Create `PROTOTYPE-FREEZE.md` from `{workflow.freeze_record_template}` with the exact prototype digest, ended Lavish status, export path, approved screens, connected journeys, decision IDs, evidence links, date, and user sign-off. After freeze, do not change prototype files without reopening visual iteration and issuing a new freeze record. Run the validator again with `--mode finalize`; a digest mismatch, missing export, incomplete Lavish review, or missing state blocks finalization.

## Derive the handoff

Only after a valid freeze, derive—not predict—the downstream artifacts:

- `DESIGN.md` from `{workflow.design_template}` for visual language and tokens;
- `EXPERIENCE.md` from `{workflow.experience_template}` for IA, journeys, screens, behavior, responsive rules, states, accessibility, hierarchy, trade-offs, and open questions;
- `COMPONENTS.md` from `{workflow.component_template}` for reusable components and their states;
- `STORY-INPUTS.md` from `{workflow.story_inputs_template}` for screen-linked draft stories and acceptance criteria.

Use prototype and evidence links throughout. `STORY-INPUTS.md` is input to architecture and the canonical epics-and-stories workflow; do not claim architecture decisions are settled here. Apply `{workflow.doc_standards}`, execute `{workflow.external_handoffs}`, append a completion event to the memlog, and present all paths.
