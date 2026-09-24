# Spec: Home events and scripture tiles

Status: approved
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: frontend-design

## Outcome

Home “What’s going on” shows one scripture row, then two event rows. “Highlighted testimonies” is a 2×2 grid whose first cell is scripture. Verse wording, fill priority, testimony order, and scripture links are the Proposed outcome and Constraints in [intent.md](./intent.md). Visual direction stays [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md). Event records stay [ADR 0005](../../adr/0005-event-records.md).

## Resolved questions

| # | Question | Resolution |
| --- | --- | --- |
| 1 | Which fields does an event tile show, and does it link? | A dated row shows `name` and the IST `whenLine` from `listUpcoming`. A Sunday fallback shows the Home service name, language, and time. No description, photograph, scope line, calendar control, or venue. The row is text. It does not link. |
| 2 | Does the testimony grid stay two columns at 800px? | See Highlighted testimonies. |

## What’s going on

Three ruled rows, same row treatment as the current highlight list. Scripture is the first row. The citation is the row title. The verse is the line under it.

Fill priority is [intent.md](./intent.md). Dated rows use `listUpcoming` order. Slot results:

| Upcoming records | Slot 1 | Slot 2 |
| --- | --- | --- |
| Two featured | First featured | Second featured |
| One featured | That featured record | Miracles and Healing Service |
| None featured, two or more other dated | First other dated | Second other dated |
| None featured, one other dated | That dated record | Miracles and Healing Service |
| None upcoming | Miracles and Healing Service | Word Fest Service |

A featured record is not followed by a non-featured dated record. Do not show a third event. Do not pad a featured pair with a service.

Sunday fallbacks use the name, language, and time from Home “New to HSG?” in [the Home spec](../../features/home-landing-page/spec.md). Order when both appear: Miracles and Healing Service, then Word Fest Service.

These two slots use per-request time when `/` is served ([docs/architecture.md](../../architecture.md)), with the same upcoming test as [ADR 0005](../../adr/0005-event-records.md). Scripture and the other Home sections stay module content.

## Highlighted testimonies

Four cells. Cell one is scripture: citation as the story title, verse as the story paragraph. Cells two through four follow [intent.md](./intent.md). The Home source line stays under the grid ([Home spec](../../features/home-landing-page/spec.md), Highlighted testimonies).

| Width | Grid |
| --- | --- |
| Above 800px | Two columns. Row one: scripture, Healing story from Sherman, Illinois. Row two: Testimony from California, Miracle from Dallas. |
| 800px and below | One column, in cell order. A rule separates each cell, as stories do today. |

## Unchanged

Section links: [intent.md](./intent.md). `/events`: [intent.md](./intent.md). Headings stay “What’s going on” and “Highlighted testimonies”. Sermons, New to HSG?, hero, nav, and footer stay the Home spec.
