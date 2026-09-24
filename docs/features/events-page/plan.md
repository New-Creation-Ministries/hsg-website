# Plan: events-page
Author: Udeet Gulati
Status: approved
Links: [intent](./intent.md) · [spec](./spec.md)

Behavior: [ux.md](./ux.md), overridden by the spec delta. Records: [ADR 0005](../../adr/0005-event-records.md). Feeds: [ADR 0006](../../adr/0006-calendar-subscription.md). Shell: [ADR 0002](../../adr/0002-public-navigation-and-recovery.md). Visual: [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md) and [05-timeline.html](./design-reference/05-timeline.html) with [events.css](./design-reference/events.css). The later `body { --bg … }` block and `@media (max-width: 800px)` are the composition.

Do not ship the reference concept footer, “Placeholder photograph”, Unsplash files, or “Names and photographs are placeholders.” Miracles and Healing in the HTML has no add; this spec gives it one. The page still shows Home’s “9:30am onwards”.

## Files that change

- Add `src/content/events/index.ts` — dated records plus the two Sunday feed records. Display copy stays in Home.
- Add `src/content/events/events.test.ts` — schema, featured cap, and Home time-text locks.
- Add `src/lib/event-list.ts` — list, sort, and IST labels. No clock of its own.
- Add `src/lib/event-list.test.ts` — fixtures `INV-DEMO-042` for A1, A2, A8, A9 labels.
- Add `src/lib/calendar-feed.ts` — `METHOD:PUBLISH` body for one id.
- Add `src/lib/calendar-feed.test.ts` — A3, A4, A5, A9 feed bytes.
- Edit `src/app/events/page.tsx` — dynamic list, spine, Sunday band, subscribe links.
- Add `src/components/add-to-calendar.tsx` — one disclosure per item.
- Add `src/app/events/feeds/[id]/route.ts` — static feed response.
- Edit `next.config.ts` — rewrite `/events/feeds/:id.ics` to `/events/feeds/:id`.
- Edit `src/app/globals.css` — timeline and Sunday band, scoped so Home regions stay.
- Edit `e2e/navigation.spec.ts` — `/events` is no longer a shell.
- Add `e2e/events.spec.ts` — published page, Sunday adds, keyboard, narrow width.
- Edit `src/components/add-to-calendar.tsx`, `src/lib/calendar-feed.ts`, their tests, `e2e/events.spec.ts`, `spec.md`, and [ADR 0006](../../adr/0006-calendar-subscription.md) — `events-page_5_1`.

`src/content/home/index.ts` and `src/app/page.tsx` stay. Home keeps `dynamic = "error"`. “What’s going on” stays three placeholders.

## Order of work

### Wave 1 (1 task)

id: events-page_1_1
title: Add the events module and the two Sunday feed records
status: done
acceptance_criteria:
- `EventRecord` has `id`, `name`, `start`, `end`, `revision`, and optional `description`, `photo`, `featured`. `start` and `end` are ISO-8601 with offset `+05:30`. `photo` is `{ src, alt }` imported in this module.
- `events` starts as `[]`. No venue field. No Unsplash import.
- `sundayFeeds` is `word-fest` (Sunday 08:00–09:00 `Asia/Kolkata`, weekly, `revision` ≥ 1) and `miracles-and-healing` (Sunday 09:30–13:30 `Asia/Kolkata`, weekly, its own revision). Those objects do not copy Home name, language, or time text.
- `assertEventsPublishable(events, now)` throws if a record lacks `name`, `start`, or `end`; if `end` is not after `start`; if `revision` is not an integer ≥ 1; if `photo.src` is set without `alt`; or if more than two records with `featured: true` have `end` after `now`. It does not drop extras.
- `events.test.ts` fails when `word-fest` is not 08:00–09:00 while Home “New to HSG?” still has `English\n8–9am`, and when `miracles-and-healing` is not 09:30–13:30 while that item’s text is not `Multilingual\n9:30am onwards`.
- The module does not call `Date.now` or `new Date`.
files:
- src/content/events/index.ts
- src/content/events/events.test.ts
depends_on: []

### Wave 2 (2 parallel)

id: events-page_2_1
title: List upcoming rows and format IST labels
status: done
acceptance_criteria:
- `listUpcoming(events, now)` keeps a record only while `now` in `Asia/Kolkata` is before `end`. It returns featured rows first, then the rest. Within each group, earlier `start` first. Equal starts keep module order.
- A conference is one row. Same IST calendar date: tick is day and start time; when-line is weekday, date, and start–end; scope is `This date only`. Different IST dates: tick is the start day only; when-line is `5 October – 9 October 2026` with no daily hours; scope is `These dates only`.
- Labels use `Asia/Kolkata` only. Tests pass a fixed `now` and cover zero rows, one featured row, two featured rows before a later minor row, a row dropped after `end` with no other change, and Monday 5 Oct through Friday 9 Oct as one row.
files:
- src/lib/event-list.ts
- src/lib/event-list.test.ts
depends_on:
- events-page_1_1

