# 0005 Event records

- Status: accepted.
- Date: 2026-09-24.
- Decision owner: Udeet Gulati.

## Context

[docs/architecture.md](../architecture.md) leaves the event model to the first slice that needs it. [ADR 0001](0001-public-pages.md) already stores page copy as typed TypeScript under `src/content/<page>/`, published by deploy. Church events are that kind of copy: a name, an IST interval, and optional body content an editor chooses to expand. They are not accounts, embeds, or rows in a hosted database.

## Decision

- A dated church event is one typed record in `src/content/events/`. The module is the source. There is no second store.
- Each record has a stable id, a name, an IST start, an IST end after that start, and a positive integer revision. A description, a photograph, and a featured flag are optional.
- One record is one gathering. A conference that covers several dates is still one record: the start and the end are the span. The record does not store a separate time for each day.
- The id does not change when the times, name, or description change. A new id is a new gathering. The revision increases when subscribers must see a change.
- A photograph is a file imported by that record, with alt text. The repository holds the file. The page does not hotlink a stock image.
- Sunday service names, languages, and time text stay in `src/content/home/`. The events module does not copy that text.
- Adding an event is a new record in this module, then a deploy.
- The public list includes a record only while the current time in `Asia/Kolkata` is before its end. That comparison runs when `/events` is served. An ended event leaves the page with no further deploy. The site does not remove it from anyone’s calendar.
- Serving `/events` reads these files and the clock. It does not read a database.

## Alternatives

| Alternative | Outcome |
| --- | --- |
| Markdown or JSON files beside the app | Rejected. [ADR 0001](0001-public-pages.md) already uses typed modules, and a second format would split the content pattern. |
| Hosted database | Rejected. Nothing here needs persisted server state or a trusted server. |
| Reuse the Home highlight rows as the event list | Rejected. Those rows have no dates, and Home keeps them until a separate content change. |

## Consequences

- Later public listings of church events use this record. A private or member-only event amends this ADR before it adds accounts or a second store.
- A surface that needs a field this record does not have, such as a venue, amends this ADR before showing or inventing that field.
