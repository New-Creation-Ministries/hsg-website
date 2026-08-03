---
name: HSG Website
description: Holy Spirit Generation Church — responsive website (no native app). Official India digital home. Youth-forward, dark-first.
status: draft
colors:
  surface-base: '#0C0C12'
  surface-raised: '#16161F'
  surface-overlay: '#1E1E2A'
  ink-primary: '#F4F4F8'
  ink-secondary: '#9B9BA8'
  ink-disabled: '#5C5C6A'
  accent-primary: '#E5A84B'
  accent-secondary: '#7C6CF0'
  border-hairline: '#2A2A38'
  live-indicator: '#34D399'
  error: '#F87171'
  success: '#34D399'
typography:
  display:
  family: 'Outfit, system-ui, sans-serif'
  weight: 700
  size: 32px
  lineHeight: 1.15
  heading:
  family: 'Outfit, system-ui, sans-serif'
  weight: 600
  size: 22px
  lineHeight: 1.25
  body:
  family: 'DM Sans, system-ui, sans-serif'
  weight: 400
  size: 16px
  lineHeight: 1.5
  label:
  family: 'DM Sans, system-ui, sans-serif'
  weight: 500
  size: 14px
  lineHeight: 1.4
  meta:
  family: 'DM Sans, system-ui, sans-serif'
  weight: 400
  size: 13px
  lineHeight: 1.35
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  pill: 999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
  '7': 48px
  '8': 64px
components:
  nav-bar-height: 56px
  nav-bar-height-desktop: 64px
  touch-target-min: 44px
  card-padding: 16px
  section-gap: 24px
updated: 2026-08-03
---

## Brand & Style

Holy Spirit Generation is a vibrant, Word-based, Spirit-filled church. The website should feel **youth-forward, current, and alive** — not a static brochure. Visitors should sense worship energy and clarity at once: warm faith-filled language, practical information that is easy to scan, and a dark visual environment that feels modern without sacrificing readability.

Photography and video are central. Authentic HSG worship, community, and ministry imagery support the message; text always wins when contrast is tested. The experience remains welcoming to every age — bold typography and clear hierarchy carry newcomers who may be unfamiliar with church culture.

## Colors

Dark mode is the primary launch expression (PRD §8.1). Light mode is a future consideration; mocks and Figma frames default to dark.

| Token | Hex | Role |
|---|---|---|
| `surface-base` | `#0C0C12` | Page canvas, full-bleed sections |
| `surface-raised` | `#16161F` | Cards, nav bar, tab bar |
| `surface-overlay` | `#1E1E2A` | Nested panels, input fields |
| `ink-primary` | `#F4F4F8` | Headlines, primary body |
| `ink-secondary` | `#9B9BA8` | Supporting text, meta labels |
| `ink-disabled` | `#5C5C6A` | Disabled controls |
| `accent-primary` | `#E5A84B` | Primary CTAs, key highlights (warm gold) |
| `accent-secondary` | `#7C6CF0` | Secondary emphasis, live/watch accents |
| `live-indicator` | `#34D399` | Live badge, success states |
| `border-hairline` | `#2A2A38` | Dividers, card borders |

Avoid: outcome-promising greens on healing content, pressure-red urgency on giving, low-contrast text on photography without scrim.

## Typography

- **Display** — Hero headlines on Home and section heroes. Outfit 700, 32px. Used sparingly.
- **Heading** — Section titles, card titles. Outfit 600, 22px.
- **Body** — Paragraphs, descriptions. DM Sans 400, 16px.
- **Label** — Buttons, nav labels, form labels. DM Sans 500, 14px.
- **Meta** — Timestamps, IST labels, captions. DM Sans 400, 13px.

Minimum body size on mobile: 16px. Line height never below 1.4 for body text. WCAG 2.2 AA contrast required on all text/fill pairings.

## Layout & Spacing

Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px.

- Mobile web content margins: 16px horizontal.
- Desktop max content width: 1200px centered; hero may full-bleed.
- Section vertical gap: 24px (mobile), 32px (desktop).
- Card internal padding: 16px.
- Quick-action tiles: 2-column grid, 12px gap.

Breakpoints (CSS pixels): 320 (minimum), 390 (mobile web mock), 768 (tablet), 1024 (desktop nav), 1440 (desktop mock).

## Elevation & Depth

Hierarchy through surface tone, not heavy shadows. Optional subtle shadow on modals: `0 8px 32px rgba(0,0,0,0.45)`. Photography heroes use bottom gradient scrim (`transparent → surface-base`) for text legibility.

## Shapes

- `rounded/sm` (8px) — inputs, chips, small buttons
- `rounded/md` (12px) — cards, media thumbnails
- `rounded/lg` (16px) — hero cards, modals
- `rounded/pill` — live badges, category tags

## Components

Visual specs; behavioral rules live in `EXPERIENCE.md`.

| Component | Visual |
|---|---|
| **Site header** | `surface-raised`, 56px (mobile web) / 64px (desktop), logo left, nav links or menu button right |
| **Mobile nav panel** | Full-height overlay; list of page links; closes on selection — not a bottom tab bar |
| **Site footer** | Service time strip, contact links, social icons, copyright |
| **Live banner** | `accent-secondary` left border or pill badge + `live-indicator` dot |
| **Quick action tile** | `surface-raised`, icon + label, `rounded/md`, min 88px height |
| **Announcement card** | Title `heading`, date `meta` in IST, optional urgency stripe |
| **Event row** | Date column + title + location; hairline divider |
| **Sermon/media card** | 16:9 thumbnail, play overlay, title + date below |
| **Primary button** | `accent-primary` fill, `ink-primary` on dark gold → use `#0C0C12` text on gold |
| **Secondary button** | `border-hairline` outline, `ink-primary` text |
| **Form field** | `surface-overlay` fill, `rounded/sm`, 48px min height |
| **Giving amount chip** | Unselected: outline; selected: `accent-primary` border + tint |
| **Trust note** | `meta` text, `surface-overlay` panel — used on prayer/giving flows |

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use web header + footer on every page | Mimic native app bottom tab bars or app-only navigation |
| Lead with today's service state and next action | Hide service times behind video or social embeds |
| Separate prayer follow-up from giving visually | Place thanksgiving offering on same screen as testimony submit |
| Label every contact route with purpose + owning team | Show private addresses or unverified accounts |
| Show IST on every time-sensitive item | Use ambiguous "soon" without date/time |
| Use dignified, pressure-free giving copy | Preselect amounts or link healing to payment |
| Test text on photography with scrim | Overlay body text directly on busy photos |
