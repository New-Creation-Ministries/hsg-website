# Spec: YouTube playlist feed failure

Status: ready
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: write-spec, frontend-design, doc-review

## Scope

- Outcomes, constraints, and deferred work: [accepted intent](./intent.md).
- Read lifecycle and failure boundary: accepted [ADR 0007](../../adr/0007-youtube-section-failure-isolation.md).

## Reader and failure boundary

| Responsibility | Contract |
| --- | --- |
| `src/lib/youtube-playlist.ts` | Own transport and parsing; retain the existing playlist return shape and rejection interface. |
| Request policy | Implement ADR 0007 with `cache: "no-store"`; one attempt per Home render, without retries. |
| Deadline | Abort after 3,000 ms from request start; the same deadline covers response headers and body consumption. Release timers on every outcome. |
| Validation | Retain rejection of non-feed content, missing/blank playlist title, no entries, and entries missing/blank video IDs or titles; parser exceptions also count as read failures. |
| `src/app/page.tsx` | Own the section recovery boundary around playlist reading and selection; convert rejection into explicit unavailable state. |

- Keep `dynamic = "force-dynamic"` and `homeEventSlots(..., new Date())`.
- Home may wait for the bounded read before responding; progressive streaming is outside this fix.
- Framework behavior reference: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md`.

## Sermons states

| State | Visible result |
| --- | --- |
| Available | Existing scripture panel and up to five video rows; existing thumbnails, full titles, feed order, and outbound video playback. |
| Unavailable | Existing Sermons heading, Watch link to `/watch`, and scripture panel; replace video rows with “Sermons are temporarily unavailable here.”, the playlist placeholder thumbnail, and “Listen to the word on Youtube”. |

- Fallback link: `https://www.youtube.com/playlist?list=PLWX7FFgYGzyU`, derived from the configured playlist ID without relying on fetched metadata.
- Open the fallback link in a new tab with `rel="noopener noreferrer"`, following [ADR 0002](../../adr/0002-public-navigation-and-recovery.md).
- Keep existing section typography, spacing, narrow-screen stacking, and visible keyboard focus; wrap the message and link without introducing cards or a new visual treatment.
- Render no video rows, fabricated series title, unpublished-content placeholder, technical error, or retry control in unavailable state.
- Keep hero, highlights and date-sensitive event slots, testimonies, service information, navigation, and footer usable; playlist failures must not produce a Home error page or HTTP 5xx.

## Diagnostics

- Emit ADR 0007's failure diagnostic exactly once per failed attempt at the Home boundary.
- Include a stable event name, playlist ID, failure category (`http`, `timeout`, `network`, or `invalid-feed`), and HTTP status when available.
- Treat body-read transport failures as `network`; parsing/validation failures as `invalid-feed`.
- Do not send diagnostics to the browser or log feed bodies.

## Regression verification

| Surface | Required evidence |
| --- | --- |
| Reader tests in `src/lib/youtube-playlist.test.ts` | Valid fixture preserves metadata/order; HTTP 404 and 500, rejected fetch, rejected body read, invalid-feed cases, and parser exceptions reject. |
| Deadline tests | Stalled headers and stalled body each abort at the shared 3,000 ms deadline; successful completion clears the deadline. Use deterministic timers and abort-aware doubles. |
| Home rendering tests | Reader success yields first five rows; read failures yield the fallback link and no video rows while unrelated Home content and date-sensitive event selection remain correct. Test rendered output, not only source text. |
| Recovery and logs | Failed render followed by valid render restores rows; exactly one diagnostic per failed read and none for success. |
| Browser verification | Visit Home with server-side controlled feed success/failure at wide and narrow viewports; fallback is keyboard reachable, other navigation remains usable, and Home returns HTTP 200. Browser-only request interception cannot mock the server fetch. |

- Automated tests use fixtures and do not call live YouTube.
- Run `make build`, `make test`, and `make lint` after implementation; require “Build succeeded”, all tests passing, and zero lint warnings.

## Contract precedence and concerns

- ADR 0007 governs Home's read lifecycle and failure handling in place of the conflicting requirements in [playlist spec](../../features/youtube-sermon-playlist/spec.md).
- **Sermons states** supersedes that spec's four-video, series-title/channel layout contract for Home; the selected layout matches `src/app/page.test.ts` and `src/content/home/home.test.ts`.
- A fallback link provides a direct route to YouTube; this site cannot guarantee the external playlist page's availability.
- Unresolved decisions: none.
