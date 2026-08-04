# Visually Iterate a Screen

The outcome is a narrowly changed screen reviewed through Lavish whose relationship to approved decisions is explicit. Inputs are the selected run's prototype brief, screen inventory, approved screen records, visual decision log, prototype files, visual evidence, and memlog.

Ask which screen or flow is changing only when the request does not identify it. Read the current artifacts and list the locked decisions that constrain the requested change. If the request conflicts with one, stop before editing and name the conflict; proceed only when the user explicitly unlocks or supersedes it. Record the new rationale without erasing the old decision.

Load `references/lavish-review.md`. Apply only the requested change to `{doc_workspace}/{workflow.lavish_artifact}` while preserving navigation, components, and unrelated screens. Save it so Lavish live reloads the affected viewport, then resume the required foreground poll with an agent reply that summarizes visible differences and asks for approval or another revision using concrete visual questions.

Until approval returns through Lavish, keep proposals and assumptions in `.memlog.md`; do not add them to `VISUAL-DECISIONS.md` or replace an approved screen record. On explicit Lavish approval:

- append the approved decisions with stable `VD-###` identifiers;
- update the affected approved screen record with the approval receipt and preserve a fresh screenshot;
- mark the screen `approved` in the inventory;
- note the approved iteration in the memlog.

If the user chooses the next journey step, route to `visual-next-screen`.
