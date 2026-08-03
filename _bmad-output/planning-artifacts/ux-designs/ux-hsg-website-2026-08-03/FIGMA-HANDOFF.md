# HSG Website — Figma Mock Handoff

Responsive **website** mocks only — no native mobile app screens. Mobile frames represent mobile **browser** viewports (390px), not app chrome.

**Source PRD:** `_bmad-output/planning-artifacts/prds/prd-hsg-website-2026-07-18/prd.md`

**Design spine:** `DESIGN.md` · **Experience spine:** `EXPERIENCE.md`

**HTML reference mocks:** `mockups/*.html` (open in browser for pixel reference)

---

## File setup

| Property | Value |
|---|---|
| File name | `HSG Website — Launch Mocks` |
| Editor type | Design (`figma.com/design/...`) |
| Primary desktop frame | 1440px |
| Mobile web viewport mock | 390px (browser, not phone app) |
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

### 2. Desktop — Core (1440)

| Frame name | PRD | HTML mock | Key content |
|---|---|---|---|
| `Home / Today` | FR-4, FR-19 | `home-desktop.html` | Top nav, hero today banner, quick actions row, two-column announcements + events |
| `Plan a Visit` | FR-2 | — | Service times, map, parking, accessibility, newcomer CTA |
| `Give Offering` | FR-14 | — | Category, amount, review panel |

### 3. Mobile web — Core (390 viewport)

| Frame name | PRD | HTML mock | Key content |
|---|---|---|---|
| `Home / Today` | FR-4, FR-19 | `home-mobile.html` | Header + menu, today banner, quick actions, footer — **no bottom tab bar** |
| `Plan a Visit` | FR-2 | `visit-plan-mobile.html` | Service times IST, map, parking, children, accessibility, newcomer CTA |
| `Healing Prayer` | FR-8, FR-9 | `healing-mobile.html` | Belief intro, 3-step card process, logistics links, stories list |
| `Give Offering` | FR-14 | `give-mobile.html` | Category grid, amount chips, anonymous option, review summary |
| `Give — Confirmed` | FR-15 | — | Receipt ref, amount, category, download receipt |
| `Give — Pending` | FR-15 | — | Verify-before-retry guidance |
| `Watch — Live` | FR-6 | `watch-mobile.html` | Player, live badge, title/meta |
| `Watch — Fallback` | FR-6 | `watch-mobile.html` | Next service + recent list + YouTube link |
| `Mobile nav — open` | — | — | Full-screen menu panel with all page links |
| `Events List` | FR-5 | — | IST-ordered rows, cancelled state variant |
| `Event Detail` | FR-5 | — | Full fields + external registration CTA + calendar export |
| `Prayer Request` | FR-7 | — | Intent selector, consent notice, urgent guidance |
| `About HSG` | FR-1 | — | Story, beliefs, pastors, ministries, languages |
| `Contact` | FR-19 | — | Verified routes with purpose + owning team |

### 4. Components (web)

Build as component sets where variants apply:

- `SiteHeader` — desktop (inline nav) / mobile web (menu button)
- `MobileNavPanel` — open / closed
- `SiteFooter` — service time + contact links
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
- `SiteHeader` — desktop variant

### 5. Desktop — Home detail

Already covered in section 2. Extend other key pages to 1440px using the same header/footer components.

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
