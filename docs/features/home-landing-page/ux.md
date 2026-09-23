# UX: Home landing page

## Handoff and authority

- Status: designed; implementation and user validation pending.
- Scope and content authority: [spec](spec.md); purpose and audiences: [intent](intent.md).
- Shared behavior: [ADR 0002](../../adr/0002-public-navigation-and-recovery.md).
- Page structure and publishing: [ADR 0001](../../adr/0001-public-pages.md).
- Visual direction and church-name heading: [ADR 0003](../../adr/0003-spirit-in-blue-visual-direction.md); this document defines interaction behavior.
- Evidence is stakeholder-defined scope, not observed visitor behavior or independently verified source claims.
- The spec’s Sunday times supersede the intent’s times; copy stays in the spec rather than being duplicated here.
- Owners below are delivery responsibilities: Udeet Gulati for product/content decisions; implementing engineer for behavior and verification.

## Outcomes and evidence

| ID | User outcome | Evidence and limitation | Design/flow | Observable experience goal |
| --- | --- | --- | --- | --- |
| O1 | Understand the church and identify its leader | Intent Problem and Proposed outcome; no comprehension research | C1, F1 | Name, church identity, Bengaluru, and leadership relationship are available without opening another page |
| O2 | Find church activity and testimony information | Spec Copy and Page; live highlights and media absent | C2, F2 | Each group is identifiable; unpublished items cannot be mistaken for working links |
| O3 | Reach available messages | Spec Sermons; channel supplied, playlists absent | C2, F3 | One available channel link is distinguishable from two unpublished playlists |
| O4 | Find Sunday service information and the visit-information destination | Spec New to HSG and Concerns; address absent | C3, F4 | Both service names, languages, and times can be read together; directions remain an explicit unmet outcome |
| O5 | Move between public pages and recover from a shell | Spec Routes; ADR 0001 | C4, F2 | Every destination is reachable; current location and a route back Home remain available |

## Information architecture

| Order | Content object | Findability and meaning | Next action |
| --- | --- | --- | --- |
| Shared header | Church identity and public navigation | Brand returns Home; route labels/order come from Spec Routes | Shared navigation contract in ADR 0002 |
| 1 | Leader identity and church introduction | Page heading identifies HSG; adjacent blurb identifies its leaders | Read onward; navigation remains available |
| 2 | What’s going on | Bounded list of three highlights; current fixture is unpublished content, not “no events” | Events |
| 3 | Highlighted testimonies | Three story summaries; titles retain locations and do not attribute stories to HSG gatherings | Praise Reports |
| 4 | Sermons | Channel introduction, one channel link, two unpublished playlist items | Watch |
| 5 | New to HSG | Sunday introduction and two service records, each retaining name/language/time | Contact Us |

- Keep all four sections visible in the reading flow; no carousel, tabs, filters, or section disclosure.
- Preserve the spec’s distinction between Home headings and destination labels; their adjacency supplies the relationship.
- Support direct entry to `/` and every destination; returning visitors need no onboarding or separate member view.
- No search or detail routes are introduced for this bounded content set.

## Task flows

- Actors: visitors and members have the same public read/navigation permissions.
- Every flow is read-only; there is no form, submission, recipient handoff, saved work, or irreversible action.
- Internal navigation, external navigation, focus, and browser-history recovery follow ADR 0002.

| ID | Entry and actions | Decision/alternative | Completion evidence | Interruption and recovery |
| --- | --- | --- | --- | --- |
| F1 / O1 | Open Home → read leader name and blurb | Skip header to main; continue to sections or use About | Identity facts are visible together; no portrait is required to understand the name | Reload or return to Home; missing image does not remove identity text |
| F2 / O2, O5 | Read a section → activate its destination link, or use shared navigation | Unlinked summaries/placeholders remain readable; do not activate | Destination heading matches link label; shell accurately states unpublished status | Browser Back returns to prior page; Home link recovers from any shell |
| F3 / O3 | Read Sermons → activate Evangelist Rambabu | Choose Watch for the site’s media destination; unpublished playlists have no action | Browser navigates to supplied channel URL; successful playback is external and unverified | If external page fails, browser Back returns to HSG; reload external page is browser-owned |
| F4 / O4 | Read New to HSG → compare services → activate Contact Us | Choose either service using visible language/time; no booking is implied | Sunday information is readable; Contact Us opens its shell | Back returns to service information; no directions or attendance confirmation can be completed in this slice |

