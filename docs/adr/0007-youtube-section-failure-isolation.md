# 0007 YouTube section failure isolation

- Status: accepted.
- Date: 2026-09-25.
- Decision owner: Udeet Gulati.
- Amends: [ADR 0004](0004-youtube-playlist-reading.md), read timing and failure handling.

## Context

- Request-time pages combine repository content with optional public YouTube playlist metadata.

## Decision

- Request-time playlist listings read the public feed on the server with an explicit deadline covering headers and body consumption.
- Reads bypass persistent fetch caching; each page request can recover from a previous unusable response.
- The reader rejects failed or unusable responses; the calling section handles those failures and retains a direct playlist link without video rows.
- Record failed reads in server diagnostics.
- Keep unrelated page failures outside the playlist recovery boundary.
- Retain ADR 0004's public feed, feed ordering, thumbnail and outbound playback mechanisms, and absence of credentials or persisted feed copies.
- These rules replace ADR 0004's deploy-time-only reading and page-production failure contract for request-time listings.

## Consequences

- A visitor request can wait for the configured deadline and creates an upstream attempt.
- No last-successful copy is retained.
- Static playlist consumers remain governed by ADR 0004's build-time contract.
