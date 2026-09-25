# Plan: youtube-playlist-feed-failure
Author: Udeet Gulati
Status: ready
Links: [intent](./intent.md) · [spec](./spec.md)

## Files that change

- Edit `src/lib/youtube-playlist.ts` — `youtube-playlist-feed-failure_1_1`.
- Edit `src/lib/youtube-playlist.test.ts` — `youtube-playlist-feed-failure_1_1`.
- Add `e2e/fixtures/youtube-feed.xml` — `youtube-playlist-feed-failure_1_2`.
- Add `e2e/fixtures/youtube-fetch.mjs` — `youtube-playlist-feed-failure_1_2`.
- Edit `playwright.config.ts` — `youtube-playlist-feed-failure_1_2`.
- Add `playwright.youtube.config.ts` — `youtube-playlist-feed-failure_1_2`.
- Edit `src/app/page.tsx` — `youtube-playlist-feed-failure_2_1`.
- Edit `src/content/home/index.ts` — `youtube-playlist-feed-failure_2_1`.
- Edit `src/app/globals.css` — `youtube-playlist-feed-failure_2_1`.
- Add `src/app/page.render.test.tsx` — `youtube-playlist-feed-failure_2_1`.
- Add `e2e/youtube-feed-failure.spec.ts` — `youtube-playlist-feed-failure_3_1`.

## Order of work

### Wave 1 (2 parallel)

