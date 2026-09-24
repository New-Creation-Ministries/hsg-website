# Spec: Events page

Status: approved
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
UX: [ux.md](./ux.md)
Skills: frontend-design

## Outcome

`/events` lists upcoming church events in IST, then the two Sunday services from Home. Zero, one, or two featured upcoming events lead the list and show the body below. Each addable item is a calendar subscription so a later published time can replace the entry the visitor subscribed to.

Visual direction stays [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md). This page’s composition is [05-timeline.html](./design-reference/05-timeline.html). Records are [ADR 0005](../../adr/0005-event-records.md). Calendar handoff is [ADR 0006](../../adr/0006-calendar-subscription.md). Navigation stays [ADR 0002](../../adr/0002-public-navigation-and-recovery.md).

## Resolved questions

| # | Question | Resolution |
| --- | --- | --- |
| 1 | Which fields are the featured event’s content? | Name, IST start, and IST end. Description and photograph when the record has them. The locked timeline has no venue, so the page and the feed omit place. Do not invent one. |
| 2 | How does a time change reach Google and Apple? | The visitor subscribes to that item’s feed ([ADR 0006](../../adr/0006-calendar-subscription.md)). A later deploy raises `SEQUENCE`. The calendar app applies it on its own refresh. A copied event cannot do this. |
| 3 | What happens when an event is added or expires? | A new record appears on the next deploy. Once the end has passed, the next request omits it. No deploy, and no calendar cleanup. |
| 4 | How does one control offer both calendars? | The row shows one “Add to calendar” button. Google Calendar and Apple Calendar are inside it, as in the timeline reference. |
| 5 | How does a multi-day conference subscribe? | One timeline row, start date through end date. The feed adds one 08:00–08:30 IST reminder on each conference date, and on no date before the start or after the end. |

## Delta from the UX

[ux.md](./ux.md) held both questions open and forbade update wording. Those gates are closed as follows.

| UX rule | This spec |
| --- | --- |
| Place, description, and image undecided | Description and photograph are the featured body. Place stays out. |
| Do not claim the external entry will update | Scope copy may say a subscription follows later published times after the calendar app refreshes. It still must not say “Added” or that the refresh already happened. |
| Apple asks the device to take a calendar file | Apple is a `webcal:` subscribe link. A downloaded `.ics` import is a detached copy and does not satisfy the intent. If the browser stays on the page, it does not navigate. |
| Open-ended items have no add | A dated event with no end stays visible with no subscribe action. Miracles and Healing is not in that set: the page still says “9:30am onwards”, and the feed ends at 13:30. |
| More than two featured upcoming events is unsupported | Publish fails. Do not drop or hide the extras. |
| Upcoming means start still in the future at publish | Listed on each request while now in `Asia/Kolkata` is before the end. A passed end drops off with no deploy. A conference stays up after day one. |
| Two visible add labels per item | One “Add to calendar” button. Google and Apple are the menu inside it. |

## Content

`src/content/events/` holds dated events. Sunday display copy stays in `src/content/home/index.ts`.

| Field | Required | Use |
| --- | --- | --- |
| `id` | yes | Stable slug. Feed path. Never reused for a different gathering. |
| `name` | yes | Visible title. Feed `SUMMARY`. |
| `start` | yes | ISO-8601 with offset `+05:30`. Spine date. First conference day. |
| `end` | yes | ISO-8601 with offset `+05:30`, after `start`. Last conference moment. The page drops the row once this instant has passed. |
| `revision` | yes | Integer ≥ 1. Feed `SEQUENCE`. Increase when name or times change. |
| `description` | no | Featured body paragraph. Omitted when absent. Not shown on a minor row. |
| `photo` | no | `{ src, alt }` imported from this module. Featured only. `alt` required when `src` is set. |
| `featured` | no | At most two records still listed. |

Word Fest’s feed record lives here too: id `word-fest`, Sunday 08:00–09:00 `Asia/Kolkata`, weekly, with its own revision. A test fails the build if that interval no longer matches the Home line “8–9am”. Miracles and Healing’s feed record is id `miracles-and-healing`, Sunday 09:30–13:30 `Asia/Kolkata`, weekly, with its own revision. The page does not show 1:30pm. A test fails the build if Home no longer says “9:30am onwards”.

An event missing `name`, `start`, or `end`, an end that is not after the start, a photo without alt, a revision that is not a positive integer, or a third featured listed event fails page production. Do not publish a guessed name, time, or picture.

To publish a new event, add the record and deploy. `/events` then includes it on each request until `end`. After that instant the next request omits the row. The feed is left as published. The site does not clear anyone’s calendar.

Photographs in the HTML reference are Unsplash stand-ins. Production uses church files only. The design caption “Placeholder photograph” does not ship.

## Page

Document title: `Events | Holy Spirit Generation`. `h1`: Events. Match the timeline reference. Do not ship its concept footer or placeholder names.

Ink, paper, mist, acid, cobalt, and the pale band are the Home tokens. Display is Oswald uppercase; body and notes are DM Sans. The spine is a hairline with an acid tick. Featured rows are cobalt panels. Sunday services sit on the pale band, off the spine. Flat rectangles, no shadow, no radius on the panels. No entrance motion. Stack to one column at 800px, same threshold as Home.

