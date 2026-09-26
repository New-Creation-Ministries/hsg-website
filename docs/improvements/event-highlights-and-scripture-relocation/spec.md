# Spec: Event highlights and scripture relocation

Status: approved
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: frontend-design

## Outcome

Home “What’s going on” keeps Acts 2:46 and its Events section link; event slots go; two Instagram event highlights take their place, using the Watch Featured Testimonies row pattern without writeup or name switches. Home “Highlighted testimonies” is removed. Hebrews 2:4 moves to `/watch` as a horizontal block before Featured Testimonies items. “New to HSG?” uses the former Highlighted testimonies band background. About drops the family-residence sentence in [intent.md](./intent.md) Proposed outcome.

Verse wording and scripture non-linking: [home-events-and-scripture-tiles](../home-events-and-scripture-tiles/intent.md). Watch external-open / no on-page play: [watch-page](../../features/watch-page/intent.md) Proposed outcome → Testimonies. Visual direction: [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md). Event listing: [ADR 0005](../../adr/0005-event-records.md) unchanged. No new ADR.

This supersedes the Home Highlighted testimonies 2×2 and the What’s going on event-tile feed from [home-events-and-scripture-tiles](../home-events-and-scripture-tiles/spec.md).

## Delta

| Surface | Before | After |
| --- | --- | --- |
| `/` What’s going on | Scripture + two `homeEventSlots` event rows | Scripture + two event highlights; Events link kept |
| `/` Highlighted testimonies | 2×2 scripture + three stories + RWO source note | Section removed |
| `/` New to HSG? | Ink home-section ground | Band background previously used by Highlighted testimonies (`.testimony-section` / `--band`) |
| `/` section order | What’s going on → Highlighted testimonies → New to HSG? → Sermons | What’s going on → New to HSG? → Sermons |
| `/watch` Featured Testimonies | Heading then testimony items | Heading → Hebrews 2:4 horizontal block → items |
| `/about` Gospel to the Nations | Includes the family-residence sentence in [intent.md](./intent.md) | That sentence removed; other founder copy unchanged |

## Home — What’s going on

- Heading and `more` (`Events` → `/events`) stay.
- First row: Acts 2:46 (AMP) scripture tile — citation title, verse under it, same ruled-row / scripture-tile treatment as today. Copy: [home-events-and-scripture-tiles](../home-events-and-scripture-tiles/intent.md). No `href`.
- Do not render `homeEventSlots` / upcoming event rows in this section.
- Then the two Initial highlights from [intent.md](./intent.md) Proposed outcome, in that order.

### Event highlight UI

Reuse Watch Featured Testimonies presentation (`src/components/watch-testimonies.tsx`, [watch-page Testimonies UI](../../features/watch-page/spec.md#testimonies-ui)) for surface, play affordance, external-open, and no on-page player.

Home deltas only:

- Title only beside/under the surface (no name/writeup copy block).
- No witness name-switcher.
- Restyle for the What’s going on ink ground with Home tokens; do not wrap this section in the cream testimony band.

### Highlight content

Each highlight record: `title`, `url`, `thumbnailUrl`. Titles and URLs from [intent.md](./intent.md) Initial highlights. `thumbnailUrl` is content-authored from that reel and published by deploy. Do not fetch Instagram media at build or request time.

## Home — remove Highlighted testimonies

- Delete the section: heading, Hebrews cell, three story tiles, and “Stories adapted from Rambo World Outreach.”
- Do not relocate those three stories elsewhere in this task.

## Home — New to HSG?

- Layout, intro, service records, Know More → `/contact`, and sunday source note stay ([Home spec](../../features/home-landing-page/spec.md)).
- Apply the background (and on-band text/link/rule token treatment) previously used by Highlighted testimonies / `.testimony-section` (`--band`, `--band-ink`, `--band-link`).

## Watch — Hebrews 2:4

- Inside the Featured Testimonies cream band, after the “Featured Testimonies” heading and before the testimony item list.
- Horizontal full-width block: citation `Hebrews 2:4 (KJV)`; verse copy from [home-events-and-scripture-tiles](../home-events-and-scripture-tiles/intent.md). Scripture tiles do not link ([home-events-and-scripture-tiles](../home-events-and-scripture-tiles/intent.md) Constraints).
- Not a `WatchTestimony` / not in the testimonies array.
- Existing four testimony items, switches, surfaces, and writeups stay ([watch-page](../../features/watch-page/spec.md)).

## About

- In Gospel to the Nations copy (`src/content/about/`), remove only the family-residence sentence in [intent.md](./intent.md) Proposed outcome.
- Leave the open-air / 89 nations paragraph and every other scene unchanged.

## Unchanged

- Hero, Sermons, nav, footer ([Home spec](../../features/home-landing-page/spec.md)).
- `/events` listing and calendar behavior ([ADR 0005](../../adr/0005-event-records.md)).
- Watch live status and sermon rows.
- Shared header/footer ([ADR 0001](../../adr/0001-public-pages.md), [ADR 0002](../../adr/0002-public-navigation-and-recovery.md)).

## Acceptance

- What’s going on matches [Home — What’s going on](#home--whats-going-on).
- Highlighted testimonies absent per [Home — remove Highlighted testimonies](#home--remove-highlighted-testimonies).
- New to HSG? matches [Home — New to HSG?](#home--new-to-hsg).
- Watch Hebrews placement matches [Watch — Hebrews 2:4](#watch--hebrews-24).
- About matches [About](#about).

## Concerns

| Topic | Issue |
| --- | --- |
| Home / Watch docs drift | [Home spec](../../features/home-landing-page/spec.md), [home-events-and-scripture-tiles](../home-events-and-scripture-tiles/spec.md), and [About spec](../../features/about-page/spec.md) nations source line still describe the pre-change layouts. |
| Thumbnail assets | Reel posters must be captured into the repo before ship; broken or missing `thumbnailUrl` leaves an empty cobalt surface. |
| New to HSG? contrast | Moving Band onto the visit section requires Acid/Mist/time colors to follow on-band tokens so AA contrast holds. |
