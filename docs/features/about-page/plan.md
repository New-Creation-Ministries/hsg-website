# Plan: about-page
Author: Udeet Gulati
Status: ready
Links: [intent](./intent.md) · [spec](./spec.md)

Skills: frontend-design, playwright. ADRs: [0001](../../adr/0001-public-pages.md), [0002](../../adr/0002-public-navigation-and-recovery.md). Visual lock: [scenes.html](./explorations/scenes.html). Do not reopen [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md).

## Files that change

- Add `src/content/about/index.ts` — scenes module per [spec Content](./spec.md#content) — `about-page_1_1`
- Add `src/content/about/about.test.ts` — order, titles, Home import lock — `about-page_1_1`
- Add `public/about/founders.jpg`, `born-again.jpg`, `the-call.jpg`, `nations.jpg`, `church.jpg` — from Cursor assets (Content-table filenames) — `about-page_1_2`
- Delete six exploration PNGs listed in [spec Delta](./spec.md#delta) — `about-page_1_2`
- Edit `src/app/globals.css` and/or add `src/app/about/layout.tsx` — non-sticky header and footer snap on `/about` — `about-page_1_3`
- Edit `src/app/layout.test.ts`, `e2e/navigation.spec.ts`, `e2e/accessibility.spec.ts` as needed for chosen chrome — `about-page_1_3`
- Edit `src/app/about/page.tsx` — replace shell with Scenes body — `about-page_2_1`
- Add `src/components/about-scene-dots.tsx` (or equivalent client module) — scene-dot `aria-current` — `about-page_2_1`
- Edit `src/app/globals.css` — scoped scenes styles from scenes.html — `about-page_2_1`
- Add `src/app/about/page.test.ts` — no shell sentence; metadata title About — `about-page_2_1`
- Add `e2e/about.spec.ts` — published scenes checks — `about-page_3_1`
- Edit `e2e/navigation.spec.ts` — `/about` leaves the shell loop — `about-page_3_1`
- Edit `e2e/home.spec.ts` and `e2e/events.spec.ts` — align Home and Events assertions with published copy — `about-page_4_1`

Plate sources live outside the repo at `.cursor/projects/Users-udeetgulati-Projects-hsg-website/assets/` (filenames in [spec Content](./spec.md#content)). Copy into `public/about/` as the five short names above (`src` `/about/...`).

## Order of work

Wave 2 depends on content, plates, and the `/about` chrome task. Wave 4 depends on the published `/about` specs.

### Wave 1 (3 parallel)

id: about-page_1_1
title: Add typed about content and Home service import
status: done
acceptance_criteria:
- `src/content/about/` exports the six scenes per [spec Content](./spec.md#content) and [The story continues](./spec.md#the-story-continues) (Home “New to HSG?” import; no second service source).
- `about.test.ts` fails if scene order/titles drift, if services are duplicated under about, or if Home service text changes while about still expects the old strings.
files:
- src/content/about/index.ts
- src/content/about/about.test.ts
depends_on: []

id: about-page_1_2
title: Ship five plates and delete exploration images
status: done
acceptance_criteria:
- Five plates exist under `public/about/` as named in Files that change, copied from the Cursor assets folder using Content-table source filenames.
- The six exploration PNGs in [spec Delta](./spec.md#delta) are deleted from `docs/features/about-page/explorations/images/`.
files:
- public/about/founders.jpg
- public/about/born-again.jpg
- public/about/the-call.jpg
- public/about/nations.jpg
- public/about/church.jpg
- docs/features/about-page/explorations/images/couple.png
- docs/features/about-page/explorations/images/stage.png
- docs/features/about-page/explorations/images/night-crusade.png
- docs/features/about-page/explorations/images/studio.png
- docs/features/about-page/explorations/images/festival.png
- docs/features/about-page/explorations/images/filmstrip.png
depends_on: []

id: about-page_1_3
title: Keep shared chrome; unstick header; snap footer on /about
status: done
acceptance_criteria:
- `/about` still renders shared SiteHeader and SiteFooter.
- On `/about` only, `.site-header` is not sticky. Other routes stay sticky.
- After the last scene, one scroll-snap stop reveals SiteFooter. `prefers-reduced-motion` still disables scroll-snap.
files:
- src/app/globals.css
- src/app/about/layout.tsx
- src/app/layout.test.ts
depends_on: []

### Wave 2 (1 task)

**Most risky:** `about-page_2_1` (details under Risks).

id: about-page_2_1
title: Replace /about shell with the Scenes page body
status: done
acceptance_criteria:
- Page body matches [spec Page](./spec.md#page) and [Acceptance](./spec.md#acceptance). Header unstick and footer snap stay on `about-page_1_3`.
- Scene dots ship in page-local markup.
- Scenes CSS is scoped so Home and Events regions are unchanged. No entrance fade/slide kit.
- `page.test.ts` asserts no shell sentence and metadata title `About`.
files:
- src/app/about/page.tsx
- src/components/about-scene-dots.tsx
- src/app/globals.css
- src/app/about/page.test.ts
depends_on:
- about-page_1_1
- about-page_1_2
- about-page_1_3

### Wave 3 (1 task)

id: about-page_3_1
title: Cover published /about in Vitest and Playwright
status: done
acceptance_criteria:
- `make test` green including `about.test.ts` and `page.test.ts`.
- `e2e/navigation.spec.ts` treats `/about` like `/events`: title `About | Holy Spirit Generation`, no shell sentence; Menu → About still lands on `/about`.
- `e2e/about.spec.ts` covers [spec Acceptance](./spec.md#acceptance), including five plates, non-sticky header on `/about`, and the footer snap after the last scene.
- `make e2e` runs the new/updated specs.
files:
- e2e/about.spec.ts
- e2e/navigation.spec.ts
depends_on:
- about-page_2_1

### Wave 4 (1 task)

id: about-page_4_1
title: Align Home and Events Playwright with published copy
status: done
acceptance_criteria:
- `make e2e` passes, including `e2e/home.spec.ts` and `e2e/events.spec.ts`.
- Scripture assertions match the curly-quoted scripture tiles and the sermon blockquote on Home.
- Sunday time assertions match published Home “New to HSG?” times (`English` / `8–9am` and the second service time) on Home and Events.
- Footer `contentinfo` links are the SiteFooter socials (Facebook, Instagram, YouTube), not zero links.
- Wide-viewport composition assertions match the current Home testimony, sermon, and Sunday layout.
- `e2e/about.spec.ts` and `e2e/navigation.spec.ts` stay green. About scenes, plates, and chrome stay as waves 1–3 left them.
files:
- e2e/home.spec.ts
- e2e/events.spec.ts
depends_on:
- about-page_3_1

### Not doing

- Scope exclusions in [intent Constraints](./intent.md#constraints) and [spec Concerns](./spec.md#concerns) (redesign, invented facts, address unification, ADR 0003 reopen, embeds/accounts).
- Shipping deleted exploration plates or a plate on The story continues ([spec Delta](./spec.md#delta) / Content).

## Risks

- `e2e/navigation.spec.ts` and `e2e/accessibility.spec.ts` still treat `/about` as a shell until wave 3.
- Unscoped scenes rules in `globals.css` can restyle Home/Events, including making the header non-sticky on other routes.
- Footer snap can hide SiteFooter if the snap container does not include it.
- Cursor asset files are outside the repo; a clean clone cannot copy plates until the five JPGs are in that assets folder or already under `public/about/`.
- Updating Home or Events assertions to match published copy can hide a real layout regression if the wide composition is wrong rather than the assertion.

## Acceptance criteria

| Check | Command or route | Pass |
| --- | --- | --- |
| Unit | `make test` | `about.test.ts`, `page.test.ts` green; Home import lock holds |
| Build | `make build` | Ends with “Build succeeded” |
| Lint | `make lint` | Zero warnings |
| Browser | `make e2e` | Full suite green, including `e2e/about.spec.ts`, updated navigation, and the Home/Events assertion updates in wave 4 |
| Missing infra | — | No screenshot baseline; no WebKit project in CI for this page |

Human review of the draft plan. Deployed preview for visual sign-off against scenes.html.
