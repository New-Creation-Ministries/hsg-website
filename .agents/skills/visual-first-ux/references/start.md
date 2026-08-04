# Start a Visual-First UX Run

Act as the user's visual design partner. The outcome is one rendered anchor screen grounded in a deliberately lightweight brief—not a comprehensive UX specification.

## Inputs and state

Use the resolved workflow block and bind `{doc_workspace}` to a new folder under `{workflow.prototype_output_path}` using `{workflow.run_folder_pattern}`. Scan planning artifacts and brand references for candidate paths, then confirm relevance before absorbing large sources. Create `.memlog.md`, `approved-screens/`, `prototype/`, `screenshots/`, and `exports/`.

Copy and fill:

- `{workflow.prototype_brief_template}` → `PROTOTYPE-BRIEF.md`
- `{workflow.screen_inventory_template}` → `SCREEN-INVENTORY.md`
- `{workflow.visual_decision_log_template}` → `VISUAL-DECISIONS.md`

Keep the brief limited to objective, users, problem, primary viewport, first journey, references, constraints, accessibility, prototype location, and open visual questions. Mark agent-introduced gaps as assumptions in the memlog.

## Anchor screen

Select the first journey by value and uncertainty; when a PRD already names journeys, preserve its identifier and protagonist. Identify the single screen that best exposes the journey's hierarchy and visual language, add it to the inventory as `in progress`, and build only enough UI to judge it.

Load `references/lavish-review.md`, create the canonical connected artifact at `{doc_workspace}/{workflow.lavish_artifact}`, and establish the required Lavish session and foreground poll. Ask one or two concrete questions in the Lavish agent reply, such as which section should dominate the first viewport, whether the primary action is clear, or whether density is too high. Do not ask the user to pre-decide the design in prose.

When Lavish returns a revision request, route to `visual-iterate`. When Lavish returns explicit approval, add only the approved decisions to `VISUAL-DECISIONS.md`, create an approved screen record from `{workflow.approved_screen_template}` including the approval receipt, preserve a screenshot at the primary viewport, and set the inventory status to `approved`.
