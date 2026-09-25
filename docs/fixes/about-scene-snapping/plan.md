# Plan: about-scene-snapping
Author: Udeet Gulati
Status: ready
Links: [intent](./intent.md) · [spec](./spec.md)

## Files that change

- Edit `src/app/globals.css` — `about-scene-snapping_1_1`.
- Edit `src/app/about/page.test.ts` — `about-scene-snapping_1_1`.
- Edit `e2e/helpers.ts` — `about-scene-snapping_2_1`.
- Edit `e2e/about.spec.ts` — `about-scene-snapping_2_1`.

## Order of work

### Wave 1 (1 task)

- Most risky step: `about-scene-snapping_1_1`.

id: about-scene-snapping_1_1
title: Correct the About snap port and one-viewport phone layout
status: done
acceptance_criteria:
- Implement [CSS boundary](./spec.md#css-boundary), [Snap contract](./spec.md#snap-contract), and [Phone layout contract](./spec.md#phone-layout-contract) in the existing About selectors in `src/app/globals.css`; do not edit About components or content.
- In the existing `@media (max-width: 800px)` About block, set every `.scene` to `height: 100svh` and `max-height: 100svh`, with content-sized copy followed by a `minmax(0, 1fr)` plate row; allow the grid children to shrink instead of forcing overflow.
- Re-integrate phone copy rules: `1.4rem 1.2rem 1.1rem` padding; heading size `clamp(2.35rem, 11vw, 3.2rem)` with `0.65rem` bottom margin; paragraph size `0.95rem`, `1.45` line height, and `0.55rem` between sibling paragraphs.
- Remove the plate's fixed `46svh` minimum so it consumes the grid remainder; keep Founders, The call, and Gospel to the Nations on `cover` at `center 18%`, `center 58%`, and `center 42%`, and keep Born Again and The Church on `contain` over `#2a160f`.
- Re-integrate the phone service-band rules: `1.2rem` padding, `0.55rem` service gaps, `0.65rem` top margins, and `1.1rem`, `0.9rem`, `1.55rem`, and `0.95rem` sizes for service heading, language, time, and address.
- Hide `.about-scene-dots` with `display: none` and remove any phone padding or spacing reserved for that overlay; do not add replacement navigation.
- Extend `src/app/about/page.test.ts` with focused source-contract assertions for the CSS owned by the `Route scoping`, `Responsive scene dots`, `Phone height and content`, and `Plate treatment` rows in [Verification](./spec.md#verification).
- `npx vitest run src/app/about/page.test.ts src/app/layout.test.ts` passes.
files:
- src/app/globals.css
- src/app/about/page.test.ts
depends_on: []

### Wave 2 (1 task)

id: about-scene-snapping_2_1
title: Prove settled scenes, responsive dots, phone fit, and footer completion in Chromium
status: done
acceptance_criteria:
- Add the shared 390×844 viewport constant in `e2e/helpers.ts` without changing the existing named viewports.
- Add a reusable scroll-stability helper that uses retrying assertions over consecutive position samples; do not use fixed sleeps.
- Extend `e2e/about.spec.ts` to cover every scenario in [Verification](./spec.md#verification), using role-based queries for accessibility-tree checks and Playwright report attachments for visual evidence.
- Keep programmatic DOM reads limited to measurements.
- Satisfy the [Regression requirement](./spec.md#verification) in the existing tests; share only setup or measurement helpers that keep each user journey independently readable.
- `npx playwright test e2e/about.spec.ts` passes.
files:
- e2e/helpers.ts
- e2e/about.spec.ts
depends_on:
- about-scene-snapping_1_1

### Not doing

- Honor the exclusions and prohibitions in [Scope](./spec.md#scope) and [Snap contract](./spec.md#snap-contract).

## Risks

- The later global 800px shell rules change header and footer dimensions after the About-specific media block. Browser verification must use the rendered dimensions rather than infer fit from source CSS.

## Acceptance criteria

- Run the commands below and paste their successful output before marking implementation complete.

| Verification | Command |
| --- | --- |
| Focused CSS contract | `npx vitest run src/app/about/page.test.ts src/app/layout.test.ts` |
| About browser behavior and screenshots | `npx playwright test e2e/about.spec.ts` |
| Build | `make build` |
| All tests | `make test` |
| Lint | `make lint` |
