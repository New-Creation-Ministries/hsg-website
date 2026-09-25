# Intent: Watch page
Author: Udeet Gulati
Status: ready

## Problem

`/watch` is a published shell: the heading is Watch and the body is “This page will be published here.” Home Sermons already links Watch to `/watch`. Visitors cannot find live service status, the named testimonies, or the theme sermon playlists on this site.

## Proposed outcome

- `/watch` is a full public Watch page matching the locked UI (`.impeccable/mocks/decision/watch-locked.png`). Decision: witness-first testimonies; sermons are playlist rows (`.impeccable/mocks/decision/watch-locked.prompt.json`, `.impeccable/mocks/decision/watch-options.json`). Horizontal row structure from `.impeccable/mocks/decision/watch-sermon-rows.png`.
- **Live:** one centered status under the header. When `https://www.youtube.com/@EvangelistRambabuRambo/live` reports a broadcast live now, show its title and thumbnail as a link to that URL. Otherwise the line is plain text `No ongoing service` with no link. No player. Live does not play on `/watch`.
- **Testimonies (cream band, first content):** one active witness at a time — large name, video surface, writeup from the post. Activating the video opens the post externally (does not play on `/watch`). Name switches among:
  - Thangaraj — `https://www.instagram.com/reel/DT-AMm_kewV/`
  - Poorvika — `https://www.instagram.com/reel/DQ__yFACVim/`
  - Creative Miracle — `https://www.instagram.com/reel/DSaHC9JEmiz/`
  - YouTube testimony — `https://www.youtube.com/watch?v=9zmB82CeUj4`
- **Sermons:** theme rows under a dark ground. Lime playlist titles (locked mock); do not use white titles or the `SERMONS` label from `watch-sermon-rows.png`. Each title links to that playlist on YouTube. Each row is that playlist’s videos as ADR 0004 link + thumbnail (no on-page player), at most the Atom feed cap (15); side scroll within a row; next theme is the next row. Playlists:
  - Healing — `https://www.youtube.com/playlist?list=PL4sLZ9xdjDfid3If1uvOqlTz9WvGYTN1A`
  - Live in Health — `https://www.youtube.com/watch?v=ht8-j7mc1qs&list=PLKz6Hr2fQ7Nc`
  - Restoration and Recovery — `https://www.youtube.com/playlist?list=PLTXk7vAHmkA0`
  - Grow in the Word — `https://www.youtube.com/playlist?list=PL5ah6Wbjftr5aLfOd-3F9nSJiG12XRW5f`
  - Conquer Fear — `https://www.youtube.com/playlist?list=PL5ah6Wbjftr4tGpaloXOehqpXB6KwY3zI`
  - Mental Health — `https://www.youtube.com/playlist?list=PLWX7FFgYGzyU`
  - Excellent Life — `https://www.youtube.com/playlist?list=PLC1s9kXkw278`
  - Free sermons — `https://www.youtube.com/watch?v=bsAOKb70lgE&list=PLP2xTHxGd68s`

## Affected users and systems

- Visitors and members on `/watch`. Shared nav Watch; Home Sermons → Watch ([docs/adr/0001-public-pages.md](../../adr/0001-public-pages.md), [docs/features/home-landing-page/spec.md](../home-landing-page/spec.md)).
- Church website ([docs/architecture.md](../../architecture.md)).
- Playlist reading: [docs/adr/0004-youtube-playlist-reading.md](../../adr/0004-youtube-playlist-reading.md). Exceeding the feed cap requires amending ADR 0004 before implementation.
- Separate from [docs/features/youtube-sermon-playlist/](../youtube-sermon-playlist/) (Home Sermons only).

## Constraints

- Follow locked UI and sermon title treatment under Proposed outcome; do not redesign.
- Follow witness-first / playlist-row layout under Proposed outcome.
- Playback and external-open rules under Proposed outcome; sermon rows per ADR 0004.
- Live status timing under Proposed outcome.
- Do not invent testimonies, playlist themes, or channel ids beyond Proposed outcome.
- Keep shared SiteHeader / SiteFooter.

## Open questions

Resolved in [spec.md Resolved questions](./spec.md#resolved-questions).
