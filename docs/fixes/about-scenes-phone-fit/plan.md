# Plan: about-scenes-phone-fit
Author: Udeet Gulati
Status: ready
Links: [intent](./intent.md) · [spec](./spec.md)

## Files that change

- Edit `src/app/globals.css` — `about-scenes-phone-fit_1_1`.
- Edit `e2e/about.spec.ts` — `about-scenes-phone-fit_2_1`.
- Edit `src/components/about-snap.tsx` — `about-scenes-phone-fit_1_1` only if ≤800px CSS alone cannot satisfy the Snap row of [Phone layout contract](./spec.md#phone-layout-contract-800px).

## Order of work

### Wave 1 (1 task)

- Most risky step: `about-scenes-phone-fit_1_1`.

id: about-scenes-phone-fit_1_1
title: Implement ≤800px one-viewport scene and plate budget in CSS
status: done
acceptance_criteria:
- Satisfy [Phone layout contract (≤800px)](./spec.md#phone-layout-contract-800px) in `@media (max-width: 800px)` under `.about-page` in `src/app/globals.css`.
- Remove the shipped phone regime that uses scene `min-height: auto` and plate `min-height: 46svh`.
- Touch `about-snap.tsx` or ≤800px snap CSS only if required by the Snap row of that contract; keep `prefers-reduced-motion` per [about-page Page](../../features/about-page/spec.md#page).
- Confirm against [Confirmed phone failures](./spec.md#confirmed-phone-failures) at 390×844.
files:
- src/app/globals.css
- src/components/about-snap.tsx
depends_on: []

### Wave 2 (1 task)

id: about-scenes-phone-fit_2_1
title: Extend About e2e with phone fit assertions and scene screenshots
status: done
acceptance_criteria:
- Satisfy [Regression verification](./spec.md#regression-verification) by extending `e2e/about.spec.ts` beyond snap-arm-only.
- Assert at 390×844 and at `phone` from `e2e/helpers.ts` (320×700).
- Attach per-scene 390×844 phone screenshots to the Playwright report for human review (no pixel-diff CI).
- Run `npx playwright test e2e/about.spec.ts`, then `make build`, `make test`, `make lint`.
files:
- e2e/about.spec.ts
depends_on:
- about-scenes-phone-fit_1_1

### Not doing

- [Constraints](./intent.md#constraints).
- Do not reopen [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md).
- Contain plates row of [Phone layout contract](./spec.md#phone-layout-contract-800px).

## Risks

- After removing the `46svh` plate floor, long phone copy plus large display type can still exceed a one-viewport scene; any further ≤800px CSS must stay inside [Constraints](./intent.md#constraints) and [Phone layout contract](./spec.md#phone-layout-contract-800px) — primary risk for `about-scenes-phone-fit_1_1`.
- Cover `background-position` tuned at 390×844 can re-crop at 320×700; Wave 2 must assert both sizes.
- Touching snap arming or `scroll-snap-stop` to hide overflow can break existing About snap / header / footer e2e (`e2e/about.spec.ts`) and layout contract tests in `src/app/layout.test.ts`.
- Source-string tests in `src/app/about/page.test.ts` and `src/app/layout.test.ts` may need updates only if they assert the old `46svh` / `min-height: auto` phone regime after CSS changes.

## Acceptance criteria

- Missing infrastructure: Playwright About e2e exists, but there is no `/about` phone layout/fit assertion suite and no phone screenshot baseline; Wave 2 adds fit assertions and evidence screenshots (human review, not pixel-diff CI).
- Unresolved product decisions: none ([spec](./spec.md)).
- Verification commands:

| Verification | Command |
| --- | --- |
| About browser suite | `npx playwright test e2e/about.spec.ts` |
| Build | `make build` |
| Unit tests | `make test` |
| Lint | `make lint` |