id: events-page_2_2
title: Build one iCalendar document per addable id
status: done
acceptance_criteria:
- `calendarFeed(id, { dtstamp })` returns `text/calendar` lines: `METHOD:PUBLISH`, one `VEVENT` set, `SEQUENCE` equal to that record’s `revision`, `DTSTAMP` equal to the passed instant, `SUMMARY` the record name.
- Same IST date: one `VEVENT` for the real interval. `UID` is the id.
- Different IST dates: one `VEVENT` per IST date from the start date through the end date, inclusive, each 08:00–08:30, `UID` `{id}/{YYYY-MM-DD}`. A Mon 5 Oct–Fri 9 Oct fixture has five events and none on 4 Oct or 10 Oct.
- `word-fest`: one weekly Sunday `VEVENT`, 08:00–09:00, `RRULE` with `BYDAY=SU`, `TZID=Asia/Kolkata`. `miracles-and-healing`: weekly Sunday 09:30–13:30, same rule. Seed `DTSTART` is a fixed Sunday, not “next Sunday” from the clock.
- An unknown id throws. The builder does not emit `METHOD:CANCEL` and does not read the clock.
- Raising `revision` and changing `end` keeps the same UIDs and writes the new `SEQUENCE` and interval.
files:
- src/lib/calendar-feed.ts
- src/lib/calendar-feed.test.ts
depends_on:
- events-page_1_1

### Wave 3 (2 parallel)

**Most risky:** `events-page_3_1`. Home is `dynamic = "error"`. A `new Date()` or `headers()` call in a module Home imports, or a feed route that is dynamic, either fails the Home build or stamps `DTSTAMP` per request.

id: events-page_3_1
title: Serve each feed as a static deploy artifact
status: done
acceptance_criteria:
- `GET /events/feeds/{id}.ics` is `200` with `Content-Type: text/calendar; charset=utf-8` and `Cache-Control` whose `max-age` is at most 3600. Body is `calendarFeed` for that id.
- `generateStaticParams` lists every dated `id` plus `word-fest` and `miracles-and-healing`, including records whose `end` is already past. It calls `assertEventsPublishable(events, new Date())` and the Home time-text checks, so `npm run build` throws before a third still-listed featured record or a drifted Sunday window is published.
- The route exports `dynamic = "force-static"`. `DTSTAMP` is captured once in that build, not on later requests. The handler does not read `headers()`, `cookies()`, or `connection()`.
- `next.config.ts` rewrites `/events/feeds/:id.ics` to `/events/feeds/:id`. No file is written under `public/`.
files:
- src/app/events/feeds/[id]/route.ts
- next.config.ts
depends_on:
- events-page_1_1
- events-page_2_2

id: events-page_3_2
title: Replace the Events shell with the timeline page
status: done
acceptance_criteria:
- `src/app/events/page.tsx` exports `dynamic = "force-dynamic"`. It calls `listUpcoming(events, new Date())` during render. It does not export `revalidate`. `src/app/page.tsx` still exports `dynamic = "error"` and does not import `@/content/events` or `@/lib/event-list`.
- Document title is `Events | Holy Spirit Generation`. `h1` is Events. No IST note under the title.
- Featured row: cobalt panel, `h2` name, when-line, description only when set, `next/image` only when `photo` is set (`alt` is `photo.alt`), then scope. Minor row: `h3`, when-line, scope. No photo and no description on a minor row. No venue. No radius and no shadow on panels.
- Zero listed events render “No upcoming events.” One featured event is not padded. Sunday services stay.
- Sunday `h2` is “Sunday services”. No intro under that heading. Each Home “New to HSG?” item keeps name, language, and time, including “8–9am” and “9:30am onwards”. The page text does not contain `1:30`.
- Dated scope line is “This date only.” or “These dates only.” followed by “Subscribing follows a later published time after your calendar refreshes.” The page does not contain “Added”.
- One `AddToCalendar` per dated row and per Sunday service. Summary accessible name is `Add to calendar, {name}, {this date only|these dates only|every Sunday}`. The menu has “Google Calendar” and “Apple Calendar”, each named with the same event or service name. Google `href` is `https://calendar.google.com/calendar/render?cid=webcal://{host}/events/feeds/{id}.ics` with no `target`. Apple `href` is `webcal://{host}/events/feeds/{id}.ics`. `{host}` comes from the request `Host` header on this page only.
- CSS for `.spine`, `.tick`, `.breakout`, and `.sunday` follows the reference. Stack to one column at `max-width: 800px`. Tokens stay the Home ink, paper, mist, acid, cobalt, and band values. Targets for the summary and both menu links are at least 44px.
- `e2e/navigation.spec.ts` still checks the shell sentence on About, Praise Reports, Watch, Contact Us, and Give. `/events` expects title `Events | Holy Spirit Generation`, `h1` Events, and no shell sentence.
files:
- src/app/events/page.tsx
- src/components/add-to-calendar.tsx
- src/app/globals.css
- e2e/navigation.spec.ts
depends_on:
- events-page_2_1

### Wave 4 (1 task)

