# Spec: Error handling model and audit

Status: ready
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: write-spec, error-handling-patterns, frontend-design, doc-review

## Scope

- Outcomes, constraints, and success criteria: [intent.md](./intent.md).
- Durable decisions: [ADR 0009](../../adr/0009-site-error-model.md).
- Framework references: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`, `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`, `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md`, `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`.

## Failure classes

Handling per class: [ADR 0009 Decision](../../adr/0009-site-error-model.md#decision).

| Class | Axes | Expected |
| --- | --- | --- |
| External read failure (YouTube feed, live page, oEmbed): `http`, `timeout`, `network`, `invalid-feed` | transient / system | yes |
| Content invariant (repository content contradicts a rule) | permanent / system | no |
| Unknown route or unknown feed `id` | permanent / user | yes |
| Uncaught render failure (programmer or framework error) | permanent until redeploy / system | no |
| Generation-time date | not a failure | — |

## Rendering modes

| Route | Current | Target | Change |
| --- | --- | --- | --- |
| `/` | `force-dynamic` | `revalidate = 3600` | Remove `dynamic`; playlist read through the shared boundary |
| `/about`, `/contact`, `/give` | static | static | None |
| `/events` | `force-dynamic` | `revalidate = 3600` | Remove `dynamic`; replace `headers().get("host")` with `siteHost` |
| `/events/feeds/[id]` | `force-static`, `dynamicParams = false` | unchanged | None |
| `/watch` | `force-dynamic` | `revalidate = 300` | Remove `dynamic`; playlist and live reads through the shared boundary |

- No route or component calls `headers()`, `cookies()`, `connection()`, or reads `searchParams`.
- External readers call `fetch` without `cache` or `next.revalidate` options; the route's `revalidate` governs read frequency and response reuse. `cache: "no-store"` is removed from `src/lib/youtube-playlist.ts` and `src/lib/youtube-live.ts`.
- `new Date()` in a page or reader is evaluated once per generation.
- First generation of every route happens in `next build`; a throw there fails the deploy. A throw during background regeneration keeps the last successful response and is logged by `onRequestError`.
- `src/lib/site-host.ts` exports `siteHost`: `NEXT_PUBLIC_SITE_HOST`, else `VERCEL_PROJECT_PRODUCTION_URL` when `VERCEL_ENV` is `production`, else `VERCEL_URL`, else `localhost:3000`. An empty result in a Vercel build throws `ContentInvariantError` at module load.

## Per-page error model

Columns: what fails; class from [Failure classes](#failure-classes); what the visitor sees; degraded rendering; retry; log entry (fields in [Logging](#logging)). Content-invariant rows name the owning module; rules are in [Content invariants](#content-invariants).

| Route | Failure source | Class | Visitor sees | Degraded rendering | Retry | Log |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Content invariant in `src/content/home`, `src/lib/home-event-slots.ts`, `src/app/page.tsx` | Content invariant | Nothing; deploy fails | None | Redeploy | Build output |
| `/` | Sermon playlist feed read | External read | Unavailable state ([fix spec](../../fixes/youtube-playlist-feed-failure/spec.md#sermons-states)) | Video rows omitted | Next regeneration | `external_read_failed`, `dependency: youtube-playlist` |
| `/` | Event slot selection date | Not a failure | Slots as of last generation | — | Next regeneration | None |
| `/` | Uncaught render failure at build | Render failure | Nothing; deploy fails | None | Redeploy | Build output |
| `/` | Uncaught render failure at regeneration | Render failure | Last successful page | Whole previous page | Next regeneration | `render_failed` |
| `/` | Uncaught client render failure | Render failure | Shell + error copy | `src/app/error.tsx` | Reload page | Browser console |
| `/about`, `/contact`, `/give` | Content invariant in `src/content/about`, `src/content/contact`, `src/content/give` | Content invariant | Nothing; deploy fails | None | Redeploy | Build output |
| `/about`, `/contact`, `/give` | Uncaught client render failure | Render failure | Shell + error copy | `src/app/error.tsx` | Reload page | Browser console |
| `/events` | Content invariant in `src/content/events`, `src/content/home`, `src/lib/site-host.ts` | Content invariant | Nothing; deploy fails | None | Redeploy | Build output |
| `/events` | Upcoming-list date | Not a failure | List as of last generation; "No upcoming events." when empty | — | Next regeneration | None |
| `/events` | Uncaught render failure (build, regeneration, client) | Render failure | As `/` rows above | As `/` | As `/` | As `/` |
| `/events/feeds/[id]` | Content invariant or publish-time rule in `src/app/events/feeds/[id]/route.ts`, `src/lib/calendar-feed.ts` | Content invariant | Nothing; deploy fails | None | Redeploy | Build output |
| `/events/feeds/[id]` | Unknown `id` (including `.ics` rewrite) | Unknown route | Not-found shell, HTTP 404 | `src/app/not-found.tsx` | Correct the link | None |
| `/watch` | Content invariant in `src/content/watch` | Content invariant | Nothing; deploy fails | None | Redeploy | Build output |
| `/watch` | Theme playlist feed read (per row) | External read | Per [ADR 0008](../../adr/0008-watch-playlist-continuation.md) | Row videos omitted | Next regeneration | One `external_read_failed` per failed row, `dependency: youtube-playlist` |
| `/watch` | Live page read or oEmbed read | External read | No live section; no copy, no link | Live section omitted | Next regeneration | One `external_read_failed`, `dependency: youtube-live` or `youtube-oembed` |
| `/watch` | Live page without `isLiveNow` | Not a failure | No live section | — | Next regeneration | None |
| `/watch` | Uncaught render failure (build, regeneration, client) | Render failure | As `/` rows above | As `/` | As `/` | As `/` |
| Shared shell `src/app/layout.tsx` | Uncaught failure inside the root layout (`src/components/site-header.tsx`, `src/components/site-footer-gate.tsx`, fonts) | Render failure | Minimal document: site name, error copy, Home link; no header or footer | `src/app/global-error.tsx` | Reload page | `render_failed` |
| Shared shell | Uncaught failure inside a page under the layout | Render failure | Header, footer, error copy | `src/app/error.tsx` | Reload page | `render_failed` |
| Unknown route | Any path without a matching segment | Unknown route | Header, footer, not-found copy, HTTP 404 | `src/app/not-found.tsx` | Use navigation | None |

## Error hierarchy

Module: `src/lib/errors.ts`.

| Class | Extends | Fields | `isOperational` |
| --- | --- | --- | --- |
| `SiteError` | `Error` | `code: string`, `isOperational: boolean`, `cause?: unknown`; `name` set to the constructor name | per subclass |
| `ExternalReadError` | `SiteError` | `dependency: ExternalDependency`, `resource: string`, `category: ExternalReadFailureCategory`, `status?: number` | `true` |
| `YoutubePlaylistReadError` | `ExternalReadError` | `dependency` fixed to `youtube-playlist`; `resource` is the playlist id | `true` |
| `YoutubeLiveReadError` | `ExternalReadError` | `dependency` is `youtube-live` or `youtube-oembed`; `resource` is the fetched URL | `true` |
| `ContentInvariantError` | `SiteError` | `module: string`, `rule: string` | `false` |

- `ExternalDependency = "youtube-playlist" | "youtube-live" | "youtube-oembed"`.
- `ExternalReadFailureCategory = "http" | "timeout" | "network" | "invalid-feed"`; `YoutubePlaylistReadFailureCategory` becomes an alias. Category mapping follows the [fix spec Diagnostics](../../fixes/youtube-playlist-feed-failure/spec.md#diagnostics) for every `ExternalReadError`.
- `parseFeed` and `parseEntry` in `src/lib/youtube-playlist.ts` throw `YoutubePlaylistReadError` with `invalid-feed` directly; the rewrapping `catch` in `readYoutubePlaylist` is removed.
- `readYoutubeLiveBroadcast` returns `YoutubeLiveBroadcast | null` where `null` means no live broadcast, and throws `YoutubeLiveReadError` for every transport, status, or oEmbed parse failure. `readText` no longer returns `null`.
- Every `throw new Error(...)` in `src/` outside tests becomes one of these classes or `notFound()`.
- `onRequestError` in `src/instrumentation.ts` is the only handler for non-`SiteError` failures.

## Shared read boundary

Module: `src/lib/external-read.ts`.

```ts
type ExternalReadContext = { route: string; dependency: ExternalDependency; resource: string }
type ExternalReadResult<T> = { ok: true; value: T } | { ok: false; error: ExternalReadError }
function readExternal<T>(context: ExternalReadContext, read: () => Promise<T>): Promise<ExternalReadResult<T>>
```

- Catches only `ExternalReadError`; logs it once through `logExternalReadFailure`; returns `{ ok: false }`. Rethrows every other value.
- Callers: `readSermonListing` in `src/app/page.tsx`, `readThemeListing` and the live read in `src/app/watch/page.tsx`. The duplicated `catch` and `console.error` blocks are removed.
- Deadline and single attempt per the [fix spec reader contract](../../fixes/youtube-playlist-feed-failure/spec.md#reader-and-failure-boundary) stay inside the readers.

## Logging

Module: `src/lib/diagnostics.ts`. Each function makes exactly one `console` call with one object argument.

| Function | Level | `event` | Fields |
| --- | --- | --- | --- |
| `logExternalReadFailure(context, error)` | `warn` | `external_read_failed` | `route`, `dependency`, `resource`, `category`, `status?`, `code`, `message` |
| `logRenderFailure(input)` | `error` | `render_failed` | `route`, `method`, `routerKind`, `routeType`, `renderSource?`, `digest?`, `code?`, `isOperational?`, `message` |

- `src/instrumentation.ts` exports `onRequestError` and calls `logRenderFailure` with `request.path`, `request.method`, and `context` fields; `code` and `isOperational` when the error is a `SiteError`.
- Body content (feed, HTML, JSON) is never logged; visitor exposure per [ADR 0009](../../adr/0009-site-error-model.md).

## Route boundaries and visitor copy

| File | Kind | Renders | Behaviour |
| --- | --- | --- | --- |
| `src/app/not-found.tsx` | Server component | Inside root layout: header, footer, `<main id="main-content" class="page-width" tabIndex={-1}>` | `metadata.title` "Page not found"; framework returns 404; also used for unmatched URLs and `dynamicParams = false` misses |
| `src/app/error.tsx` | Client component | Inside root layout | React `<title>` "Something went wrong"; ignores `error.message`; "Reload page" button calls `window.location.reload()`; no `retry()` or `reset()` |
| `src/app/global-error.tsx` | Client component | Own `<html lang="en">` and `<body>` with `globals.css` imported | Same copy as `error.tsx` plus site name as plain text; Home link as `<a href="/">` |

| Surface | Heading (`h1`) | Sentence | Actions |
| --- | --- | --- | --- |
| Not found | Page not found | This page isn't here. Use the menu to find what you were looking for, or return to Home. | Link "Return to Home" → `/` |
| Unexpected error | Something went wrong | This page couldn't load. Reload it, or return to Home. | Button "Reload page"; link "Return to Home" → `/` |

- Layout: one left-aligned column, existing `h1` display type and body type, spacing from `.page-width`; no card or illustration.
- Focus and skip link follow [ADR 0002 G5](../../adr/0002-public-navigation-and-recovery.md).
- No `loading.tsx`.

## Content invariants

- Module-load invariants throw `ContentInvariantError` at evaluation of the owning module and depend only on repository content.
- Publish-time rules that read the build clock run only in `generateStaticParams` and throw `ContentInvariantError`: `assertEventsPublishable(events, new Date())` in `src/app/events/feeds/[id]/route.ts`.
- `src/lib/home-event-slots.ts` resolves both service slots at module load (exported validated services) and selects between them per call; `findService` no longer throws inside the date-dependent branches.
- `src/lib/calendar-feed.ts` unknown-id and Sunday-title throws become `ContentInvariantError`; the framework 404 for non-generated params makes them unreachable at request time.
- `src/app/page.tsx` heading check and `src/content/about/index.ts` "New to HSG?" check throw `ContentInvariantError`.
- Sunday window locks in `src/app/events/feeds/[id]/route.ts` throw `ContentInvariantError`.

## Audit procedure

Deliverable: `docs/improvements/error-handling-model-and-audit/audit.md`, one row per site.

| Column | Content |
| --- | --- |
| Site | `path:line` in `src/` excluding `*.test.*` |
| Construct | `throw`, `catch`, `fetch`, `null-on-failure` |
| Current class | conforming, swallow-all, stringly-typed, misplaced boundary, missing boundary |
| Model row | Route and failure source from [Per-page error model](#per-page-error-model) |
| Action | none, retype, move, add boundary, remove |

| Class | Detection rule |
| --- | --- |
| conforming | Throws a `SiteError` subclass or `notFound()`; catches with an `instanceof` condition and rethrows otherwise; `fetch` is inside a reader that maps every outcome to a typed error |
| swallow-all | `catch` without a type condition that returns, logs, or ignores without rethrow; `.catch(() => null)` |
| stringly-typed | `throw new Error(string)` for a classifiable failure; message parsing in a `catch`; category in `message` |
| misplaced boundary | External-read `catch` or logging outside `readExternal`; content invariant inside a request path or a date-dependent branch of module code; `catch` in a reader that converts to `null` |
| missing boundary | `fetch` or a throwing call with no owning boundary on its route; a route without the shared error and not-found files |

Files in scope for the first audit pass: `src/lib/youtube-live.ts`, `src/lib/youtube-playlist.ts`, `src/lib/calendar-feed.ts`, `src/lib/home-event-slots.ts`, `src/app/page.tsx`, `src/app/watch/page.tsx`, `src/app/events/page.tsx`, `src/app/events/feeds/[id]/route.ts`, `src/content/*/index.ts`.

## Regression verification

| Surface | Required evidence |
| --- | --- |
| `src/lib/errors.test.ts` | Each class sets `name`, `code`, `isOperational`, and fields; `instanceof` chain holds |
| `src/lib/external-read.test.ts` | `ExternalReadError` → `{ ok: false }` and exactly one `warn` entry with the field set; other errors rethrow without a log |
| `src/lib/youtube-live.test.ts` | Non-OK live page, rejected fetch, abort, invalid oEmbed JSON, and missing oEmbed fields throw `YoutubeLiveReadError` with the mapped category; page without `isLiveNow` resolves `null` |
| `src/lib/youtube-playlist.test.ts` | Existing cases; every rejection is a `YoutubePlaylistReadError` with `dependency` and `resource` |
| `src/app/page.render.test.tsx`, `src/app/watch/page.test.ts` | Playlist and live failures render the degraded state; one log per failed read; success logs nothing; a non-`ExternalReadError` propagates |
| `src/app/not-found.test.tsx`, `src/app/error.test.tsx`, `src/app/global-error.test.tsx` | Copy, actions, `main` landmark, no `error.message` in output |
| `src/instrumentation.test.ts` | `onRequestError` emits one `render_failed` entry with path, digest, and `SiteError` fields when present |
| Content tests | `homeEventSlots` service validation runs at module load; `ContentInvariantError` for each existing invariant case |
| Route config tests | No `src/app/**` file exports `dynamic = "force-dynamic"`; `/`, `/events`, `/watch` export the specified `revalidate` |
| `e2e/youtube-feed-failure.spec.ts`, new `e2e/errors.spec.ts` | Failure modes at build time render the degraded state; `/no-such-page` and `/events/feeds/unknown.ics` return 404 with header and footer; Home returns 200 |

- Run `make build`, `make test`, and `make lint`.

## Contract precedence and concerns

- [ADR 0009](../../adr/0009-site-error-model.md) governs where it conflicts with [ADR 0002](../../adr/0002-public-navigation-and-recovery.md), [ADR 0004](../../adr/0004-youtube-playlist-reading.md), and [ADR 0007](../../adr/0007-youtube-section-failure-isolation.md).
- Intent constraint "a visitor page reload is the only retry" reads as: no retry inside a page production; a reload after the interval triggers the next production.
- Supersedes in the [playlist feed failure spec](../../fixes/youtube-playlist-feed-failure/spec.md): "Keep `dynamic = "force-dynamic"`", the `console.error` level, and the `youtube_playlist_read_failed` event name.
- Supersedes in the [Watch spec](../../features/watch-page/spec.md#live-status): "On each visit, read that page" becomes one read per generation.
- Supersedes in the [Events plan](../../features/events-page/plan.md): `{host}` from the request header becomes `siteHost`.
- Lag and recovery consequences: [ADR 0009 Consequences](../../adr/0009-site-error-model.md#consequences).
- Preview deployments produce `webcal://` links to the preview host.
