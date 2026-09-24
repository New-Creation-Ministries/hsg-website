# UX: Events page

## Handoff and authority

- Status: designed against a draft intent. Two intent questions block release of highlight bodies and calendar-update claims.
- Scope: [intent](intent.md). Shared navigation and shells: [ADR 0001](../../adr/0001-public-pages.md), [ADR 0002](../../adr/0002-public-navigation-and-recovery.md).
- Sunday service names, languages, and times: `src/content/home/index.ts`. Current records: Word Fest Service (English, 8–9am) and Miracles and Healing Service (Multilingual, 9:30am onwards).
- Home entry: “What’s going on” links to `/events` ([home spec](../home-landing-page/spec.md)). This UX does not change Home highlights.
- Evidence is the draft intent and those sources. No observed visitor behavior.
- Owners: Udeet Gulati for product and content decisions; implementing engineer for behavior and verification.
- Next software spec: [write-spec](../../../.agents/skills/write-spec/SKILL.md), after the blocking gates below.

## Outcomes and evidence

| ID | User outcome | Evidence and limitation | Design | Observable experience goal |
| --- | --- | --- | --- | --- |
| O1 | See upcoming church events in IST | Intent proposed outcome; past events excluded; “upcoming” at publish time only | C1, F1 | Each listed event has a name and an IST start; past events are absent; times are not converted to the viewer’s zone |
| O2 | See the two flagged events with their content, then the other upcoming events | Intent; highlight fields are open question 1 | C1, F1 | Zero, one, or two flagged events lead the upcoming group; a third flag is unsupported |
| O3 | Add each Sunday service to Google Calendar and Apple Calendar as a weekly item | Intent; Home Sunday records | C2, F2 | Each service has its own Google and Apple actions; the action means every Sunday in IST, not the next Sunday only |
| O4 | Add each special event once | Intent | C3, F3 | Each upcoming event has its own Google and Apple actions; no add-all |
| O5 | A later published time change updates the calendar entry added from the site | Intent; mechanism is open question 2 | F4 | Not observable until Udeet chooses the mechanism. The page must not claim the entry will update |
| O6 | Reach Events and return | Home spec routes; ADR 0002 | C4, F1 | `/events` is reachable from nav and Home; current location and a route Home remain available |

## Information architecture

| Order | Content object | Findability and meaning | Next action |
| --- | --- | --- | --- |
| Shared header | Church identity and public navigation | Events is the current page | ADR 0002 |
| 1 | Upcoming events | Dated events still upcoming at publish, in IST. Flagged events (at most two) show their content first; every other upcoming event follows | Add that event once (C3), after its name and IST start exist |
| 2 | Sunday services | The two Home Sunday records only. “Regular service” is the intent’s term; the visible heading is Sunday services | Add that service every Sunday (C2) |

- One page, `/events`. No event detail route, search, filter, or pagination.
- Visitors and members share the same page. No accounts and no editor UI. The flag is set in repository content and published by deploy.
- Direct entry, nav, and Home “What’s going on” all open this page. Home’s three highlight rows stay placeholders until a separate content change.
- Provisional list order: earlier IST start first within the flagged pair and within the rest. Equal starts keep repository order. Owner: Udeet. Revisit if published order must be manual.
- Terminology: Sunday services, not “regular services,” on the page. Do not label dated events “special” in the UI. Do not show the internal flag name.

## Task flows

- Actors: visitors and members, same public permissions. Editors publish through the repo; they have no page role.
- Calendar apps are external. Saving, sign-in, and refresh there are not site completion.
- Internal navigation, focus, and history follow ADR 0002. External Google navigation follows ADR G7 (same tab).

