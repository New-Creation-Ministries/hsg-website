# Intent: Tablet and iPad viewport layout
Author: Udeet Gulati
Status: ready

## Problem
- At the target tablet viewports (defined in Constraints), `/about` scene photos clip horizontally.
- About scroll snapping does not settle flush; part of an adjacent scene stays visible ([about-scene-snapping](../about-scene-snapping/intent.md)).
- About scene dots track the active scene, but clicking a dot does not scroll to that scene, including upward to earlier scenes ([about-scene-dot-navigation](../about-scene-dot-navigation/intent.md)).
- On `/give`, the existing `2 CORINTHIANS 9:6 • KJV` scripture block (`src/content/give/index.ts`) renders below the “Have Questions or need help” region, and the blue panel extends past the white base. The same panel/base overflow appears on Contact Us.
- On every page at the target tablet viewports, the footer address collides with the social logos.
- Automated UI coverage does not render and verify these behaviors at the target tablet viewports.

## Proposed outcome
- About scene photos stay fully visible horizontally at the target tablet viewports.
- About scroll snapping meets the absorbed [about-scene-snapping](../about-scene-snapping/intent.md) Proposed outcome.
- Scene-dot clicks meet the absorbed [about-scene-dot-navigation](../about-scene-dot-navigation/intent.md) Proposed outcome, including upward navigation to earlier scenes.
- On Give and Contact Us at the target tablet viewports, the scripture block does not render below the “Have Questions or need help” region, and the blue panel stays within the white base.
- Footer address and social logos do not overlap on any page at the target tablet viewports.
- Automated tests render and verify the tablet-owned behaviors at the target tablet viewports.

## Affected users and systems
- Visitors and members on tablet/iPad at the target tablet viewports, and visitors using About snap and scene dots on the viewports covered by the absorbed About intents (Constraints).
- `/about` scene photos, scroll snapping, and scene dots.
- `/give` and Contact Us layout (scripture block, help region, blue panel / white base).
- Site footer address and social logo layout on every page.
- Automated UI/e2e tests for tablet-owned behaviors at the target tablet viewports, and for absorbed About snap/dot coverage as those absorbed intents require.

## Constraints
- This task absorbs [about-scene-snapping](../about-scene-snapping/intent.md) and [about-scene-dot-navigation](../about-scene-dot-navigation/intent.md); do not plan those as separate outstanding work.
- Target tablet viewports for development and automated tests of tablet-owned behaviors: 768×1024 portrait and 1024×768 landscape only. Do not add other iPad sizes (no 820×1180, no 1024×1366).
- Absorbed About snap and scene-dot requirements keep the viewport coverage stated in those intents; tablet photo, Give/Contact, and footer defects are verified at the target tablet viewports.
- Do not change the Give scripture reference (`2 CORINTHIANS 9:6 • KJV` in `src/content/give/index.ts`); layout only.
- Preserve desktop and phone behavior that already meets existing page contracts unless a shared layout change is required.
- Do not redesign About, Give, Contact Us, or the footer beyond correcting the listed layout and navigation failures.
- Honor Constraints in [about-scene-snapping](../about-scene-snapping/intent.md) and [about-scene-dot-navigation](../about-scene-dot-navigation/intent.md).

## Open questions
- None.
