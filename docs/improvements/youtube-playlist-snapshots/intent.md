# Intent: YouTube playlist snapshots
Author: Udeet Gulati
Status: draft

## Problem
- The [playlist feed failure fix](../../fixes/youtube-playlist-feed-failure/intent.md) keeps Home available during YouTube feed failures, but its sermon section loses video rows until the feed recovers.
- A retained, validated playlist snapshot could preserve those rows during upstream outages.

## Proposed outcome
- Deliver this improvement after the section-level failure fix.
- Serve the last successfully validated snapshot while refreshing in the background.
- Refresh on demand when the snapshot is at least one hour old; coalesce concurrent attempts and wait at least one hour after a failed attempt before retrying.
- Retain the last successful snapshot without a hard expiry; replace it only after a successful, validated refresh.
- Share snapshots across server instances and retain them across deployments.
- Preserve the fix's playlist-link fallback when no usable snapshot is available, including storage failures.
- Recover automatically on a later visit when upstream service becomes usable again.
- Record failed refreshes and the last successful refresh time in server diagnostics.
- Verify retained snapshots, concurrent refreshes, interrupted attempts, first-load failure, redeployment retention, and recovery.

## Affected users and systems
- Visitors and members opening Home's sermon section.
- Home server rendering, the YouTube playlist reader, and proposed snapshot storage and refresh lifecycle.
- [YouTube sermon playlist spec](../../features/youtube-sermon-playlist/spec.md), [ADR 0004](../../adr/0004-youtube-playlist-reading.md), and [architecture boundaries](../../architecture.md).

## Constraints
- Treat private Vercel Blob as the candidate for future evaluation, not an approved persistence decision.
- Preserve playlist selection, successful video ordering, outbound playback, and request-time event behavior.
- Do not invent video metadata or replace a usable snapshot with invalid refresh data.
- Keep storage credentials and refresh writes server-only; isolate production and nonproduction data.
- Keep snapshot and coordination state consistent under concurrent instances; do not assume cache reads or post-response callbacks provide durable coordination.
- Candidate evidence checked 2026-09-25; revalidate during specification.

| Candidate evidence | Planning implication |
| --- | --- |
| [Blob durability](https://vercel.com/docs/vercel-blob#durability-and-availability) and [private storage](https://vercel.com/docs/vercel-blob/private-storage) | Durable objects with authenticated reads; retaining the store and stable pathname can preserve data across deployments. |
| [Conditional writes](https://vercel.com/docs/vercel-blob#conditional-writes) | ETags guard single-object updates; they do not provide multi-object transactions or a server-enforced lease predicate. |
| [SDK reads](https://vercel.com/docs/vercel-blob/using-blob-sdk#get) and [writes](https://vercel.com/docs/vercel-blob/using-blob-sdk#put) | Evaluate uncached reads, deterministic paths, no-overwrite creation, conditional replacement, and abort support against the installed SDK. |
| [Next.js after](https://nextjs.org/docs/app/api-reference/functions/after) | Post-response work remains bounded by platform duration and is not a durable job queue. |
| [Vercel Runtime Cache](https://vercel.com/docs/caching/runtime-cache) and [Data Cache](https://vercel.com/docs/caching/runtime-cache/data-cache) | Evictable, regional cache storage cannot alone guarantee retained snapshots or global refresh coordination. |

## Open questions
- Can private Vercel Blob meet retention and coordination requirements with bounded workers and host-clock assumptions, including interrupted or ambiguous writes?
- Which store configuration, credentials, SDK version, operating cost, and deployment checks are required?
- What storage-read and upstream deadlines bound visitor latency and background work?
- Which changes to ADR 0004 and the playlist spec are required after the section-level fix is accepted?