id: events-page_4_1
title: Check the published Events page in Chromium
status: done
acceptance_criteria:
- `e2e/events.spec.ts` opens `/events` from Home “What’s going on” and from the header Events link. Events is `aria-current="page"`. Back returns to Home. The shell sentence, “Placeholder photograph”, “Times are in IST”, and “Not on the dated line” are absent. “Voice of Apostles 2026” is visible. Both Sunday services show Home time text, one Add to calendar each, and no “1:30”.
- Opening Add to calendar shows Google Calendar and Apple Calendar. Google’s `href` contains `cid=webcal://` and `/events/feeds/word-fest.ics`. Apple’s `href` starts with `webcal://` and ends with `/events/feeds/miracles-and-healing.ics`. Neither link has `target="_blank"`.
- Keyboard Tab reaches a summary, Enter opens it, and the next Tab reaches Google Calendar. At 320px width, `expectNoHorizontalScroll` passes and the Sunday names are visible.
- `GET /events/feeds/word-fest.ics` during the Playwright run is `text/calendar` and contains `RRULE` and `BYDAY=SU`.
- A1, A2, A5, A8, and A9 stay in `make test` via the fixture clocks in `event-list.test.ts` and `calendar-feed.test.ts`. This e2e file does not add dated production records and does not set browser zoom.
files:
- e2e/events.spec.ts
depends_on:
- events-page_3_1
- events-page_3_2

### Wave 5 (1 task)

id: events-page_5_1
title: Open calendar links in a new tab and name the feed after the event
status: done
acceptance_criteria:
- Google Calendar and Apple Calendar each use `target="_blank"` and `rel="noopener noreferrer"`. The Google `href` stays `https://calendar.google.com/calendar/render?cid=webcal://{host}/events/feeds/{id}.ics`. The Apple `href` stays `webcal://{host}/events/feeds/{id}.ics`.
- `calendarFeed` sets `X-WR-CALNAME` to that item’s name: the dated record’s `name`, or the Sunday service title already used as `SUMMARY`. `SUMMARY` is unchanged.
- `add-to-calendar.test.ts` requires `target="_blank"` on both links. `e2e/events.spec.ts` expects `target="_blank"` on Google and Apple. `calendar-feed.test.ts` expects `X-WR-CALNAME` for a dated event and for `word-fest`.
- `spec.md` and ADR 0006 say both calendar links open in a new tab, and that the feed’s calendar name is the event or service name. Same-day, multi-day, and Sunday `VEVENT` dates and times stay as those documents already specify.
files:
- src/components/add-to-calendar.tsx
- src/components/add-to-calendar.test.ts
- src/lib/calendar-feed.ts
- src/lib/calendar-feed.test.ts
- e2e/events.spec.ts
- docs/features/events-page/spec.md
- docs/adr/0006-calendar-subscription.md
depends_on:
- events-page_2_2
- events-page_4_1

### Not doing

- A database, Markdown, or JSON store. ADR 0005 keeps one typed module.
- A Google template URL, a downloaded `.ics` import, one feed for every event, or a provider write API. ADR 0006.
- Filling Home “What’s going on” from events.
- A venue field, past section, detail route, search, filter, pagination, or “Added” state.
- A no-end dated record. `end` is required, so the feed table’s “no button” row is not a page branch.
- Cancelling a feed when `end` passes. The static route keeps serving that id.
- Unsplash stand-ins and the reference caption.
- `public/events/feeds/*.ics`. Extensionless route plus rewrite keeps `Content-Type` and `Cache-Control`.
- Changing which dates or times a feed emits. Multi-day stays one 08:00–08:30 IST reminder per IST date. No task for events missing from those dates.

## Risks

- `e2e/navigation.spec.ts` requires “This page will be published here.” on `/events` until `events-page_3_2` updates that assertion.
- `assertEventsPublishable` counts featured records whose `end` is after build time. A third featured record that has already ended does not fail the build. A third that is still listed does.
- Playwright cannot assert 400% zoom. A6’s zoom line is manual on a Vercel preview. Narrow width is the automated stand-in.

## Acceptance criteria

| Check | Command or route | Pass |
| --- | --- | --- |
| Unit | `make test` | `events.test.ts`, `event-list.test.ts`, `calendar-feed.test.ts` green |
| Build | `make build` | Ends with “Build succeeded”. A third still-listed featured record or a Home/feed Sunday mismatch throws during `generateStaticParams` |
| Lint | `make lint` | Zero warnings |
| Browser | `make e2e` | `e2e/events.spec.ts` and the updated navigation shell loop |
| Feed | `/events/feeds/word-fest.ics` and `/events/feeds/miracles-and-healing.ics` | Weekly Sunday windows; page never shows 1:30pm |
| Calendar handoff | `events-page_5_1` | Both links open in a new tab. `X-WR-CALNAME` is the event or service name. `VEVENT` dates and times are unchanged |
| Preview | Deployed URL, 400% zoom, keyboard | Names, times, and add labels wrap; no horizontal scroll. Record browser, viewport, and result |

No screenshot baseline exists. A1’s two featured panels are fixture tests until real records are added in `src/content/events/index.ts`.
