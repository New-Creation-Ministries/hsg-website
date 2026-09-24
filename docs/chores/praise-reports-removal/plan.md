# Plan: praise-reports-removal
Author: Udeet Gulati
Status: approved
Links: [intent](./intent.md) · [spec](./spec.md)

## Files that change

- Delete `src/app/praise-reports/page.tsx` — `praise-reports-removal_1_1`
- Edit `src/content/home/index.ts` — `praise-reports-removal_1_2`
- Edit `src/app/page.tsx` — `praise-reports-removal_1_2`
- Edit `docs/features/home-landing-page/intent.md` — `praise-reports-removal_1_3`
- Edit `docs/features/home-landing-page/spec.md` — `praise-reports-removal_1_3`
- Edit `docs/features/home-landing-page/ux.md` — `praise-reports-removal_1_3`
- Edit `docs/features/home-landing-page/plan.md` — `praise-reports-removal_1_3`
- Edit `PRODUCT.md` — `praise-reports-removal_1_4`
- Edit `docs/features/events-page/plan.md` — `praise-reports-removal_1_4`
- Edit `docs/features/events-page/design-reference/05-timeline.html` — `praise-reports-removal_1_4`
- Edit `docs/improvements/home-events-and-scripture-tiles/intent.md` — `praise-reports-removal_1_4`
- Edit `docs/improvements/home-events-and-scripture-tiles/plan.md` — `praise-reports-removal_1_4`
- Edit `docs/feedback/overall.md` — `praise-reports-removal_1_4`
- Edit `src/content/home/home.test.ts` — `praise-reports-removal_2_1`
- Edit `e2e/copy.ts` — `praise-reports-removal_2_2`
- Edit `e2e/home.spec.ts` — `praise-reports-removal_2_2`
- Edit `e2e/accessibility.spec.ts` — `praise-reports-removal_2_2`

## Order of work

### Wave 1 (4 parallel)

id: praise-reports-removal_1_1
title: Delete the praise-reports route
status: done
acceptance_criteria:
- `src/app/praise-reports/page.tsx` is gone
- No other `src/app` page file is added or edited
- Runtime behavior matches [spec.md](./spec.md) Route
files:
- src/app/praise-reports/page.tsx
depends_on: []

**Most risky:** `praise-reports-removal_1_2`. See Risks.

id: praise-reports-removal_1_2
title: Drop the nav item and the testimonies section link
status: done
acceptance_criteria:
- `nav` and Highlighted testimonies match [spec.md](./spec.md) Nav and Highlighted testimonies
- Other sections keep their current `more` values
- `src/app/page.tsx` renders `SectionLink` only when `more` is set, at both the visit intro and the section head
- Both sites still contain the source text `section.more.label`, so `src/app/page.test.ts` keeps matching
files:
- src/content/home/index.ts
- src/app/page.tsx
depends_on: []

id: praise-reports-removal_1_3
title: Align Home planning docs with Nav
status: done
acceptance_criteria:
- Edits match [spec.md](./spec.md) Docs for Home intent, Home spec, Home UX, and Home plan
- Home spec `sections` export marks `more` optional
- Home UX Menu row counts the routes in [spec.md](./spec.md) Nav
files:
- docs/features/home-landing-page/intent.md
- docs/features/home-landing-page/spec.md
- docs/features/home-landing-page/ux.md
- docs/features/home-landing-page/plan.md
depends_on: []

id: praise-reports-removal_1_4
title: Remove the destination from the other listed docs
status: done
acceptance_criteria:
- Edits match [spec.md](./spec.md) Docs for `PRODUCT.md`, Events plan, the timeline reference, Home events intent, Home events plan, and overall feedback
- The two feedback element strings become `HomeAboutEventsWatchContact UsGive`
files:
- PRODUCT.md
- docs/features/events-page/plan.md
- docs/features/events-page/design-reference/05-timeline.html
- docs/improvements/home-events-and-scripture-tiles/intent.md
- docs/improvements/home-events-and-scripture-tiles/plan.md
- docs/feedback/overall.md
depends_on: []

### Wave 2 (2 parallel)

id: praise-reports-removal_2_1
title: Assert nav and testimonies content
status: done
acceptance_criteria:
- `src/content/home/home.test.ts` matches [spec.md](./spec.md) Tests for that file
files:
- src/content/home/home.test.ts
depends_on:
- praise-reports-removal_1_2

id: praise-reports-removal_2_2
title: Assert header labels and no testimonies section link
status: done
acceptance_criteria:
- `e2e/copy.ts`, `e2e/home.spec.ts`, and `e2e/accessibility.spec.ts` match [spec.md](./spec.md) Tests for those files
files:
- e2e/copy.ts
- e2e/home.spec.ts
- e2e/accessibility.spec.ts
depends_on:
- praise-reports-removal_1_2

### Not doing

- [intent.md](./intent.md) Constraints
- [spec.md](./spec.md) Concerns, Tests, and Docs
- Do not edit this task folder except through planning

## Risks

`src/app/page.tsx` reads `section.more.href` and `section.more.label` in the visit intro and the section head. Making `more` optional without a guard at both sites fails typecheck.

`src/app/page.test.ts` matches the source text `section.more.label`. Optional chaining that removes that substring fails that test. `.section-head` is a flex row and still lays out a lone `h2`; no CSS edit.

No Playwright spec asserts [spec.md](./spec.md) Route after that path leaves `e2e/copy.ts` `routes`. Confirm the request in the browser or with curl against the Playwright `webServer`.

## Acceptance criteria

- Behavior matches [spec.md](./spec.md) Acceptance.
- `make test`, `make lint`, and `make build` pass. Build ends with “Build succeeded”. `make e2e` passes. Vitest does not run `e2e/`.