id: youtube-playlist-feed-failure_1_1
title: Bound playlist reads and expose classified failures
status: done
acceptance_criteria:
- Implement [Reader and failure boundary](./spec.md#reader-and-failure-boundary) inside `readYoutubePlaylist`; preserve its signature and resolved shape.
- Export a typed read error carrying `category` and optional `status` for the Home diagnostic; classify errors at transport, body consumption, and parsing boundaries using [Diagnostics](./spec.md#diagnostics).
- Run the spec's reader and deadline cases in `src/lib/youtube-playlist.test.ts`; assert request options, exactly one fetch, categories, HTTP status, and timer cleanup on success and every rejection path.
- Advance deterministic timers through a headers delay followed by a body delay to prove the body does not receive a fresh deadline; restore timers and globals after each test.
files:
- src/lib/youtube-playlist.ts
- src/lib/youtube-playlist.test.ts
depends_on: []

id: youtube-playlist-feed-failure_1_2
title: Add deterministic server feed fixtures for browser testing
status: done
acceptance_criteria:
- Add a valid six-entry XML fixture with distinguishable titles and ordering.
- Preload `e2e/fixtures/youtube-fetch.mjs` into the Next.js test server using Node's `--import`; intercept only the configured YouTube feed URL and pass through other fetches.
- Default the existing Playwright configuration to immutable success fixtures, disable reuse of an uncontrolled server, and exclude `youtube-feed-failure.spec.ts` from that configuration.
- Add `playwright.youtube.config.ts` selecting only the failure suite, a separate server port, one worker, and no server reuse; allocate a unique temporary mode file per run and clean it up after server shutdown.
- The isolated preload reads that mode file for each feed attempt, supporting success, HTTP 404/500, network rejection, malformed feed, and abort-aware stalled headers/body; mode changes need no application restart.
- Browser test commands cannot send feed requests to live YouTube; fixture controls exist only in test files and test-server startup, without production endpoints or application environment branches.
- Run existing `e2e/home.spec.ts` against the default success fixture to verify the server interception works with Next.js fetch wrapping.
files:
- e2e/fixtures/youtube-feed.xml
- e2e/fixtures/youtube-fetch.mjs
- playwright.config.ts
- playwright.youtube.config.ts
depends_on: []

### Wave 2 (1 task)

- Most risky step: `youtube-playlist-feed-failure_2_1`.

id: youtube-playlist-feed-failure_2_1
title: Recover only the Home sermon listing and verify rendered states
status: done
acceptance_criteria:
- Catch playlist reading and selection in `Home`; use explicit available/unavailable state passed to `SermonItems`, leaving event selection and unrelated rendering outside the catch.
- Store the spec's fallback message and link label in `src/content/home/index.ts`; derive the URL from `sermonPlaylistId`.
- Implement both [Sermons states](./spec.md#sermons-states) using existing section structure; add narrowly scoped fallback styles so the message and link do not inherit video-row layout.
- Emit the stable event `youtube_playlist_read_failed` with the spec's diagnostic fields once at the Home boundary; keep classification handling and logging server-side.
- Add rendered-output tests by awaiting `Home` and rendering its returned tree with React server rendering; stub the playlist module and necessary framework/client components locally without changing shared test configuration.
- Cover the spec's Home rendering, recovery, and log scenarios with success containing six videos and each failure category; assert no technical diagnostic text appears in markup.
- Freeze the clock around an event boundary and verify actual rendered slot content against `homeEventSlots`; an unrelated event-selection exception still propagates.
- Preserve existing `src/app/page.test.ts` and `src/content/home/home.test.ts` coverage.
files:
- src/app/page.tsx
- src/content/home/index.ts
- src/app/globals.css
- src/app/page.render.test.tsx
depends_on:
- youtube-playlist-feed-failure_1_1

### Wave 3 (1 task)

id: youtube-playlist-feed-failure_3_1
title: Verify browser failure isolation and same-server recovery
status: blocked
acceptance_criteria:
- In the isolated fixture server, exercise all failure modes from task `youtube-playlist-feed-failure_1_2` and assert the navigation response is HTTP 200 and the unavailable state matches the spec.
- Switch failure to success and reload on the same running server; assert five fixture videos in feed order and no fallback.
- At 1440px and 390px widths, verify the scripture panel, unchanged surrounding Home sections, navigation and footer; check no horizontal overflow and that the fallback link is reachable by keyboard with visible focus.
- Verify Watch navigation reaches `/watch` during failure and the fallback link has the configured URL and new-tab attributes without navigating to YouTube.
- Capture success and failure screenshots at both widths for human review; attach them to the test report and inspect wrapping, stacking, spacing, and focus treatment.
files:
- e2e/youtube-feed-failure.spec.ts
depends_on:
- youtube-playlist-feed-failure_1_2
- youtube-playlist-feed-failure_2_1

### Not doing

- [Deferred work and scope constraints](./intent.md#constraints).
- [Progressive streaming exclusion](./spec.md#reader-and-failure-boundary).

## Risks

- The current `Home` awaits the reader before returning markup; a catch around the whole page would hide unrelated content defects. Mitigation: task `youtube-playlist-feed-failure_2_1`.
- Existing `.playlists a` rules assume a thumbnail and title row; applying them unchanged to a fallback can damage narrow-screen layout.
- Current reader tests assert `force-cache`; update that obsolete assertion to the accepted policy while retaining validation coverage.
- Current Home tests inspect source text only; they cannot prove rendered fallback or recovery.
- Existing browser tests require five video rows from a live server. An uncontrolled reused server or parallel writes to shared fixture state can invalidate results; Wave 1 isolates mutable scenarios from the normal suite.

## Acceptance criteria

- Missing infrastructure: Playwright exists, but server feed interception, deterministic failure controls, rendered Home tests, and approved fallback screenshot baselines do not; the owning tasks above add the first three, and screenshots require human review.
- Before implementation, read `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md` for the installed fetch behavior.
- No unresolved product decisions; human acceptance is required for this draft plan and later screenshot review.
- Run the commands below and report actual output against [Regression verification](./spec.md#regression-verification).

| Verification | Command |
| --- | --- |
| Reader and Home tests | `npx vitest run src/lib/youtube-playlist.test.ts src/app/page.render.test.tsx src/app/page.test.ts src/content/home/home.test.ts` |
| Existing Home browser regression | `npx playwright test e2e/home.spec.ts` |
| Failure, recovery, and screenshots | `npx playwright test --config=playwright.youtube.config.ts` |
| Build | `make build` |
| All unit tests | `make test` |
| Lint | `make lint` |
