# 0009 Site error model

- Status: accepted.
- Date: 2026-09-26.
- Decision owner: Udeet Gulati.
- Amends: [ADR 0002](0002-public-navigation-and-recovery.md), recovery shells; [ADR 0004](0004-youtube-playlist-reading.md), read timing; [ADR 0007](0007-youtube-section-failure-isolation.md), read timing and recovery.

## Context

- Public pages combine repository content with optional public YouTube data.
- Failures differ in whether a retry can help and in who can act on them.

## Decision

- Every failure is classified on two axes before handling: transient or permanent, and user-actionable or system-actionable ([pattern source](../../.agents/skills/error-handling-patterns/SKILL.md)).
- Every page is static or revalidated on an interval; no route renders per request. Revalidation is page production under [ADR 0004](0004-youtube-playlist-reading.md).
- One attempt per external read per page production; no automatic retry; the next production is the recovery.
- Expected transient failures of external reads degrade only the owning section, keep the direct outbound link where the section publishes one, and emit exactly one structured server log entry.
- Repository content rules run in the build; a violation fails the deploy and never reaches a visitor. Rules that read the clock run only in the build's static-parameter step.
- Unexpected failures propagate to the framework boundary. A page-level failure renders the shared header and footer with a fixed error copy; a root-layout failure renders a minimal document with the same copy. Both offer a full page reload and a Home link, and emit one structured log entry with the framework digest.
- Unknown routes render the shared header and footer with a fixed not-found copy and HTTP 404 ([ADR 0002 G8](0002-public-navigation-and-recovery.md) shell rules apply).
- Visitor-visible surfaces never show internal error text, status codes, or digests.
- Diagnostics are structured `console` entries in the hosting runtime logs; no external error tracker.
- Typed error classes carry classification fields; string parsing of error messages is not a handling mechanism.

## Alternatives

| Alternative | Outcome |
| --- | --- |
| Request-time rendering with per-visit external reads | Rejected. Every visit depends on YouTube latency and availability. |
| External error tracker | Rejected. Runtime logs cover a public site with no accounts or transactions. |
| Automatic retry with backoff toward YouTube | Rejected. Page production has a bounded deadline; the next production is the retry. |
| Framework default error and not-found pages | Rejected. They drop the shared navigation and copy. |
| Last-successful copy of external data | Not decided here; see [snapshot intent](../improvements/youtube-playlist-snapshots/intent.md). |

## Consequences

- External data and date-dependent selections lag the clock by up to one revalidation interval; a visitor reload inside the interval serves the cached page.
- In [ADR 0007](0007-youtube-section-failure-isolation.md), "request-time" and "page request" mean page production.
- [ADR 0004](0004-youtube-playlist-reading.md)'s rule that an unreadable feed fails page production no longer applies; external read failures follow this ADR and [ADR 0007](0007-youtube-section-failure-isolation.md).
- Pages that need per-request data amend this ADR before adding a request-time route.
