# Spec: About scene snapping

Status: ready
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: write-spec, frontend-design, doc-review

## Scope

- Restore the accepted `/about` scene behavior without changing scene content, order, desktop composition, or visual direction.
- Remove scene-navigation dots at phone widths and preserve their existing presentation and behavior above the phone breakpoint.
- Follow the unchanged [About page Outcome](../../features/about-page/spec.md#outcome), [Page](../../features/about-page/spec.md#page), and [Acceptance](../../features/about-page/spec.md#acceptance) contracts.
- Limit production changes to About snap and responsive layout rules in `src/app/globals.css`.
- Keep `src/components/about-snap.tsx` responsible only for arming CSS snapping after user scroll input.
- Do not add JavaScript-driven scroll positioning.
- No backend, content-model, route, or durable architecture change; no ADR is required.

## Snap contract

| Surface | Required behavior |
| --- | --- |
| Root scroller on `/about` | Use mandatory vertical scroll snap with no top snap-port offset. A selected scene's border box settles at the viewport top, within 1px for subpixel rounding. |
| Root scroller on other routes | Retain the global `6.5rem` scroll padding used to clear the sticky header for anchor navigation. |
| About header | Remain non-sticky and keep its existing initial snap stop. Scrolling past it must allow the first scene to settle at viewport top. |
| Scenes | Keep `scroll-snap-align: start` and `scroll-snap-stop: always`. At rest, no pixels from the preceding or following scene appear inside the viewport. |
| Scene dots above 800px | Keep anchor targets, presentation, and `aria-current` behavior. Dot navigation must use the corrected CSS snap offset. |
| Scene dots at 800px and below | Hide the navigation with `display: none` so it is absent visually, from hit testing, and from the accessibility tree. Scene scrolling remains available through native input; do not add another phone-only scene navigator. |
| Reduced motion | Keep About scroll snapping disabled under `prefers-reduced-motion: reduce`. |
| Footer | Remain the final snap target. The final transition must expose the footer fully without leaving the last scene stranded mid-scene. |

### CSS boundary

- Override `scroll-padding-top` only on `html:has(.about-page)`.
- Keep the global `html { scroll-padding-top: 6.5rem; }` declaration unchanged for sticky-header routes.
- Do not compensate with per-scene margins, transforms, or hard-coded header measurements.

## Phone layout contract

Applies at the existing `max-width: 800px` About breakpoint.

| Requirement | Behavior |
| --- | --- |
| One scene, one viewport | Set each scene to `height: 100svh` and `max-height: 100svh`; copy plus plate or service band remains one snap stop. |
| Grid sizing | Use a two-row phone grid: content-sized copy followed by a `minmax(0, 1fr)` plate row within a one-viewport scene. |
| Copy | Use `1.4rem 1.2rem 1.1rem` padding; headings use `clamp(2.35rem, 11vw, 3.2rem)` with `0.65rem` bottom margin; paragraphs use `0.95rem` type, `1.45` line height, and `0.55rem` sibling spacing. Do not edit or truncate content. |
| Photo plates | Remove the fixed `46svh` floor and let each plate consume the scene height remaining after copy. |
| Cover plates | Founders, The call, and Gospel to the Nations remain `cover`; use phone subject positions `center 18%`, `center 58%`, and `center 42%`, respectively. |
| Contain plates | Born Again and The Church remain `contain` on `#2a160f`; do not crop poster content to eliminate letterboxing. |
| Service band | Use `1.2rem` padding; `0.55rem` service gaps; `0.65rem` top margins; and `1.1rem`, `0.9rem`, `1.55rem`, and `0.95rem` type for service heading, language, time, and address. Do not reserve overlay space for scene navigation. |

## Verification

Extend `e2e/about.spec.ts` for browser behavior and `src/app/about/page.test.ts` for the phone CSS contract.

| Coverage | Required assertion |
| --- | --- |
| Route scoping | `/about` computes a zero top scroll padding; at least one sticky-header route still computes `6.5rem`. |
| Settled desktop transitions | At the existing desktop viewport, perform actual user scroll or scene-dot transitions, wait until scrolling is stable, and assert each selected scene top is within 1px of viewport top. Assert the preceding scene ends at or above the top and the following scene begins at or below the bottom. |
| Settled phone transitions | At 390×844 and the existing 320×700 phone helper viewport, use native scroll input, wait until scrolling is stable, and repeat the settled-position and adjacent-scene checks without relying on scene dots. |
| Responsive scene dots | At 800px wide, `.about-scene-dots` is not visible and is absent from the accessibility tree; at 801px and the desktop viewport, it is visible and retains its links and `aria-current` behavior. |
| Phone height and content | At both phone viewports, every scene height is at most viewport height plus 1px; its heading, all copy, and photo plate or complete service band are in the viewport at rest. |
| Plate treatment | At both phone viewports, cover plates retain `cover` and the three subject positions; contain plates retain `contain` and `rgb(42, 22, 15)`. |
| Footer | On desktop and phone, a final user-driven transition from The story continues settles at the document end with the complete footer in the viewport. |
| Reduced motion | Existing snap-disable coverage remains green. Position assertions run with reduced motion disabled. |
| Visual evidence | Attach or retain one 390×844 screenshot per settled scene for human review. |
| Regression | Existing About content, header behavior, desktop scene-dot behavior, and desktop layout checks remain green. |

## Acceptance

- Acceptance requires the [Scope](#scope), [Snap contract](#snap-contract), and [Phone layout contract](#phone-layout-contract) to be satisfied with all evidence in [Verification](#verification) passing.

## Files

| Path | Change |
| --- | --- |
| `src/app/globals.css` | Scope the snap-port offset, apply the phone layout contract, and hide scene dots at phone widths. |
| `e2e/about.spec.ts` | Add settled-position, bleed, responsive-dot, phone-fit, plate, footer, and screenshot coverage. |
| `e2e/helpers.ts` | Add the shared 390×844 viewport constant. |
| `src/app/about/page.test.ts` | Add the focused one-viewport and hidden-phone-dots CSS contract. |

Unresolved decisions: none.