| ID | Entry and actions | Decision or alternative | Completion evidence | Interruption and recovery |
| --- | --- | --- | --- | --- |
| F1 / O1, O2, O6 | Open `/events` → read IST times → compare flagged events with the later list | Skip to main; leave via nav or Home | Names and IST starts are visible; flagged events precede the others; past events are absent | Reload or Back. No saved filters or drafts |
| F2 / O3 | Read a Sunday service → Add to Google Calendar or Add to Apple Calendar | Either service; either calendar. Not “next Sunday only” | The handoff starts with that service’s weekly IST time. The site does not show “Added” | Google: Back returns to Events. Apple: Events stays in the browser if the device only opens a calendar file. Cancel on the calendar app leaves the site unchanged |
| F3 / O4 | Read one upcoming event → Add to Google Calendar or Add to Apple Calendar | That event only | The handoff starts for that occurrence. The site does not show “Added” | Same as F2 |
| F4 / O5 | After a handoff, the church publishes a new time | No visitor path until question 2 is decided | Unresolved. Do not treat a new deploy as proof the external entry changed | Owner Udeet; gate before any update wording or update implementation |

## Interface contracts

### C1 — Upcoming events

- Entry: `/events` loaded; source: repository event content published by deploy.
- Page `h1` is Events. Document title stays `Events | Holy Spirit Generation`.
- A visible note says times are in IST (`Asia/Kolkata`). Do not convert times for the viewer’s zone.
- An upcoming event is one whose IST start is still in the future at publish. The page is static. It does not claim the list is live between deploys.
- Supported flag counts among upcoming events: 0, 1, or 2. Those events appear first and, once question 1 is answered, show the approved content. The other upcoming events follow as a list.
- Each listed event shows its name and IST start, including date. Those two facts are the minimum assumption for O1. Place, description, and image stay inside question 1.
- Provisional empty copy when nothing is upcoming: “No upcoming events.” Sunday services remain. Owner: Udeet, before publish.
- An event with no name or no IST start is unsupported content. Do not invent either. Do not list it as upcoming.
- More than two flagged upcoming events is unsupported. Do not drop, rank, or hide the extras. Do not publish that set until Udeet sets a rule.
- No past-event section, cancellation notice, or per-event URL.

### C2 — Sunday services

- Entry: the Sunday services group; source: the two Home service records.
- Each record keeps name, language, and time together, including “onwards”.
- The group states that an add applies every Sunday in IST.
- Each service has two actions: “Add to Google Calendar” and “Add to Apple Calendar”. The accessible name includes the service name.
- Word Fest uses 8–9am. Do not shorten it.
- Miracles and Healing has no end. Do not invent a duration for its calendar item. Its add actions stay unavailable until Udeet supplies an end or explicitly allows an open-ended item. The record itself stays visible.
- Actions hand off the current published weekly time zoned to IST. They do not say the entry will update later.

### C3 — One-time event add

- Each upcoming event that has a name and IST start has the same two action labels. The accessible name includes the event name and IST start.
- The group states that an add applies to that date only.
- Missing end: same rule as Miracles and Healing. List the event; do not invent an end; withhold add until an end exists or Udeet allows an open-ended item.
- Place is omitted from the handoff unless question 1 includes it and the event has one. Do not invent a venue.
- Activating Google leaves `/events` in the same tab. Activating Apple asks the device to take the calendar file and does not navigate away when the browser stays on the page.
- No “Added”, “Saved”, or “Subscribed” status. The site cannot see the external calendar.
- No bulk add, third calendar, or site account step.

### C4 — Shared shell

- Header, Menu, current page, focus, and history: [ADR 0002](../../adr/0002-public-navigation-and-recovery.md).
- No telemetry, session recording, or visitor-content capture.
- The page does not remember which items a visitor added.

## State and recovery inventory