## Interface contracts

### C1 — Leader and introduction

- Entry: Home loaded by either audience; source: Spec Copy and Page.
- Present the specified page heading and complete blurb before the lead-in sections.
- Wide layout places the portrait beside the introduction; constrained layout places it below the name, keeping the blurb in the same introduction group before sections.
- The empty portrait field is decorative, unfocusable, and unannounced; it has no upload or reveal action.
- A supplied portrait uses its specified text alternative; a failed image retains space and identity text without a retry control.
- Text remains available when images fail; no timed reveal or motion is required.

### C2 — Highlights, testimonies, and sermons

- Entry: Home’s static content is available; exact titles, descriptions, intro text, and item counts come from Spec Copy.
- Each section exposes a heading, optional intro, list, and one destination link in that reading order.
- An item with a URL has one descriptive text link using its title; text without a URL has no focus target, hover action, play icon, or link styling.
- Keep any item description adjacent to its title; do not truncate testimony summaries or invent a healing outcome for an incomplete source summary.
- Keep the supplied unpublished-item wording visible; do not substitute loading indicators or claim there are no events, playlists, or stories.
- Section links use the destination label; normal browser link actions remain available.
- External media is reached by link; no embedded player, autoplay, account requirement, or provider request is initiated merely by reading Home.
- Ownership/freshness: content changes only through the repo publishing process; no “latest” status or automatic freshness guarantee is added.

### C3 — Sunday information

- Entry: New to HSG section; source: Spec New to HSG table.
- Keep each service name, language, and time associated in both reading and visual order.
- Preserve “onwards” without inventing an end time; service times describe the Bengaluru church’s local schedule, not a viewer-timezone conversion.
- Each service is informational, with no selection state, reservation action, or confirmation.
- Contact Us is the sole section action; do not label it “Get directions” while the destination is a shell.
- Street address, map, and visit logistics remain outside Home’s approved scope.

### C4 — Shared shell

- Use [ADR 0002](../../adr/0002-public-navigation-and-recovery.md) for header, Menu, current location, navigation focus, shell recovery, and history behavior.
- Use Spec Page for document titles and metadata; a shell’s heading and title name the actual destination.
- No telemetry is required by the supplied evidence; do not add analytics events, session recording, or visitor-content capture for this design.

## State and recovery inventory

| State | Force / entry trigger | Visible behavior and available action | Exit/recovery | Contract / verification |
| --- | --- | --- | --- | --- |
| Home ready | Successful static document load | Identity and all four sections; links enabled only where URLs exist | Navigate or keep reading | C1–C3 / A1–A3 |
| Menu collapsed / expanded | Header cannot use the wide navigation arrangement; Menu toggled | Same seven destinations; expansion state and focus follow ADR 0002 | Toggle, Escape, activate link, or widen viewport | C4 / A4–A5 |
| Content unpublished | Null portrait or absent item URL | Decorative portrait field and specified text placeholders; no fake controls | Follow section destination; content owner publishes later | C1–C2 / A2 |
| Destination shell | Internal destination lacks published copy | Destination heading and approved shell sentence; shared nav remains usable | Home, another destination, or browser Back | C4 / A6 |
| Portrait fails after later supply | Image URL unavailable | Identity remains readable; no broken layout or endless loading | Continue reading; publisher fixes asset | C1 / A7 |
| External destination unavailable | Channel navigation fails or provider limits access | Browser/provider owns failure; HSG does not claim playback succeeded | Browser Back or external reload | C2 / A8 |
| Loaded page loses connectivity | Network disconnect after document load | Already loaded text remains readable; no online-status claim | Read locally; retry failed navigation after connection returns | C1–C4 / A8 |
| Initial document or route load fails | No usable page response/cache | Browser/framework failure boundary; no custom offline page promised | Browser reload or Back | A8; engineer verifies deployed behavior |

