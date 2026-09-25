# 0008 Watch playlist titles and continuation

- Status: accepted.
- Date: 2026-09-25.
- Decision owner: Udeet Gulati.
- Amends: [ADR 0004](0004-youtube-playlist-reading.md), visible series name and feed-length limit.

## Context

- [ADR 0004](0004-youtube-playlist-reading.md) shows the feed title and at most the public Atom feed’s entries (15). A listing that must show more than the feed provides amends that ADR before using the Data API.
- A Watch-style surface publishes theme names that differ from YouTube feed titles and scrolls horizontally past the Atom prefix.

## Decision

- When a slice publishes a content-authored series name beside a playlist id, that name is the visible series title. Otherwise the feed title remains the visible name ([ADR 0004](0004-youtube-playlist-reading.md)).
- The first batch of videos for a row remains the public Atom feed for that playlist id, in feed order, at most 15 entries ([ADR 0004](0004-youtube-playlist-reading.md)). Request-time consumers follow [ADR 0007](0007-youtube-section-failure-isolation.md).
- Further batches after that prefix use YouTube Data API `playlistItems.list` on a trusted server with a server-only credential. Each item stays a new-tab watch link plus `mqdefault` thumbnail; no player, iframe, or YouTube script on the listing ([ADR 0004](0004-youtube-playlist-reading.md)).
- Continuation order follows the Data API playlist order after the Atom prefix. Do not reorder or dedupe by publish date beyond skipping video ids already shown from the feed.
- If continuation fails, keep the already shown prefix and the playlist link. Do not empty the row or fail unrelated page regions.

## Alternatives

| Alternative | Outcome |
| --- | --- |
| Feed title only | Rejected for theme rows that publish a distinct display name. |
| Atom feed only, playlist URL for the rest | Rejected when the surface must keep scrolling videos on this site past 15. |
| Client-held Data API key | Rejected. The credential stays on the trusted server. |

## Consequences

- Slices that only need the Atom prefix keep [ADR 0004](0004-youtube-playlist-reading.md) / [ADR 0007](0007-youtube-section-failure-isolation.md) unchanged.
- A slice that scrolls past the feed requires a server-side YouTube Data API credential and continuation endpoint.
- Visible theme names and feed titles can differ; content owns the display name when published.
