# Intent: YouTube playlist feed failure
Author: Udeet Gulati
Status: ready

## Problem
- Home fails to load when the YouTube playlist feed returns HTTP 404.
- On 2026-09-25, playlist `PLWX7FFgYGzyU` returned HTTP 200 with title “Mental health” at its [playlist page](https://www.youtube.com/playlist?list=PLWX7FFgYGzyU), while its [XML feed](https://www.youtube.com/feeds/videos.xml?playlist_id=PLWX7FFgYGzyU) returned HTTP 404.
- YouTube's internal reason for the feed failure remains unknown; the response does not establish that the playlist is missing.
- `src/lib/youtube-playlist.ts` throws on unsuccessful responses; `src/app/page.tsx` awaits the reader without handling failures.
- Commit `7195cde` changed Home to `force-dynamic`, exposing visitor requests to feed failures instead of the deployment-time failure boundary in [ADR 0004](../../adr/0004-youtube-playlist-reading.md).

## Proposed outcome
- Isolate feed errors, timeouts, and unusable data to the sermon section so the rest of Home remains usable.
- On failure, show a working playlist link without video rows or unpublished-content placeholders.
- Recover the listing automatically when the feed becomes usable again.
- Record playlist read failures in server diagnostics.
- Cover feed failures, section fallback, unaffected Home content, and recovery with regression tests.

## Affected users and systems
- Visitors and members opening Home.
- Home server rendering, sermon listing, and the YouTube playlist reader.
- [YouTube sermon playlist spec](../../features/youtube-sermon-playlist/spec.md) and ADR 0004's reading and failure-handling contract.

## Constraints
- Keep playlist ID `PLWX7FFgYGzyU`.
- Preserve date-sensitive event behavior on Home.
- Preserve the existing successful sermon listing and outbound playback behavior.
- Do not invent video metadata.
- Keep this fix limited to section-level failure isolation within [architecture boundaries](../../architecture.md).
- Defer durable snapshots, Vercel Blob, background refresh, and refresh coordination to the [snapshot improvement intent](../../improvements/youtube-playlist-snapshots/intent.md).

## Open questions
- None.
