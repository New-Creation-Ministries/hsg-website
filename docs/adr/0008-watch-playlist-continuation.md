# 0008 Watch playlist titles

- Status: accepted.
- Date: 2026-09-25.
- Decision owner: Udeet Gulati.
- Amends: [ADR 0004](0004-youtube-playlist-reading.md), visible series name.

## Context

- [ADR 0004](0004-youtube-playlist-reading.md) shows the feed title and at most the public Atom feed’s entries (15). The playlist link opens the rest.
- A Watch-style surface publishes theme names that differ from YouTube feed titles.

## Decision

- When a slice publishes a content-authored series name beside a playlist id, that name is the visible series title and links to the playlist URL. Otherwise the feed title remains the visible name ([ADR 0004](0004-youtube-playlist-reading.md)).
- A row shows the public Atom feed for that playlist id, in feed order, at most 15 entries ([ADR 0004](0004-youtube-playlist-reading.md)). Request-time consumers follow [ADR 0007](0007-youtube-section-failure-isolation.md).
- Each item stays a new-tab watch link plus `mqdefault` thumbnail; no player, iframe, or YouTube script on the listing ([ADR 0004](0004-youtube-playlist-reading.md)).
- If the feed read fails, keep the title link. Do not empty unrelated page regions.

## Alternatives

| Alternative | Outcome |
| --- | --- |
| Feed title only | Rejected for theme rows that publish a distinct display name. |
| YouTube Data API continuation past 15 | Rejected. The title link opens the rest of the playlist. |

## Consequences

- Slices that only need the Atom prefix keep [ADR 0004](0004-youtube-playlist-reading.md) / [ADR 0007](0007-youtube-section-failure-isolation.md) unchanged.
- Visible theme names and feed titles can differ; content owns the display name when published.
- Watch does not use a YouTube Data API credential.
