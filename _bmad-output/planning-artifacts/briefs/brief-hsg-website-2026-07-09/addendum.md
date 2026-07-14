# Product Brief Addendum: HSG Church Website

This addendum captures details that should inform PRD, UX, and architecture work but are too detailed for the product brief.

## Functional Notes

- Home page needs to carry the main "what is HSG / what is happening now / how do I join or get help" burden.
- "Today" should include recent activity and live or recent YouTube services.
- Help section should support newcomers, prayer requests, quick navigation to important site areas, church directions, and new location information.
- Events need both calendar sync and website-managed event detail pages.
- Testimonies should support text, photos, and video, with publishing controlled by church teams.
- Giving is for offerings only, not sales.
- Contact should aggregate Instagram, YouTube, emails, phone numbers, and official support routes.

## Technical And Operational Notes

- Supabase is the intended backend direction.
- Vercel is a hosting candidate.
- Domain is `holyspiritgeneration.org`.
- Launch geography is India only.
- The system should be designed for future regional content reuse without a full rebuild.
- The delivery workflow should be end-to-end testable and deployable via agents.
- The production availability target is at least 99.9% monthly uptime, as measured by automated external monitoring, with alerts enabled; planned maintenance is excluded from the uptime calculation.
- High-change content includes background images, testimonies, event pages, announcements, and media embeds/links.
- Likely integration anchors include Razorpay for giving, Google Calendar or equivalent calendar sync for events, and YouTube for live/recent services.

## Open PRD/Architecture Questions

- CMS/admin model: Supabase custom admin, headless CMS layered on Supabase, or a lightweight content workflow using existing tools?
- Calendar ownership: Google Calendar as the source of truth, CMS as source of truth, or bidirectional workflow with conflict rules?
- Giving compliance: required donor fields, receipt numbering, PAN/GST/FCRA considerations, anonymous giving limits, refund handling, and audit trail expectations.
- Prayer request privacy: storage policy, retention period, notification routing, and access control.
- Testimony consent: explicit consent capture for names, photos, and videos, especially for minors or sensitive stories.
- Media strategy: embed live social content versus curate selected posts/videos into the site for reliability and brand control.
- Roles: who can draft, review, publish, archive, and delete content?
- Observability: what monitoring coverage, error-alerting thresholds, escalation paths, and payment-failure reporting are expected for launch?
