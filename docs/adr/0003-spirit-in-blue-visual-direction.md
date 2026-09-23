# 0003 Spirit in Blue visual direction

- Status: accepted; production implementation pending.
- Date: 2026-09-23.
- Decision owner: Udeet Gulati.

## Context and authority

- The user selected Spirit in Blue from three complete HTML landing-page concepts.
- The user required the church name as the title and a logo-only header.
- Visual reference: [selected HTML](../features/home-landing-page/design-reference/02-spirit-in-blue.html).
- Palette and typography values: selected option in [tokens.json](../features/home-landing-page/design-reference/tokens.json).
- Content and interaction scope: [Home intent](../features/home-landing-page/intent.md), [Home UX](../features/home-landing-page/ux.md), and [ADR 0002](0002-public-navigation-and-recovery.md).
- Home uses the church name as the main heading, Oswald and DM Sans, the Spirit in Blue palette, and the layouts in Decisions. A pastor-name heading, Fraunces as the only typeface, the logo navy/blue/gold palette, and a single reading column are outside this decision.

## Decisions

| Area | Selected treatment |
| --- | --- |
| Identity | Holy Spirit Generation is the main heading; leaders are named in the introduction. |
| Header | Existing HSG logo without adjacent brand text; retain an accessible Home link name. |
| Color | Dark ink page, cobalt hero and sermon panel, warm off-white text, pale yellow-green links and service times. |
| Contrast | A light testimony band separates stories from the dark sections. |
| Typography | Oswald for uppercase display headings; DM Sans for body text, navigation, and supporting copy. |
| Hero | Large church-name heading beside a reserved portrait field; stack on narrow screens. |
| Highlights | Three announcement rows separated by fine rules; unpublished entries remain text. |
| Testimonies | Unequal desktop columns; readable stacked stories on mobile. |
| Sermons | Cobalt channel feature beside a plain playlist list; only supplied URLs are linked. |
| Sunday services | Introductory block beside two service records; names, languages, and times remain associated. |
| Shape and depth | Flat rectangular surfaces, thin separators, and generous section spacing. |
| Responsive layout | Inline Menu disclosure and single-column content at narrow widths; all sections remain visible. |
| Motion | Static content; no entrance effects or autoplay. |

## Alternatives

| Alternative | Outcome |
| --- | --- |
| Midnight Journal | Not selected; retained in the reference folder. |
| Earth & Light | Not selected; retained in the reference folder. |

## Implementation boundaries

- Preserve the selected HTML as a design reference, not the production route implementation.
- Implement shared navigation against ADR 0002; prototype query-string shells are demonstration behavior.
- Preserve missing-content states; placeholder portraits and unpublished entries are not approved final content.
- Use the existing church logo from `public/brand/hsg-logo.jpg`.
- Reuse the local preview fonts or equivalent production font loading for the selected families.
- Retain keyboard focus, semantic headings, accessible navigation, and readable contrast during implementation.
- Desktop and mobile preview screenshots document the selected composition; production verification remains required.
