# Intent: Event highlights and scripture relocation
Author: Udeet Gulati
Status: ready

## Problem

Home “What’s going on” still presents an event feed after the scripture tile. Home keeps a separate “Highlighted testimonies” band that includes scripture and story tiles. “New to HSG?” does not use that band’s background. About still includes the line “He lives in Bangalore with his wife Vinita Rambabu, and his two children Ankit and Annika.”

## Proposed outcome

- On `/`, “What’s going on” keeps its scripture tile (Acts 2:46 AMP; wording from [home-events-and-scripture-tiles](../home-events-and-scripture-tiles/intent.md)).
- Remove the event feed from “What’s going on”. Show recent event highlights instead, using the Featured Testimonies presentation pattern on `/watch` (`src/components/watch-testimonies.tsx`; [watch-page](../../features/watch-page/intent.md) Proposed outcome → Testimonies). Each highlight shows the given title and the Instagram reel thumbnail; no writeup text. Home highlights use a title (no name-switcher among witnesses).
- Initial highlights:
  - Together Youth Night Highlights — `https://www.instagram.com/reel/DclzTz2TnWk/` (thumbnail from that reel)
  - Recent Service Recap — `https://www.instagram.com/reel/DdQZhQNTH6S/` (thumbnail from that reel)
- “What’s going on” keeps its Events section link (`more` → `/events`).
- Remove the Home “Highlighted testimonies” section (scripture cell and story tiles).
- Move that section’s scripture (Hebrews 2:4 KJV; wording from [home-events-and-scripture-tiles](../home-events-and-scripture-tiles/intent.md)) to `/watch` as a horizontal block just before Featured Testimonies items begin. It is not a Featured Testimonies item.
- “New to HSG?” uses the background treatment previously used by “Highlighted testimonies”.
- On `/about`, remove the line: “He lives in Bangalore with his wife Vinita Rambabu, and his two children Ankit and Annika.”

## Affected users and systems

- Visitors and members on `/`, `/watch`, and `/about`.
- Home sections and content: `src/content/home/`, `src/app/page.tsx` ([Home landing page](../../features/home-landing-page/intent.md), [home-events-and-scripture-tiles](../home-events-and-scripture-tiles/intent.md)).
- Watch Featured Testimonies: `src/components/watch-testimonies.tsx`, `src/content/watch/` ([Watch page](../../features/watch-page/intent.md)).
- About founder copy: `src/content/about/` ([About page](../../features/about-page/intent.md)).

## Constraints

- Home event highlights follow Watch testimonies external-open / no on-page play ([watch-page](../../features/watch-page/intent.md) Proposed outcome → Testimonies).
- Event-highlight fields: Proposed outcome (title + reel thumbnail; no writeup).
- Hebrews 2:4 Watch placement: Proposed outcome.
- Scripture tile linking: [home-events-and-scripture-tiles](../home-events-and-scripture-tiles/intent.md) Constraints.
- This intent supersedes the Home “Highlighted testimonies” 2×2 layout and the event-tile feed under “What’s going on” from [home-events-and-scripture-tiles](../home-events-and-scripture-tiles/intent.md). It does not change `/events` listing behavior ([ADR 0005](../../adr/0005-event-records.md)).
- About change is that one sentence only; leave the rest of founder copy unchanged.

## Open questions

None.
