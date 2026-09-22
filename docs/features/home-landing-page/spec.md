# Spec: Home landing page

Status: accepted
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: frontend-design

## Outcome

Home names Apostle Dr. P. S. Rambabu, holds a place for his portrait, and states what the church is. Four lead-in sections follow, in order, each with a few items and a link to its page. The shared nav opens every destination in [ADR 0001](../../adr/0001-public-pages.md).

Replaces the centered logo and the sentence “Gatherings, news, and messages will be published here.”

## Copy

Adapt the blurb and testimony lines from [rwo.life/about-us](https://www.rwo.life/about-us) and [rwo.life](https://www.rwo.life/). Sunday service times are the New to HSG table. The street address stays off Home; visit information belongs to Contact Us.

**Blurb**

Holy Spirit Generation is a Word-based, Spirit-filled church in Bengaluru, founded and led by Apostle Dr. P. S. Rambabu and Pastor Vinita Rambabu.

**What’s going on** — three items, no dates, places, or URLs:

| Title |
| --- |
| Highlight to be published |
| Highlight to be published |
| Highlight to be published |

**Highlighted testimonies** — three summaries, no media URL. These are Rambo World Outreach miracle-night stories. The item text does not place them at an HSG gathering.

| Title | Text |
| --- | --- |
| Healing story from Sherman, Illinois | A woman had lived for three decades with double scoliosis, a missing rib, and four back surgeries. |
| Testimony from California | A woman had severe migraine for seven years and could not bear sunlight or ordinary sound. Apostle Rambabu laid hands on her and said “Restore,” and the migraine ended. |
| Miracle from Dallas | A woman had been deaf in her left ear since childhood. She began to hear after Apostle Rambabu called out her condition and cast his shadow on her. |

**Sermons** — intro: “Messages from the Evangelist Rambabu channel.”

| Title | URL |
| --- | --- |
| Evangelist Rambabu | https://www.youtube.com/c/EvangelistRambabuRambo |
| Playlist to be published | — |
| Playlist to be published | — |

**New to HSG** — intro: “Join us every Sunday.” These times supersede the service times in the intent.

| Service | Language | Time |
| --- | --- | --- |
| Word Fest Service | English | 8–9am |
| Miracles and Healing Service | Multilingual | 9:30am onwards |

## Page

Left aligned. One reading column, about 65 characters. Fraunces stays the only typeface: the leader’s name is the large setting; body uses the same family with open line-height.

The memorable element is the name and the portrait. Sections are lists. Gold (`primary`) is the name, the current nav item, and text links. Body stays `foreground`. The portrait field uses `card`. No second palette beyond [docs/architecture.md](../../architecture.md) and the tokens already in `src/app/globals.css`.

```
[mark] Holy Spirit Generation     Home  About  Events  Praise Reports  Watch  Contact Us  Give

Apostle Dr. P. S. Rambabu                         [ portrait field ]
Holy Spirit Generation is a Word-based, ...

What's going on
Highlight to be published
Highlight to be published
Highlight to be published
Events
```

The other three sections repeat that shape: heading, intro when specified, items, one link.

| | |
| --- | --- |
| Header | Existing `/brand/hsg-logo.jpg` with `.logo-mark`, small, linking to `/`. Church name beside it. Then the nav. |
| Hero | `h1` is “Apostle Dr. P. S. Rambabu”. Blurb under the name. Portrait to the right on wide viewports, stacked under the name when narrow. |
| Portrait | No photo is supplied. Render a portrait-shaped `card` field, `aria-hidden`, because the name is already the `h1`. When `portrait` is set, `next/image` replaces the field; alt is “Apostle Dr. P. S. Rambabu”. |
| Sections | `h2` headings, in the intent’s order. An item with a URL is a link. An item without a URL is text. |
| Section links | What’s going on → Events. Highlighted testimonies → Praise Reports. Sermons → Watch. New to HSG → Contact Us. Link text is the destination label. |
| Narrow nav | Below `64rem`, the seven links sit behind a button labeled “Menu” (`aria-expanded`). At `64rem` and up, the list is visible and the button is absent. |
| Motion | None. |
| Document title | `Holy Spirit Generation`. Description is the blurb. Shell titles are `{Page} \| Holy Spirit Generation`. |

## Content

`src/content/home/` replaces `src/content/home.ts`. `@/content/home` remains the import path. Pages are static. No request fetches copy, playlists, or testimonials.

| Export | Fields |
| --- | --- |
| `church` | `name` |
| `leader` | `name`, `blurb`, `portrait` (`null` or `{ src, alt }`) |
| `nav` | `{ label, href }[]` in nav order |
| `sections` | `{ heading, intro?, items: { title, text?, href? }[], more: { label, href } }[]` in section order |

`src/app/layout.tsx` reads `church.name` and `leader.blurb` for metadata and renders the header. `src/content/home.test.ts` moves to `src/content/home/home.test.ts`.

## Routes

| Label | Path | Home section |
| --- | --- | --- |
| Home | `/` | — |
| About | `/about` | — |
| Events | `/events` | What’s going on |
| Praise Reports | `/praise-reports` | Highlighted testimonies |
| Watch | `/watch` | Sermons |
| Contact Us | `/contact` | New to HSG |
| Give | `/give` | — |

Each path other than `/` is a static page: the shared header, an `h1` of the nav label, and “This page will be published here.” Give is nav only.

External URLs open in the same tab.

## Acceptance

- Home shows the leader name, the portrait field, the blurb, then the four sections in order.
- Each section shows the items in the copy tables and one destination link.
- Nav labels and paths match the route table. Every path renders.
- Placeholder rows have no `href`. The only external URL is the Evangelist Rambabu channel.
- `portrait` is null. No new image file.
- The old summary sentence is gone from content, metadata, and `home.test.ts`.
- Tests assert church name, blurb, section order, nav, service times, and which items have a URL.
- Keyboard: skip link to main content, visible focus, Menu opens and closes the same seven links.
- Text and gold links meet contrast on the navy background. Touch targets for Menu and nav links are at least 44px.

## Concerns

| Topic | What this spec does |
| --- | --- |
| Open questions in the intent | Playlist URLs, live highlights, testimony URLs, and a portrait stay empty fields. |
| Miracle stories | Wording is adapted because the intent asks for it. Items are not labeled as HSG services. |
| Visit address | The about page states an address. This slice leaves it for Contact Us, which is still a shell. A visitor cannot get directions from Home. |
| Embeds and events | [docs/architecture.md](../../architecture.md) still defers the embed mechanism and the event model. Home stores optional URLs and renders links. |
| Palette | Architecture locks navy, blue, and gold. This spec does not add another palette. |
| Extra claims on the about page | Growth, “supernatural lifestyle,” and the biography are on the source page. The blurb stays the short sentence the intent names. |
