# Intent: Error handling model and audit
Author: Udeet Gulati
Status: ready

## Problem
- The [YouTube playlist feed failure fix](../../fixes/youtube-playlist-feed-failure/intent.md) and [ADR 0007](../../adr/0007-youtube-section-failure-isolation.md) isolated one section on one page; no page-level or site-level error model exists.
- `src/app/` has no `error.tsx`, `global-error.tsx`, `not-found.tsx`, or `loading.tsx`. Any uncaught render failure or unknown route shows the framework default page without the shared shell. [ADR 0002 G8](../../adr/0002-public-navigation-and-recovery.md) defines shell behavior only for unpublished navigation destinations; no decision covers unknown routes or render failures.
- `src/lib/youtube-live.ts` returns `null` for network, non-OK status, and parse failures without diagnostics; only aborts propagate. Live status vanishes silently.
- `src/app/page.tsx` and `src/app/watch/page.tsx` duplicate the `YoutubePlaylistReadError` catch and `console.error({ event, playlistId, category, status })` block; no shared module owns the failure-handling or log shape.
- `YoutubePlaylistReadError` is the only typed error. Content and feed invariants in `src/content/*/index.ts`, `src/lib/calendar-feed.ts`, `src/lib/home-event-slots.ts`, `src/lib/youtube-playlist.ts`, and `src/app/events/feeds/[id]/route.ts` throw generic `Error` with message strings.
- Home, Watch, and Events are `force-dynamic`; content invariants inside request-time functions (`src/lib/home-event-slots.ts`, `src/lib/calendar-feed.ts`) execute on visitor requests and fail the page. Module-level guards (`src/app/page.tsx` heading check, `src/content/about/index.ts`) still fail the deploy but also re-run on every server cold start.
- No page states which failures are expected, which are programmer errors, what the visitor sees, or what is logged.

## Proposed outcome
- Step 1: an accepted per-page error model, one entry per row below.

| Route | Target rendering | Failure sources |
| --- | --- | --- |
| `/` | revalidated | Repository content, YouTube playlist feed, current date |
| `/about` | static | Repository content (build) |
| `/contact` | static | Repository content (build) |
| `/events` | revalidated | Repository content, current date |
| `/events/feeds/[id]` | static | Repository content (build); unknown `id` |
| `/give` | static | Repository content (build) |
| `/watch` | revalidated | Repository content, YouTube playlist feeds, YouTube live page and oEmbed |
| Shared shell `src/app/layout.tsx` | all | Uncaught render failure |
| Unknown route | — | None |

- Each model entry records: failure sources; expected versus unexpected classification on the transient/permanent and user/system-actionable axes from `.agents/skills/error-handling-patterns/SKILL.md`; what the visitor sees; fallback or degraded rendering; retry decision; what is logged and with which fields.
- Step 2: audit `src/` against the accepted model. Inventory every `throw`, `catch`, `fetch`, and `null`-on-failure return; classify each as conforming, swallow-all, stringly-typed, misplaced boundary, or missing boundary.
- Step 3: correct the code to the model: typed error hierarchy; one shared failure-handling and structured-logging path for external readers; route-level `error.tsx` and `not-found.tsx` that keep the shared shell; content invariants run at build or revalidation time or become typed operational errors.
- Success criteria:
  - The model is accepted and referenced by the spec before implementation starts.
  - Every route renders its shared shell on unexpected failure and on unknown paths.
  - Every external read failure produces one structured server log entry with route, dependency, category, and status when known.
  - No `catch` in `src/` swallows without a typed condition or a rethrow.
  - No route exports `dynamic = "force-dynamic"`.
  - Regression tests cover each modelled failure path per page.
  - `make build`, `make test`, and `make lint` pass.

## Affected users and systems
- Visitors and members on every public page.
- Rendering mode of `/`, `/events`, and `/watch`; build-time production of `/events/feeds/[id]` and static pages.
- `src/lib/youtube-playlist.ts`, `src/lib/youtube-live.ts`, `src/lib/calendar-feed.ts`, content modules under `src/content/`.
- [ADR 0002](../../adr/0002-public-navigation-and-recovery.md), [ADR 0004](../../adr/0004-youtube-playlist-reading.md), [ADR 0007](../../adr/0007-youtube-section-failure-isolation.md).
- [Watch spec](../../features/watch-page/spec.md) and [YouTube sermon playlist spec](../../features/youtube-sermon-playlist/spec.md) failure sections.

## Constraints
- `.agents/skills/error-handling-patterns/SKILL.md` is the governing pattern source for classification, hierarchy design, boundaries, logging, and anti-pattern detection.
- Stay within [architecture boundaries](../../architecture.md): no backend, no persisted feed copies, no credentials.
- Diagnostics go to Vercel runtime logs through structured `console` calls; no external error tracker.
- No automatic retry toward YouTube; a visitor page reload is the only retry. ADR 0002 and ADR 0007 keep their single-attempt rules.
- Keep ADR 0002 G7 and G8; any change to ADR 0002, 0004, or 0007 goes through a new site-error-model ADR.
- All pages, including Live status on `/watch`, move from `force-dynamic` to static or revalidated rendering; no route uses request-time rendering.
- Live status failure on `/watch` is silent to the visitor and emits one structured log entry.
- Visitor copy for the not-found page and the unexpected-error page is decided in the spec.
- Preserve existing visible content, visual design, date-sensitive event behavior, and successful-path rendering.
- Never show internal error messages to visitors.
- Snapshots and background refresh remain in the [snapshot improvement intent](../../improvements/youtube-playlist-snapshots/intent.md).

## Open questions
- None.
