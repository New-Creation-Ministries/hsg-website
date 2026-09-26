# Plan: event-highlights-and-scripture-relocation
Author: Udeet Gulati
Status: approved
Links: [intent](./intent.md) · [spec](./spec.md)

## Files that change

- Edit `src/content/home/index.ts` — `event-highlights-and-scripture-relocation_1_1`
- Edit `src/content/home/home.test.ts` — `event-highlights-and-scripture-relocation_1_1`
- Edit `src/content/watch/index.ts` — `event-highlights-and-scripture-relocation_1_2`
- Edit `src/content/watch/watch.test.ts` — `event-highlights-and-scripture-relocation_1_2`
- Edit `src/content/about/index.ts` — `event-highlights-and-scripture-relocation_1_3`
- Edit `src/content/about/about.test.ts` — `event-highlights-and-scripture-relocation_1_3`
- Add `public/home/together-youth-night.jpg` — `event-highlights-and-scripture-relocation_1_4`
- Add `public/home/recent-service-recap.jpg` — `event-highlights-and-scripture-relocation_1_4`
- Edit `src/app/globals.css` — `event-highlights-and-scripture-relocation_2_1`
- Edit `src/app/globals.test.ts` — `event-highlights-and-scripture-relocation_2_1`
- Edit `src/app/page.tsx` — `event-highlights-and-scripture-relocation_2_2`
- Edit `src/app/page.test.ts` — `event-highlights-and-scripture-relocation_2_2`
- Edit `src/app/page.render.test.tsx` — `event-highlights-and-scripture-relocation_2_2`
- Edit `src/app/events/page.test.ts` — `event-highlights-and-scripture-relocation_2_2`
- Delete `src/lib/home-event-slots.ts` — `event-highlights-and-scripture-relocation_2_2`
- Delete `src/lib/home-event-slots.test.ts` — `event-highlights-and-scripture-relocation_2_2`
- Add `src/components/home-event-highlights.tsx` — `event-highlights-and-scripture-relocation_2_2`
- Edit `src/components/watch-testimonies.tsx` — `event-highlights-and-scripture-relocation_2_3`
- Edit `src/app/watch/page.test.ts` — `event-highlights-and-scripture-relocation_2_3`
- Edit `e2e/copy.ts` — `event-highlights-and-scripture-relocation_3_1`
- Edit `e2e/home.spec.ts` — `event-highlights-and-scripture-relocation_3_1`
- Edit `e2e/watch.spec.ts` — `event-highlights-and-scripture-relocation_3_1`
- Edit `e2e/accessibility.spec.ts` — `event-highlights-and-scripture-relocation_3_1`
- Edit `docs/features/home-landing-page/spec.md` — `event-highlights-and-scripture-relocation_3_2`
- Edit `docs/features/home-landing-page/ux.md` — `event-highlights-and-scripture-relocation_3_2`
- Edit `docs/improvements/home-events-and-scripture-tiles/spec.md` — `event-highlights-and-scripture-relocation_3_2`
- Edit `docs/features/about-page/spec.md` — `event-highlights-and-scripture-relocation_3_2`
- Edit `src/content/home/home-planning-docs.test.ts` — `event-highlights-and-scripture-relocation_3_2`

## Order of work

### Wave 1 (4 parallel)

