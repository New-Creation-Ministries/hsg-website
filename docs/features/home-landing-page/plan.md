# Plan: home-landing-page
Author: Udeet Gulati
Status: approved
Links: [intent](./intent.md) · [spec](./spec.md)

Behavior: [ux.md](./ux.md) A1–A9. Shell: [ADR 0001](../../adr/0001-public-pages.md), [ADR 0002](../../adr/0002-public-navigation-and-recovery.md). Visual: [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md) and [02-spirit-in-blue.html](./design-reference/02-spirit-in-blue.html).

The HTML file states each rule twice. The later `body { --bg … }` block and the later `@media (max-width: 800px)` block are the composition. Do not implement the earlier three-column highlights, portrait caption, or playlist subtitles.

## Files that change

- Edit `src/content/home/index.ts` — add the testimony source line, Sunday note, and footer line next to the existing exports.
- Edit `src/content/home/home.test.ts` — assert those three sentences and keep the current content assertions.
- Edit `src/app/layout.tsx` — load Oswald and DM Sans through `next/font/google`; render the footer.
- Edit `src/app/globals.css` — replace the navy/gold theme and 64rem home layout with the Spirit in Blue tokens and regions.
- Edit `src/app/page.tsx` — church-name hero, four sections, and the reference region structure.
- Edit `src/components/site-header.tsx` — logo-only brand; Menu threshold at 800px.
- Add `src/components/site-footer.tsx` — church name and footer line. No second navigation.
- Add `src/components/portrait-field.tsx` — monogram, supplied image, and failed-image fallback.
- Add `playwright.config.ts` — Chromium project, `webServer` on `http://127.0.0.1:3000`, traces on retry.
- Add `e2e/home.spec.ts`, `e2e/navigation.spec.ts`, `e2e/accessibility.spec.ts` — browser acceptance for UX A1–A9.
- Edit `package.json`, `Makefile`, `.gitignore`, `eslint.config.mjs` — `make e2e` runs Playwright; reports stay untracked.

`src/app/about/page.tsx`, `events/page.tsx`, `watch/page.tsx`, `contact/page.tsx`, and `give/page.tsx` stay as they are: each `h1` is the nav label and the body is “This page will be published here.”

## Order of work

### Wave 1 (3 parallel)

id: home-landing-page_1_1
title: Add the three Home sentences the section items do not carry
status: done
acceptance_criteria:
- `pageNotes.testimonies` is “Stories adapted from Rambo World Outreach.”
- `pageNotes.sunday` is “Sunday services · Bengaluru local time”
- `pageNotes.footer` is “Word-based. Spirit-filled. Bengaluru.”
- Existing assertions still pass: church name, blurb, portrait `null`, section order, nav, Sunday records, and a single item URL for the Evangelist Rambabu channel
- `home.test.ts` does not contain “Gatherings, news, and messages will be published here.”
files:
- src/content/home/index.ts
- src/content/home/home.test.ts
depends_on: []

id: home-landing-page_1_2
title: Load Oswald and DM Sans in the root layout
status: done
acceptance_criteria:
- `next/font/google` loads DM Sans as `--font-sans` and Oswald weight 500 as `--font-display`, both `display: "swap"` and `subsets: ["latin"]`
- Fraunces is not imported
- Metadata stays `title.default` = `church.name`, `template` = `%s | ${church.name}`, `description` = `leader.blurb`
files:
- src/app/layout.tsx
depends_on: []

id: home-landing-page_1_3
title: Run Home acceptance in Chromium with Playwright
status: done
acceptance_criteria:
- `make e2e` starts `next dev` through `playwright.config.ts` and runs `e2e/home.spec.ts`, `e2e/navigation.spec.ts`, and `e2e/accessibility.spec.ts`
- `make test` stays `vitest` and does not launch a browser
- Specs assert UX A1–A6 and A8–A9 against the finished page. A7’s supplied and broken portrait stay a local content edit, not a committed fixture
files:
- playwright.config.ts
- e2e/copy.ts
- e2e/helpers.ts
- e2e/home.spec.ts
- e2e/navigation.spec.ts
- e2e/accessibility.spec.ts
- package.json
- Makefile
- .gitignore
- eslint.config.mjs
depends_on: []

