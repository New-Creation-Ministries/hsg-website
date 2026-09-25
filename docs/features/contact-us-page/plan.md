# Plan: contact-us-page
Author: Udeet Gulati
Status: ready
Links: [intent](./intent.md) · [spec](./spec.md)

Skills: frontend-design, playwright. ADRs: [0001](../../adr/0001-public-pages.md), [0002](../../adr/0002-public-navigation-and-recovery.md). Visual lock: [visit-desk.png](../../../.impeccable/mocks/visit-desk.png). Do not reopen [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md).

## Files that change

- Add `src/content/contact/index.ts` — typed contact copy per [spec Content](./spec.md#content) — `contact-us-page_1_1`
- Add `src/content/contact/contact.test.ts` — ownership imports + locked strings/hrefs — `contact-us-page_1_1`
- Edit `src/app/layout.tsx` — wrap `SiteFooter` in pathname gate; omit on `/contact` only — `contact-us-page_1_2`
- Add `src/components/site-footer-gate.tsx` — pathname gate; do not render `SiteFooter` on `/contact` (not CSS-hidden) — `contact-us-page_1_2`
- Edit `src/app/layout.test.ts` — lock `/contact` omits footer; other routes still mount it — `contact-us-page_1_2`
- Edit `src/app/contact/page.tsx` — replace shell with visit-desk body + cream strip — `contact-us-page_2_1`
- Edit `src/app/globals.css` — scoped contact layout/tokens; no unscoped chrome changes — `contact-us-page_2_1`
- Add `src/app/contact/page.test.ts` — no shell; title; main-content; G7; tel/mailto; no SiteFooter — `contact-us-page_2_1`
- Add `e2e/contact.spec.ts` — published contact checks — `contact-us-page_3_1`
- Edit `e2e/navigation.spec.ts` — `/contact` leaves the shell loop like Give/About — `contact-us-page_3_1`

## Order of work

Wave 2 depends on content and footer chrome. Wave 3 depends on the published page.

### Wave 1 (2 parallel)

id: contact-us-page_1_1
title: Add typed contact content with Home/Give ownership imports
status: pending
acceptance_criteria:
- `src/content/contact/` exports the Content blocks and ownership wiring from [spec Content](./spec.md#content) and [intent Proposed outcome](./intent.md#proposed-outcome).
- `contact.test.ts` fails if those ownership links or locked strings/hrefs drift.
files:
- src/content/contact/index.ts
- src/content/contact/contact.test.ts
depends_on: []

id: contact-us-page_1_2
title: Omit SiteFooter on /contact only
status: pending
acceptance_criteria:
- `/contact` does not render shared `SiteFooter` (pathname gate via `site-footer-gate.tsx`; not CSS-hidden). Other routes still render it.
- Shared `SiteHeader` remains on `/contact`.
- `layout.test.ts` locks the omit-on-contact / keep-elsewhere contract without weakening About chrome locks.
files:
- src/app/layout.tsx
- src/components/site-footer-gate.tsx
- src/app/layout.test.ts
depends_on: []

### Wave 2 (1 task)

**Most risky:** `contact-us-page_2_1` (details under Risks).

id: contact-us-page_2_1
title: Replace /contact shell with visit-desk layout and cream strip
status: pending
acceptance_criteria:
- Page body matches [spec Page](./spec.md#page) and [Acceptance](./spec.md#acceptance). Tokens and type follow [spec Page](./spec.md#page).
- CSS is scoped so Home, About, Events, Give, and remaining shells are unchanged.
- `page.test.ts` asserts metadata title `Contact Us`, import from `@/content/contact`, `#main-content`, no shell sentence, G7 on http(s) links, no `target="_blank"` on tel/mailto, and no `SiteFooter` on this route.
files:
- src/app/contact/page.tsx
- src/app/globals.css
- src/app/contact/page.test.ts
depends_on:
- contact-us-page_1_1
- contact-us-page_1_2

### Wave 3 (1 task)

id: contact-us-page_3_1
title: Cover published /contact in Playwright
status: pending
acceptance_criteria:
- `e2e/navigation.spec.ts` treats `/contact` like `/give`: title `Contact Us | Holy Spirit Generation`, mock `h1`, no shell sentence; Menu → Contact Us lands on `/contact`; Contact Us is `aria-current="page"`.
- `e2e/contact.spec.ts` covers [spec Acceptance](./spec.md#acceptance): locked copy and hrefs, G7 on http(s) links, live-translation visible text (not raw Glossa URL), WhatsApp label without link, no `footer.site-footer`, cream strip at page bottom, narrow stack shows all blocks.
- `make e2e` runs the new/updated specs.
files:
- e2e/contact.spec.ts
- e2e/navigation.spec.ts
depends_on:
- contact-us-page_2_1

### Not doing

- Scope and chrome exclusions in [intent Constraints](./intent.md#constraints), [spec Concerns](./spec.md#concerns), and [spec Page](./spec.md#page).

## Risks

- `e2e/navigation.spec.ts` still expects `/contact` as a shell (`h1` Contact Us + shell sentence) until wave 3; shipping wave 2 without updating that loop fails CI.
- Root `layout.tsx` always mounts `SiteFooter` today (`layout.test.ts`); a faulty pathname gate can drop the footer site-wide or leave it on `/contact`. Omit by not rendering via `site-footer-gate.tsx`, not CSS `display: none`. Chrome contract: [spec Concerns](./spec.md#concerns).
- Matching visit-desk.png is the highest visual risk; unscoped contact CSS can restyle Home/Give/About.
- Breakage surface: shared nav current-page for Contact Us, Give helpBar and Home address imports if those sources change, SiteFooter social URL lock tests.

## Acceptance criteria

| Check | Command or route | Pass |
| --- | --- | --- |
| Unit | `make test` | `contact.test.ts`, `page.test.ts`, and updated `layout.test.ts` green |
| Build | `make build` | Ends with “Build succeeded” |
| Lint | `make lint` | Zero warnings |
| Browser | `make e2e` | Full suite green, including `e2e/contact.spec.ts` and updated navigation |
| Visual | `/contact` | Matches [spec Acceptance](./spec.md#acceptance) against visit-desk.png |
| Missing infra | — | No screenshot baseline; mock PNG is visual reference only |

Human review of the draft plan. Deployed preview for visual sign-off against visit-desk.png.
