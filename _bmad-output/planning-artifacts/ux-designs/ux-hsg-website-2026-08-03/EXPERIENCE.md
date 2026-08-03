---
name: HSG Website
status: draft
sources:
  - {planning_artifacts}/prds/prd-hsg-website-2026-07-18/prd.md
  - {planning_artifacts}/briefs/brief-hsg-website-2026-07-09/brief.md
updated: 2026-08-03
---

# HSG Website — Experience Spine

> Paired with `DESIGN.md`. Maps PRD FR-1–FR-19 to surfaces and Figma mock frames. **Responsive website only** — no native mobile app at launch.

## Foundation

**Website-only delivery.** One responsive web experience at `holyspiritgeneration.org` — not a separate mobile app, not an app wrapper. Visitors use mobile, tablet, and desktop browsers (PRD §4.1, NFR-2). Mobile browsers are the primary launch audience, but navigation and layout follow **web patterns** (top header, in-page links, footer) rather than native app chrome (bottom tab bar, app-style gestures).

No member login at launch. India region only; IST for all time displays. `DESIGN.md` owns visual tokens; this spine owns behavior, IA, and flows.

## Information Architecture

### Global navigation (responsive web header)

**Desktop (≥1024px):** persistent top header — logo left; inline links: Home, About, Visit, Watch, Events, Prayer, Grow, Give, Contact; primary **Give** CTA button on the right.

**Tablet / mobile web (&lt;1024px):** logo + **Give** CTA + menu button. Menu opens a full-screen or slide-over panel listing all nav destinations (no bottom tab bar).

| Nav item | Primary surface | PRD mapping |
|---|---|---|
| Home | Today + quick paths | FR-4, FR-19 |
| About | Identity & trust | FR-1 |
| Visit | Plan a visit + newcomer connect | FR-2, FR-3 |
| Watch | Live + recent services | FR-6 |
| Events | Upcoming list + detail | FR-5 |
| Prayer | Request + healing process | FR-7, FR-8 |
| Grow | Jesus, discipleship, Powerhouse, serve | FR-11–FR-13 |
| Give | Offering flow entry | FR-14, FR-15 |
| Contact | Verified routes | FR-19 |

**Footer (all breakpoints):** service time summary, key contact routes, social links (YouTube, Instagram), copyright.

### Surface catalog

| Surface | Route (illustrative) | Purpose | PRD |
|---|---|---|---|
| Home / Today | `/` | What's happening now, announcements, quick actions | FR-4, FR-19 |
| About HSG | `/about` | Story, beliefs, pastors, ministries, languages | FR-1 |
| Plan a Visit | `/visit` | Service times, venue, directions, parking, children, accessibility | FR-2 |
| Newcomer connect | `/visit/connect` | Register interest / contact Newcomer Volunteer Team | FR-3 |
| Watch | `/watch` | Live stream or fallback + recent sermons | FR-6 |
| Events list | `/events` | Upcoming events ordered by IST start | FR-5 |
| Event detail | `/events/{id}` | Full event info + external registration link | FR-5 |
| Prayer request | `/prayer/request` | General prayer + supported help intents | FR-7 |
| Healing process | `/healing` | Healing card process + Sunday logistics | FR-8 |
| Healing content | `/healing/stories` | Testimonies, sermons, clips | FR-9 |
| Healing follow-up | `/healing/follow-up` | Private healing status / testimony submit | FR-10 |
| Spiritual next steps | `/grow` | Jesus, discipleship, prayer timings | FR-11 |
| Powerhouses | `/grow/powerhouse` | Discover by area, express interest | FR-12 |
| Serve | `/grow/serve` | Volunteer Team opportunities | FR-13 |
| Give | `/give` | Category, amount, review, pay | FR-14, FR-15 |
| Payment result | `/give/result` | Confirmed / pending / failed states | FR-15 |
| Contact | `/contact` | Verified routes by purpose | FR-19 |

→ Visual reference: `mockups/home-desktop.html`, `mockups/home-mobile.html`, `mockups/visit-plan-mobile.html`, `mockups/healing-mobile.html`, `mockups/give-mobile.html`, `mockups/watch-mobile.html`

## Voice and Tone

Warm, welcoming, faith-filled. Explain church terms (Powerhouse, healing card). Practical info is direct and scannable.

| Do | Don't |
|---|---|
| "Next service · Sunday 10:00 AM IST" | "Join us this weekend!" without time |
| "Your request was sent to our pastoral care team." | "We'll pray for you right now." |
| "Giving is voluntary. Prayer and follow-up are not connected to offering." | "Give thanks for your healing" on submit screen |
| "Healing cards are created before the Sunday service." | Promise a specific healing outcome |

