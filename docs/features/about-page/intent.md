# Intent: About page
Author: Udeet Gulati
Status: ready

## Problem

`/about` is a published shell: the heading is About and the body is “This page will be published here.” Home already links About to `/about`.

## Proposed outcome

- `/about` is a full about page for Holy Spirit Generation.
- Page ships the locked exploration UI ([docs/features/about-page/explorations/scenes.html](explorations/scenes.html)).
- Biography and church story from [rwo.life/about-us](https://www.rwo.life/about-us) are adapted into the locked scenes (Founders, Born Again, The call, Gospel to the Nations, Namma Bengaluru, The story continues). Adaptation is allowed; the page does not have to be identical to rwo.life. Do not invent other biography.
- Born Again keeps the birth material from rwo.life and must also talk about being born again and giving life to Jesus.
- The story continues keeps the former Sunday scene content: Home “New to HSG?” service names and times ([docs/features/home-landing-page/spec.md](../home-landing-page/spec.md)). Title only changes.
- Plates:
  - Founders — family photo: `Screenshot_2026-09-25_at_1.49.35_AM-cf239ee9-57d8-453e-ac63-c0e839eeb497.jpg`
  - The call — `image-9063ab83-0af6-437c-8252-de576905cae7.jpg`
  - Gospel to the Nations — `image-8c1c51f3-98dc-43db-8867-45d3395bd94f.jpg`
  - Namma Bengaluru — `Screenshot_2026-09-25_at_1.50.46_AM-05d43de6-4c47-44c8-8c7d-ac0938f6d734.jpg`
  - Born Again — `image-18d5cfd3-f15d-40f7-810e-d8aea132f612.jpg`
  - The story continues — no plate.
- Drop exploration plates: `couple.png`, `stage.png`, `night-crusade.png`, `studio.png`, `festival.png`, `filmstrip.png`.

## Affected users and systems

- Visitors and members on `/about`. Home hero About links here ([docs/features/home-landing-page/spec.md](../home-landing-page/spec.md)).
- Church website ([docs/architecture.md](../../architecture.md)). No new backend, auth, or embeds for this feature.

## Constraints

- UI design is locked to [docs/features/about-page/explorations/scenes.html](explorations/scenes.html). Do not redesign layout, scene order, typography, or palette.
- `/about` keeps shared SiteHeader and SiteFooter. On this page only, the header is not sticky. The footer is a final scroll-snap after the last scene.
- Content source is [rwo.life/about-us](https://www.rwo.life/about-us). Adapt into the locked scenes; do not invent biography or service facts. The page does not have to be identical to rwo.life.
- The story continues service names and times must match Home “New to HSG?” ([docs/features/home-landing-page/spec.md](../home-landing-page/spec.md)), not rwo.life or scenes.html.
- Ship only the plates listed under Proposed outcome. The story continues has no plate. Drop `couple.png`, `stage.png`, `night-crusade.png`, `studio.png`, `festival.png`, and `filmstrip.png`; they are out of scope.
- Static public page only; no member accounts for this feature.

## Open questions

None.