| Omitted state | Reason | Revisit gate |
| --- | --- | --- |
| Loading skeleton, background refresh, empty search results | No fetched lists or search | First feature introducing remote data/search |
| Sign-in, permission denied, member-only content | Public read-only audience | Any authorization feature |
| Validation, save, undo, pending submission, recipient acceptance | No inputs or mutations | First interactive transaction; Give currently remains a shell |
| Stale-data banner | No freshness feed or dates for placeholders | Events/content owner defines a freshness lifecycle before publishing time-sensitive highlights |

## Reflow and input constraints

- Use the spec’s wide/narrow header threshold while preserving the behavior requirements in ADR 0002 when text wraps or focus would otherwise become hidden.
- At narrow widths and up to 400% zoom, stack content without horizontal page scrolling or clipped names, links, service times, or summaries.
- Allow headings, brand text, navigation labels, and service records to wrap and grow; do not rely on fixed text heights or ellipses.
- Orientation changes preserve content order and a visible logical focus position; they do not reload Home.
- Keyboard, touch, pointer, switch, and voice users receive the same destinations and actions; no hover-only information or drag interaction.
- Link names match visible labels; visible focus and non-color link identification distinguish interactive text from placeholders.
- Retain the spec’s touch-target and contrast requirements; no motion is needed even when reduced motion is requested.
- Localization is not introduced; expanded-text checks must preserve associations without assuming current English label lengths.
- Semantic/ARIA choices and conformance testing belong to an accessibility review; these contracts are requirements, not evidence of conformance.

## Pattern decisions and testable risks

| Decision and authority | Alternative / tradeoff | Disconfirming observation and revisit owner |
| --- | --- | --- |
| Visible lists in approved order — Spec Page | Carousel or tabs save initial space but hide items and require additional navigation | Readers cannot locate visit information; Udeet reviews hierarchy with a future scope change |
| Inline navigation disclosure — ADR 0002 design decision | Modal drawer separates navigation but adds dismissal/focus-trap behavior | Expanded links obscure orientation or Menu is not discovered; engineer and Udeet revisit header |
| Destination labels on section links — Spec Page | Action labels could clarify intent but diverge from accepted labels | Readers cannot connect Sermons to Watch or testimonies to Praise Reports; Udeet resolves terminology |
| Same-tab external links — Spec Routes | New tabs retain Home visibly but add context-switching and closing work | Visitors cannot resume after external navigation; Udeet revisits with evidence |
| Retain explicit placeholders — Spec Copy | Hiding unpublished groups reduces clutter but removes approved lead-ins | Visitors interpret placeholders as malfunction or live activity; Udeet reviews publication readiness |

- Cognitive-demand hypotheses: adjacent summaries reduce recall; fixed section/destination pairs aid recognition; browser Back supports media re-entry.
- Untested risks: portrait absence weakens recognition; repeated placeholder titles add scanning cost; shells interrupt information seeking; the leader-focused heading may not immediately communicate church identity.
- No participants were recruited, observed, recorded, or contacted; no usability results or population claims are asserted.
- Candidate questions for a separately authorized review: can visitors identify HSG, find a suitable Sunday service, distinguish playable media from placeholders, and return from a shell or channel?
- Udeet owns study authorization, participant scope, consent/data handling, and any evidence-based success thresholds; no arbitrary completion-time target is assigned here.

## Dependencies and resolution gates

