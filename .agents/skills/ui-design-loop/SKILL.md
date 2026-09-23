---
name: ui-design-loop
description: Orchestrate visual design, independent review, screenshots, and human iteration after UX is finalized.
---

# UI Design Loop

## Inputs

- finalized UX
- target screens and states
- product and repository context
- existing design system and brand assets

UX structure and behavior are fixed unless reopened by the human.

## Agents

Both agents use `impeccable`.

- Design Agent: design and implementation
- Review Agent: critique only

Only the Design Agent edits the UI.

## Flow

1. Design Agent finds relevant real-world UI references before designing.
   - Use concrete screenshots or live interfaces.
   - Select references relevant to the product, surface, and visual problem.
   - Record which visual characteristics are being referenced.
   - Do not use references as templates to copy wholesale.

2. Design Agent establishes the visual direction and implements the UI using the finalized UX and reference set.

3. Capture screenshots for the required screens, states, and viewports.

4. Review Agent critiques the rendered UI using:
   - finalized UX
   - selected references
   - current screenshots

5. Review Agent returns either:
   - material findings
   - PASS

6. Send material findings to the Design Agent and repeat from screenshot capture until PASS.

## Human Loop

After PASS:

1. Present screenshots through Lavish.
2. Send human feedback to the Design Agent.
3. Run the Review Agent on the revision.
4. Update the Lavish screenshots.
5. Repeat until the human accepts the UI.

## Output

- finalized UI implementation
- finalized UI screenshots
