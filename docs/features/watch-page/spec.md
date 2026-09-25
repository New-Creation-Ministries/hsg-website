# Spec: Watch page

Status: ready
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: frontend-design

## Outcome

Replace the `/watch` shell with the locked Watch page ([`.impeccable/mocks/decision/watch-locked.png`](../../../.impeccable/mocks/decision/watch-locked.png)). Live status, witness-first testimonies, and theme sermon rows match [intent.md](./intent.md) Proposed outcome. Decision files: [watch-locked.prompt.json](../../../.impeccable/mocks/decision/watch-locked.prompt.json), [watch-options.json](../../../.impeccable/mocks/decision/watch-options.json).

Shared SiteHeader / SiteFooter stay ([ADR 0001](../../adr/0001-public-pages.md), [ADR 0002](../../adr/0002-public-navigation-and-recovery.md)). Architecture: [docs/architecture.md](../../architecture.md). Separate from Home Sermons ([youtube-sermon-playlist](../youtube-sermon-playlist/)).

## Resolved questions

| # | Question | Resolution |
| --- | --- | --- |
| 1 | Instagram / YouTube testimony title and writeup source; who maintains when the post changes | Manual typed fields under `src/content/watch/` ([ADR 0001](../../adr/0001-public-pages.md)): each testimony has display name, external URL, title, and writeup. Content authors update those fields when the source post changes; publish by deploy. Do not fetch Instagram or YouTube captions at build or request time for this surface. |
| 2 | Do short playlist ids unique to Watch resolve? | Yes (checked 2026-09-25) for `PLKz6Hr2fQ7Nc`, `PLTXk7vAHmkA0`, `PLC1s9kXkw278`, and `PLP2xTHxGd68s`. `PLWX7FFgYGzyU` stays with [youtube-sermon-playlist Resolved Q1](../youtube-sermon-playlist/spec.md#resolved-questions). |

## Delta

| Before | After |
| --- | --- |
| `/watch` shell: `h1` Watch + “This page will be published here.” | Full Watch page per locked mock |
| No `src/content/watch/` | Typed testimonies + playlist theme records under `src/content/watch/` |
| No live status, testimonies, or theme rows | Live line, cream testimony band, lime-titled sermon rows |

Do not redesign layout, palette, or chrome; point at the locked mock.

## Content

### Testimonies

Fixed set and order from [intent.md](./intent.md) Proposed outcome. Do not invent additional witnesses.

Each record: `name`, `url`, `title`, `writeup`. Title and writeup are adapted from the current source post by content authors; omit hashtags, phone lists, and privacy asides unless essential. Exact shipped strings live only in `src/content/watch/`.

### Sermon playlists

Display names and playlist ids from [intent.md](./intent.md) Proposed outcome (ids from the published playlist URLs). Content stores those display names and ids only. Content owns the visible series name ([ADR 0008](../../adr/0008-watch-playlist-continuation.md)). Video titles, ids, and thumbnails come from the Atom reader ([ADR 0004](../../adr/0004-youtube-playlist-reading.md)).

### Live

Fixed URL and label: [intent.md](./intent.md) Proposed outcome Live.

## Page

- Path: `/watch`. Title: `Watch | Holy Spirit Generation` (root template).
- Composition: locked mock — SiteHeader, centered live status line, cream testimony band, then dark sermon rows.
- Skip link → `#main-content`. Visible page heading is the active testimony name (Oswald uppercase), not a shell `h1` “Watch.”
- Current nav item: Watch ([ADR 0002](../../adr/0002-public-navigation-and-recovery.md) G1).
- Tokens: Ink, Band, Band ink, Acid, Cobalt from [Home spec](../home-landing-page/spec.md) (values match the locked mock). Visual direction reference: [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md). Do not invent a second palette.
- Type: Oswald uppercase for testimony name and lime playlist titles; DM Sans for body, status, writeup, and name switches. App font pipeline.
- Narrow viewports: stack testimony name above the video surface; name switches wrap; sermon rows remain horizontal scroll. All regions remain visible.
- No on-page Instagram or YouTube player, iframe, or embed script for live, testimonies, or sermons.
- External http(s) links: `target="_blank"` and `rel="noopener noreferrer"` ([ADR 0002](../../adr/0002-public-navigation-and-recovery.md) G7).
- Motion: no entrance kit. Horizontal row scroll is the interaction. Respect `prefers-reduced-motion` for any non-essential motion beyond scroll.

```
[logo]                         Home  About  Events  Watch  Contact Us  Give

              No ongoing service   (or live title + thumbnail link)

THANGARAJ                      [ cobalt video surface ]
                               writeup
Thangaraj | Poorvika | Creative Miracle | YouTube testimony

HEALING
[thumb] [thumb] [thumb] …   → horizontal scroll, at most 15

LIVE IN HEALTH
…
```

## Live status

- One centered status linking to `https://www.youtube.com/@EvangelistRambabuRambo/live` (G7).
- On each visit, read that page. Show the broadcast title and thumbnail only when it includes `liveBroadcastDetails.isLiveNow`. A finished video on the Live tab is not live.
- Otherwise, and when the live read fails, the line is plain text `No ongoing service` with no link. No player. Live does not play on `/watch`.
- A failed live read does not block testimonies or sermon rows.

## Testimonies UI

- One active witness at a time: large name, cobalt video surface with play affordance, writeup under the surface.
- Activating the video surface opens that testimony’s `url` externally (G7). It does not play on `/watch`.
- Name switches list all four names; the active name uses Acid; others use Band ink. Switching changes name, surface target, title/writeup without navigation.
- Default active: Thangaraj (first in the intent list).

## Sermon rows

- One row per playlist, in [intent.md](./intent.md) Proposed outcome order, on the ink ground.
- Row title: content display name, Acid, Oswald uppercase, linking to that playlist on YouTube (G7) ([ADR 0008](../../adr/0008-watch-playlist-continuation.md)).
- Each video: ADR 0004 link + `mqdefault` thumbnail (no on-page player). Accessible name is the video title; image `alt` empty; `referrerpolicy="no-referrer"`.
- Videos: public Atom feed for that playlist, at most 15, feed order ([ADR 0004](../../adr/0004-youtube-playlist-reading.md)). Read at request time with [ADR 0007](../../adr/0007-youtube-section-failure-isolation.md) isolation per row.
- A failed row keeps its title link without video thumbnails; other rows still render ([ADR 0007](../../adr/0007-youtube-section-failure-isolation.md)).

## Acceptance

- `/watch` does not show the shell sentence.
- While a broadcast is live now, the line shows its title and thumbnail and links to `https://www.youtube.com/@EvangelistRambabuRambo/live`. Otherwise the line is `No ongoing service` with no link.
- Four testimonies match the intent URLs; title and writeup come from `src/content/watch/`; activating the surface opens the post externally; switches change the active witness.
- Eight sermon rows use the intent display names in Acid; each title links to its playlist; videos are Atom-feed link+thumbnail rows, at most 15.
- No Instagram/YouTube iframe or player script on the page.
- Shared header/footer; Watch is the current nav item.
- Layout matches the locked mock except shared header/footer production chrome and the narrow stack rules above.

## Concerns

| Topic | Issue |
| --- | --- |
| Visual direction vs ADR 0003 | [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md) is Home’s contract. Watch follows the locked mock and reuses matching Home tokens; it does not reopen ADR 0003. |
| frontend-design vs locked mock | frontend-design flags near-black + acid-green as a generic cluster. The accepted mock uses that look; the brief wins — do not redesign. |
| Playlists longer than 15 | The row stops at the Atom cap. The title link opens the full playlist on YouTube. |
| Display name vs feed title | Watch applies [ADR 0008](../../adr/0008-watch-playlist-continuation.md) content-authored series names. |
| Testimony string authorship | Exact title/writeup strings are not fixed in this spec; they are authored in `src/content/watch/` from the source posts before ship. |
