# Intent: Praise reports removal
Author: Udeet Gulati
Status: draft

## Problem

The public nav and `/praise-reports` are outside the product. Code, tests, product copy, planning docs, a design reference, and feedback notes still name that destination.

## Proposed outcome

- Delete the route and the nav item.
- Delete the name and the path from the files under Affected users and systems.
- Highlighted testimonies stories on Home stay. That section has no section link.

## Affected users and systems

- Visitors and members, through the shared nav, the Home section link, and `/praise-reports`.
- `src/app/praise-reports/page.tsx`
- `src/content/home/index.ts`, `src/content/home/home.test.ts`
- `e2e/copy.ts`, `e2e/home.spec.ts`, `e2e/accessibility.spec.ts`
- `PRODUCT.md`
- [Home intent](../../features/home-landing-page/intent.md), [spec](../../features/home-landing-page/spec.md), [UX](../../features/home-landing-page/ux.md), [plan](../../features/home-landing-page/plan.md)
- [Events plan](../../features/events-page/plan.md), [events timeline reference](../../features/events-page/design-reference/05-timeline.html)
- [Home events and scripture tiles intent](../../improvements/home-events-and-scripture-tiles/intent.md) and [plan](../../improvements/home-events-and-scripture-tiles/plan.md)
- [Overall feedback](../../feedback/overall.md)
- Nav order stays the list in the [Home spec](../../features/home-landing-page/spec.md) ([ADR 0001](../../adr/0001-public-pages.md)).

## Constraints

- No archive page, redirect copy, or “formerly” sentence.
- This task folder is the planning record. Other docs do not name the destination.

## Open questions

None.
