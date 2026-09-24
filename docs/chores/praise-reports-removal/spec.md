# Spec: Praise reports removal

Status: approved
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: none

## Outcome

Behavior and constraints: [intent.md](./intent.md) Proposed outcome and Constraints. No new ADR. The revised route table is Nav.

## Route

Delete `src/app/praise-reports/page.tsx`. A request for `/praise-reports` is an unknown route.

## Nav

Revise the route table in [Home spec](../../features/home-landing-page/spec.md) to:

| Label | Path | Home section |
| --- | --- | --- |
| Home | `/` | — |
| About | `/about` | Hero |
| Events | `/events` | What’s going on |
| Watch | `/watch` | Sermons |
| Contact Us | `/contact` | New to HSG |
| Give | `/give` | — |

`nav` in `src/content/home/index.ts` matches those labels except Home. Header and Menu both use `nav`. Home stays the logo link.

Home spec and [Home plan](../../features/home-landing-page/plan.md) header sentences that count seven links count six (logo plus `nav`).

## Highlighted testimonies

Stories, grid, and source line stay ([Home events spec](../../improvements/home-events-and-scripture-tiles/spec.md)).

That section has no section link. `HomeSection.more` is optional. Omit `more` on Highlighted testimonies. `src/app/page.tsx` renders the section link only when `more` is set. Other sections keep their links.

## Docs

Remove the label and the path from every file in [intent.md](./intent.md) Affected users and systems except this folder.

| File | Edit |
| --- | --- |
| `PRODUCT.md` | Leads into Events, Watch, and Contact Us. Routes match Nav. |
| [Home intent](../../features/home-landing-page/intent.md) | Reach list matches Nav. |
| [Home spec](../../features/home-landing-page/spec.md) | Route table, header diagram, and link counts match Nav. Section-links row matches Highlighted testimonies. |
| [Home UX](../../features/home-landing-page/ux.md) | Highlighted testimonies next action is `—`. Pattern-decision row keeps Sermons → Watch and drops the testimonies clause. |
| [Home plan](../../features/home-landing-page/plan.md) | Drop the page, the name in Not doing, and the Band-link clause in the accessibility row. Shell count is the routes in Nav besides Home. |
| [Events plan](../../features/events-page/plan.md) | Shell sentence covers About, Watch, Contact Us, and Give. |
| [Events timeline reference](../../features/events-page/design-reference/05-timeline.html) | Delete both anchors. Do not leave `#praise`. |
| [Home events intent](../../improvements/home-events-and-scripture-tiles/intent.md) | Section link matches Highlighted testimonies. |
| [Home events plan](../../improvements/home-events-and-scripture-tiles/plan.md) | Source line stays. |
| [Overall feedback](../../feedback/overall.md) | Delete the label from the two element strings. |

[Home events spec](../../improvements/home-events-and-scripture-tiles/spec.md) points at its intent for section links. No edit there.

## Tests

| File | Asserts |
| --- | --- |
| `src/content/home/home.test.ts` | `nav` matches Nav. Highlighted testimonies matches Highlighted testimonies. |
| `e2e/copy.ts` | `navLabels` and `routes` match Nav. |
| `e2e/home.spec.ts` | Header link text matches `navLabels`. Highlighted testimonies matches Highlighted testimonies. |
| `e2e/accessibility.spec.ts` | Section-link height checks omit that region. Drop the Band-link color expect. Testimony heading color stays. Axe still walks `routes`. |

`e2e/navigation.spec.ts` reads `routes`. No edit there.

## Acceptance

- Wide header and Menu match the Nav labels, in that order.
- Home matches Highlighted testimonies.
- `/praise-reports` does not render a page.
- Label and path outside this folder: [intent.md](./intent.md) Constraints.

## Concerns

| Topic | What this spec does |
| --- | --- |
| Home events intent | That constraint currently requires the testimonies section link. Highlighted testimonies replaces it. |
| Band link `#182da3` | Stays in the Home color table. No Home element uses it after the section link is removed. |
| `.impeccable/review/browser-checks.json` | Leave unchanged. |