## Component Patterns

| Component | Use | Behavioral rules |
|---|---|---|
| Today banner | Home | Shows live state OR next service + venue link; no autoplay video |
| Quick action grid | Home | Plan Visit, Watch, Request Prayer, Give — always visible without scroll on 390px |
| Service facts block | Visit, Healing | Schedule, map link, parking, children, wheelchair — mark unavailable fields explicitly |
| Live player area | Watch | Live label only when stream active; fallback shows next service + recent item |
| Event row | Events | IST date/time; cancelled state explicit; ended events removed from upcoming |
| External registration CTA | Event detail | Opens approved form; site is not source of truth for registration data |
| Prayer intent selector | Prayer request | Separates prayer vs practical help; urgent-needs guidance above fold |
| Healing card steps | Healing | Numbered Sunday process; links to visit logistics |
| Amount chips + custom | Give | No preselected amount; category required before pay |
| Payment status panel | Give result | Distinct UI for confirmed / pending / failed; idempotent receipt display |
| Contact route card | Contact | Purpose label + owning Volunteer Team + channel |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Service live | Home, Watch | Green live badge; player or link to stream |
| No live stream | Watch | Next service time + recent sermon card + YouTube channel link |
| Stream failure | Watch | Non-playing fallback; no infinite loader |
| Empty upcoming events | Events | "No upcoming events" + link to contact for enquiries |
| Form submit success | Prayer, Newcomer, Powerhouse | Confirm delivery to routing process, not human response promise |
| Form submit failure | All forms | Retain entered fields; show verified alternative contact |
| Payment pending | Give result | Explain verification path before retry |
| Payment confirmed | Give result | Receipt reference + download; single record even on refresh |
| Critical content conflict | Any | Release-blocking — not shown in mocks; ops unpublish path |

## Interaction Primitives

- Click/tap primary actions; no hover-only affordances (NFR-2).
- External links (maps, YouTube, Google Forms) open in new tab with accessible label.
- Calendar export one-way from approved event record.
- No autoplay video on Home.
- Sticky top header on scroll; mobile menu closes on navigation or Escape.
- Browser back/forward and deep links work for every public route — no app-only routing.

## Accessibility Floor

WCAG 2.2 Level AA (NFR-1). Keyboard operable; visible focus; 44px min touch targets; form labels and errors programmatically associated; images have alt text; contrast verified on `DESIGN.md` token pairs. Authoring CMS accessibility is out of mock scope but required in FR-16.

## Key Flows

### Flow 1 — Ananya plans first visit (UJ-1)

1. Ananya lands on Home from search.
2. Today banner shows next Sunday 10:00 AM IST + venue name.
3. She clicks **Plan a Visit**.
4. Visit surface shows service schedule, map, parking, children's church, wheelchair support, languages.
5. She clicks **Connect with Newcomer Team**.
6. **Climax:** She submits interest; confirmation explains message was routed to Newcomer Volunteer Team.

### Flow 2 — Ravi seeks healing prayer (UJ-2)

1. Ravi opens Healing from Home nav or Prayer section.
2. He reads healing belief summary and numbered healing-card steps.
3. Inline links jump to Sunday service time and wheelchair info on Visit surface.
4. He browses healing testimonies (clearly not outcome promises).
5. **Climax:** He knows to arrive before service to create a healing card.

### Flow 3 — Arjun gives offering (UJ-5)

1. Arjun clicks **Give** in the site header or home quick action.
2. Selects category (e.g. General Offering); enters amount — no default selected.
3. Reviews summary; completes payment.
4. **Climax:** Confirmed state shows receipt reference only after provider confirmation.

### Flow 4 — Meera checks today (UJ-3)

1. Meera opens Home.
2. Reads announcements and next event.
3. Clicks event → detail → external registration.
4. **Climax:** Task complete in one session without Instagram/WhatsApp dig.

## Responsive & Platform

**Website only — no native app.** Single codebase responsive site; all journeys work in mobile, tablet, and desktop browsers (NFR-2). There is no App Store / Play Store release, no install prompt, and no app-specific navigation patterns.

| Breakpoint | Navigation | Layout notes |
|---|---|---|
| ≥1024px | Inline top nav + footer | Multi-column content, max-width 1200px |
| 768–1023px | Header menu + footer | Reduced columns, touch-friendly targets |
| 320–767px | Header menu (hamburger) + footer | Single column; essential actions above fold |

Mobile browser visitors are the primary launch audience, but they use **Safari/Chrome**, not a dedicated HSG app.
