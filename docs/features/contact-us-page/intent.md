# Intent: Contact Us page
Author: Udeet Gulati
Status: ready

## Problem

`/contact` is a published shell: the heading is Contact Us and the body is “This page will be published here.” Nav already links Contact Us to `/contact`. Visitors have no on-site visit invitation, directions, arrival guidance, phone, email, or socials for contacting or finding the church.

## Proposed outcome

- `/contact` is a full public Contact Us page for Holy Spirit Generation.
- UI matches [`.impeccable/mocks/visit-desk.png`](../../../.impeccable/mocks/visit-desk.png): split main (blue Visit HSG left, dark green arrival instructions right), cream contact strip below, lime GET DIRECTIONS control. Shared nav highlights Contact Us.
- Visit HSG: eyebrow “VISIT HSG”; headline “COME AND RECEIVE YOUR MIRACLE”; address from Home `pageNotes.address` ([`src/content/home/index.ts`](../../../src/content/home/index.ts)): `NC Arena #3 Near Legacy School & Moto Mind Shop Byrithi, Village, Kothanur, Bengaluru, Karnataka 560077`.
- GET DIRECTIONS links to `https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KUmCSu__Ga47McXkTAwuEFl1&daddr=NC+Arena+%233+Near+Legacy+School+%26+Moto+Mind+Shop+Byrithi,+Village,+Kothanur,+Bengaluru,+Karnataka+560077` (destination matches that address). External links open in a new tab ([docs/adr/0002-public-navigation-and-recovery.md](../../adr/0002-public-navigation-and-recovery.md)).
- Arrival instructions (warm/welcoming rephrase allowed; keep these facts):
  - Go in past the Bosch showroom.
  - Two-wheeler parking is in front of Bosch on Sundays.
  - Four-wheeler parking is in the ground opposite, next to Sam Palace.
  - Healing cards for healing prayer in the second service starting 8am.
  - Wheelchairs are available for people who cannot walk.
  - Please meet volunteers if this is your first visit.
  - Lunch is provided after the service.
  - Live translation: visible text “Live Translation using AI” is the link. Destination `https://glossa.live/holy-spirit-generation`. Do not show the raw URL as page text.
- Contact strip: phone `+91-9036 060 480` and email `support@rwo.life` (same as Give help bar, [`src/content/give/index.ts`](../../../src/content/give/index.ts)); socials YouTube, Instagram, and a WhatsApp channel item whose URL is added after this work.
- YouTube and Instagram URLs from SiteFooter ([`src/components/site-footer.tsx`](../../../src/components/site-footer.tsx)): `https://www.youtube.com/c/EvangelistRambabuRambo`, `https://www.instagram.com/holyspiritgeneration777/`.

## Affected users and systems

- Visitors and members on `/contact`. Shared nav Contact Us destination ([docs/adr/0001-public-pages.md](../../adr/0001-public-pages.md), [docs/adr/0002-public-navigation-and-recovery.md](../../adr/0002-public-navigation-and-recovery.md)). Home New to HSG section link goes to Contact Us / `/contact` ([docs/features/home-landing-page/spec.md](../home-landing-page/spec.md)).
- Church website ([docs/architecture.md](../../architecture.md)). No new backend, auth, or embeds beyond the Glossa live-translation link.

## Constraints

- UI reference is the visit-desk mock under Proposed outcome; do not redesign the split layout, palette, or lime directions control.
- Information source of truth is the user content list under Proposed outcome. Mock-only lines (for example “Volunteers will guide you.” and “We appreciate you visiting.”) are not required content.
- Do not invent address, phone, email, social URLs, or maps URL beyond Proposed outcome and Open questions.
- `/contact` keeps the shared SiteHeader and does not render the shared SiteFooter. The cream contact strip stays as page content (phone, email, socials), not the site footer. Page remains a static public route under `/contact`.

## Open questions

None.
