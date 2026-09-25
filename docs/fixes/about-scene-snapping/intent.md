# Intent: About scene snapping
Author: Udeet Gulati
Status: ready

## Problem
- `/about` scenes no longer settle flush with the viewport when scroll snapping completes; part of the preceding scene remains visible, so scenes appear to bleed into each other.
- Browser reproduction at desktop and phone widths shows About snap targets settling below the viewport top.
- Global `html { scroll-padding-top: 6.5rem; }`, added for sticky-header anchor clearance, also offsets About snap positions even though the About header is intentionally non-sticky.
- At phone widths, scenes can exceed one viewport, crop key subjects, or land mid-scene under mandatory snapping.
- At phone widths, the fixed scene-navigation dots overlay the scene and add visual clutter to an already constrained viewport.
- Existing end-to-end tests assert snap CSS and event arming but do not verify the final position produced by a real scene transition.

## Proposed outcome
- Restore `/about` snapping so each selected scene settles at the viewport top without the preceding or following scene bleeding into the resting view.
- Preserve sticky-header anchor clearance on routes that use the sticky header.
- Re-integrate the reverted phone layout changes so each scene fits one phone viewport with its heading, copy, and plate or service band visible.
- Remove the scene-navigation dots at phone widths while retaining them on larger viewports.
- Add regression tests that verify settled snap positions and absence of adjacent-scene bleed on desktop and phone viewports.
- Add phone coverage for scene height, visible content, plate treatment, absence of scene-navigation dots, and the final footer snap.

## Affected users and systems
- Visitors and members reading `/about` on desktop, tablet, and phone viewports.
- About scene sizing, scroll-snap rules, responsive scene-navigation dots, non-sticky header behavior, and footer snap.
- `src/app/globals.css`, `src/components/about-snap.tsx`, and `e2e/about.spec.ts`.
- The About page contract in [docs/features/about-page/spec.md](../../features/about-page/spec.md).

## Constraints
- Treat the accepted About [Outcome](../../features/about-page/spec.md#outcome), [Page](../../features/about-page/spec.md#page), and [Acceptance](../../features/about-page/spec.md#acceptance) contracts as authoritative for unchanged behavior.
- Preserve sticky-header anchor offsets on routes outside `/about`.
- Keep scene-navigation dots and their existing behavior above the phone breakpoint.
- Fit every phone scene within one viewport while applying the corrected snap offset.
- Keep cover mode for Founders, The call, and Gospel to the Nations.
- Keep contain mode and the existing fill color for Born Again and The Church.
- Do not add JavaScript-driven scroll positioning when CSS scroll snapping can provide the required behavior.

## Open questions
- None.
