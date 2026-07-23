# HSG Website PRD Addendum

## Technical Decisions

### Platform and Delivery Direction

- `holyspiritgeneration.org` is the intended production domain.
- Supabase is the intended launch content and data foundation.
- Vercel is a hosting candidate, not a confirmed decision.
- The delivery workflow should support end-to-end testing and agent-friendly deployment through CI/CD.

### Offerings and Reconciliation

- Razorpay is the intended provider for one-time offering payments.
- Authoritative captured-payment confirmation must be verified server-side, and repeated callbacks for the same Razorpay payment ID must be idempotent.
- Confirmed offering records and their current receipts will be stored in Supabase and included in the offering-record recovery plan.
- Failed and cancelled attempts will not be stored as offering records. Each attempt may emit a privacy-preserving aggregate metric containing a timestamp and failure category but no donor-entered content or payment credentials.
- The Finance Volunteer Team will reconcile offerings using exported data rather than a website-based finance feature.
- Refund and correction events remain linked to the immutable original offering record; exports surface the current status and associated provider references.

### Prayer-Request Routing

- Prayer requests will be delivered by email to configured HSG recipient addresses.
- The recipient addresses must map to the pastoral-care roles approved under the PRD; the named recipient list is a pre-implementation approval.
- Supabase is the intended private system of record for website-hosted prayer, healing-status, and testimony submissions. Email is a notification and routing channel, not an additional long-term record.
- Sensitive submissions use the PRD's six-month deletion rule; notification emails must not create uncontrolled retained copies beyond that period.

### Integration Candidates

- YouTube for live and recent services.
- Google Calendar or an equivalent solution may provide one-way personal-calendar actions from approved website event records; it is not an event source of truth or a bidirectional synchronization mechanism at launch.
- Google Forms or another approved external solution for event registration.
- The choice between live social-media embeds and curated social content remains open.

### Content Administration

- The administration model remains open: a custom Supabase admin, a headless CMS layered on Supabase, or a lighter approved workflow.
- Whatever model is selected must let authorised Volunteer Teams maintain routine content without developer help.

### Observability and Release Operations

- Automated external uptime monitoring and alerts are required for the 99.9% monthly uptime target; planned maintenance is excluded.
- Monitoring covers semantic public availability, critical-content freshness, form delivery, livestream availability, payment confirmation, and aggregate payment-failure rate.
- The Tech Volunteer Team owns escalation and must configure a primary and backup responder before launch.
- Critical content, form, media, access-control, offering, export, and recovery journeys are covered by the PRD's end-to-end release gate.
