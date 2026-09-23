# 0002 Public navigation and recovery

- Status: accepted.
- Date: 2026-09-23.
- Owner: Udeet Gulati; implementing engineer verifies interaction behavior.

## Scope and authority

- Applies to the shared header and public-page navigation, including future pages.
- Inherits routes, labels, order, shell copy, and public access from [ADR 0001](0001-public-pages.md) and [Home spec](../features/home-landing-page/spec.md#routes).
- Inherits Menu threshold, same-tab links, focus visibility, skip link, and target-size requirements from [Home spec](../features/home-landing-page/spec.md#page).
- Defines the previously unspecified focus, disclosure, and recovery behavior below.
- Landing-page-only content and flows remain in [Home UX](../features/home-landing-page/ux.md).

## Decisions

| ID | Shared concern | Observable contract |
| --- | --- | --- |
| G1 | Location and return | The brand link is named Holy Spirit Generation and returns to `/`; exactly the current destination is indicated by more than color and exposed as the current page. Future child routes must specify their owning navigation section. |
| G2 | Narrow navigation | Menu reveals an inline list in document flow, not a modal overlay. A fresh page load starts collapsed. Button name stays Menu; expanded/collapsed state is exposed. Opening retains button focus; the next Tab reaches the first link. Hidden links cannot receive focus. |
| G3 | Closing navigation | Menu toggles closed; Escape while focus is in the expanded navigation closes it and returns focus to Menu. Activating a destination closes the disclosure, including selecting the current page. No focus trap or click-outside requirement. Closing with focus inside returns focus to Menu unless navigation moves focus to the destination. |
| G4 | Viewport changes | Wide navigation exposes all links. If Menu becomes hidden while focused, move focus to the current-page link. On narrowing, keep the disclosure open when a navigation link holds focus; otherwise start collapsed. Preserve focus on a visible link. Allow text to wrap instead of clipping when space is constrained. |
| G5 | Page transitions | For client-side navigation to a different internal page, update title/current-page state, close Menu, and place focus at the destination’s main heading or main start without obscuring it. Selecting the current page closes Menu and restores visible focus without creating a duplicate history entry. Fresh document loads use normal browser focus; a first keyboard-accessible skip link reaches main. |
| G6 | Re-entry | Menu state is transient; no cookie or local-storage preference. Browser Back/Forward may restore page/scroll state; do not override native history restoration with a forced top scroll or heading-focus reset. Restored disclosure state must agree with visibility and focus. |
| G7 | Link availability | Missing URLs render as text, not disabled or fake links. Available links retain normal browser link behavior. External links use the same tab; no custom leave-site confirmation. The browser/provider owns external failure and Back/reload recovery. |
| G8 | Unpublished destinations | A shell retains shared navigation, correct title, and destination heading with the approved sentence. It offers no false completion, payment, form, or directions action. Home and other navigation destinations remain usable. |

## Alternatives and limits

- Inline disclosure keeps navigation in the reading order; a modal drawer would require additional dismissal and focus-trap behavior without an approved need.
- Same-tab navigation follows the Home spec; revisit if observed visitors repeatedly fail to return from external media.
- No automatic retry, custom offline cache, notification, analytics, or saved navigation preference is introduced.
- Public shells fulfill route availability, not the information or transaction goals of their future pages.
- Visual direction, content schemas, embed behavior, and future page layouts remain owned by their existing specs and [architecture](../architecture.md).

## Verification and evolution

- Engineer verifies disclosure, resize, route focus, history, and shell recovery using [Home UX acceptance](../features/home-landing-page/ux.md#acceptance-and-deployed-verification).
- Accessibility review selects semantics and the browser/assistive-technology matrix; these decisions do not assert conformance.
- Later features reference this ADR instead of redefining shared behavior.
- Changes to navigation labels, section ownership, modal behavior, or recovery update this ADR with their feature’s evidence and acceptance checks.
