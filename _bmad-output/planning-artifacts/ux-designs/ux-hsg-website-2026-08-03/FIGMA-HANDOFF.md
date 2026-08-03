# HSG Website — Figma Mock Handoff

This document maps PRD requirements and local HTML mocks to a Figma design file structure. Use it when building frames in Figma via `use_figma` or manual design.

**Source PRD:** `_bmad-output/planning-artifacts/prds/prd-hsg-website-2026-07-18/prd.md`

**Design spine:** `DESIGN.md` · **Experience spine:** `EXPERIENCE.md`

**HTML reference mocks:** `mockups/*.html` (open in browser for pixel reference)

---

## File setup

| Property | Value |
|---|---|
| File name | `HSG Website — Launch Mocks` |
| Editor type | Design (`figma.com/design/...`) |
| Primary frame width | 390px (mobile) |
| Desktop frame width | 1440px |
| Default mode | Dark |

---

## Pages

### 1. Cover & Tokens

- Project title, PRD link, last updated date
- Color styles (from `DESIGN.md`):
  - `surface/base` `#0C0C12`
  - `surface/raised` `#16161F`
  - `surface/overlay` `#1E1E2A`
  - `ink/primary` `#F4F4F8`
  - `ink/secondary` `#9B9BA8`
  - `accent/primary` `#E5A84B`
  - `accent/secondary` `#7C6CF0`
  - `status/live` `#34D399`
  - `border/hairline` `#2A2A38`
- Text styles:
  - `Display/Outfit 32 Bold`
  - `Heading/Outfit 22 SemiBold`
  - `Body/DM Sans 16 Regular`
  - `Label/DM Sans 14 Medium`
  - `Meta/DM Sans 13 Regular`
- Spacing variables: 4, 8, 12, 16, 24, 32, 48, 64
- Radius variables: 8, 12, 16, 999

### 2. Mobile — Core (390 × 844)

| Frame name | PRD | HTML mock | Key content |
|---|---|---|---|
| `Home / Today` | FR-4, FR-19 | `home-mobile.html` | Live banner, quick actions, announcements, events preview, tab bar |
| `Plan a Visit` | FR-2 | `visit-plan-mobile.html` | Service times IST, map, parking, children, accessibility, newcomer CTA |
| `Healing Prayer` | FR-8, FR-9 | `healing-mobile.html` | Belief intro, 3-step card process, logistics links, stories list |
| `Give Offering` | FR-14 | `give-mobile.html` | Category grid, amount chips, anonymous option, review summary |
| `Give — Confirmed` | FR-15 | — | Receipt ref, amount, category, download receipt |
| `Give — Pending` | FR-15 | — | Verify-before-retry guidance |
| `Watch — Live` | FR-6 | `watch-mobile.html` | Player, live badge, title/meta |
| `Watch — Fallback` | FR-6 | `watch-mobile.html` | Next service + recent list + YouTube link |
| `Events List` | FR-5 | — | IST-ordered rows, cancelled state variant |
| `Event Detail` | FR-5 | — | Full fields + external registration CTA + calendar export |
| `Prayer Request` | FR-7 | — | Intent selector, consent notice, urgent guidance |
| `About HSG` | FR-1 | — | Story, beliefs, pastors, ministries, languages |
| `Contact` | FR-19 | — | Verified routes with purpose + owning team |
| `More Menu` | — | — | Grow, Powerhouse, Serve, About, Contact |

### 3. Mobile — Components

Build as component sets where variants apply:

- `TabBar` — 5 items, active state
- `QuickActionTile` — default / pressed
- `PrimaryButton` — default / disabled
- `SecondaryButton`
- `AnnouncementCard`
- `EventRow`
- `SermonCard`
- `ServiceTimeRow`
- `FactCard`
- `HealingStep`
- `CategoryChip` — selected / unselected
- `AmountChip` — selected / unselected
- `LiveBadge`
- `SiteHeader` — logo + menu

### 4. Desktop — Home (1440)

Extend `Home / Today` to 1440px:

- Horizontal nav instead of tab bar (Home, Watch, Events, Give, About, Visit, Prayer, Contact)
- Hero with today banner + quick actions in single row
- Two-column: announcements + events sidebar
- Footer with contact routes

---

## PRD journey coverage checklist

| Journey | Frames required | Status in mocks |
|---|---|---|
| UJ-1 Ananya visit decision | Home, About, Visit, Newcomer connect | Home + Visit mocked |
| UJ-2 Ravi healing | Healing, Visit logistics links | Healing mocked |
| UJ-3 Meera church life | Home, Events, Watch | Home + Watch mocked |
| UJ-5 Arjun giving | Give, Give result states | Give mocked |

---

## Visual rules (PRD §8)

1. **Dark-first** — all frames use dark tokens; verify WCAG AA contrast.
2. **No pressure** — giving never on prayer/testimony submit screens.
3. **IST everywhere** — every time shows date + IST label.
4. **No outcome promises** — healing copy uses "prayer offered" not "you will be healed".
5. **Photography** — use placeholder frames with gradient scrim; label "HSG photo" for content team swap.
6. **No hover-only** — all actions visible on mobile frames.

---

## Building in Figma (agent workflow)

When Figma MCP is authenticated in Cursor Desktop:

1. `create_new_file` → `HSG Website — Launch Mocks`
2. `use_figma` — create token variables (Step 2 in figma-generate-design)
3. `use_figma` — build component library page
4. `use_figma` — assemble mobile frames incrementally; screenshot each section
5. Optional: run `generate_figma_design` against local HTML mocks for pixel capture, then replace with component instances

---

## Authentication note

Figma MCP requires authentication in **Cursor Desktop IDE** (Settings → MCP → Figma → Sign in). Cloud agents cannot complete interactive OAuth. After you authenticate, re-run the agent task to push these mocks directly into Figma.
