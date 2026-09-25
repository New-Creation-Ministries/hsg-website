# Plan: watch-page
Author: Udeet Gulati
Status: approved
Shipped follow-up: fixed live URL, Atom rows capped at 15, playlist link on the title. No `YOUTUBE_DATA_API_KEY`. See [spec](./spec.md) and [ADR 0008](../../adr/0008-watch-playlist-continuation.md).
Links: [intent](./intent.md) · [spec](./spec.md)

Skills: frontend-design, playwright. ADRs: [0001](../../adr/0001-public-pages.md), [0002](../../adr/0002-public-navigation-and-recovery.md), [0004](../../adr/0004-youtube-playlist-reading.md), [0007](../../adr/0007-youtube-section-failure-isolation.md), [0008](../../adr/0008-watch-playlist-continuation.md). Visual lock: [watch-locked.png](../../../.impeccable/mocks/decision/watch-locked.png). Do not reopen [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md).

## Files that change

- Add `src/content/watch/index.ts` — testimonies + playlist theme records per [spec Content](./spec.md#content) — `watch-page_1_1`
- Add `src/content/watch/watch.test.ts` — lock names, URLs, playlist ids/order; require title/writeup present — `watch-page_1_1`
- Add `src/lib/youtube-live.ts` — request-time channel live check via Data API — `watch-page_1_2`
- Add `src/lib/youtube-live.test.ts` — live / offline / failure → offline copy — `watch-page_1_2`
- Add `src/lib/youtube-playlist-continuation.ts` — `playlistItems.list` after Atom prefix — `watch-page_1_3`
- Add `src/lib/youtube-playlist-continuation.test.ts` — order, skip feed ids, failure keeps prefix — `watch-page_1_3`
- Add `src/app/api/watch/playlist-continuation/route.ts` — trusted-server continuation endpoint — `watch-page_1_3`
- Edit `src/app/watch/page.tsx` — replace shell; live line; testimony band; eight Atom rows — `watch-page_2_1`
- Add `src/components/watch-testimonies.tsx` (client) — name switches; external open on surface — `watch-page_2_1`
- Add `src/components/watch-sermon-row.tsx` (client) — horizontal scroll; load more via continuation — `watch-page_2_1`
- Edit `src/app/globals.css` — scoped Watch layout/tokens reuse; no unscoped chrome changes — `watch-page_2_1`
- Add `src/app/watch/page.test.ts` — no shell; title Watch; main-content; no iframe/player script — `watch-page_2_1`
- Add `e2e/watch.spec.ts` — published Watch checks — `watch-page_3_1`
- Edit `e2e/navigation.spec.ts` — `/watch` leaves the shell loop like About/Give — `watch-page_3_1`
- Edit `e2e/fixtures/youtube-fetch.mjs` and/or add Data API fixture preload — stub live + continuation in Playwright — `watch-page_3_1`
- Edit `e2e/accessibility.spec.ts` if Watch needs the same contrast exception pattern as About — `watch-page_3_1`
- Edit `src/content/watch/index.ts` — testimony thumbnail URL per record — `watch-page_4_1`
- Edit `src/content/watch/watch.test.ts` — lock thumbnail URLs — `watch-page_4_1`
- Edit `src/components/watch-testimonies.tsx` — thumbnail on the video surface, play affordance on top — `watch-page_4_1`
- Edit `src/app/globals.css` — surface image, cobalt fallback — `watch-page_4_1`
- Edit `src/app/watch/page.test.ts` — surface image, no iframe — `watch-page_4_1`
- Edit `e2e/watch.spec.ts` — thumbnail swaps with the active witness — `watch-page_4_1`

Server-only env: `YOUTUBE_DATA_API_KEY` ([spec Concerns](./spec.md#concerns)). Document in the reader tasks; do not commit the key.

## Order of work

Wave 2 depends on content, live reader, and continuation. Wave 3 depends on the published page. Wave 4 depends on the published Watch tests.

### Wave 1 (3 parallel)

id: watch-page_1_1
title: Add typed watch content under src/content/watch
status: done
acceptance_criteria:
- Exports testimonies + playlist themes per [spec Content](./spec.md#content) (order/URLs from [intent Proposed outcome](./intent.md#proposed-outcome)).
- `watch.test.ts` fails if order, names, URLs, playlist ids drift, or title/writeup is empty.
files:
- src/content/watch/index.ts
- src/content/watch/watch.test.ts
depends_on: []

id: watch-page_1_2
title: Add request-time YouTube live status reader
status: done
acceptance_criteria:
- Implements [spec Live status](./spec.md#live-status); channel and offline copy from [intent Proposed outcome](./intent.md#proposed-outcome).
- Credential stays server-side ([spec Concerns](./spec.md#concerns)); missing key → offline.
- Unit tests: live, offline, failure → offline.
files:
- src/lib/youtube-live.ts
- src/lib/youtube-live.test.ts
depends_on: []

id: watch-page_1_3
title: Add playlist continuation reader and route
status: done
acceptance_criteria:
- Implements [ADR 0008](../../adr/0008-watch-playlist-continuation.md) Decision.
- Route rejects playlist ids not in Watch content; credential stays server-side.
- Unit tests: skip-prefix ids, order, failure.
files:
- src/lib/youtube-playlist-continuation.ts
- src/lib/youtube-playlist-continuation.test.ts
- src/app/api/watch/playlist-continuation/route.ts
depends_on: []

### Wave 2 (1 task)

**Most risky:** `watch-page_2_1` (details under Risks).

id: watch-page_2_1
title: Replace /watch shell with locked Watch page
status: done
acceptance_criteria:
- Page matches [spec Page](./spec.md#page), [Live status](./spec.md#live-status), [Testimonies UI](./spec.md#testimonies-ui), [Sermon rows](./spec.md#sermon-rows), and [Acceptance](./spec.md#acceptance).
- `force-dynamic` so live and Atom reads run per visit; per-row isolation per [ADR 0007](../../adr/0007-youtube-section-failure-isolation.md).
- CSS scoped so Home/About/Events/Give unchanged.
- `page.test.ts` asserts metadata title `Watch`, `#main-content`, no shell sentence, no iframe/youtube embed script, G7 on external http(s) links.
files:
- src/app/watch/page.tsx
- src/components/watch-testimonies.tsx
- src/components/watch-sermon-row.tsx
- src/app/globals.css
- src/app/watch/page.test.ts
depends_on:
- watch-page_1_1
- watch-page_1_2
- watch-page_1_3

### Wave 3 (1 task)

id: watch-page_3_1
title: Cover published /watch in Playwright
status: done
acceptance_criteria:
- `e2e/navigation.spec.ts` treats `/watch` like `/about` and `/give`: title `Watch | Holy Spirit Generation`, no shell sentence; heading is the default testimony name (Thangaraj), not “Watch”; Watch stays `aria-current="page"`.
- `e2e/watch.spec.ts` covers [spec Acceptance](./spec.md#acceptance): offline live copy (fixture), four switches + external surface, eight Acid titles, Atom thumbs, scroll load-more past prefix, no iframe/player, narrow stack shows all regions.
- Fixture preload stubs Data API live + continuation without real quota; existing Atom feed fixture still works for Home.
- `make e2e` green including the new/updated specs; axe pass or documented contrast exception only if matching Home/About pattern.
files:
- e2e/watch.spec.ts
- e2e/navigation.spec.ts
- e2e/fixtures/youtube-fetch.mjs
- e2e/accessibility.spec.ts
depends_on:
- watch-page_2_1

### Wave 4 (1 task)

id: watch-page_4_1
title: Show each testimony's source thumbnail on the video surface
status: done
acceptance_criteria:
- The testimony surface shows that witness's thumbnail with the play affordance on top. Activating it still opens the testimony `url` externally. No iframe, embed, or on-page player.
- The YouTube testimony uses the thumbnail for video id `9zmB82CeUj4` (`https://i.ytimg.com/vi/9zmB82CeUj4/hqdefault.jpg`). No Data API call.
- Each Instagram testimony uses a content-authored image URL on its record in `src/content/watch/`. Do not fetch Instagram at build or request time.
- Switching witnesses swaps the thumbnail with the name, writeup, and link. A missing image keeps the cobalt surface.
- `watch.test.ts` fails if a thumbnail URL is empty or the YouTube thumbnail id drifts. `e2e/watch.spec.ts` sees the active thumbnail and a different one after a switch.
files:
- src/content/watch/index.ts
- src/content/watch/watch.test.ts
- src/components/watch-testimonies.tsx
- src/app/globals.css
- src/app/watch/page.test.ts
- e2e/watch.spec.ts
depends_on:
- watch-page_3_1

### Not doing

- Scope exclusions in [intent Constraints](./intent.md#constraints) and [spec Concerns](./spec.md#concerns).
- Home Sermons changes ([youtube-sermon-playlist](../youtube-sermon-playlist/)); shared SiteHeader/SiteFooter module redesign; on-page Instagram/YouTube playback.

## Risks

- `e2e/navigation.spec.ts` still expects `/watch` as a shell (`h1` Watch + shell sentence) until wave 3; shipping wave 2 without updating that loop fails CI.
- Eight parallel Atom reads plus live check on every visit can amplify YouTube latency; isolation must follow Home’s `YoutubePlaylistReadError` boundary so one bad playlist does not blank the page.
- Unscoped Watch CSS can restyle Home testimony/sermon regions that already use Band/Acid/Ink.
- Missing or invalid `YOUTUBE_DATA_API_KEY` in deploy must degrade to offline live copy and Atom-only rows; without that, preview looks “broken live” while content is fine.
- Extending `e2e/fixtures/youtube-fetch.mjs` for Data API calls can break Home’s feed-failure suite if interception is too broad.

## Acceptance criteria

| Check | Command or route | Pass |
| --- | --- | --- |
| Unit | `make test` | watch content, live, continuation, and `page.test.ts` green |
| Build | `make build` | Ends with “Build succeeded” |
| Lint | `make lint` | Zero warnings |
| Browser | `make e2e` | Full suite green, including `e2e/watch.spec.ts` and updated navigation |
| Visual | `/watch` | Matches [spec Acceptance](./spec.md#acceptance) against watch-locked.png |
| Testimony thumbnail | `/watch` | Active surface shows that witness's thumbnail; switch changes it; click still leaves the site |
| Missing infra | — | No screenshot baseline; mock PNG is visual reference only. No committed YouTube Data API key; deploy/preview must set `YOUTUBE_DATA_API_KEY`. Playwright needs Data API stubs (wave 3) beyond today’s Atom-only preload |

Human review of the draft plan. Deployed preview for visual sign-off against watch-locked.png.
