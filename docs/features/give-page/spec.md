# Spec: Give page

Status: ready
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: frontend-design

## Outcome

Replace the `/give` shell with the locked leaflet layout ([`.impeccable/mocks/decision/leaflet.png`](../../../.impeccable/mocks/decision/leaflet.png)). Scripture, “Why we give,” GIVE CTA, and help-bar strings are fixed in the intent; do not invent or paraphrase. Payment stays on Razorpay. Copy lives under `src/content/give/` ([ADR 0001](../../adr/0001-public-pages.md)). Shared SiteHeader and SiteFooter stay ([ADR 0002](../../adr/0002-public-navigation-and-recovery.md)). Architecture: [docs/architecture.md](../../architecture.md). No new backend, auth, or embeds.

## Delta

| Before | After |
| --- | --- |
| `/give` shell: `h1` Give + “This page will be published here.” | Full give page per leaflet mock |
| No `src/content/give/` | Typed copy under `src/content/give/` ([ADR 0001](../../adr/0001-public-pages.md)) |
| No on-site payment or help contacts for giving | GIVE → Razorpay; help bar phone + email above SiteFooter |

Do not redesign layout, palette, typography, or chrome; point at the leaflet mock.

## Content

Exact strings: [intent.md](./intent.md) Proposed outcome.

| Block | Role |
| --- | --- |
| Scripture | Display uppercase as mock; citation as intent |
| Why we give | Heading + body from intent; body sentence-case |
| GIVE CTA | Label and href from intent |
| Help bar | Label, phone, and email from intent |

Out of scope: [intent.md](./intent.md) Constraints.

## Page

- Path: `/give`. Title: `Give | Holy Spirit Generation` (root template).
- Composition: leaflet mock — 50/50 main (cobalt scripture left, ink “Why we give” + acid GIVE right), light help band, then SiteFooter.
- Skip link → `#main-content`. Visible page heading / `h1` is the mock’s “Why we give”; no shell `h1` “Give.”
- Shared SiteHeader / SiteFooter. Current nav item: Give. Mock’s Home underline is preview chrome, not production.
- Help bar sits above SiteFooter on `/give`.
- Tokens follow the mock. Reuse Home Spirit in Blue token names where values match ([ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md) / Home tokens): ink page/right panel, cobalt scripture panel, acid CTA and accents, light band for help. Do not invent a second palette.
- Type: match the mock’s uppercase display / sans body. Use the app font pipeline (Oswald display, DM Sans body) unless the mock clearly requires otherwise; do not add a third family.
- Narrow viewports: stack scripture above “Why we give”; help bar remains full-width above the footer. All blocks remain visible.
- GIVE CTA: rectangular acid block, black label, left-aligned under body. `target="_blank"` and `rel="noopener noreferrer"` ([ADR 0002](../../adr/0002-public-navigation-and-recovery.md) G7). Same for any other http(s) external link on this page.
- Phone → `tel:+919036060480`. Email → `mailto:support@rwo.life`. Display strings stay as in the intent. These are not http(s) destinations; do not force `target="_blank"`.
- No motion kit. `prefers-reduced-motion` not required beyond existing site defaults.
- No forms, embeds, or member accounts on this page.

## Acceptance

- `/give` does not show the shell sentence.
- Scripture, citation, “Why we give,” GIVE href, help label, phone, and email match the intent.
- Layout matches the leaflet mock except shared header/footer, Give as current nav, and the narrow stack rule.
- GIVE opens Razorpay in a new tab (G7).
- Help bar is above SiteFooter; SiteFooter remains on `/give`.
- Static public page; publish by deploy via `src/content/give/`.

## Concerns

| Topic | Issue |
| --- | --- |
| Visual direction vs ADR 0003 | [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md) is Home’s Spirit in Blue contract. Give follows the leaflet mock; it does not reopen ADR 0003. |
| frontend-design vs locked mock | frontend-design flags near-black + acid-green as a generic cluster. The accepted mock uses that look; the brief wins — do not redesign. |
