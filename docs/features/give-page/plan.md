# Plan: give-page
Author: Udeet Gulati
Status: ready
Links: [intent](./intent.md) · [spec](./spec.md)

Skills: frontend-design, playwright. ADRs: [0001](../../adr/0001-public-pages.md), [0002](../../adr/0002-public-navigation-and-recovery.md). Visual lock: [leaflet.png](../../../.impeccable/mocks/decision/leaflet.png). Do not reopen [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md).

## Files that change

- Add `src/content/give/index.ts` — typed give copy per [spec Content](./spec.md#content) — `give-page_1_1`
- Add `src/content/give/give.test.ts` — lock intent/spec strings and hrefs; fail on QR/extra fields — `give-page_1_1`
- Edit `src/app/give/page.tsx` — replace shell with leaflet body + help bar — `give-page_2_1`
- Edit `src/app/globals.css` — scoped give layout; no unscoped chrome changes — `give-page_2_1`
- Add `src/app/give/page.test.ts` — no shell sentence; title Give; main-content; G7 attrs; tel/mailto — `give-page_2_1`
- Add `e2e/give.spec.ts` — published give checks — `give-page_3_1`
- Edit `e2e/navigation.spec.ts` — `/give` leaves the shell loop like About/Events — `give-page_3_1`

## Order of work

Wave 2 depends on content. Wave 3 depends on the published page.

### Wave 1 (1 task)

id: give-page_1_1
title: Add typed give content under src/content/give
status: done
acceptance_criteria:
- `src/content/give/index.ts` exports the Content blocks and Page hrefs from [intent Proposed outcome](./intent.md#proposed-outcome) and [spec Page](./spec.md#page) (scripture, citation, why copy, GIVE, help contacts).
- `give.test.ts` fails if those intent/spec strings or hrefs drift, or if QR/address/extra payment fields appear.
files:
- src/content/give/index.ts
- src/content/give/give.test.ts
depends_on: []

### Wave 2 (1 task)

**Most risky:** `give-page_2_1` (details under Risks).

id: give-page_2_1
title: Replace /give shell with leaflet layout and help bar
status: done
acceptance_criteria:
- Page body matches [spec Page](./spec.md#page) and [Acceptance](./spec.md#acceptance). Tokens and type follow [spec Page](./spec.md#page).
- Help bar is a sibling after `#main-content` so it sits above shared SiteFooter from `src/app/layout.tsx`; SiteFooter still renders.
- CSS is scoped so Home, About, Events, and remaining shells are unchanged.
- `page.test.ts` asserts metadata title `Give`, import from `@/content/give`, `#main-content`, no shell sentence, G7 on GIVE, and no `target="_blank"` on tel/mailto.
files:
- src/app/give/page.tsx
- src/app/globals.css
- src/app/give/page.test.ts
depends_on:
- give-page_1_1

### Wave 3 (1 task)

id: give-page_3_1
title: Cover published /give in Playwright
status: done
acceptance_criteria:
- `e2e/navigation.spec.ts` treats `/give` like `/about` and `/events`: title `Give | Holy Spirit Generation`, `h1` “Why we give”, no shell sentence; Menu → Give still lands on `/give`; Back-from-Give scroll restore stays green.
- `e2e/give.spec.ts` covers [spec Acceptance](./spec.md#acceptance): locked copy, GIVE href + `target="_blank"`, help bar above `footer.site-footer`, phone/email hrefs, Give as `aria-current="page"`, narrow stack still shows all blocks.
- `make e2e` runs the new/updated specs.
files:
- e2e/give.spec.ts
- e2e/navigation.spec.ts
depends_on:
- give-page_2_1

### Not doing

- Scope exclusions in [intent Constraints](./intent.md#constraints) and [spec Concerns](./spec.md#concerns).
- Changing shared SiteHeader/SiteFooter modules or root layout order for this page.

## Risks

- `e2e/navigation.spec.ts` still expects `/give` as a shell (`h1` Give + shell sentence) until wave 3; shipping wave 2 without updating that loop fails CI.
- Matching the leaflet mock is the highest visual risk; unscoped give CSS can restyle Home/About/Events.
- Help bar must live in page children (before SiteFooter in document order). Putting it inside a full-viewport `main` that swallows the footer breaks the “above SiteFooter” contract.

## Acceptance criteria

| Check | Command or route | Pass |
| --- | --- | --- |
| Unit | `make test` | `give.test.ts` and `page.test.ts` green |
| Build | `make build` | Ends with “Build succeeded” |
| Lint | `make lint` | Zero warnings |
| Browser | `make e2e` | Full suite green, including `e2e/give.spec.ts` and updated navigation |
| Visual | `/give` | Matches [spec Acceptance](./spec.md#acceptance) against leaflet.png |
| Missing infra | — | No screenshot baseline; mock PNG is visual reference only |

Human review of the draft plan. Deployed preview for visual sign-off against leaflet.png.
