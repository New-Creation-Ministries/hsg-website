# Audit: error-handling-model-and-audit

Scope: spec §Audit procedure files plus `src/app/layout.tsx`, `src/app/about/page.tsx`, `src/app/contact/page.tsx`, `src/app/give/page.tsx`, and modules this plan created.

Reconciliation (5_2): every wave-1 Action is applied. Current class is `conforming` and Action is `none` for every row. Historical `null-on-failure` transport/parse sites removed in 2_3 are not retained.

| Site | Construct | Current class | Model row | Action |
| --- | --- | --- | --- | --- |
| `src/lib/youtube-live.ts:68` | fetch | conforming | `/watch` · Live page read or oEmbed read | none |
| `src/lib/youtube-live.ts:69` | catch | conforming | `/watch` · Live page read or oEmbed read | none |
| `src/lib/youtube-live.ts:70` | throw | conforming | `/watch` · Live page read or oEmbed read | none |
| `src/lib/youtube-live.ts:74` | throw | conforming | `/watch` · Live page read or oEmbed read | none |
| `src/lib/youtube-live.ts:85` | catch | conforming | `/watch` · Live page read or oEmbed read | none |
| `src/lib/youtube-live.ts:86` | throw | conforming | `/watch` · Live page read or oEmbed read | none |
| `src/lib/youtube-live.ts:111` | catch | conforming | `/watch` · Live page read or oEmbed read | none |
| `src/lib/youtube-live.ts:112` | throw | conforming | `/watch` · Live page read or oEmbed read | none |
| `src/lib/youtube-live.ts:121` | throw | conforming | `/watch` · Live page read or oEmbed read | none |
| `src/lib/youtube-live.ts:132` | throw | conforming | `/watch` · Live page read or oEmbed read | none |
| `src/lib/youtube-live.ts:155` | null-on-failure | conforming | `/watch` · Live page without `isLiveNow` | none |
| `src/lib/youtube-playlist.ts:101` | throw | conforming | `/` · Sermon playlist feed read; `/watch` · Theme playlist feed read | none |
| `src/lib/youtube-playlist.ts:110` | throw | conforming | `/` · Sermon playlist feed read; `/watch` · Theme playlist feed read | none |
| `src/lib/youtube-playlist.ts:126` | throw | conforming | `/` · Sermon playlist feed read; `/watch` · Theme playlist feed read | none |
| `src/lib/youtube-playlist.ts:137` | throw | conforming | `/` · Sermon playlist feed read; `/watch` · Theme playlist feed read | none |
| `src/lib/youtube-playlist.ts:145` | throw | conforming | `/` · Sermon playlist feed read; `/watch` · Theme playlist feed read | none |
| `src/lib/youtube-playlist.ts:154` | throw | conforming | `/` · Sermon playlist feed read; `/watch` · Theme playlist feed read | none |
| `src/lib/youtube-playlist.ts:181` | fetch | conforming | `/` · Sermon playlist feed read; `/watch` · Theme playlist feed read | none |
| `src/lib/youtube-playlist.ts:185` | catch | conforming | `/` · Sermon playlist feed read; `/watch` · Theme playlist feed read | none |
| `src/lib/youtube-playlist.ts:186` | throw | conforming | `/` · Sermon playlist feed read; `/watch` · Theme playlist feed read | none |
| `src/lib/youtube-playlist.ts:194` | throw | conforming | `/` · Sermon playlist feed read; `/watch` · Theme playlist feed read | none |
| `src/lib/youtube-playlist.ts:205` | catch | conforming | `/` · Sermon playlist feed read; `/watch` · Theme playlist feed read | none |
| `src/lib/youtube-playlist.ts:206` | throw | conforming | `/` · Sermon playlist feed read; `/watch` · Theme playlist feed read | none |
| `src/lib/calendar-feed.ts:50` | throw | conforming | `/events/feeds/[id]` · Content invariant or publish-time rule | none |
| `src/lib/calendar-feed.ts:89` | throw | conforming | `/events/feeds/[id]` · Content invariant or publish-time rule | none |
| `src/lib/calendar-feed.ts:98` | throw | conforming | `/events/feeds/[id]` · Content invariant or publish-time rule | none |
| `src/lib/calendar-feed.ts:189` | throw | conforming | `/events/feeds/[id]` · Content invariant or publish-time rule | none |
| `src/lib/home-event-slots.ts:34` | throw | conforming | `/` · Content invariant in `src/lib/home-event-slots.ts` | none |
| `src/lib/home-event-slots.ts:48` | throw | conforming | `/` · Content invariant in `src/lib/home-event-slots.ts` | none |
| `src/app/page.tsx:38` | throw | conforming | `/` · Content invariant in `src/app/page.tsx` | none |
| `src/app/events/feeds/[id]/route.ts:75` | throw | conforming | `/events/feeds/[id]` · Content invariant or publish-time rule | none |
| `src/app/events/feeds/[id]/route.ts:84` | throw | conforming | `/events/feeds/[id]` · Content invariant or publish-time rule | none |
| `src/app/events/feeds/[id]/route.ts:91` | throw | conforming | `/events/feeds/[id]` · Content invariant or publish-time rule | none |
| `src/content/events/index.ts:69` | throw | conforming | `/events` · Content invariant in `src/content/events` | none |
| `src/content/events/index.ts:79` | throw | conforming | `/events` · Content invariant in `src/content/events` | none |
| `src/content/events/index.ts:87` | throw | conforming | `/events` · Content invariant in `src/content/events` | none |
| `src/content/events/index.ts:95` | throw | conforming | `/events` · Content invariant in `src/content/events` | none |
| `src/content/events/index.ts:108` | throw | conforming | `/events` · Content invariant in `src/content/events` | none |
| `src/content/about/index.ts:22` | throw | conforming | `/about` · Content invariant in `src/content/about` | none |
| `src/lib/external-read.ts:24` | catch | conforming | Shared read boundary · `readExternal` | none |
| `src/lib/external-read.ts:29` | throw | conforming | Shared read boundary · `readExternal` | none |
| `src/lib/site-host.ts:14` | throw | conforming | `/events` · Content invariant in `src/lib/site-host.ts` | none |
| `src/lib/errors.ts` | — | conforming | Error hierarchy · `SiteError` subclasses | none |
| `src/lib/diagnostics.ts` | — | conforming | Logging · `external_read_failed` / `render_failed` | none |
| `src/app/not-found.tsx` | — | conforming | Unknown route; `/events/feeds/[id]` · Unknown `id` | none |
| `src/app/error.tsx` | — | conforming | Shared shell · Uncaught failure inside a page under the layout | none |
| `src/app/global-error.tsx` | — | conforming | Shared shell · Uncaught failure inside the root layout | none |
| `src/instrumentation.ts` | — | conforming | Uncaught render failure at regeneration · `render_failed` | none |
