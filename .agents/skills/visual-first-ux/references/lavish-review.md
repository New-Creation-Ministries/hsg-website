# Required Lavish Review Contract

Lavish Editor is the only review and approval channel for rendered Visual-First UX iterations. Use `{workflow.lavish_cli}` for every command and `{doc_workspace}/{workflow.lavish_artifact}` as the canonical connected prototype. The prototype remains authoritative; Lavish annotations, chat, layout warnings, inputs, and whiteboards are review instructions rather than source files.

Before first writing the artifact, run `{workflow.lavish_cli} design` and every matching playbook required by the installed `lavish` skill. Use the project's design system when available. Keep images, CSS, fonts, and scripts beside the artifact and reference them relatively; a dev-server-only URL does not satisfy the contract.

Open or resume the review with `{workflow.lavish_cli} {doc_workspace}/{workflow.lavish_artifact}`. Then run a foreground, active-turn poll with `{workflow.lavish_cli} poll {doc_workspace}/{workflow.lavish_artifact} --agent-reply "<what changed and what to review first>"`. Keep the poll attached and observable; if the host yields a tracked process, continue polling that process. If it is interrupted, re-run it because queued feedback persists.

Apply only feedback returned by the poll. A `layout-warnings` batch is actionable only after the user queues it; apply the entire queued batch before saving. A `whiteboard` response is guidance for updating the authoritative Mermaid or artifact source, never a replacement source. After saving, let live reload present the new revision and poll again with a concise agent reply.

Chat feedback may clarify scope but cannot approve a screen. Approval must be explicit in a Lavish response and identify the screen or iteration being approved. Record that receipt in the approved screen record and memlog before updating `VISUAL-DECISIONS.md` or inventory status.

Do not fall back to screenshots, ordinary browser preview, or chat approval. Repair and retry an `artifact_failures` response or CLI startup failure; if a usable Lavish session and poll still cannot be established, stop the UX workflow and report Lavish as the blocker.

At finalization, ask the user in Lavish to inspect the connected journey and the Layout issues inbox, then send final approval and end the session. Respect a user-ended session and do not reopen it. Otherwise end it with `{workflow.lavish_cli} end {doc_workspace}/{workflow.lavish_artifact}`. Export the approved portable artifact with `{workflow.lavish_cli} export {doc_workspace}/{workflow.lavish_artifact} --out {doc_workspace}/{workflow.lavish_export}`. Never publish through `share` without separate explicit authorization because it sends the artifact to a third-party service.