| State | Force / entry trigger | Visible behavior and available action | Exit or recovery | Contract |
| --- | --- | --- | --- | --- |
| Events ready | Static document loads with a supported set | Upcoming group, then Sunday services; adds only where an end or an allowed open end exists | Read, add, or navigate | C1–C3 |
| No upcoming events | Publish contains none | “No upcoming events.” Sunday services remain | Wait for a later publish | C1 |
| One flagged event | One upcoming event is flagged | That event leads, with content once fields exist; the rest follow | Read or add that event | C1 |
| Highlight fields unknown | Question 1 open | Names and IST starts may be specified; place, description, and image are not designed | Udeet answers question 1 | C1 |
| Open-ended time | “onwards” or no end | Record stays; add actions for that item are absent | Udeet sets an end or allows no end | C2, C3 |
| Calendar handoff started | Google or Apple action | No success claim on the site | Back, or remain on Events; retry the action | C2, C3 |
| External calendar fails or visitor cancels | Provider or device failure after handoff | Browser or calendar app owns the failure | Return to Events; site state unchanged | C2, C3 / ADR G7 |
| Time changed after add | Later deploy | Page shows the new time. External entry update is not claimed | Question 2 | F4 |
| Stale published list | An event’s start passes before the next deploy | The last published list remains. No “live” or “updated” claim | Next deploy drops events whose start has passed | C1 |
| Unsupported content | Third flag, or missing name or start | No visitor-facing guess | Fix content before publish | C1 |
| Load fails or connectivity drops after load | No document, or network loss | Browser failure boundary, or already loaded text remains | Reload or Back | ADR 0002 |

| Omitted state | Reason | Revisit gate |
| --- | --- | --- |
| Past events, archive, cancellation mail | Intent excludes past events; no accounts | A later intent |
| Event detail route, search, pagination | No volume or deep-link evidence | Udeet, if one page cannot hold the published set |
| In-progress event (started, not ended) | End is not a required field; upcoming uses start | If an end becomes required and in-progress events must stay listed |
| Member-only events, sign-in, permission denied | Public page | Any private-content feature |
| Saved “added” state, undo on the site | External calendars; no site persistence | Question 2, if the mechanism stores server state |
| Loading skeleton | Static publish | A per-request events page |

## Reflow and input constraints

- At narrow widths and 400% zoom, stack the page without horizontal scrolling or clipped names, times, or action labels.
- Headings, notes, event names, and action labels wrap. No fixed text heights or ellipses.
- Orientation change keeps order and does not reload the page.
- Keyboard, touch, pointer, switch, and voice reach the same actions. No hover-only detail and no drag.
- Action names match visible labels and include the service or event they change.
- Targets for add actions are at least 44px. Visible focus distinguishes them from text.
- No motion is required.
- English chrome only. Expanded text must keep each time with its event or service.
- Semantic and ARIA choices belong to an accessibility review. These contracts are requirements, not conformance evidence.

## Pattern decisions and testable risks

| Decision and authority | Alternative / tradeoff | Disconfirming observation and revisit owner |
| --- | --- | --- |
| Upcoming, then Sunday services — intent order and Home “What’s going on” entry | Sunday services first favors the weekly add and repeats Home | People from Home cannot find dated events; Udeet reorders |
| One page, flagged events expanded in place — intent | Detail pages give each event a URL but add a return path this intent does not ask for | Published content does not fit or cannot be shared; Udeet adds a route |
| Separate weekly and one-time adds — intent | One “add” control hides whether the calendar repeats | People add every Sunday when they wanted one date, or the reverse; Udeet revises labels |
| Same-tab Google handoff — ADR G7 | A new tab keeps Events visible and adds a window to close | People cannot return from Google; Udeet revisits with evidence |
| No success status — external save is invisible | “Added” reduces uncertainty and is false when the calendar app cancels | People repeat adds because they cannot tell the handoff started; Udeet may add a “continue in Google Calendar / Apple Calendar” note that still does not claim a save |
| Static upcoming set — architecture and intent | Per-request filtering drops past events without a deploy | Visitors treat a passed event as still scheduled; Udeet allows a non-static page |
| Update mechanism unresolved — intent question 2 | Subscribe to a feed (updates after the calendar app refreshes; no per-user store). One-time copy (no backend; does not update). Provider write APIs (can update Google only with stored consent; conflicts with no accounts; no equivalent Apple path) | Udeet picks one. A one-time copy cannot satisfy O5. A feed must be described as a subscription, not as a detached copy |