```
Events
Times are in IST (Asia/Kolkata). Dated gatherings sit on the line.
Sunday services repeat and stay off it.

| 4 Oct  |  [photo]  NIGHT OF WORSHIP          |
| 6:00pm |           Saturday, 4 October 2026 · 6:00–8:30 pm IST
|        |           description
|        |           This date only
|        |           Add to calendar

| 15 Oct |  PRAYER AND FASTING
| 6:00am |  Wednesday, 15 October 2026 · 6:00–7:30 am IST
           This date only
           Add to calendar

Sunday services          Word Fest Service
Not on the dated line.   English                 8–9am
An add applies every     Add to calendar
Sunday in IST.           Miracles and Healing Service
                         Multilingual            9:30am onwards
                         Add to calendar
```

- Order inside the spine: featured listed events first, then the other listed events. Earlier start first within each group. Equal starts keep module order.
- One row per record, placed on the start date. A conference is not repeated on later days.
- Same IST date: the tick shows that day and the start time. The row shows weekday, date, and start–end. Scope: “This date only”.
- More than one IST date: the tick shows the start day only. The row shows the start date through the end date, with no daily hours. Scope: “These dates only”.
- Featured row: photograph when present (empty `alt` only if the description already carries the meaning; otherwise the photo’s alt), `h2` name, the when-line, description when present, then the scope.
- Minor row: `h3` name, the when-line, same scope. No photograph and no description.
- Zero upcoming events: the sentence “No upcoming events.” Sunday services remain. One featured event is not padded to two.
- Sunday group heading “Sunday services”. Intro: “Not on the dated line. An add applies every Sunday in IST.” Each Home record keeps name, language, and time, including “onwards”. Word Fest keeps “8–9am”. Miracles and Healing keeps “9:30am onwards” and still has Add to calendar.
- Both Sunday services use the same one-button control. The feed end for Miracles and Healing is 1:30pm IST and is not written on the page.
- One button per item, label “Add to calendar”. It opens two options: “Google Calendar” and “Apple Calendar”. Those names are not separate buttons on the row. The button’s accessible name includes the event or service name and either “this date only”, “these dates only”, or “every Sunday”. Menu options include the same event or service name. Targets are at least 44px. Labels wrap. No horizontal page scroll at narrow width or 400% zoom.
- No past section, detail route, search, filter, pagination, venue, or “Added” status.

## Feeds

Built at deploy. One feed per addable item. Path `/events/feeds/{id}.ics`. `Content-Type: text/calendar; charset=utf-8`. `Cache-Control` max-age no more than 3600 seconds.

| Item | Feed |
| --- | --- |
| Start and end on one IST date | One `VEVENT` for that real interval. UID is the event id. |
| Start and end on different IST dates | One `VEVENT` per IST date from the start date through the end date, inclusive. Each is 08:00–08:30. UID `{event-id}/{date}`. No earlier reminder and no date after the end. |
| Word Fest | One weekly `VEVENT`, Sunday 08:00–09:00. |
| Miracles and Healing | One weekly `VEVENT`, Sunday 09:30–13:30. The page still says “9:30am onwards”. |
| Dated event with no end | No URL and no button. |

Google href: `https://calendar.google.com/calendar/render?cid=webcal://{host}/events/feeds/{id}.ics`, same tab. Apple href: `webcal://{host}/events/feeds/{id}.ics`.

The scope line beside the button reads “This date only.” or “These dates only.”, then “Subscribing follows a later published time after your calendar refreshes.” Sunday intro adds the same refresh clause to the weekly sentence. Do not promise the same day.

## Acceptance

Fixtures use a synthetic name such as `INV-DEMO-042`. No real visitor calendars. No third featured event.

| ID | Given / action | Evidence |
| --- | --- | --- |
| A1 | Two featured upcoming events and other upcoming events | Featured panels first with name, IST range, description and photo when present; minor rows after them by start; Sunday services match Home; no venue |
| A2 | Zero upcoming, then one featured | “No upcoming events.” and Sunday services; then one panel, not padded |
| A3 | Add to calendar for both Sunday services | Word Fest feed is weekly Sunday 08:00–09:00 IST. Miracles and Healing feed is weekly Sunday 09:30–13:30 IST. The page still shows “9:30am onwards” and does not show 1:30pm. No “Added” |
| A4 | Subscribe one same-day event | That interval only. The row shows one Add to calendar button, with Google and Apple inside it |
| A5 | Raise revision and change the end; reload after deploy | Page shows the new span. Feed keeps its UIDs and the new `SEQUENCE`. Page does not say the external calendar has already changed |
| A8 | Request `/events` after `end`, with no new deploy | The row is absent. Sunday services remain. The feed is not required to cancel |
| A9 | Conference Monday 5 Oct through Friday 9 Oct | One spine row on 5 Oct, when-line “5 October – 9 October 2026”. Feed has five 08:00–08:30 reminders, 5–9 Oct only, and none on 4 Oct or 10 Oct |
| A6 | Narrow width, 400% zoom, keyboard | Names, times, and add labels wrap; actions reachable and named with their item |
| A7 | Open from Home and nav; Back; disconnect after load | ADR 0002. Loaded text remains |

## Concerns

| Topic | What this spec does |
| --- | --- |
| Refresh delay | Google often polls a subscribed calendar many hours later. The copy says “after your calendar refreshes” and does not claim a time. |
| Detached copy | A visitor can still import instead of subscribe inside the calendar app. The site cannot detect that. The links themselves are subscribe links. |
| Expired reminders | The page drops the row when `end` passes. It does not remove those reminders from Google or Apple. |
| Clock | `/events` reads the time on each request so expiry does not wait for a deploy. A new or edited record still needs a deploy. |
| Home highlights | “What’s going on” stays three placeholders. This spec does not fill them from events. |
| Venue | Not stored and not shown. Adding a place amends [ADR 0005](../../adr/0005-event-records.md). |
