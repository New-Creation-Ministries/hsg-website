# Spec: About page

Status: ready
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: frontend-design

## Outcome

Replace the `/about` shell with the locked Scenes page ([explorations/scenes.html](./explorations/scenes.html)). Adapt biography and church story from [rwo.life/about-us](https://www.rwo.life/about-us) into the six scenes. Adaptation is allowed; the page does not have to be identical to rwo.life. The story continues (former Sunday scene) service names and times follow Home “New to HSG?” ([home-landing-page/spec.md](../home-landing-page/spec.md)).

Content lives under `src/content/about/` ([ADR 0001](../../adr/0001-public-pages.md)). `/about` keeps shared SiteHeader and SiteFooter ([ADR 0002](../../adr/0002-public-navigation-and-recovery.md)). On `/about` only, `.site-header` is not sticky. The footer is a final scroll-snap after the last scene. Architecture: [docs/architecture.md](../../architecture.md). No new backend, auth, or embeds.

## Delta

| Before | After |
| --- | --- |
| `/about` shell: `h1` About + “This page will be published here.” | Full Scenes page per [scenes.html](./explorations/scenes.html) |
| No `src/content/about/` | Typed copy under `src/content/about/` ([ADR 0001](../../adr/0001-public-pages.md)) |
| Exploration plates `couple.png`, `stage.png`, `night-crusade.png`, `studio.png`, `festival.png`, `filmstrip.png` | Delete all six; out of scope |

Do not redesign layout, scene order, typography, palette, or chrome; point at [scenes.html](./explorations/scenes.html).

## Content

Adapt from [rwo.life/about-us](https://www.rwo.life/about-us). Do not invent biography or service facts. Condensation into scene length is allowed. The page does not have to be identical to rwo.life. The only added claim is Born Again: keep the birth material and also talk about being born again and giving life to Jesus.

| Scene id | Heading | Source on rwo.life | Plate |
| --- | --- | --- | --- |
| `founders` | Founders | Opening founders / Rambo World Outreach paragraph | Family photo `Screenshot_2026-09-25_at_1.49.35_AM-cf239ee9-57d8-453e-ac63-c0e839eeb497.jpg` |
| `born-again` | Born Again | Birth in Bellary through the 1983 healing and early street preaching, plus being born again and giving life to Jesus | Born Again photo `image-18d5cfd3-f15d-40f7-810e-d8aea132f612.jpg` |
| `the-call` | The call | Lecturer years and the 1989 full-time call | Raised-hands photo `image-9063ab83-0af6-437c-8252-de576905cae7.jpg` |
| `nations` | Gospel to the Nations | Open-air campaigns, 89 nations, family in Bangalore | Globe photo `image-8c1c51f3-98dc-43db-8867-45d3395bd94f.jpg` |
| `church` | Namma Bengaluru | HSG founders and senior pastors paragraph | Shepherd photo `Screenshot_2026-09-25_at_1.50.46_AM-05d43de6-4c47-44c8-8c7d-ac0938f6d734.jpg` |
| `story-continues` | The story continues | Intro and visit line; services from Home (below) | Pale band (no photo) |

Use the Founders–The church condensation in [scenes.html](./explorations/scenes.html) when it matches rwo.life; edit only to remove inaccuracy or invented claims, and for the Born Again addition above.

### The story continues

Service names, languages, and times are the Home “New to HSG?” table in [home-landing-page/spec.md](../home-landing-page/spec.md). Import those display fields from `src/content/home/` (same ownership pattern as Events). Do not keep a second authoritative copy under about. Ignore Kannada / English labels and times in scenes.html and on rwo.life.

- Intro: “Join us every Sunday as we gather to worship together.” or Home’s “Join us every Sunday.” No third intro.
- Show language with each Home service record on the band without redesigning the plate.
- The story continues visit address: the locked exploration / rwo form. Footer `pageNotes.address` stays as today unless a later feature unifies them.

## Page

- Path: `/about`. Title: `About | Holy Spirit Generation` (root template).
- Composition, tokens, scroll-snap, scene dots, alternating columns, ≤800px stack: [scenes.html](./explorations/scenes.html).
- Brand logo: `/brand/hsg-logo.jpg`. Accessible name returns to `/`.
- Skip link → `#main-content`. First scene: `founders`.
- Ship the five plates in the Content table. The story continues: band with services and address.
- Exploration images: remove per Delta.
- Do not ship “Exploration · Scenes”, design-reference-only logo or home HTML hrefs.
- On `/about` only, `.site-header` is not `position: sticky`. Other routes keep the sticky header.
- After the last scene, one more scroll-snap stop reveals `SiteFooter`.
- Motion: scene-dot `aria-current` and scroll-snap from the exploration; `prefers-reduced-motion` disables scroll-snap. No entrance fade/slide kit.
- No embeds, forms, or member accounts on this page.

## Acceptance

- `/about` does not show the shell sentence.
- Scenes, headings, sources, and plates match the Content table.
- The story continues services match Home “New to HSG?” via Home content import; Kannada / English service lines are absent.
- Photo plates and image deletes match Page / Delta.
- Layout matches the locked exploration except scene titles, plates, the Born Again addition, The story continues service facts, shared header/footer, the non-sticky header on `/about`, the footer snap, and production brand/logo paths.
- Static public page; publish by deploy via `src/content/about/`.

## Concerns

| Topic | Issue |
| --- | --- |
| Visual direction vs ADR 0003 | [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md) is Home’s Spirit in Blue contract. About follows scenes.html; it does not reopen ADR 0003. |
| Address strings | The story continues plate (rwo / scenes) and footer `pageNotes.address` differ. Unifying is out of scope unless the author directs it. |
