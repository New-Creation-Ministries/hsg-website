# 0006 Calendar subscription

- Status: accepted.
- Date: 2026-09-24.
- Decision owner: Udeet Gulati.

## Context

Visitors add a Sunday service or one dated event to Google Calendar and Apple Calendar. A later published time change has to reach that entry. The site has no member accounts. Google and Apple remain external. A copied event (Google template URL, or an `.ics` file imported once) does not change when the church republishes. Writing into a visitor’s calendar needs stored consent and has no equivalent Apple path.

A subscribed iCalendar feed does change. The client keeps the event’s UID and replaces it when `SEQUENCE` increases. Google’s “add by URL” and Apple’s `webcal:` subscription both follow a public feed. Neither needs a user record on this site.

## Decision

- Each addable item is its own iCalendar feed, `METHOD:PUBLISH`, produced at deploy from the event record or a Sunday service. One subscribe action adds that feed only.
- A same-day event is one `VEVENT` for its real IST start and end. UID is the event id. `SEQUENCE` is the revision. `DTSTAMP` is the deploy time.
- A span that covers more than one IST date is one `VEVENT` per IST date from the start date through the end date, inclusive. No date before the start and no date after the end. Each is 08:00–08:30 `Asia/Kolkata`, UID `{event-id}/{date}`, `SUMMARY` the event name. These are reminders on the conference days, not a countdown and not that day’s schedule. `SEQUENCE` is the record revision.
- Word Fest is one weekly `VEVENT` (`RRULE` on Sunday), 08:00–09:00 `Asia/Kolkata`. Miracles and Healing is one weekly `VEVENT`, 09:30–13:30 `Asia/Kolkata`. That 13:30 end is only in the feed. The page keeps the Home text “9:30am onwards”. A dated event with no end has no feed.
- Google opens `https://calendar.google.com/calendar/render?cid=` with that feed’s `webcal:` URL in a new tab. Apple opens the `webcal:` URL in a new tab and lets the device offer Subscribe. Both links use `rel="noopener noreferrer"`. The feed’s `X-WR-CALNAME` is the event name or the Sunday service title (same string as `SUMMARY`).
- The feed is not rewritten when the event leaves the page. Leftover reminders in a visitor’s calendar are acceptable. Deleting the record on a later deploy removes the URL; clients may keep their last copy.
- The feed response is cacheable for at most one hour. No per-request data, no stored consent, and no provider write API.

## Alternatives

| Alternative | Outcome |
| --- | --- |
| Google template URL or a one-time `.ics` import | Rejected. The calendar keeps a detached copy. A later time change on the site does not change it. |
| One feed for every event, with a single subscribe action | Rejected. The visitor asked to add one item, not the whole list. |
| Google or Apple write APIs | Rejected. They need stored consent, a backend, and still do not update Apple. |

## Consequences

- The site can say that a subscription follows later published times after the calendar app refreshes. It cannot say the entry is already saved or that the refresh is immediate. Google often refreshes a subscribed calendar many hours later; Apple uses its own schedule.
- A visitor who imports the feed as a one-time copy does not get updates. The actions must be subscriptions, not file downloads.
- The page does not try to clear an expired event from Google or Apple. A time change still reaches subscribers only while the record and its URL remain.
