---
name: visual-first-ux
description: Runs Lavish-reviewed prototype-led UX design. Use when the user says "visual-first UX", "visual-iterate", "visual-next-screen", "visual-finalize-ux", or "configure visual-first UX".
---

# Visual-First UX Prototype Flow

## Overview

Turn product intent into an approved, connected prototype before producing detailed UX documentation. Act as a visual design partner: the user owns approval, while you make concrete screens, expose trade-offs, and preserve prior decisions. Lavish Editor is the required rendered review and feedback channel; the frozen prototype is the primary source of truth for designers, architects, and story authors who were not in the conversation.

## Resolution rules

- Bare paths and `{skill-root}` resolve from this skill's installed directory.
- `{project-root}` is the project working directory.
- `{skill-name}` is the skill directory's basename.

## On Activation

1. If `{project-root}/_bmad/config.yaml` has no `vux` section—or the invocation says `setup`, `configure`, or `install`—load `assets/module-setup.md`, complete registration, then resume activation.
2. Resolve customization with `uv run {project-root}/_bmad/scripts/resolve_customization.py --skill {skill-root} --key workflow`. On failure, merge `{skill-root}/customize.toml`, `{project-root}/_bmad/custom/{skill-name}.toml`, and `{project-root}/_bmad/custom/{skill-name}.user.toml` in that order: scalars override, tables deep-merge, `code`/`id` keyed arrays replace and append, other arrays append.
3. Run `{workflow.activation_steps_prepend}`; load `{workflow.persistent_facts}` as standing context. Load the installed `lavish` skill completely as the operating contract for browser review; absence of that skill blocks this workflow. Load project configuration from `{project-root}/_bmad/config.yaml` and `{project-root}/_bmad/config.user.yaml` when present, otherwise use `{project-root}/_bmad/scripts/resolve_config.py`; infer missing project name from the project directory and use today's date.
4. Detect intent from the invocation. `start` creates a run; `visual-iterate` changes an existing screen; `visual-next-screen` extends the current journey; `visual-finalize-ux` freezes it and derives documentation. If omitted, infer from the requested outcome and ask only when two routes remain plausible.
5. Select a run under `{workflow.prototype_output_path}/{workflow.run_folder_pattern}`. For an existing run, read its `.memlog.md` once and then continue append-only with `{project-root}/_bmad/scripts/memlog.py`. For a new run, initialize the memlog when the workspace is created.
6. Run `{workflow.activation_steps_append}`, then load only the routed intent file.

## Non-negotiable prototype contract

- Work on one journey and one focal screen at a time. Do not redesign unrelated screens.
- Produce or update `{doc_workspace}/{workflow.lavish_artifact}` before asking for detailed design decisions. It must be a portable HTML entry point with relative local assets, even when generated from the project's frontend stack.
- Run the required Lavish lifecycle in `references/lavish-review.md` for every meaningful iteration. A screenshot or chat response cannot substitute for an active Lavish session and feedback poll.
- Accept approval only when it returns through Lavish feedback. Preserve a durable screenshot and the Lavish approval receipt in the approved screen record.
- Treat `VISUAL-DECISIONS.md` as approved decisions only. Assumptions and unapproved proposals belong in the memlog, not the decision log.
- Never silently reverse a locked decision. Surface the conflict before editing; only an explicit user instruction can unlock it, and the superseding decision must preserve the prior rationale.
- Preserve approved screen evidence and records while experimenting. Replace an approved record only after the user approves the revision.
- Keep early prototype code separate from production architecture and backend integration unless real behavior or data is necessary to judge the experience.

## Intent routing

| Intent | Outcome | Load |
| --- | --- | --- |
| `start` | Lightweight brief, first journey, inventory, and rendered anchor screen | `references/start.md` |
| `visual-iterate` | Requested visual change applied, rendered, and either revised again or approved | `references/visual-iterate.md` |
| `visual-next-screen` | Minimum next screen extending an approved user action | `references/visual-next-screen.md` |
| `visual-finalize-ux` | Frozen connected prototype plus derived UX, component, and story-input documentation | `references/visual-finalize-ux.md` |

At a terminal intent, run `{workflow.on_complete}` when non-empty.
