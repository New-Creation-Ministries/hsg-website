# Spec: Tablet and iPad viewport layout

Status: ready
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: write-spec, frontend-design, doc-review

## Scope

- Correct the tablet/iPad layout and About navigation failures listed in [intent.md](./intent.md).
- Absorb [about-scene-snapping](../about-scene-snapping/intent.md) and [about-scene-dot-navigation](../about-scene-dot-navigation/intent.md); do not plan them as separate outstanding work.
- Treat [about-scene-snapping/spec.md](../about-scene-snapping/spec.md) [Snap contract](../about-scene-snapping/spec.md#snap-contract), [Phone layout contract](../about-scene-snapping/spec.md#phone-layout-contract), [CSS boundary](../about-scene-snapping/spec.md#css-boundary), and [Verification](../about-scene-snapping/spec.md#verification) as authoritative for snap, phone layout, and their existing desktop/phone coverage.
- Treat [about-scene-dot-navigation/intent.md](../about-scene-dot-navigation/intent.md) Proposed outcome as authoritative for scene-dot click behavior above 800px.
- Follow unchanged About, Give, and Contact Us page contracts for behavior not listed here: [about-page/spec.md](../../features/about-page/spec.md), [give-page/spec.md](../../features/give-page/spec.md), [contact-us-page/spec.md](../../features/contact-us-page/spec.md).
- Layout and CSS only for Give scripture presentation; do not change `2 CORINTHIANS 9:6 • KJV` in `src/content/give/index.ts`.
- Do not redesign About, Give, Contact Us, or SiteFooter beyond correcting the listed failures.
- Preserve desktop and phone behavior that already meets those page contracts unless a shared layout change is required.
- No backend, content-model, route, or durable architecture change; no ADR.

## Target viewports

| Class | Sizes | Coverage |
| --- | --- | --- |
| Tablet-owned | 768×1024 portrait; 1024×768 landscape | About photo fit; Give leaflet / help / panel containment; Contact desk / strip / panel containment; SiteFooter address vs social logos; automated tests for those behaviors |
| Absorbed About snap / dots | Viewports in [about-scene-snapping/spec.md](../about-scene-snapping/spec.md#verification) and [about-scene-dot-navigation/intent.md](../about-scene-dot-navigation/intent.md) | Snap settle, phone layout, scene-dot clicks, responsive dots |

Do not add other iPad sizes (no 820×1180, no 1024×1366).

## About photo fit

At both tablet-owned viewports, every About scene photo plate that uses a photo remains fully visible horizontally: no horizontal clipping of the plate or its image treatment.

Plate modes, fill color, and phone subject positions: [Phone layout contract](../about-scene-snapping/spec.md#phone-layout-contract). Scene order, copy, and alternating desktop columns stay unchanged beyond what horizontal fit requires.

## About snap and scene dots

| Requirement | Contract |
| --- | --- |
| Snap, phone layout, scroll padding, reduced motion, footer snap | [Snap contract](../about-scene-snapping/spec.md#snap-contract), [Phone layout contract](../about-scene-snapping/spec.md#phone-layout-contract), [CSS boundary](../about-scene-snapping/spec.md#css-boundary) |
| Scene-dot clicks above 800px | [about-scene-dot-navigation Proposed outcome](../about-scene-dot-navigation/intent.md#proposed-outcome) |
| Positioning mechanism | [about-scene-snapping Scope](../about-scene-snapping/spec.md#scope); [about-scene-dot-navigation Constraints](../about-scene-dot-navigation/intent.md#constraints) |

## Give and Contact Us panels

At both tablet-owned viewports:

| Surface | Required behavior |
| --- | --- |
| Give scripture | The existing citation block (`scripture.citation` from `src/content/give/index.ts`) does not render below the “Have Questions or need help” region (`.give-help`) |
| Give panels | Cobalt scripture / ink why panels stay within the page’s white base; no panel overflow past that base |
| Contact panels | Cobalt visit / olive arrival panels stay within the page’s white base; same panel-vs-base overflow rule as Give |
| Content | No copy, CTA, help, or contact-strip string changes; layout only. Citation immutability: [Scope](#scope). |
| Page contracts | Keep Give leaflet and Contact visit-desk compositions from their feature specs; fix containment and vertical order only |

`/contact` omits SiteFooter per [contact-us-page/spec.md](../../features/contact-us-page/spec.md); panel containment above applies to Contact page chrome, not SiteFooter.

## SiteFooter

At both tablet-owned viewports, on every route that renders `SiteFooter`:

| Requirement | Behavior |
| --- | --- |
| Address vs socials | `.footer-address` and `.footer-social` logos do not overlap or collide |
| Content | Keep ministry name, church name, address, and social hrefs unchanged |
| Other viewports | Preserve existing desktop and phone footer layout that already meets page contracts unless a shared change is required |

## Verification

| Coverage | Required assertion |
| --- | --- |
| Absorbed About snap / phone / dots | All rows in [about-scene-snapping Verification](../about-scene-snapping/spec.md#verification), including settled desktop via scene dots and responsive dots at 801px / desktop |
| About photos at tablet | At 768×1024 and 1024×768, every photo plate’s horizontal bounds stay within the viewport; no horizontal clip of plate or image |
| Give at tablet | At both tablet sizes: citation not below `.give-help`; blue/ink panels within white base |
| Contact at tablet | At both tablet sizes: cobalt/olive panels within white base |
| Footer at tablet | At both tablet sizes on a representative SiteFooter route (and any other footer-bearing pages covered by existing e2e): address and social logos have non-overlapping boxes |
| Regression | Existing About, Give, Contact, and footer checks that already pass remain green; phone wheel/PageDown snap unchanged |

Shared viewport helpers for the two tablet sizes belong beside existing e2e helpers (`e2e/helpers.ts` or equivalent).

Run `make build`, `make test`, and `make lint` after implementation; require “Build succeeded”, all tests passing, and zero lint warnings.

## Acceptance

- [Scope](#scope), [Target viewports](#target-viewports), [About photo fit](#about-photo-fit), [About snap and scene dots](#about-snap-and-scene-dots), [Give and Contact Us panels](#give-and-contact-us-panels), and [SiteFooter](#sitefooter) are satisfied with all evidence in [Verification](#verification) passing.

## Files

| Path | Change |
| --- | --- |
| `src/app/globals.css` | Tablet photo fit; absorbed snap/phone/dot CSS; Give/Contact panel containment and order; SiteFooter collision fix at tablet widths |
| `src/components/site-footer.tsx` | Only if markup change is required for non-colliding tablet layout |
| `e2e/about.spec.ts` | Absorbed snap/dot coverage; tablet photo-fit coverage |
| `e2e/give.spec.ts` / contact e2e (or shared tablet specs) | Tablet scripture/help order and panel containment |
| `e2e/helpers.ts` | Shared 768×1024 and 1024×768 viewport constants |
| Focused page/CSS unit tests | Contract assertions for tablet/layout CSS where the repo already uses that pattern |

## Concerns

| Topic | Record |
| --- | --- |
| CSS-only scene-dot navigation | Absorbed intents forbid JavaScript-driven scroll positioning. Dot clicks must succeed via corrected CSS snap/anchors. If CSS cannot meet settled-position and `aria-current` checks, that blocks implementation under current policy. |

Unresolved decisions: none.
