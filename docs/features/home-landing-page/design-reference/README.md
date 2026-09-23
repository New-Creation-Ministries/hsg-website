# Landing page design reference

- Visual decisions: [ADR 0003](../../../adr/0003-spirit-in-blue-visual-direction.md).
- Comparison entry: `docs/features/home-landing-page/design-reference/index.html`.
- Status: **Spirit in Blue locked by the user**; production implementation pending.
- Selected visual reference: `docs/features/home-landing-page/design-reference/02-spirit-in-blue.html`.
- Preserve the church-name heading and logo-only header in the selected direction.
- Extracted palette and typography snapshot: `docs/features/home-landing-page/design-reference/tokens.json`; HTML remains authoritative.
- Authority: `docs/features/home-landing-page/intent.md`, `docs/features/home-landing-page/spec.md`, `docs/features/home-landing-page/ux.md`.
- User-authorized visual freedom supersedes existing palette, font, and composition restrictions for the selected landing-page direction.

| HTML | Direction | Section treatment |
| --- | --- | --- |
| `01-midnight-journal.html` | Navy, gold, DM Serif Display / DM Sans | Framed portrait, editorial columns, light Sunday close |
| `02-spirit-in-blue.html` | Cobalt, ink, acid yellow, Oswald / DM Sans | Poster hero, announcement rows, contrasting testimony band |
| `03-earth-and-light.html` | Charcoal, copper, cream, DM Serif Display / DM Sans | Arched portrait field, asymmetric story list, warm Sunday close |

## Behavior

- Main heading: Holy Spirit Generation; leadership remains in the introduction.
- Header brand: logo only, with an accessible Home link name.

- Each page includes all four sections and supplied content.
- Navigation opens named unpublished shells within the preview.
- Home and browser Back recover from shells.
- The supplied YouTube channel opens normally.
- Missing portraits, event highlights, and playlists remain identified placeholders.
- Fonts are local assets sourced from Google Fonts: DM Sans, DM Serif Display, Oswald.
- Logo source: `public/brand/hsg-logo.jpg`.
- No stock photography or generated imagery used.

## Verification

- All three designs checked at 1440px and 390px.
- No horizontal overflow or JavaScript page errors.
- Desktop navigation, mobile menu, destination shells, and Home recovery passed.
- `make test`: 1 file passed; 5 tests passed.
- `make lint`: passed, zero warnings.
- `make build`: blocked by Turbopack worker port binding: `Operation not permitted (os error 1)`, including retry outside requested sandbox.
- Screenshots: `docs/features/home-landing-page/design-reference/review/`.
