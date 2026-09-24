# Plan: home-events-and-scripture-tiles
Author: Udeet Gulati
Status: approved
Links: [intent](./intent.md) · [spec](./spec.md)

Records: [ADR 0005](../../adr/0005-event-records.md). Visual: [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md). Sunday fields: [Home spec](../../features/home-landing-page/spec.md) “New to HSG?”. Static pages: [docs/architecture.md](../../architecture.md).

## Files that change

- Edit `src/content/home/index.ts` — `home-events-and-scripture-tiles_1_1`
- Edit `src/content/home/home.test.ts` — `home-events-and-scripture-tiles_1_1`
- Add `src/lib/home-event-slots.ts` — `home-events-and-scripture-tiles_1_2`
- Add `src/lib/home-event-slots.test.ts` — `home-events-and-scripture-tiles_1_2`
- Edit `src/app/globals.css` — `home-events-and-scripture-tiles_1_3`
- Edit `src/app/globals.test.ts` — `home-events-and-scripture-tiles_1_3`
- Edit `src/app/page.tsx` — `home-events-and-scripture-tiles_2_1`
- Edit `src/app/page.test.ts` — `home-events-and-scripture-tiles_2_1`
- Edit `e2e/home.spec.ts` — `home-events-and-scripture-tiles_3_1`

## Order of work

### Wave 1 (3 parallel)

id: home-events-and-scripture-tiles_1_1
title: Put scripture in the home module and drop the highlight placeholders
status: done
acceptance_criteria:
- “What’s going on” and “Highlighted testimonies” items match [intent.md](./intent.md) Proposed outcome and Constraints. Testimony order there. No `href` on those items.
- Headings, `more` links, and sections listed in [spec.md](./spec.md) Unchanged stay as they are.
- No item title is `Highlight to be published`. `home.test.ts` locks the scripture items and that absence.
files:
- src/content/home/index.ts
- src/content/home/home.test.ts
depends_on: []

id: home-events-and-scripture-tiles_1_2
title: Select the two home event slots from upcoming records
status: done
acceptance_criteria:
- `homeEventSlots(events, services, now)` calls `listUpcoming(events, now)` and returns two slots. Dated: `{ kind: "dated", name, whenLine }`. Service: `{ kind: "service", name, language, time }` from the passed New to HSG item (`text` split on `\n`).
- Returned pairs match the five rows in [spec.md](./spec.md) “What’s going on”, including featured, pad, and service order there.
- The helper does not call `Date.now` or `new Date`. Tests pass a fixed `now`.
files:
- src/lib/home-event-slots.ts
- src/lib/home-event-slots.test.ts
depends_on: []

id: home-events-and-scripture-tiles_1_3
title: Stack the highlight line and make testimonies a two-column grid
status: done
acceptance_criteria:
- `.highlights li` stacks its children at every width. The border-top rule on `.highlights li` stays.
- `.stories` matches the width table in [spec.md](./spec.md) Highlighted testimonies: `1fr 1fr` above 800px; at `max-width: 800px`, one column and the existing `article + article` top rule.
- `globals.test.ts` no longer expects `1.5fr 1fr 1fr` on `.stories`.
files:
- src/app/globals.css
- src/app/globals.test.ts
depends_on: []

### Wave 2 (1 task)

**Most risky:** `home-events-and-scripture-tiles_2_1`.

id: home-events-and-scripture-tiles_2_1
title: Render scripture and the two slots on the home page at request time
status: done
acceptance_criteria:
- `src/app/page.tsx` exports `dynamic = "force-dynamic"`. It does not export `revalidate`. It calls `homeEventSlots(events, sundayItems, new Date())` during render. `new Date()` stays in this file.
- “What’s going on” and “Highlighted testimonies” render as [spec.md](./spec.md) those sections. Scripture and service copy come from the home module. Dated lines use the slot `name` and `whenLine`. Service lines use slot `language` then `time`.
- Sermon render stays: `readYoutubePlaylist(sermonPlaylistId)`, `firstPlaylistVideos(..., 5)`. This file does not set `cache: "no-store"`. The reader stays `cache: "force-cache"`.
- `page.test.ts` expects `force-dynamic` and the slot call, and no longer expects `dynamic = "error"`.
files:
- src/app/page.tsx
- src/app/page.test.ts
depends_on:
- home-events-and-scripture-tiles_1_1
- home-events-and-scripture-tiles_1_2

### Wave 3 (1 task)

id: home-events-and-scripture-tiles_3_1
title: Assert home scripture, slots, and grid in Playwright
status: done
acceptance_criteria:
- `e2e/home.spec.ts` no longer expects `Highlight to be published` or a three-column testimony row.
- On `/`, “What’s going on” matches [spec.md](./spec.md) that section. The two event rows equal `homeEventSlots(events, sundayItems, new Date())` computed in the test. Do not hard-code a dated event name.
- Testimony grid matches [spec.md](./spec.md) Highlighted testimonies at `aboveMenu` (801px) and `atMenu` (800px). Praise Reports and the source line stay.
files:
- e2e/home.spec.ts
depends_on:
- home-events-and-scripture-tiles_1_3
- home-events-and-scripture-tiles_2_1

## Not doing

- [spec.md](./spec.md) Unchanged.
- Scripture links and the event fields excluded in [spec.md](./spec.md) Resolved questions.
- A third event row, or a service after two featured rows — [spec.md](./spec.md) “What’s going on”.

## Risks

- `src/app/page.tsx` exports `dynamic = "error"`, and `src/app/page.test.ts` locks that. `new Date()` in that file does not opt `/` into per-request rendering. The export change is `home-events-and-scripture-tiles_2_1`.
- A `new Date()` or `headers()` inside `@/content/events` or `@/lib/event-list` also runs for `src/app/events/feeds/[id]/route.ts` (`dynamic = "force-static"`) and `/events`. Keep the clock in `src/app/page.tsx`.
- `.highlights li` is `display: flex; justify-content: space-between` above 800px. A second child sits beside the title. `home-events-and-scripture-tiles_1_3` stacks the row.
- `e2e/home.spec.ts` and `src/app/globals.test.ts` expect `.stories` at `1.5fr 1fr 1fr` and the first story wider than the other two. Home e2e must compute slots with `new Date()`. `page.clock` does not change the server clock.

## Acceptance criteria

- `make test` covers `home-events-and-scripture-tiles_1_1` through `home-events-and-scripture-tiles_2_1`.
- `make build` finishes with `Build succeeded`.
- Playwright `e2e/home.spec.ts` as in `home-events-and-scripture-tiles_3_1`. No screenshot baseline in this repo. Axe on `/` stays in `e2e/accessibility.spec.ts`.
