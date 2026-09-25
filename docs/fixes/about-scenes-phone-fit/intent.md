# Intent: About scenes phone fit
Author: Udeet Gulati
Status: ready

## Problem

- On phone viewports, `/about` Scenes do not fit the screen correctly ([docs/features/about-page/spec.md](../../features/about-page/spec.md) Content).
- Shipped ≤800px layout (`docs/features/about-page/explorations/scenes.html`, `src/app/globals.css`): copy stacks above plate; scene `min-height` is auto; photo plates use `min-height: 46svh` with cover or contain.
- Under mandatory scroll-snap (`scroll-snap-stop: always`), stacked copy plus plate must fit one phone viewport; today it often does not.
- Phone plate box (~46svh × full width) with shipped cover/contain yields crop or letterbox ([`src/app/globals.css`](../../../src/app/globals.css), [`scenes.html`](../../features/about-page/explorations/scenes.html)).
- `e2e/about.spec.ts` arms snap at 390×844 only; no phone layout/fit assertions and no `/about` phone screenshot baseline.

## Proposed outcome

- Each `/about` scene fits the phone screen: heading, copy, and plate (or The story continues band) readable in the phone viewport without incorrect crop, letterbox, or mid-scene snap clipping.
- Phone-viewport regression coverage for that fit behavior; phone screenshots used as evidence while confirming and fixing.

## Affected users and systems

- Visitors and members opening `/about` on phones.
- About Scenes page: `src/app/about/page.tsx`, `src/app/globals.css` (`.about-page` ≤800px), `src/components/about-scene-dots.tsx`, `src/components/about-snap.tsx`, plates in `public/about/`.
- Existing About feature docs and `e2e/about.spec.ts`.

## Constraints

- Do not redesign About scene order, typography, palette, copy, plate assets, or desktop side-by-side composition beyond scoped ≤800px phone-fit changes; keep the locked exploration contract from [about-page](../../features/about-page/spec.md).
- Do not reopen [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md).
- Preserve the about-page SiteHeader / SiteFooter contract ([about-page Page](../../features/about-page/spec.md#page)); ≤800px snap may change only if required for phone fit.
- No new backend, auth, or embeds ([docs/architecture.md](../../architecture.md)).

## Open questions

- Which scenes fail how on phone (overflow vs cover crop vs contain letterbox) — confirm from phone screenshots during the fix.
