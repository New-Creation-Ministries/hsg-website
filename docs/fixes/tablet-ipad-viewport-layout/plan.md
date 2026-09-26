# Plan: tablet-ipad-viewport-layout
Author: Udeet Gulati
Status: ready
Links: [intent](./intent.md) · [spec](./spec.md)

## Files that change

- Edit `src/app/globals.css` — `tablet-ipad-viewport-layout_1_1`
- Edit `src/components/site-footer.tsx` — `tablet-ipad-viewport-layout_1_1` (only if CSS alone cannot stop address/social overlap)
- Edit `src/app/about/page.test.ts` — `tablet-ipad-viewport-layout_1_1`
- Edit `src/app/give/page.test.ts` — `tablet-ipad-viewport-layout_1_1`
- Edit `src/app/contact/page.test.ts` — `tablet-ipad-viewport-layout_1_1`
- Edit `src/app/layout.test.ts` — `tablet-ipad-viewport-layout_1_1` (only if footer/shell CSS contracts move here)
- Edit `e2e/helpers.ts` — `tablet-ipad-viewport-layout_1_2`
- Edit `e2e/about.spec.ts` — `tablet-ipad-viewport-layout_2_1`
- Edit `e2e/give.spec.ts` — `tablet-ipad-viewport-layout_2_2`
- Edit `e2e/contact.spec.ts` — `tablet-ipad-viewport-layout_2_3`
- Edit `e2e/home.spec.ts` — `tablet-ipad-viewport-layout_2_4`

## Order of work

### Wave 1 (2 parallel)

- Most risky step: `tablet-ipad-viewport-layout_1_1`.

id: tablet-ipad-viewport-layout_1_1
title: Fix tablet layout CSS for About, Give, Contact, and SiteFooter
status: pending
acceptance_criteria:
- In `src/app/globals.css`, satisfy [About photo fit](./spec.md#about-photo-fit), [About snap and scene dots](./spec.md#about-snap-and-scene-dots), [Give and Contact Us panels](./spec.md#give-and-contact-us-panels), and [SiteFooter](./spec.md#sitefooter) at the tablet-owned sizes in [Target viewports](./spec.md#target-viewports).
- Keep production changes within [Scope](./spec.md#scope); edit `src/components/site-footer.tsx` only if markup is required for non-colliding tablet footer layout.
- Scene-dot navigation stays CSS-only per [Concerns](./spec.md#concerns); if CSS cannot meet settled-position and `aria-current` checks, mark this task `blocked`.
- Extend focused page/CSS unit tests (`src/app/about/page.test.ts`, `src/app/give/page.test.ts`, `src/app/contact/page.test.ts`, and `src/app/layout.test.ts` only if footer/shell contracts belong there) using the repo’s existing source-contract pattern for the CSS owned by this task.
- `npx vitest run src/app/about/page.test.ts src/app/give/page.test.ts src/app/contact/page.test.ts src/app/layout.test.ts` passes.
files:
- src/app/globals.css
- src/components/site-footer.tsx
- src/app/about/page.test.ts
- src/app/give/page.test.ts
- src/app/contact/page.test.ts
- src/app/layout.test.ts
depends_on: []

id: tablet-ipad-viewport-layout_1_2
title: Add shared tablet viewport helpers for e2e
status: pending
acceptance_criteria:
- Add named viewport constants for 768×1024 and 1024×768 in `e2e/helpers.ts` without changing existing named viewports (`desktop`, `phone`, `phoneLarge`, `atMenu`, `aboveMenu`).
- Helpers are importable by About, Give, Contact, and home e2e specs.
files:
- e2e/helpers.ts
depends_on: []

### Wave 2 (4 parallel)

id: tablet-ipad-viewport-layout_2_1
title: Prove About snap, dots, and tablet photo fit in Chromium
status: pending
acceptance_criteria:
- Extend `e2e/about.spec.ts` so the absorbed About rows and the About-photos-at-tablet row in [Verification](./spec.md#verification) pass.
- Reuse `waitForScrollStable` / measurement helpers; no fixed sleeps; production and tests stay within the CSS-only positioning boundary in [Concerns](./spec.md#concerns).
- [Regression](./spec.md#verification) for existing About checks; phone wheel/PageDown snap unchanged.
- `npx playwright test e2e/about.spec.ts` passes.
files:
- e2e/about.spec.ts
depends_on:
- tablet-ipad-viewport-layout_1_1
- tablet-ipad-viewport-layout_1_2

id: tablet-ipad-viewport-layout_2_2
title: Prove Give tablet scripture order and panel containment
status: pending
acceptance_criteria:
- Extend `e2e/give.spec.ts` so the Give-at-tablet row in [Verification](./spec.md#verification) passes at both tablet-owned viewports.
- Existing Give checks stay green.
- `npx playwright test e2e/give.spec.ts` passes.
files:
- e2e/give.spec.ts
depends_on:
- tablet-ipad-viewport-layout_1_1
- tablet-ipad-viewport-layout_1_2

id: tablet-ipad-viewport-layout_2_3
title: Prove Contact tablet panel containment
status: pending
acceptance_criteria:
- Extend `e2e/contact.spec.ts` so the Contact-at-tablet row in [Verification](./spec.md#verification) passes at both tablet-owned viewports.
- Existing Contact checks stay green (including SiteFooter omission).
- `npx playwright test e2e/contact.spec.ts` passes.
files:
- e2e/contact.spec.ts
depends_on:
- tablet-ipad-viewport-layout_1_1
- tablet-ipad-viewport-layout_1_2

id: tablet-ipad-viewport-layout_2_4
title: Prove SiteFooter address and socials do not collide at tablet
status: pending
acceptance_criteria:
- Extend `e2e/home.spec.ts` so the Footer-at-tablet row in [Verification](./spec.md#verification) passes on `/` at both tablet-owned viewports.
- Existing home footer checks stay green.
- `npx playwright test e2e/home.spec.ts` passes.
files:
- e2e/home.spec.ts
depends_on:
- tablet-ipad-viewport-layout_1_1
- tablet-ipad-viewport-layout_1_2

### Not doing

- Honor exclusions in [Scope](./spec.md#scope), [Target viewports](./spec.md#target-viewports), and [Concerns](./spec.md#concerns).

## Risks

- Breakage: About CSS for flush settle / dots can regress phone wheel/PageDown snap and desktop two-column scene layout; Give/Contact min-height or overflow tweaks can break leaflet/desk stacks at ≤50rem and desktop side-by-side; footer tablet rules can disturb absolute-centered socials on wide desktop or the ≤800px static footer stack.
- Most risky: `tablet-ipad-viewport-layout_1_1` must make scene-dot clicks settle flush and set `aria-current` via CSS anchors/snap only. Current `e2e/about.spec.ts` already fails those checks; if CSS cannot satisfy them, the task is blocked under [Concerns](./spec.md#concerns).
- 768×1024 hits existing ≤800px / ≤50rem stacks; 1024×768 does not — landscape tablet still uses desktop About columns and absolute footer socials, so fixes must target that mid-band without inventing new iPad sizes.

## Acceptance criteria

| Verification | Command / evidence |
| --- | --- |
| Full gates | `make build` (“Build succeeded”); `make test` (all green); `make lint` (zero warnings) |
| Cross-cutting | Every [Verification](./spec.md#verification) row has a passing automated assertion owned by Wave 1–2 tasks; absorbed About visual attachments remain as that absorbed spec requires |

Missing infrastructure: none for Playwright or Vitest; no screenshot-baseline library beyond existing Playwright attachments.
