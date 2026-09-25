# Plan: error-handling-model-and-audit
Author: Udeet Gulati  Status: ready
Links: [intent](./intent.md) · [spec](./spec.md) · [ADR 0009](../../adr/0009-site-error-model.md)

- Per task: run the `Verify` command, then `make lint`. Repo-wide gates: [Acceptance criteria](#acceptance-criteria). Test evidence per file: spec §Regression verification.
- Outside `id:` and `depends_on:` fields, task ids drop the `error-handling-model-and-audit_` prefix.

## Files that change

| Action | Path | Tasks |
| --- | --- | --- |
| add | `docs/improvements/error-handling-model-and-audit/audit.md` | 1_1, 5_2 |
| add | `src/lib/errors.ts`, `src/lib/errors.test.ts` | 1_2 |
| add | `src/app/not-found.tsx`, `src/app/not-found.test.tsx`, `src/app/error.tsx`, `src/app/error.test.tsx`, `src/app/global-error.tsx`, `src/app/global-error.test.tsx` | 1_3 |
| add | `src/lib/diagnostics.ts`, `src/lib/diagnostics.test.ts`, `src/lib/external-read.ts`, `src/lib/external-read.test.ts`, `src/instrumentation.ts`, `src/instrumentation.test.ts` | 2_1 |
| edit | `src/lib/youtube-playlist.ts`, `src/lib/youtube-playlist.test.ts` | 2_2 |
| edit | `src/app/page.render.test.tsx` | 2_2 (error constructors), 3_2 (slots mock), 4_1 |
| edit | `src/lib/youtube-live.ts`, `src/lib/youtube-live.test.ts` | 2_3 |
| edit | `src/content/events/index.ts`, `src/content/events/events.test.ts`, `src/lib/calendar-feed.ts`, `src/lib/calendar-feed.test.ts`, `src/app/events/feeds/[id]/route.ts`, `src/app/events/feeds/[id]/route.test.ts` | 3_1 |
| edit | `src/lib/home-event-slots.ts`, `src/lib/home-event-slots.test.ts`, `src/content/about/index.ts`, `src/content/about/about.test.ts` | 3_2 |
| edit | `src/app/page.tsx` (3_2 `homeEventSlots` call only, 4_1), `src/app/page.test.ts` (4_1) | 3_2, 4_1 |
| add | `src/lib/site-host.ts`, `src/lib/site-host.test.ts`; edit `src/app/events/page.tsx`, `src/app/events/page.test.ts` | 3_3 |
| edit | `src/app/watch/page.tsx`, `src/app/watch/page.test.ts`, `docs/features/watch-page/spec.md` | 4_2 |
| add | `e2e/errors.spec.ts`; edit `e2e/youtube-feed-failure.spec.ts` | 5_1 |
| add | `src/site-error-model.test.ts` | 5_2 |

## Order of work

Choices fixed by this plan (the spec leaves them open):
- `SiteError.code`: `external_read_failed` for `ExternalReadError` and subclasses; `content_invariant_violated` for `ContentInvariantError`.
- Constructors take one options object: `new ExternalReadError({ dependency, resource, category, message, status?, cause? })`; subclasses omit or fix `dependency` per spec §Error hierarchy; `new ContentInvariantError({ module, rule, message })`.
- `src/lib/youtube-playlist.ts` re-exports `YoutubePlaylistReadError` and `YoutubePlaylistReadFailureCategory` from `src/lib/errors.ts`.
- `logExternalReadFailure` takes `route` from the context and `dependency`, `resource`, `category`, `status` from the error; optional fields are omitted, not `undefined`.
- `readText(url, dependency, signal)` in `src/lib/youtube-live.ts`: the live-page call passes `youtube-live`, the oEmbed call passes `youtube-oembed`.
- `homeEventSlots(events, now)` replaces `homeEventSlots(events, services, now)`; `src/lib/home-event-slots.ts` exports `homeServiceSlots: { miraclesAndHealing; wordFest }` resolved from `@/content/home` at module load.
- Removing `cache: "no-store"` leaves `fetch` at Next's default `auto no cache`: fetched once per `next build` and per regeneration, route stays prerendered (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md`).
- Audit scope extends the spec's first pass with `src/app/layout.tsx`, `src/app/about/page.tsx`, `src/app/contact/page.tsx`, `src/app/give/page.tsx` so every model route has rows.
- Component tests use `renderToStaticMarkup` as in `src/app/page.render.test.tsx`; vitest stays `environment: "node"`.

### Wave 1 (3 parallel)

id: error-handling-model-and-audit_1_1
title: Audit `src/` against the model and write audit.md
status: pending
acceptance_criteria:
- One row per `throw`, `catch`, `fetch`, and `null`-on-failure return in the spec §Audit procedure scope plus the four files added above; columns and classes per spec
- Missing-boundary rows for `src/app/not-found.tsx`, `error.tsx`, `global-error.tsx`, `src/instrumentation.ts`; every non-`conforming` row names the owning task id
- Verify: row count for `throw`/`catch`/`fetch` equals `grep -cE "throw |catch|fetch\(" ` over the scoped files; every row has five filled columns
files:
- docs/improvements/error-handling-model-and-audit/audit.md
depends_on: []

id: error-handling-model-and-audit_1_2
title: Add typed error hierarchy in `src/lib/errors.ts`
status: pending
acceptance_criteria:
- Classes, fields, `isOperational`, `name`, and exported types match spec §Error hierarchy
- Tests: each class sets `name`, `code`, `isOperational`, `cause`, own fields; `instanceof` chain holds; `YoutubePlaylistReadError.dependency === "youtube-playlist"`
- Verify: `npx vitest run src/lib/errors.test.ts`
files:
- src/lib/errors.ts
- src/lib/errors.test.ts
depends_on: []

id: error-handling-model-and-audit_1_3
title: Add `not-found.tsx`, `error.tsx`, `global-error.tsx`
status: pending
acceptance_criteria:
- Per spec §Route boundaries and visitor copy; `error.tsx` and `global-error.tsx` start with `"use client"` and never render `error.digest` or `error.name`
- Tests render each component: heading, sentence, `href="/"`, button text; `<main id="main-content" class="page-width" tabIndex={-1}>` in `not-found` and `error` only; `error.tsx` given `new Error("secret-marker")` outputs no `secret-marker`; `not-found` `metadata.title === "Page not found"`
- Verify: `npx vitest run src/app/not-found.test.tsx src/app/error.test.tsx src/app/global-error.test.tsx`
files:
- src/app/not-found.tsx
- src/app/not-found.test.tsx
- src/app/error.tsx
- src/app/error.test.tsx
- src/app/global-error.tsx
- src/app/global-error.test.tsx
depends_on: []

### Wave 2 (3 parallel)

id: error-handling-model-and-audit_2_1
title: Add `diagnostics.ts`, `readExternal`, and `onRequestError`
status: pending
acceptance_criteria:
- `src/lib/diagnostics.ts` per spec §Logging; `src/lib/external-read.ts` per spec §Shared read boundary; `src/instrumentation.ts` per spec §Logging with the signature in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md`
- Tests: exact object shape per log function; `readExternal` success (no log), `ExternalReadError` (one `warn`), `new Error("x")` and thrown string (rethrow, no `warn`); `onRequestError` with plain `Error` (no `code`/`isOperational`) and with `ContentInvariantError` (`code`, `isOperational: false`)
- Verify: `npx vitest run src/lib/diagnostics.test.ts src/lib/external-read.test.ts src/instrumentation.test.ts`
files:
- src/lib/diagnostics.ts
- src/lib/diagnostics.test.ts
- src/lib/external-read.ts
- src/lib/external-read.test.ts
- src/instrumentation.ts
- src/instrumentation.test.ts
depends_on: [error-handling-model-and-audit_1_2]

id: error-handling-model-and-audit_2_2
title: Retype playlist reader errors; drop `cache: "no-store"`
status: pending
acceptance_criteria:
- `parseFeed`/`parseEntry` throw `YoutubePlaylistReadError` (`invalid-feed`, `resource` = playlist id); rewrapping `catch` around `parseFeed` removed; `asTransportError` sets `resource` and `cause`; `fetch` options contain only `signal`
- Tests: existing cases pass; every rejection `instanceof YoutubePlaylistReadError` with `dependency` and `resource`; `page.render.test.tsx` constructor calls use the options object
- Verify: `npx vitest run src/lib/youtube-playlist.test.ts src/app/page.render.test.tsx`
files:
- src/lib/youtube-playlist.ts
- src/lib/youtube-playlist.test.ts
- src/app/page.render.test.tsx
depends_on: [error-handling-model-and-audit_1_2]

id: error-handling-model-and-audit_2_3
title: Make `readYoutubeLiveBroadcast` throw `YoutubeLiveReadError`
status: pending
acceptance_criteria:
- `readText` returns `string` and throws `YoutubeLiveReadError` with `resource` = URL; `parseOEmbed` throws `invalid-feed` with `dependency: "youtube-oembed"`; outer swallow-all `catch` removed; `fetch` options contain only `signal`; `null` only when the live page lacks `isLiveNow`; tests assert the mapped category per spec §Regression verification row
- Verify: `npx vitest run src/lib/youtube-live.test.ts`
files:
- src/lib/youtube-live.ts
- src/lib/youtube-live.test.ts
depends_on: [error-handling-model-and-audit_1_2]

### Wave 3 (3 parallel)

id: error-handling-model-and-audit_3_1
title: Retype events content and feed invariants to `ContentInvariantError`
status: pending
acceptance_criteria:
- Throw sites become `ContentInvariantError` with `module` and `rule`: `src/content/events/index.ts:67,75,79,85,96`; `src/lib/calendar-feed.ts:49,83,86,172`; `src/app/events/feeds/[id]/route.ts:74,81,84`; `generateStaticParams` order and `assertEventsPublishable(events, new Date())` unchanged
- Each `toThrow()` in the three test files asserts `ContentInvariantError`; one case per throw site not yet covered
- Verify: `npx vitest run src/content/events/events.test.ts src/lib/calendar-feed.test.ts "src/app/events/feeds/[id]/route.test.ts"`
files:
- src/content/events/index.ts
- src/content/events/events.test.ts
- src/lib/calendar-feed.ts
- src/lib/calendar-feed.test.ts
- src/app/events/feeds/[id]/route.ts
- src/app/events/feeds/[id]/route.test.ts
depends_on: [error-handling-model-and-audit_1_2]

id: error-handling-model-and-audit_3_2
title: Resolve Home service slots at module load; retype About invariant
status: pending
acceptance_criteria:
- `homeServiceSlots` resolved at module load, throwing `ContentInvariantError` when a service is missing; `homeEventSlots(events, now)` has no throwing branch; `src/content/about/index.ts:20` throws `ContentInvariantError`
- `src/app/page.tsx` calls `homeEventSlots(events, new Date())`; `page.render.test.tsx` mocks the new signature
- Tests: `vi.resetModules` + mocked `@/content/home` missing "Miracles and Healing Service" → import rejects with `ContentInvariantError`; slot-selection cases unchanged
- Verify: `npx vitest run src/lib/home-event-slots.test.ts src/content/about/about.test.ts src/app/page.render.test.tsx`
files:
- src/lib/home-event-slots.ts
- src/lib/home-event-slots.test.ts
- src/content/about/index.ts
- src/content/about/about.test.ts
- src/app/page.tsx
- src/app/page.render.test.tsx
depends_on: [error-handling-model-and-audit_1_2, error-handling-model-and-audit_2_2]

id: error-handling-model-and-audit_3_3
title: Add `siteHost`; move `/events` to `revalidate = 3600`
status: pending
acceptance_criteria:
- `src/lib/site-host.ts` per spec §Rendering modes; tests use `vi.stubEnv` + `vi.resetModules` + dynamic import for explicit host, production URL, preview `VERCEL_URL`, `localhost:3000`, Vercel-empty throw
- `src/app/events/page.tsx`: `export const revalidate = 3600`; no `dynamic` export; no `next/headers` import; `host={siteHost}` on every `AddToCalendar`
- `events/page.test.ts` asserts `revalidate === 3600`, no `force-dynamic`, no `headers(`; its cross-file assertion that `src/app/page.tsx` is `force-dynamic` is removed
- Verify: `npx vitest run src/lib/site-host.test.ts src/app/events/page.test.ts`
files:
- src/lib/site-host.ts
- src/lib/site-host.test.ts
- src/app/events/page.tsx
- src/app/events/page.test.ts
depends_on: [error-handling-model-and-audit_1_2]

### Wave 4 (2 parallel)

id: error-handling-model-and-audit_4_1
title: Wire `/` to `readExternal` and `revalidate = 3600`
status: pending
acceptance_criteria:
- `export const revalidate = 3600`; no `dynamic` export; heading check throws `ContentInvariantError`; `readSermonListing` uses `readExternal({ route: "/", dependency: "youtube-playlist", resource: sermonPlaylistId }, ...)`; local `try/catch` and `console.error` removed
- `page.render.test.tsx`: failure renders the unavailable state and one `console.warn` `external_read_failed`; success logs nothing; `console.error` never called; non-`ExternalReadError` rejection propagates; `page.test.ts` asserts `revalidate` and no `force-dynamic`
- Verify: `npx vitest run src/app/page.test.ts src/app/page.render.test.tsx`
files:
- src/app/page.tsx
- src/app/page.test.ts
- src/app/page.render.test.tsx
depends_on: [error-handling-model-and-audit_2_1, error-handling-model-and-audit_2_2, error-handling-model-and-audit_3_2]

id: error-handling-model-and-audit_4_2
title: Wire `/watch` to `readExternal` and `revalidate = 300` (most risky)
status: pending
acceptance_criteria:
- `export const revalidate = 300`; no `dynamic` export; `readThemeListing` and the live read use `readExternal` with `route: "/watch"`; local `try/catch` and `console.error` removed
- Live `{ ok: false }` and `{ ok: true, value: null }` render no live section (no `.watch-live`, no copy, no link, as today); `{ ok: true, value }` renders the link as today; `YOUTUBE_LIVE_OFFLINE_COPY` stays unreferenced by the page
- `watch/page.test.ts` rendering cases with mocked readers: one failed row logs one `warn` and omits its videos while other rows render; live failure renders no live section and logs one `warn` with the error's `dependency`; success logs nothing; `revalidate === 300`; no `force-dynamic`; the existing `YOUTUBE_LIVE_OFFLINE_COPY` and `e2e/watch.spec.ts` assertions stay
- `docs/features/watch-page/spec.md` lines 63, 80, 101: the live line is omitted when no broadcast is live or the read fails; failure handling per [ADR 0009](../../adr/0009-site-error-model.md); "On each visit" becomes one read per generation
- Verify: `npx vitest run src/app/watch/page.test.ts`
files:
- src/app/watch/page.tsx
- src/app/watch/page.test.ts
- docs/features/watch-page/spec.md
depends_on: [error-handling-model-and-audit_2_1, error-handling-model-and-audit_2_2, error-handling-model-and-audit_2_3]

### Wave 5 (sequential)

id: error-handling-model-and-audit_5_1
title: Add e2e not-found coverage; update leak assertions
status: pending
acceptance_criteria:
- `e2e/errors.spec.ts`: `/no-such-page` and `/events/feeds/unknown.ics` respond 404 with `h1` "Page not found", main navigation, footer, "Return to Home" link; `/` responds 200; no horizontal scroll at 320px on the not-found page
- `e2e/youtube-feed-failure.spec.ts` leak assertion also excludes `external_read_failed` and `ExternalReadError`
- Verify: `make e2e` and `npx playwright test --config playwright.youtube.config.ts`
files:
- e2e/errors.spec.ts
- e2e/youtube-feed-failure.spec.ts
depends_on: [error-handling-model-and-audit_1_3, error-handling-model-and-audit_3_3, error-handling-model-and-audit_4_1, error-handling-model-and-audit_4_2]

id: error-handling-model-and-audit_5_2
title: Add success-criteria source tests; reconcile audit.md; full verification
status: pending
acceptance_criteria:
- `src/site-error-model.test.ts` scans `src/**` excluding `*.test.*`: no `force-dynamic`; `/`, `/events`, `/watch` export the spec `revalidate` values; no `from "next/headers"`; no `throw new Error(`; no `catch` block lacking `instanceof` or `throw`; no `cache: "no-store"`
- Every `audit.md` Action is applied or the row records why it remains; rows added for files this plan created, all `conforming`
- Manual: with `npx playwright test --config playwright.youtube.config.ts` in mode `404`, the webServer output shows one `external_read_failed` entry per failed read; `/no-such-page` at 1440 and 390 widths shows header, footer, `h1`, sentence, and "Return to Home" in one left-aligned column, no card
- Verify: `npx vitest run src/site-error-model.test.ts`, then the repo-wide gates in [Acceptance criteria](#acceptance-criteria) with outputs pasted in the task report
files:
- src/site-error-model.test.ts
- docs/improvements/error-handling-model-and-audit/audit.md
depends_on: [error-handling-model-and-audit_1_1, error-handling-model-and-audit_1_3, error-handling-model-and-audit_3_1, error-handling-model-and-audit_5_1]

### Not doing

- No `loading.tsx`, retry, snapshots, or external tracker (spec §Route boundaries; ADR 0009 Alternatives).
- No edits to superseded statements in `docs/fixes/youtube-playlist-feed-failure/spec.md` and `docs/features/events-page/plan.md`; spec §Contract precedence is the record. `docs/features/watch-page/spec.md` is reconciled in 4_2.

## Risks

- Interim breakage: after 2_3, `src/app/watch/page.tsx` calls `readYoutubeLiveBroadcast()` unguarded until 4_2, so a live read failure fails Watch production on the working branch. Do not deploy between Wave 2 and Wave 4.
- Verified on `next dev`: a `dynamicParams = false` miss on `src/app/events/feeds/[id]/route.ts` (direct and via the `.ics` rewrite) already returns a 404 HTML document inside the root layout, so `src/app/not-found.tsx` will be used there; 5_1 re-checks.

## Acceptance criteria

- Unit and lint: every task's `Verify` command passes; `make test` green including `src/site-error-model.test.ts`; `make lint` zero warnings.
- Build: `make build` prints "Build succeeded"; route table lists `/`, `/events`, `/watch` as revalidated, `/about`, `/contact`, `/give`, `/events/feeds/[id]` as static, no dynamic route.
- E2E: `make e2e` green including `e2e/errors.spec.ts`; `npx playwright test --config playwright.youtube.config.ts` green, six failure modes still render the unavailable state on `/` with no internal text.
- Missing infrastructure: e2e servers run `next dev`, so revalidation reuse, background regeneration, and `onRequestError` are not exercised end to end; no fixture triggers a render failure (`error.tsx`, `global-error.tsx`) or a live-page failure (`e2e/fixtures/youtube-fetch.mjs` always answers the live URL with 200); no jsdom, so the "Reload page" click is asserted by source, not behaviour.