- Calendar-update choice is blocking. Do not implement a URL, file, or API as if it satisfied O5.
- Highlight place, description, and image are blocking for the expanded body.
- Cognitive-demand hypotheses: IST stays visible beside times; “every Sunday” and “this date only” stay beside the matching actions; names stay with actions so two identical labels are not the only cue.
- Untested risks: viewers may still read IST as local time; an absent add on an open-ended item may look broken; a stale deploy may list an event that already started.
- No participants were recruited or observed. No usability results are claimed.
- Candidate questions for a later authorized review: can a person tell weekly from one-time, tell that times are IST, and tell that the site has not confirmed a save?
- Udeet owns any study authorization, consent, and data handling.

## Dependencies and resolution gates

| Dependency or decision | Owner | Current fallback and impact | Gate |
| --- | --- | --- | --- |
| Highlight fields (question 1) | Udeet | Name and IST start only. No place, description, or image | Before expanded highlight content |
| Calendar update path (question 2) | Udeet | Handoff of the current IST time only. O5 is unmet. No update sentence | Before calendar actions ship as meeting the intent |
| Open-ended duration | Udeet | Miracles and Healing, and any event without an end, stay visible with no add | Before those adds exist |
| Empty-state sentence | Udeet | Provisional “No upcoming events.” | Before publish |
| More than two flags | Udeet | Unsupported. Do not publish | Before a third flagged upcoming event |
| List order | Udeet | Earlier IST start first; repository order breaks ties | Before a manual order is required |
| Sunday record text | Church content in `src/content/home/index.ts` | Use those two records | On every Home service change, Events follows |
| Event content and flag | Udeet, via repo deploy | No events until content exists | First events publish |
| Supported browsers and assistive technology | Implementing engineer; Udeet sets coverage | Same proposed set as [Home UX](../home-landing-page/ux.md): Chromium, WebKit, keyboard, touch, VoiceOver with Safari | Before release verification |

## Acceptance and deployed verification

- These checks cover designed behavior. They do not pass O5, highlight fields beyond name and IST start, or adds for open-ended items.
- Release of calendar actions waits on question 2 and the open-ended-duration gate.
- Local checks wait for an implementation plan. Release still needs a deployed Vercel preview.
- Fixtures: the two Home Sunday records; zero, one, and two flagged upcoming events with name, IST start, and end; one open-ended upcoming event; no third flag; no real visitor calendars. Use a synthetic title such as `INV-DEMO-042`.
- Evidence record: deployment URL or revision, browser, viewport, zoom, input mode, steps, expected and actual result, pass, fail, or blocked.

| ID | Given / action | Observable acceptance evidence |
| --- | --- | --- |
| A1 | Open `/events` with two flagged events and other upcoming events | `h1` Events; IST note; flagged events first with name, date, and IST start; other upcoming events after them in earlier-start order; Sunday services after that, matching Home records |
| A2 | Publish zero upcoming events, then one flagged event | Empty copy and Sunday services; then the single flagged event leads and is not padded to two |
| A3 | Read Sunday services and start Google, then Apple, for Word Fest | Weekly Sunday IST 8–9am is what the handoff carries; Miracles and Healing has no add while “onwards” has no approved end; no “Added” on the site; Google is same-tab; Back returns |
| A4 | Start Google and Apple for one dated event | That occurrence only; the other event is not included; cancel or external failure leaves Events unchanged and makes no success claim |
| A5 | Narrow width, 400% zoom, keyboard | Names, IST times, and add labels wrap without horizontal page scroll; actions are reachable and named with their event or service |
| A6 | Change a published start and reload after deploy | The page shows the new IST start. It does not say Google or Apple already changed. Mark O5 blocked |
| A7 | Disconnect after load; open Events from Home and nav; use Back and Home | Loaded text remains; Events is current in nav; Back and Home follow ADR 0002 |

## Design walkthrough

- Normal path: F1 → C1 → A1. Flagged events are readable before the rest.
- Highest-risk path: F4 → question 2 unresolved → A6. A time change on the site is not completion in Google or Apple.
- Open-ended path: C2 → Miracles and Healing visible, add absent → A3.
- Handoff classification: listing and shell behavior are conditional on the empty-copy and order gates. Highlight bodies and calendar release are blocking until questions 1 and 2 and the duration rule are decided.
