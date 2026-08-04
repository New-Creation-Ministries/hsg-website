# Create the Next Screen

The outcome is the minimum Lavish-reviewed screen needed to test the next action in the current approved journey. Inputs are the selected run's brief, inventory, approved screen records, visual decisions, prototype, evidence, and memlog.

Confirm the user action on an approved source screen that leads here. Reuse its visual language, navigation, component conventions, spacing, and interaction vocabulary; locked decisions remain binding. Add the new screen to `SCREEN-INVENTORY.md` as `in progress` with its entry point and related screens.

Load `references/lavish-review.md`. Extend the same canonical `{doc_workspace}/{workflow.lavish_artifact}` with only the content and behavior needed to judge the transition and primary action. Do not expand the product or redesign the source screen. Save it for Lavish live reload, then resume the required foreground poll with the transition context, what is visibly new, and concrete visual questions.

Route Lavish revision feedback through `visual-iterate`. Only after explicit approval returns through Lavish should the workflow add approved decisions, preserve a screenshot and approval receipt, create the approved screen record, and change inventory status to `approved`.
