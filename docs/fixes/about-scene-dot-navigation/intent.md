# Intent: About scene-dot navigation
Author: Udeet Gulati
Status: draft

## Problem
- On `/about` above 800px, clicking a scene dot does not scroll to that scene.
- After the Founders dot click, `#founders` stays 111.4375px below the viewport top and the header remains visible.
- After The call dot click, the page stays on Founders and that dot's `aria-current` stays unset.
- The same two failures repeat on retry in `e2e/about.spec.ts`: "settles each desktop scene flush with the viewport via scene dots" and "keeps scene dots visible with links and aria-current at 801px and desktop".
- Wheel and PageDown still settle each phone scene flush. The break is the desktop dot click.

## Proposed outcome
- Clicking a scene dot above 800px scrolls to that scene.
- That click satisfies the Scene dots row in [Snap contract](../about-scene-snapping/spec.md#snap-contract) and the Settled desktop transitions and Responsive scene dots rows in [Verification](../about-scene-snapping/spec.md#verification).
- The two failing `e2e/about.spec.ts` assertions pass without changing their expected positions or `aria-current` checks.

## Affected users and systems
- Visitors and members using scene dots on `/about` above 800px.
- Scene-dot anchors and `aria-current` in `src/components/about-scene-dots.tsx`.
- About scroll-snap rules in `src/app/globals.css`.
- Settled-position coverage in `e2e/about.spec.ts`.
- Scene-dot and settled-desktop rows in [docs/fixes/about-scene-snapping/spec.md](../about-scene-snapping/spec.md).

## Constraints
- Leave phone wheel and PageDown snapping unchanged.
- Follow the unchanged About [Outcome](../../features/about-page/spec.md#outcome), [Page](../../features/about-page/spec.md#page), and [Acceptance](../../features/about-page/spec.md#acceptance) contracts.
- Do not add JavaScript-driven scroll positioning ([Scope](../about-scene-snapping/spec.md#scope)).

## Open questions
- None.