| Dependency / decision | Owner | Current fallback and impact | Gate |
| --- | --- | --- | --- |
| Portrait, live highlights, playlists, testimony URLs | Udeet / church content provider | Accepted placeholders; no fabricated facts or media | Before replacing each placeholder, verify text, URL, asset, and publication permission |
| Service schedule correctness | Udeet / church content provider | Accepted spec values; no independent validation claimed | Confirm before public release and whenever schedule changes |
| Contact Us visit information | Udeet / future Contact Us feature | Shell; complete visit planning is blocked | Before claiming the website supports directions or full visit planning |
| Empty destination usefulness | Udeet | Shells are authorized; broader information-seeking outcomes remain unmet | Public release review explicitly considers the shell experience |
| Navigation focus and reflow | Implementing engineer | New interaction detail in ADR 0002 | Verify A4–A6 before implementation sign-off |
| Supported browser/assistive-technology matrix | Implementing engineer; Udeet resolves coverage | Proposed initial checks: Chromium and WebKit, keyboard/touch, VoiceOver with Safari | Set supported versions and accessibility coverage before release verification |
| Formal implementation plan | Implementing engineer | No plan exists; this document is a behavior handoff | Link this document and ADR 0002 when writing plan.md; do not duplicate contracts |

## Acceptance and deployed verification

- Status of every criterion below: **not run — design-only task**.
- Boundary: deployed Vercel preview, followed by a production route/link smoke check after deployment.
- Fixtures: the spec’s placeholder dataset; separate local/preview fixture with a broken portrait URL; no invented production content.
- Evidence record: deployment URL/revision, browser/version, viewport/zoom/input mode, steps, expected/actual result, pass/fail/blocked, screenshot or focus notes as applicable.
- Remove the broken-image fixture before publishing; no persistent user data needs cleanup.

| ID | Given / action | Observable acceptance evidence |
| --- | --- | --- |
| A1 | Open Home directly and read in document order | Church-name heading, blurb, and four sections match the spec; no old summary sentence; headings and service associations remain understandable |
| A2 | Inspect unpublished items with keyboard and pointer | Three highlight placeholders and two playlist placeholders remain text; null portrait is unannounced and unfocusable; only supplied URLs produce item links |
| A3 | Read New to HSG at normal and narrow widths | Both service records match the spec, with complete language/time associations; Contact Us is present; no directions or booking claim |
| A4 | At narrow width, Tab to Menu; activate, traverse, Escape, reopen, navigate | Expansion is announced; links occur in route order; Escape closes and returns focus; route activation closes disclosure and identifies destination |
| A5 | Resize across header threshold with focus inside navigation; test zoom, portrait/landscape, and expanded text | Focus never remains hidden; every destination remains reachable; no clipped labels, horizontal page scroll, or altered section order |
| A6 | Open every route directly and through navigation; use Back, Home, and skip link | Correct heading/title/current-page state; exact shell copy; skip reaches main; Back respects browser restoration without forced top reset |
| A7 | In preview, test null, supplied, and broken portrait fixtures | Null is decorative; supplied image has specified alternative; failure leaves name/blurb readable and layout usable |
| A8 | Open channel then return; disconnect after Home loads; simulate unavailable document/provider | Same-tab navigation; native Back/reload recovery remains possible; loaded text survives disconnect; no false loading, playback, or success claim |
| A9 | Run the agreed keyboard, touch, contrast, and assistive-technology checks | Visible focus, identifiable links/current page, required target sizes, readable accent and body text on ink, cobalt, and the testimony band, correct disclosure state, and logical headings; findings recorded rather than inferred from appearance |

## Design walkthrough

- Normal path: F3 → C2 → channel link → A2/A8; no playable playlist is implied by a placeholder.
- Highest-risk incomplete path: F4 → C3 → Contact Us shell → A3/A6; schedule discovery completes, directions do not; content owner and resolution gate are recorded above.
- Interruption path: expanded Menu → viewport change → ADR 0002 focus handling → A5; no hidden focused link is permitted.
- Handoff classification: conditional on recorded content/release gates; no implementation, usability, or accessibility pass is claimed.
