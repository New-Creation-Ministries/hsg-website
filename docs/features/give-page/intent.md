# Intent: Give page
Author: Udeet Gulati
Status: ready

## Problem

`/give` is a published shell: the heading is Give and the body is “This page will be published here.” Nav already links Give to `/give`. Visitors have no on-site scripture, giving rationale, payment link, or help contacts for giving.

## Proposed outcome

- `/give` is a full public give page for Holy Spirit Generation.
- UI matches [`.impeccable/mocks/decision/leaflet.png`](../../../.impeccable/mocks/decision/leaflet.png) exactly: split main (blue scripture left, black “Why we give” + lime GIVE CTA right), light help bar below.
- Scripture (KJV, as in the mock): “But this I say, He which soweth sparingly shall reap also sparingly; and he which soweth bountifully shall reap also bountifully.” Citation: `2 CORINTHIANS 9:6 • KJV`.
- “Why we give” body (exact from [rwo.life/give-india](https://www.rwo.life/give-india)): “God is generous and so he calls us to be as well. What we do with what God has given us shows the world where our hearts are at and helps proclaim the gospel. We want to glorify God with every area of our lives, and that includes what we do with our finances.”
- GIVE CTA links to `https://rzp.io/rzp/JKx5HhpN` in a new tab. Any other external links on this page also open in a new tab ([docs/adr/0002-public-navigation-and-recovery.md](../../adr/0002-public-navigation-and-recovery.md)).
- Need-help bar: “Have questions or need help?” and phone `+91-9036 060 480` from rwo.life/give-india; email `support@rwo.life` (site-specific; not on rwo.life). The light help bar sits above the shared SiteFooter; SiteFooter stays on `/give`.

## Affected users and systems

- Visitors and members on `/give`. Shared nav Give destination ([docs/adr/0001-public-pages.md](../../adr/0001-public-pages.md), [docs/adr/0002-public-navigation-and-recovery.md](../../adr/0002-public-navigation-and-recovery.md)).
- Church website ([docs/architecture.md](../../architecture.md)). No new backend, auth, or embeds. Payment stays on Razorpay.

## Constraints

- Follow the leaflet mock under Proposed outcome; do not redesign.
- Do not invent giving copy, payment methods, or contacts beyond Proposed outcome.
- Keep shared SiteHeader and SiteFooter. Page remains a static public route under `/give`.
- Out of scope: QR code, address block, and other rwo.life/give-india elements not in the mock.

## Open questions

None.
