---
title: HSG Church Website Product Brief
status: draft
created: 2026-07-09
updated: 2026-07-09
---

# Product Brief: HSG Church Website

## Executive Summary

Holy Spirit Generation needs a public website that helps people understand, join, follow, and support the church without depending on scattered social links or manual communication. The launch website will serve church members, newcomers in Bangalore and outstation visitors, and associated pastors from other locations who need a clear view of what is happening at HSG.

The first version should feel youth-forward, current, and alive, with a leadership-preferred dark theme and strong mobile support. It should make Sunday services, recent updates, events, testimonies, prayer requests, location details, contact paths, and offerings easy to find. It should also let church teams update common content without code changes.

This is an internal alignment brief for the launch product. It is not yet a full PRD or technical architecture, but it sets the product boundaries, audience priorities, and operating model needed for the next planning stage.

## The Problem

HSG's current public-facing presence appears to depend heavily on channels like Instagram and YouTube. Those channels are useful for reach, but they are not enough as the church's central source of truth. A newcomer may not know where to find service timings, how to reach the church, what is happening today, how to ask for prayer, or whether online giving is available. Members may miss announcements or event details when information is spread across posts, messages, and videos.

Church teams also need a sustainable way to keep the site fresh. Background images, testimonies, announcements, and event pages will change frequently. If every update requires developer involvement, the website will become stale quickly, especially for a youth-forward church where freshness is part of trust.

## The Solution

Build `holyspiritgeneration.org` as HSG's official digital home for India launch. The site should combine a polished public experience with a manageable content workflow for the church tech, media, and social media teams.

The home page should quickly answer: who HSG is, what is happening today, how to join or watch, how to ask for help, how to reach the church, and what the newest announcements are. Events should support upcoming event discovery, service timings, calendar sync, and dedicated event pages. Testimonies should support writeups, photos, and videos published by church teams. Giving should support offerings through Razorpay, with categories, recurring giving, donor receipts, anonymous giving, and finance-team exports. Contact should bring together Instagram, YouTube, support emails, phone numbers, and other official ways to reach HSG.

## Who This Serves

**Church members** need a reliable place to check announcements, service timings, upcoming events, testimonies, prayer request paths, giving options, and ministry updates.

**Newcomers in Bangalore and outstation visitors** need a welcoming, clear, mobile-friendly path to understand HSG, watch services, locate the church, request prayer, and know what to expect.

**Associated pastors from various locations** need to see HSG's current activity, events, testimonies, and contact points, with a foundation that can later extend to other regions without rebuilding the whole experience.

## Product Principles

1. **Alive, not brochure-like.** The website should feel current, with recent activity, live services, announcements, testimonies, and events visible without digging.
2. **Youth-forward but clear.** The visual system can be modern and dark, but the navigation and content hierarchy must remain simple for visitors of any age.
3. **Church teams can own freshness.** Non-technical teams should be able to update high-change content without code changes.
4. **Trustworthy giving.** Giving must feel secure, transparent, categorized, and finance-team friendly.
5. **India launch, regional future.** The first release is India-only, but content and structure should not block future region-specific sites or pages.

## Launch Scope

The launch version should include:

- Home landing page with About, Today, live/recent YouTube services, newcomer help, prayer request, key navigation actions, church location/new location information, and announcements.
- Events section with upcoming events, service timings, calendar sync, and dedicated event pages.
- Testimonies section for church-published writeups, photos, and videos.
- Giving section with Razorpay integration for offerings, offering categories, anonymous giving, recurring giving, donor receipts, and finance exports.
- Contact section with Instagram feed or link, YouTube link, support emails, phone numbers, and official contact paths.
- Responsive support for mobile, tablet, and desktop.
- Content update workflow for media, social media, and tech teams.
- Supabase-backed content/data foundation and an end-to-end testable, agent-deployable delivery workflow.

Out of scope for launch:

- Non-India regional experiences beyond preparing the structure for future reuse.
- Product sales, merchandise, ticket commerce, or marketplace flows.
- A full church management system for members, attendance, pastoral care, or ministry operations.
- Deep donor CRM, accounting reconciliation, or finance automation beyond launch exports and receipts.

## Success Criteria

The launch is working if:

- Newcomers can quickly find service timings, church location, live/recent services, and prayer/contact paths on mobile.
- Members use the site as a reliable source for announcements, events, testimonies, and giving.
- Church teams can publish or update events, testimonies, announcements, and media-led content without developer intervention for routine changes.
- Giving works reliably through Razorpay with the required categories, receipts, recurring options, anonymous flow, and finance exports.
- The site can be tested end to end and deployed through an agent-friendly CI/CD workflow.
- The architecture can later support other regions using the same UI patterns with region-specific content.

## Open Questions

- What content approval workflow is needed before testimonies, announcements, events, or images go live?
- Should prayer requests go to email, a private admin queue, a WhatsApp flow, or a pastoral-care tool?
- What donor receipt format and finance export fields are legally/operationally required for India?
- Should the Instagram feed be embedded directly, curated through the CMS, or linked out to avoid reliability/privacy issues?
- What is the required launch date and who signs off on design, content, giving, and deployment?

## Vision

If successful, the HSG website becomes the church's central digital doorway: welcoming for newcomers, useful for members, credible for associated pastors, and easy for ministry teams to keep alive. Over time, the same foundation can support region-specific content, richer testimony storytelling, deeper event workflows, stronger pastoral care routing, and more structured church communications while preserving one unified Holy Spirit Generation identity.
