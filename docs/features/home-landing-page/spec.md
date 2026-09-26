# Spec: Home landing page

Status: approved
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
UX: [ux.md](./ux.md)
Skills: frontend-design

## Outcome

Home identifies Holy Spirit Generation and leads a visitor into what is happening, Sunday services, and sermons. The page is the Spirit in Blue composition in [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md) and [02-spirit-in-blue.html](./design-reference/02-spirit-in-blue.html).

Shared navigation and shells stay [ADR 0001](../../adr/0001-public-pages.md) and [ADR 0002](../../adr/0002-public-navigation-and-recovery.md). Interaction stays in [ux.md](./ux.md). This spec names copy, routes, and the visual contract.

Home “What’s going on” event highlights, removal of Highlighted testimonies, New to HSG? band, and Watch Hebrews placement: [event-highlights-and-scripture-relocation](../../improvements/event-highlights-and-scripture-relocation/spec.md). Acts 2:46 wording and scripture non-linking: [home-events-and-scripture-tiles](../../improvements/home-events-and-scripture-tiles/intent.md).

## Copy

Blurb, adapted from the Holy Spirit Generation section of [rwo.life/about-us](https://www.rwo.life/about-us):

A Word-based, Spirit-filled church in Bengaluru, founded and led by Apostle Dr. P. S. Rambabu and Pastor Vinita Rambabu.

**What’s going on** — Acts 2:46 (AMP) scripture tile first (citation title, verse under it; no `href`), then two event highlights. Heading and Events → `/events` section link stay. No upcoming-event slot rows. Highlight records: `title`, `url`, `thumbnailUrl` ([event-highlights-and-scripture-relocation](../../improvements/event-highlights-and-scripture-relocation/spec.md)).

| Title | URL |
| --- | --- |
| Together Youth Night Highlights | https://www.instagram.com/reel/DclzTz2TnWk/ |
| Recent Service Recap | https://www.instagram.com/reel/DdQZhQNTH6S/ |

**Sermons** — intro: “Messages from the Evangelist Rambabu channel.”

| Title | URL |
| --- | --- |
| Evangelist Rambabu | https://www.youtube.com/c/EvangelistRambabuRambo |
| Playlist to be published | — |
| Playlist to be published | — |

**New to HSG?** — intro: “Join us every Sunday.” These times replace the intent’s Word Fest time of 8:00–8:45am. Under the records: “Sunday services · Bengaluru local time”.

| Service | Language | Time |
| --- | --- | --- |
| Word Fest Service | English | 8–9am |
| Miracles and Healing Service | Multilingual | 9:30am onwards |

Footer line: “Word-based. Spirit-filled. Bengaluru.”

Do not publish “Gatherings, news, and messages will be published here.”
Do not ship a Home “Highlighted testimonies” section.

## Page

Visual reference: [02-spirit-in-blue.html](./design-reference/02-spirit-in-blue.html). Tokens: selected option in [tokens.json](./design-reference/tokens.json). Match the reference composition. Do not ship its preview note, query-string shells, or “Return Home” control.

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#090d15` | Page background |
| Paper | `#f5f3e8` | Text on ink and cobalt |
| Mist | `#b6c1d5` | Secondary text on ink |
| Acid | `#dee77f` | Links, current nav item, service times on ink |
| Cobalt | `#173de0` | Hero and sermon channel panel |
| Rule | `#394250` | Separators on ink |
| Band | `#dedfc9` | New to HSG? visit-section background |
| Band ink | `#141a20` | Text on the visit band |
| Band link | `#182da3` | Links on the visit band |

| Role | Face |
| --- | --- |
| Display headings, monogram, service times | Oswald, uppercase, weight 500 |
| Body, navigation, footer, supporting copy | DM Sans |

Load both through the app font pipeline. Body size 16px, line-height 1.6. Heading measure stays under 65 characters. Section links are Acid, underlined, at least 44px tall, with a decorative arrow that is not part of the accessible name.

```
[logo]                                    Home  About  Events  Watch  Contact Us  Give

HOLY SPIRIT GENERATION                    [ HSG ]
blurb
About

What’s going on                       Events
Acts 2:46 (AMP)
Together Youth Night Highlights
Recent Service Recap

New to HSG?                           Contact Us
…
Sermons                               Watch
…
```

| Region | Wide (above 800px) | Narrow (800px and below) |
| --- | --- | --- |
| Header | Logo only, then the six links. | Logo and a Menu button. Links follow [ADR 0002](../../adr/0002-public-navigation-and-recovery.md). |
| Hero | Cobalt band. Church name and blurb on the left, portrait on the right. About sits under the blurb. | One column. Portrait follows the blurb and About. |
| What’s going on | Scripture tile, then two event-highlight surfaces on ink (Watch Featured Testimonies pattern; title only). | Same order, stacked. |
| New to HSG? | Band background. Intro and Contact Us beside the two service records. | Intro, then records. |
| Sermons | Cobalt panel (intro and channel link) beside the two playlist lines. | Panel, then playlist lines. |
| Footer | Church name and footer line. No second navigation and no logo. | Same. |

| | |
| --- | --- |
| Header link | Accessible name “Holy Spirit Generation”. Image is `/brand/hsg-logo.jpg` and does not add a second name. No church-name text beside the logo. |
| Heading | `h1` is “Holy Spirit Generation”, set on two lines: Holy Spirit / Generation. |
| Portrait | No photo. Cobalt field, `aria-hidden`, showing “HSG”. No visitor-facing caption. When `portrait` is set, `next/image` replaces the field; alt is “Apostle Dr. P. S. Rambabu”. A failed image keeps the field and the identity text. |
| Sections | `h2` in this order: What’s going on, New to HSG?, Sermons. All three stay visible. No Highlighted testimonies section. No carousel, tabs, or disclosure. |
| Items | Scripture tile has no `href`. Event highlights open externally (Watch testimonies pattern). A URL makes one text link whose name is the title. No URL means text: no focus, hover, or link styling. |
| Section links | What’s going on → Events. Sermons → Watch. New to HSG? → Contact Us. About in the hero → `/about`. Link text is the destination label. |
| Services | Each record shows name, then language, with the time in the same record. Keep “onwards”. Times are Bengaluru local time, not the viewer’s zone. |
| Sermons panel | Intro, then the Evangelist Rambabu link. Playlist lines stay plain text until a URL exists. No embedded player. |
| Current page | Acid plus underline, and `aria-current="page"`. |
| Menu threshold | Above 800px the six links are visible and Menu is absent. At 800px and below, Menu is the disclosure in [ADR 0002](../../adr/0002-public-navigation-and-recovery.md). |
| Motion | None. |
| Targets | Menu, nav links, and section links are at least 44px. |
| Contrast | Paper, Mist, Acid, Band ink, and Band link meet WCAG AA on the background they sit on. |
| Reflow | At narrow widths and 400% zoom, no horizontal page scroll and no clipped names, links, times, or summaries. Text wraps. |
| Document title | `Holy Spirit Generation`. Description is the blurb. Shell titles are `{Page} \| Holy Spirit Generation`. |

## Content

`src/content/home/` is the Home module. `@/content/home` is the import path. Pages are static. Home does not fetch Instagram media for event highlights.

| Export | Fields |
| --- | --- |
| `church` | `name` |
| `leader` | `name`, `blurb`, `portrait` (`null` or `{ src, alt }`) |
| `nav` | `{ label, href }[]` in nav order |
| `eventHighlights` | `{ title, url, thumbnailUrl }[]` for What’s going on |
| `sections` | `{ heading, intro?, items: { title, text?, href? }[], more?: { label, href } }[]` in section order |

Service `text` is the language, a newline, then the time. The view keeps those two parts associated with the service name.

`src/app/layout.tsx` reads `church.name` and `leader.blurb` for metadata and renders the header and footer. `src/content/home/home.test.ts` asserts church name, blurb, section order, nav, service times, and event highlights.

## Routes

| Label | Path | Home section |
| --- | --- | --- |
| Home | `/` | — |
| About | `/about` | Hero |
| Events | `/events` | What’s going on |
| Watch | `/watch` | Sermons |
| Contact Us | `/contact` | New to HSG? |
| Give | `/give` | — |

Each path other than `/` is a static page: shared header and footer, an `h1` of the nav label, and “This page will be published here.” Give is nav only. External URLs always open in a new tab ([ADR 0002](../../adr/0002-public-navigation-and-recovery.md) G7). The reference’s `?page=` addresses are not routes.

## Acceptance

Behavior checks are [ux.md](./ux.md) A1–A9. This slice also requires:

- Home shows the church-name heading, the blurb, the portrait field, then the three sections in order.
- Copy tables, the Sunday note, and the footer line match this spec. Highlighted testimonies and its RWO source line are absent.
- Nav labels and paths match the route table. Every path renders the shell sentence.
- Scripture tile has no `href`. Event-highlight URLs open externally. Sermons playlist placeholders stay unlinked until a URL exists.
- `portrait` is null. Event-highlight thumbnails are content-authored under `public/home/`.
- The old summary sentence is absent from content, metadata, and `home.test.ts`.
- Above 800px the nav is inline. At 800px and below, Menu shows the same six links.
- Keyboard: skip link to main, visible focus, Menu behavior in [ADR 0002](../../adr/0002-public-navigation-and-recovery.md).

## Concerns

| Topic | What this spec does |
| --- | --- |
| Intent open questions | Playlist URLs and a portrait stay empty until content supplies them. |
| Intent service time | Word Fest is 8–9am here and in the locked reference. The intent’s 8:00–8:45am is not the Home time. |
| Reference-only lines | Do not ship “Church news & gatherings”, “Messages & teaching”, “The Word, wherever you are.”, the portrait instruction caption, the design-comparison note, or a shell “Return Home” link. |
| Visit address | Contact Us is still a shell. Home does not give directions or take a booking. |
| Embeds and events | `/events` listing stays [ADR 0005](../../adr/0005-event-records.md). Home What’s going on uses authored event highlights, not the upcoming-event slot feed. |
| Logo palette | [docs/architecture.md](../../architecture.md) records navy, blue, and gold for the mark. Home colors are the table above, per [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md). |
| UX contrast wording | [ux.md](./ux.md) A9 checks Acid and body text on ink, cobalt, and the New to HSG? visit band. |
| Source-page claims | Growth, “supernatural lifestyle”, and the biography stay off Home. The blurb stays the sentence above. |
