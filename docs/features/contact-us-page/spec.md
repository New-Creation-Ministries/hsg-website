# Spec: Contact Us page

Status: ready
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: frontend-design

## Outcome

Replace the `/contact` shell with the locked visit-desk layout ([`.impeccable/mocks/visit-desk.png`](../../../.impeccable/mocks/visit-desk.png)). Visit invitation, maps directions, arrival facts, contact strip, and live-translation link are fixed in [intent.md](./intent.md) Proposed outcome. Copy lives under `src/content/contact/` ([ADR 0001](../../adr/0001-public-pages.md)). Shared SiteHeader stays ([ADR 0002](../../adr/0002-public-navigation-and-recovery.md)). SiteFooter and cream-strip chrome: [intent.md](./intent.md) Constraints. Architecture: [docs/architecture.md](../../architecture.md). No new backend, auth, or embeds beyond the Glossa link.

## Delta

| Before | After |
| --- | --- |
| `/contact` shell: `h1` Contact Us + “This page will be published here.” | Full Contact Us page per visit-desk mock |
| No `src/content/contact/` | Typed copy under `src/content/contact/` ([ADR 0001](../../adr/0001-public-pages.md)) |
| No on-site visit invitation, directions, arrival guidance, or contact strip | Split Visit / Arrival main + cream contact strip as page bottom |

Do not redesign layout, palette, or lime GET DIRECTIONS control; point at the visit-desk mock.

## Content

Locked labels, headline, CTA, arrival facts, phone, email, socials, and destination URLs: [intent.md](./intent.md) Proposed outcome.

| Block | Role |
| --- | --- |
| Visit HSG | Eyebrow, headline, address, GET DIRECTIONS |
| When you arrive | Heading + ordered arrival facts; live-translation row is a link |
| Contact strip | Phone, email, YouTube, Instagram, WhatsApp |

Ownership:

| Fact | Source of truth |
| --- | --- |
| Address display | Home `pageNotes.address` ([`src/content/home/index.ts`](../../../src/content/home/index.ts)); import into contact content — no second authoritative string |
| Phone and email display + `tel:` / `mailto:` | Give `helpBar` ([`src/content/give/index.ts`](../../../src/content/give/index.ts)); import — no second authoritative copy |
| YouTube and Instagram hrefs | Same URLs as SiteFooter ([`src/components/site-footer.tsx`](../../../src/components/site-footer.tsx)) |
| Maps href, Glossa href, Visit/Arrival locked strings, WhatsApp label | `src/content/contact/` per intent |

Out of scope: [intent.md](./intent.md) Constraints. WhatsApp with no channel URL yet: label text only ([ADR 0002](../../adr/0002-public-navigation-and-recovery.md) G7).

## Page

- Path: `/contact`. Title: `Contact Us | Holy Spirit Generation` (root template).
- Composition: visit-desk mock — 50/50 main (cobalt Visit HSG left, deep olive Arrival right), cream contact strip as the bottom of the page (page content, not SiteFooter; [intent.md](./intent.md) Constraints).
- Shared SiteHeader; no SiteFooter on `/contact`; current nav item: Contact Us ([intent.md](./intent.md) Constraints; [ADR 0002](../../adr/0002-public-navigation-and-recovery.md) for shared nav).
- Skip link → `#main-content`. Visible page heading / `h1` is the mock’s “COME AND RECEIVE YOUR MIRACLE”; no shell `h1` “Contact Us.” “WHEN YOU ARRIVE” is the next heading level.
- Tokens follow the mock (cobalt left, deep olive right, acid GET DIRECTIONS and Arrival accents, pale strip). Reuse Home Spirit in Blue token names where values match ([ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md) / Home tokens). Do not invent a second palette.
- Type: match the mock’s uppercase display / sans body. Use the app font pipeline (Oswald display, DM Sans body) unless the mock clearly requires otherwise; do not add a third family.
- Narrow viewports: stack Visit above Arrival; contact strip remains full-width at the bottom. All blocks remain visible.
- GET DIRECTIONS, live-translation link, YouTube, and Instagram: `target="_blank"` and `rel="noopener noreferrer"` ([ADR 0002](../../adr/0002-public-navigation-and-recovery.md) G7). Visible link text and Glossa destination: [intent.md](./intent.md) Proposed outcome.
- Phone and email hrefs: Give `helpBar` via Content ownership. Display strings: intent. These are not http(s) destinations; do not force `target="_blank"`.
- WhatsApp: per Content / G7.
- No motion kit. `prefers-reduced-motion` not required beyond existing site defaults.
- No forms, embeds, or member accounts on this page.

## Acceptance

- `/contact` does not show the shell sentence.
- Visit eyebrow, headline, address, GET DIRECTIONS href, arrival facts (including live-translation link text and Glossa href), phone, email, YouTube, and Instagram match the intent and ownership table.
- Layout matches the visit-desk mock except shared SiteHeader, Contact Us as current nav, no SiteFooter, WhatsApp without URL until supplied, and the narrow stack rule.
- External http(s) links on this page open in a new tab (G7).
- Cream contact strip is the bottom of `/contact` page content (per Page).
- Static public page; publish by deploy via `src/content/contact/`.

## Concerns

| Topic | Issue |
| --- | --- |
| Visual direction vs ADR 0003 | [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md) is Home’s Spirit in Blue contract. Contact follows the visit-desk mock; it does not reopen ADR 0003. |
| SiteFooter omission | `/contact`-only; do not drop SiteFooter on other routes. Do not implement the cream strip as SiteFooter or a shared footer substitute. |