### Wave 2 (2 parallel)

**Most risky:** `home-landing-page_2_1`. The Menu breakpoint is duplicated in `site-header.tsx` (`min-width: 64rem`, twice) and `globals.css` (`max-width: 63.999rem`). Those strings must change together.

id: home-landing-page_2_1
title: Switch the shared shell to a logo-only header, 800px Menu, and footer
status: done
acceptance_criteria:
- Brand link accessible name is “Holy Spirit Generation”; the image is `/brand/hsg-logo.jpg` with an empty `alt`; no church-name text sits beside the logo
- Wide query in both `matchMedia` calls is `(min-width: 801px)`. Narrow CSS is `@media (max-width: 800px)`. At 800px, Menu is shown and the six links are not in the inline row
- Menu remains a button named Menu. ADR 0002 G2–G6 behavior stays: collapsed on load, inline disclosure, Escape returns focus to Menu, widening from a focused Menu moves focus to the current-page link, narrowing keeps the disclosure open only when a nav link is focused
- `.menu-toggle:focus { display: flex }` stays, so a focused Menu is not hidden before that focus move
- Footer shows `church.name` and `pageNotes.footer`. It does not repeat the header links or the logo. Header nav name stays “Main navigation”. The current label has `aria-current="page"` on that header link
- Public theme variables are Ink `#090d15`, Paper `#f5f3e8`, Mist `#b6c1d5`, Acid `#dee77f`, Cobalt `#173de0`, Rule `#394250`, Band `#dedfc9`, Band ink `#141a20`, Band link `#182da3`. Focus ring and current-page link use Acid. The radial logo mask and gold `#d0af3b` / navy `#020411` page colors are gone
files:
- src/components/site-header.tsx
- src/components/site-footer.tsx
- src/app/layout.tsx
- src/app/globals.css
depends_on:
- home-landing-page_1_1
- home-landing-page_1_2

id: home-landing-page_2_2
title: Rebuild the Home regions from the content module
status: done
acceptance_criteria:
- `h1` accessible name is “Holy Spirit Generation”, drawn as two lines: Holy Spirit, then Generation. `leader.name` is not the heading
- Hero order is heading, blurb, About link, then the portrait field. About links to `/about` with visible text “About”
- Null portrait renders a Cobalt field with “HSG”, `aria-hidden`, and no caption
- `portrait-field.tsx` is a client component. A supplied portrait uses `next/image` and `leader.portrait.alt`. Image `onError` removes the image and shows the same HSG field. The heading and blurb stay in the document
- What’s going on and Sermons each put the `h2` and the section link in one header row, then the items. Highlighted testimonies puts the `h2` alone, then the items. New to HSG puts the heading, intro, and Contact Us in one column beside the service records
- Section link text is the destination label. An inline arrow SVG is `aria-hidden` and is not in the accessible name. Minimum height 44px
- Items with `href` are one same-tab link whose name is the title. Items without `href` are text with no link styling
- Sermons puts `intro` and the first item in the Cobalt panel; the other two items are plain lines. No iframe
- Testimony text is one paragraph. New to HSG splits `text` on the newline into language, then time, inside the same record. “onwards” stays
- `pageNotes.testimonies` follows the three stories. `pageNotes.sunday` follows the two records
- All four `h2`s stay visible. Each section is a region named by its `h2`. Each testimony `h3`’s parent is that story’s column. No carousel, tabs, disclosure, or motion
files:
- src/app/page.tsx
- src/components/portrait-field.tsx
depends_on:
- home-landing-page_1_1

### Wave 3 (1 task)

