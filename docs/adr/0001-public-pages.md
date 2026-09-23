# 0001 Public pages

Status: accepted
Date: 2026-09-22

## Context

[docs/architecture.md](../architecture.md) leaves page structure and content file format to the feature that defines them. [Home](../features/home-landing-page/spec.md) names the public destinations and where their copy lives.

## Decision

- Visitors and members share one public nav, in the root layout, in the order listed in the Home spec.
- Each destination is a static route. A destination with no published content shows its name and the sentence “This page will be published here.”
- Page copy lives in typed TypeScript under `src/content/<page>/` and ships by deploy.
- A destination with no published content has no content folder.

## Consequences

- Publishing content for a destination keeps its path and its nav label.
- Embeds and the event model sit outside this decision. See [docs/architecture.md](../architecture.md).
