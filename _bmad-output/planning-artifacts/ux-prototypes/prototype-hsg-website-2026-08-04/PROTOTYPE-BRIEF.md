---
title: HSG Homepage Visual Prototype Brief
status: working
created: "2026-08-04"
updated: "2026-08-04"
---

# Visual Prototype Brief

## Product objective

Make `holyspiritgeneration.org` a welcoming, current, trustworthy digital doorway for Holy Spirit Generation in India.

## Primary users

- Newcomers in Bengaluru deciding whether and how to attend.
- Church members looking for current services, events, announcements, prayer, and giving.
- Outstation visitors confirming practical visit information.

## User problem

HSG information is distributed across social and video channels. A first-time visitor needs one clear place to understand HSG, find the next service and location, know what to expect, and take a confident next step.

## Primary device or viewport

Mobile-first at 390 × 844 CSS pixels, checked at desktop 1440 × 900. Essential visit information must remain available at 320 CSS pixels and 200% zoom.

## First journey to prototype

**UJ-1 — Ananya decides whether to visit HSG.** The homepage is the anchor screen because it establishes the visual language and must expose current service information, HSG identity, trust, and the plan-a-visit action.

## Existing brand references

- User-supplied `hsg_logo.png`, used directly in the prototype.
- Logo-derived palette: midnight navy, royal blue, warm yellow-gold, and white.
- PRD direction: youth-forward, current, alive, dark, authentic, and welcoming to all ages.

## Existing design-system constraints

No production design system or frontend exists in the repository. This prototype defines an exploratory visual language from the supplied logo rather than committing production tokens or components.

## Technical constraints

- Portable HTML with relative local assets.
- Exact service, venue, livestream, announcement, and media facts are prototype content until verified by HSG.
- Essential visit information cannot depend on video playback, social-media access, or hover.
- Prototype code remains separate from production architecture and backend integration.

## Accessibility requirements

- WCAG 2.2 AA target.
- Keyboard-visible focus, semantic landmarks, sufficient contrast, reduced-motion support, readable large text, and no hover-only interactions.
- Practical information is expressed as text, not only imagery.

## Prototype tool or repository

Canonical review artifact: `prototype/index.html`

## Lavish review contract

- CLI and pinned version: project-pinned `lavish-axi` using `_bmad-output/.lavish-axi` state.
- Review entry point: `prototype/index.html`
- Approval channel: Lavish feedback only.

## Open visual questions

- Does the first viewport balance spiritual warmth with practical visit information?
- Should the visual language feel more editorial and reverent, or more energetic and youth-culture-forward?
- Which authentic HSG photography or service footage should replace the abstract prototype media treatment?