id: event-highlights-and-scripture-relocation_1_1
title: Replace Home Highlighted testimonies with event-highlight content records
status: done
acceptance_criteria:
- Home module matches [spec.md](./spec.md) Delta `/` rows and [Home — What’s going on](./spec.md#home--whats-going-on) / [Home — remove Highlighted testimonies](./spec.md#home--remove-highlighted-testimonies) / [Highlight content](./spec.md#highlight-content).
- Export name is `eventHighlights`; `thumbnailUrl` values are the `public/home/` paths from `_1_4`.
- Remove `pageNotes.testimonies`; keep sunday/ministry/address.
- `home.test.ts` locks the module; drop Hebrews/story expectations.
files:
- src/content/home/index.ts
- src/content/home/home.test.ts
depends_on: []

id: event-highlights-and-scripture-relocation_1_2
title: Export Hebrews 2:4 for Watch Featured Testimonies band
status: done
acceptance_criteria:
- Watch content matches [spec.md](./spec.md) [Watch — Hebrews 2:4](./spec.md#watch--hebrews-24) (export outside `testimonies`).
- Existing four `testimonies` records unchanged.
- `watch.test.ts` locks the scripture export and its absence from `testimonies`.
files:
- src/content/watch/index.ts
- src/content/watch/watch.test.ts
depends_on: []

id: event-highlights-and-scripture-relocation_1_3
title: Drop the Gospel to the Nations family-residence sentence
status: done
acceptance_criteria:
- About module matches [spec.md](./spec.md) [About](./spec.md#about) / Delta `/about` row.
- `about.test.ts` asserts that exact sentence is absent from `nations`.
files:
- src/content/about/index.ts
- src/content/about/about.test.ts
depends_on: []

id: event-highlights-and-scripture-relocation_1_4
title: Commit Instagram reel poster images for the two home highlights
status: done
acceptance_criteria:
- Add the two `public/home/` posters named in Files that change; paths used as `eventHighlights[].thumbnailUrl` in `_1_1`.
- [spec.md](./spec.md) [Highlight content](./spec.md#highlight-content) / Concerns Thumbnail assets: no Instagram fetch; do not ship empty `thumbnailUrl` strings.
files:
- public/home/together-youth-night.jpg
- public/home/recent-service-recap.jpg
depends_on: []

### Wave 2 (3 parallel)

**Most risky:** `event-highlights-and-scripture-relocation_2_2`.

id: event-highlights-and-scripture-relocation_2_1
title: Move band tokens to New to HSG? and style home highlights on ink
status: done
acceptance_criteria:
- CSS matches [spec.md](./spec.md) [Home — New to HSG?](./spec.md#home--new-to-hsg) and [Event highlight UI](./spec.md#event-highlight-ui); Watch Hebrews styles under `.watch-page` for [Watch — Hebrews 2:4](./spec.md#watch--hebrews-24).
- `globals.test.ts` locks band-on-visit and drops unused Home `.stories` / testimonies-only rules nothing renders.
- Contrast: [spec.md](./spec.md) Concerns “New to HSG? contrast”.
files:
- src/app/globals.css
- src/app/globals.test.ts
depends_on:
- event-highlights-and-scripture-relocation_1_1

id: event-highlights-and-scripture-relocation_2_2
title: Rewire Home page for highlights; stop homeEventSlots on What’s going on
status: done
acceptance_criteria:
- `page.tsx` implements [spec.md](./spec.md) Delta `/` rows, [Home — What’s going on](./spec.md#home--whats-going-on), [Event highlight UI](./spec.md#event-highlight-ui), and [Home — remove Highlighted testimonies](./spec.md#home--remove-highlighted-testimonies).
- Branch sections by heading (not index): What’s going on → New to HSG? (visit/band) → Sermons; remove `TestimonyItems` / `pageNotes.testimonies` render path.
- Stop importing `events` / `homeEventSlots`; delete `src/lib/home-event-slots.ts` and `src/lib/home-event-slots.test.ts`.
- Add `src/components/home-event-highlights.tsx` for the two highlight rows.
- Keep `force-dynamic` and sermon playlist read path.
- Update `page.test.ts`, `page.render.test.tsx`, and `events/page.test.ts` so they no longer expect `homeEventSlots` on Home.
files:
- src/app/page.tsx
- src/app/page.test.ts
- src/app/page.render.test.tsx
- src/app/events/page.test.ts
- src/components/home-event-highlights.tsx
- src/lib/home-event-slots.ts
- src/lib/home-event-slots.test.ts
depends_on:
- event-highlights-and-scripture-relocation_1_1
- event-highlights-and-scripture-relocation_1_4

id: event-highlights-and-scripture-relocation_2_3
title: Insert Hebrews horizontal block before Watch testimony items
status: done
acceptance_criteria:
- `watch-testimonies.tsx` matches [spec.md](./spec.md) [Watch — Hebrews 2:4](./spec.md#watch--hebrews-24).
- `watch/page.test.ts` locks Hebrews placement and that it is not rendered from the `testimonies` array.
files:
- src/components/watch-testimonies.tsx
- src/app/watch/page.test.ts
depends_on:
- event-highlights-and-scripture-relocation_1_2

### Wave 3 (2 parallel)

id: event-highlights-and-scripture-relocation_3_1
title: Update Playwright home, watch, and accessibility for the new layout
status: code_review
acceptance_criteria:
- Playwright covers [spec.md](./spec.md) Acceptance on `/`, `/watch`, and `/about` family-residence absence via About content already shipped in `_1_3` (About e2e only if an existing assertion would fail).
- `e2e/copy.ts` section list matches Delta section order; drop obsolete Highlighted testimonies / RWO source fixtures.
- `e2e/home.spec.ts`, `e2e/watch.spec.ts`, `e2e/accessibility.spec.ts` assert the new layout; no `homeEventSlots` or Highlighted testimonies region.
- No screenshot baseline in this repo.
files:
- e2e/copy.ts
- e2e/home.spec.ts
- e2e/watch.spec.ts
- e2e/accessibility.spec.ts
depends_on:
- event-highlights-and-scripture-relocation_2_1
- event-highlights-and-scripture-relocation_2_2
- event-highlights-and-scripture-relocation_2_3
- event-highlights-and-scripture-relocation_1_3

id: event-highlights-and-scripture-relocation_3_2
title: Align sibling Home/About planning docs with the shipped layout
status: code_review
acceptance_criteria:
- Sibling docs listed in Files that change match [spec.md](./spec.md) Concerns “Home / Watch docs drift” resolution for this change.
- `home-planning-docs.test.ts` locks updated Home docs without expecting Highlighted testimonies as a live section.
files:
- docs/features/home-landing-page/spec.md
- docs/features/home-landing-page/ux.md
- docs/improvements/home-events-and-scripture-tiles/spec.md
- docs/features/about-page/spec.md
- src/content/home/home-planning-docs.test.ts
depends_on:
- event-highlights-and-scripture-relocation_1_1
- event-highlights-and-scripture-relocation_1_3

## Not doing

- [spec.md](./spec.md) Unchanged.
- Relocating the three Home story tiles ([spec.md](./spec.md) [Home — remove Highlighted testimonies](./spec.md#home--remove-highlighted-testimonies)).
- Instagram media fetch ([spec.md](./spec.md) [Highlight content](./spec.md#highlight-content)).
- Changing Watch testimony records beyond inserting Hebrews ([spec.md](./spec.md) [Watch — Hebrews 2:4](./spec.md#watch--hebrews-24)).

## Risks

- `page.tsx` today keys Sunday / testimonies / sermons by section index (`SECTION_CLASS`, `isSunday`, `isTestimonies`). Heading-based branching in `_2_2` is required so Sermons is not banded and visit is not left on ink.
- `page.render.test.tsx`, `page.test.ts`, `events/page.test.ts`, `e2e/home.spec.ts`, and `e2e/accessibility.spec.ts` still assert `homeEventSlots` / Highlighted testimonies until `_2_2` / `_3_1`.
- Thumbnail empty-surface and New to HSG? contrast: [spec.md](./spec.md) Concerns.
- After deleting `home-event-slots`, do not weaken `/events` tests that lock New to HSG? times.

## Acceptance criteria

- `make test` green for content, globals, Home/Watch/About unit and render tests owned by waves 1–2 and `_3_2`.
- `make build` finishes with `Build succeeded`.
- `make e2e` (or `npm run e2e`) covers `_3_1`; no screenshot baseline infrastructure.
- Browser check: [spec.md](./spec.md) Acceptance on `/`, `/watch`, `/about`.
