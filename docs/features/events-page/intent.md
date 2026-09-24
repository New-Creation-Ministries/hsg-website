# Intent: Events page
Author: Udeet Gulati
Status: draft

## Problem

`/events` is a published shell: the heading is Events and the body is “This page will be published here.”

## Proposed outcome

- `/events` lists upcoming church events in IST.
- Two events marked by an editor flag are shown with their content. Every other upcoming event is listed after those two.
- Visitors can add events to Google Calendar and Apple Calendar in two ways: regular services as a recurring item, and special events one at a time.
- Regular services are only the Sunday services in Home “New to HSG?” (`src/content/home/index.ts`): Word Fest Service (English, 8–9am) and Miracles and Healing Service (Multilingual, 9:30am onwards).
- A later change to an event’s time updates the calendar entry that was added from the site.

## Affected users and systems

- Visitors and members on `/events`. Home “What’s going on” links here ([docs/features/home-landing-page/spec.md](../home-landing-page/spec.md)).
- Event content in the repository, published by deploy. This feature sets the event model ([docs/architecture.md](../../architecture.md)).
- Google Calendar and Apple Calendar stay external.

## Constraints

- One public Next.js app on Vercel. No member accounts.
- Add a backend only if calendar updates need persisted server state or a trusted server.
- Pages stay static unless calendar updates need per-request data.
- Past events are out of scope until specified.

## Open questions

1. Which fields are the highlighted event’s content (title, time, place, description, image)?
2. How should a time change reach Google and Apple after the visitor has added the event?