id: home-landing-page_3_1
title: Apply the Spirit in Blue region layout
status: done
acceptance_criteria:
- Body is DM Sans, 16px, line-height 1.6. `h1`, `h2`, the monogram, and service times are Oswald, uppercase, weight 500
- Hero and the sermon panel are Cobalt. The testimony section is Band with Band ink text and Band link links. Other section links and the current nav item are Acid on their background
- Wide, above 800px: hero is two columns; highlights are title rows separated by rules; testimonies are three columns with the first wider; sermons are panel beside playlist lines; Sunday is intro beside records; footer is the church name and the footer line
- At 800px and below: hero, highlights, stories, sermons, Sunday, and footer stack in that reading order. Portrait follows About. A rule separates testimony stories. Menu rules from `home-landing-page_2_1` still apply
- These reference strings are absent from the page: “Church news & gatherings”, “Messages & teaching”, “The Word, wherever you are.”, “Leader portrait placeholder”, “Return Home”, “Design concept”
- Headings stay under 65 characters of measure. No ellipsis, fixed text height, or horizontal page scroll at a 320px width
- `make test`, `make lint`, `make build`, and `make e2e` pass. Build ends with “Build succeeded”
files:
- src/app/globals.css
depends_on:
- home-landing-page_1_3
- home-landing-page_2_1
- home-landing-page_2_2

### Not doing

- Shipping `design-reference/assets` font files. Production fonts come from `next/font/google`.
- Replacing the Menu button with the reference `<details>`. ADR 0002 already specifies the button.
- Copying the reference caption, highlight subtitles, playlist subtitles, sermon tagline, preview note, `?page=` shells, or “Return Home”.
- A modal drawer, new-tab external links, embeds, or a Word Fest time of 8:00–8:45am.
- Content folders or published copy for About, Events, Watch, Contact Us, or Give.
- A WebKit project, screenshot or aria-snapshot baseline, GitHub Actions workflow, or a committed broken-portrait URL. Chromium via `make e2e` is the automated browser.

## Risks

The Menu breakpoint must stay the same in `site-header.tsx` and `globals.css`. A mismatch hides a focused link or shows Menu on a wide page.

Portrait failure handling stays in `portrait-field.tsx`.

A deployed Vercel preview is still required before release sign-off. Supplied and broken portrait checks stay a local content edit, restored to `portrait: null`.

## Acceptance criteria

| Check | Scenario |
| --- | --- |
| `make test` | `src/content/home/home.test.ts` passes. Vitest does not run `e2e/` |
| `make lint` | Zero warnings |
| `make build` | Ends with “Build succeeded” |
| `make e2e` | Chromium specs below pass against `next dev` |

| Spec | Asserts |
| --- | --- |
| `e2e/home.spec.ts` | A1–A3, A8. Church `h1`, blurb, four regions, source line, Sunday note, footer line. Unpublished rows are not links. Channel opens in the same tab and Back returns Home. Wide portrait sits beside the heading; at 800px it follows About. Highlight titles stack. Testimony columns share a row and the first parent is wider. Sermon panel sits beside playlists. Sunday time sits beside Contact Us |
| `e2e/navigation.spec.ts` | A4–A6. At 800px, Tab from Menu skips hidden links, Escape returns focus to Menu, and About closes the disclosure. Widening from a focused Menu focuses Home. Narrowing from Events keeps that link visible. 320px has no horizontal page scroll. Skip link focuses `#main-content`. Every route has the shell title, heading, and `aria-current="page"` on the header link. The footer has no links. Back from Give restores scroll above 100px |
| `e2e/accessibility.spec.ts` | A9. Axe reports no critical or serious violations on `/` and the five shells, at desktop and at 800px for Home. Menu, header links, and section links are at least 44px tall. Body is Ink `#090d15`, Paper `#f5f3e8`, 16px, DM Sans. `h1` is Oswald, uppercase, weight 500, on Cobalt `#173de0`. Current Home link and Events are Acid `#dee77f`. Testimony heading is Band ink `#141a20` on Band `#dedfc9`. Service time is Acid. The sermon link sits on Cobalt |

A7 in Playwright covers the null HSG field only. Supplied alt “Apostle Dr. P. S. Rambabu” and a broken `src` are a temporary local edit, restored to `portrait: null` before finishing. No WebKit project or GitHub Actions workflow is in the repo. UX still requires a deployed Vercel preview before release sign-off.
