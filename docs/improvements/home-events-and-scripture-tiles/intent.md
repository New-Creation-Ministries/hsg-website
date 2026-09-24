# Intent: Home events and scripture tiles
Author: Udeet Gulati
Status: ready

## Problem

Home “What’s going on” lists three unpublished placeholders. Visitors do not see upcoming church events on the landing page. “Highlighted testimonies” is three story columns and has no scripture item.

## Proposed outcome

- “What’s going on” leads with one scripture tile, then the event tiles below.
- Scripture tile: Acts 2:46 (AMP). Copy: “And day after day they regularly assembled in the temple with united purpose... with gladness and simplicity and generous hearts”.
- Fill the two event tiles from upcoming featured records first ([ADR 0005](../../adr/0005-event-records.md)). If none are featured, use upcoming dated events. Any remaining tile is a regular service, Miracles and Healing Service then Word Fest Service ([Events page intent](../../features/events-page/intent.md)).
- “Highlighted testimonies” is a 2×2 grid. The first cell is scripture. The other three cells are the current highlighted testimonies, in their current order.
- Scripture tile: Hebrews 2:4 (KJV). Copy: “God also bearing them witness, both with signs and wonders, and with divers miracles, and gifts of the Holy Ghost”.
- Each scripture item uses the item formatting of the section it sits in.

## Affected users and systems

- Visitors and members on `/`.
- Home sections “What’s going on” and “Highlighted testimonies” (`src/content/home/`, `src/app/page.tsx`).
- Upcoming event records in `src/content/events/` ([ADR 0005](../../adr/0005-event-records.md)).
- `/events` stays the full list. This intent does not change that page.

## Constraints

- Scripture tiles do not link.
- Scripture copy is the wording in Proposed outcome, including the ellipsis in Acts 2:46.
- Section links stay Events and Praise Reports ([Home spec](../../features/home-landing-page/spec.md)).
- Event record fields: [ADR 0005](../../adr/0005-event-records.md).

## Open questions

1. Which fields does an event tile show, and does the tile link anywhere?
2. Does the 2×2 testimony grid stay two columns below the Home 800px stack, or stack to one column?
