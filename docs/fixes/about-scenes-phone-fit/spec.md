# Spec: About scenes phone fit

Status: ready
Author: Udeet Gulati
Intent: [intent.md](./intent.md)
Skills: write-spec, frontend-design, doc-review

## Scope

- Outcomes, constraints, and deferred work: [accepted intent](./intent.md).
- Layout lock and desktop contract: [about-page spec](../../features/about-page/spec.md) (Page / Content). Phone changes are limited to ≤800px rules in `src/app/globals.css` and any phone-only helpers those rules need.
- Do not reopen [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md). No ADRs for this fix.

## Confirmed phone failures

Evidence: 390×844 viewport against shipped `/about` (Playwright metrics + per-scene screenshots). Scene height vs viewport:

| Scene | Fit failure | Notes |
| --- | --- | --- |
| Founders | Overflow (+119px) + cover crop | Copy ~575px + plate ~388px; `background-size: cover` crops sides |
| Born Again | Overflow (+119px) + contain letterbox | Same height budget; `contain` on `#2a160f` leaves side bars |
| The call | Cover crop | Scene fits (−25px); cover still clips raised hands |
| Gospel to the Nations | Overflow (+83px) + cover crop | Cover crops subject in the short plate |
| The Church | Overflow (+33px) + contain letterbox | Same contain treatment as Born Again |
| The story continues | None for height | Scene fits (−129px); band readable |

Mechanism and shipped CSS: [intent Problem](./intent.md#problem) ([`globals.css`](../../../src/app/globals.css), [scenes.html](../../features/about-page/explorations/scenes.html)).

## Phone layout contract (≤800px)

| Requirement | Behavior |
| --- | --- |
| One scene, one viewport | Each `.scene` (copy + plate/band) fits within the visual viewport when snap is armed. No mid-scene snap landing; heading, copy, and plate/band are fully visible without scrolling inside the scene. |
| Scene height | Cap each photo scene at one viewport tall (`100svh` / equivalent). |
| Plate budget | Plate fills the space left after copy inside that viewport (flex or equivalent). Do not use a fixed `46svh` plate floor. |
| Cover plates | Keep `cover` for Founders, The call, Gospel to the Nations. Set `background-position` so primary subjects stay in frame in the phone plate box. |
| Contain plates | Keep `contain` and `#2a160f` for Born Again and The Church (exploration poster contract). Side bars from contain in a non-matching phone plate box are accepted; do not switch these to `cover` (would crop poster text). |
| The story continues | Keep band (`plate.band`); still fit in one phone viewport with services and address readable. |
| Snap | Change ≤800px snap only if required for the one-viewport rule; keep `prefers-reduced-motion` per [about-page Page](../../features/about-page/spec.md#page). |

## Regression verification

| Surface | Required evidence |
| --- | --- |
| Phone layout | At 390×844 (and the existing phone helper size if different), each scene’s bounding height ≤ viewport height with snap armed; heading + copy + plate/band visible in that viewport. |
| Plate modes | Modes and fill match [Phone layout contract](#phone-layout-contract-800px) Cover / Contain / The story continues rows; no new mid-scene clip under mandatory snap. |
| Desktop | Existing wide-viewport about checks stay green; side-by-side layout unchanged. |
| Screenshots | Phone screenshots of each scene used as fix evidence. |
| Existing e2e | Extend `e2e/about.spec.ts` beyond snap-arm-only at 390×844 with phone fit assertions above. |
| Verification | `make build`, `make test`, `make lint` — “Build succeeded”, all green, zero lint warnings. |

Unresolved decisions: none.
