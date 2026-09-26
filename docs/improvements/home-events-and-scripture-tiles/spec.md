# Spec: Home events and scripture tiles

Status: superseded
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: frontend-design

## Outcome

Superseded for Home “What’s going on” event-slot rows and “Highlighted testimonies” by [event-highlights-and-scripture-relocation](../event-highlights-and-scripture-relocation/spec.md).

Still authoritative for:

- Acts 2:46 (AMP) wording and scripture non-linking Constraints in [intent.md](./intent.md) (Home What’s going on scripture tile).
- Hebrews 2:4 (KJV) wording in [intent.md](./intent.md) (Watch Featured Testimonies horizontal block).
- Visual direction [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md).
- Event records [ADR 0005](../../adr/0005-event-records.md) for `/events` (not Home What’s going on).

## Current Home layout

| Surface | Contract |
| --- | --- |
| What’s going on | Scripture tile + two event highlights; Events section link; no `homeEventSlots` rows — [event-highlights-and-scripture-relocation](../event-highlights-and-scripture-relocation/spec.md) |
| Highlighted testimonies | Removed from Home — same successor |
| New to HSG? | Visit Band background — same successor |
| Watch Hebrews 2:4 | Horizontal block before Featured Testimonies items — same successor |

## Historical (superseded)

The following described the pre-relocation Home and must not be treated as live requirements.

### What’s going on (superseded)

Three ruled rows: scripture first, then two event-slot rows from `homeEventSlots` / `listUpcoming` fill priority. Dated and Sunday-fallback slot pairs, no third event, no link on slot rows.

### Highlighted testimonies (superseded)

2×2 grid: Hebrews 2:4 cell plus three story cells; Home RWO source line under the grid. Heading had no section link.

## Unchanged

`/events` listing and calendar behavior: [ADR 0005](../../adr/0005-event-records.md). Sermons, hero, nav, and footer: [Home spec](../../features/home-landing-page/spec.md) as updated by the successor.
