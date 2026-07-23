# Reconciliation Report: Product Brief Addendum

## Source

`_bmad-output/planning-artifacts/briefs/brief-hsg-website-2026-07-09/addendum.md`

## Compared Against

- `prd.md`, updated 2026-07-23
- `addendum.md`
- `.memlog.md`, consulted only to distinguish intentional later decisions from omissions

## Verdict

The current PRD and PRD addendum preserve all material product, operational, and downstream-design input from the product-brief addendum. The validation-resolution work restores the previously missing home/help priority, contact-channel coverage, platform direction, delivery constraints, monitoring contract, editable media, integration candidates, content roles, prayer privacy, testimony consent, offering operations, and event-calendar ownership.

The original event-calendar question is now explicitly resolved: the approved, publicly verified website event record is the public source of truth; personal-calendar actions are one-way exports; and personal calendars, external registration forms, and bidirectional synchronization do not update or override the website record at launch.

## Material Gaps

None.

The source's product intent and downstream concerns are either represented directly, strengthened by binding requirements and gates, retained as appropriate downstream decisions, or superseded by documented later scope decisions.

## Coverage Review

### Functional notes

| Source input | Current disposition |
|---|---|
| Home page carries the “who HSG is / what is happening / how to join or get help” burden | Preserved in FR-19, which requires a direct home-experience path to those tasks; reinforced by FR-4. |
| Today includes recent activity and live or recent YouTube services | Preserved across FR-4 and FR-6. YouTube remains an integration candidate in the PRD addendum rather than a hard-coded product dependency. |
| Help supports newcomers, prayer, quick navigation, directions, and new-location information | Preserved across FR-2, FR-3, FR-7, FR-17, and FR-19. Time-sensitive service/location changes are explicitly editable and publicly verified. |
| Events have website detail pages and calendar support | Preserved in FR-5. The approved website event is authoritative, and personal-calendar actions are one-way exports; bidirectional synchronization is explicitly excluded at launch. |
| Testimonies support text, photos, and video with church-controlled publishing | Preserved in FR-9, FR-10, FR-16, and Decision Register item 5, with stronger consent, minor, withdrawal, and audit controls. |
| Giving is offerings only, not sales | Preserved in the Offering definition, FR-14, and launch exclusions. One-time-only giving and no product/ticket commerce are intentional later boundaries. |
| Contact aggregates Instagram, YouTube, email, phone, and official support routes | Preserved explicitly in FR-19. |

### Technical and operational notes

| Source input | Current disposition |
|---|---|
| Supabase intended backend direction | Preserved in the PRD addendum as the intended launch content and data foundation and private submission/confirmed-offering system of record. |
| Vercel hosting candidate | Preserved as a candidate, not a settled decision. |
| Production domain `holyspiritgeneration.org` | Preserved in the PRD addendum. |
| India-only launch | Preserved in the Vision, launch exclusions, regional-readiness NFR, and launch-approved payment-source boundary. |
| Future regional content reuse without a rebuild | Preserved and made testable in NFR-7. |
| End-to-end testable, agent-deployable delivery | Preserved in the addendum and NFR-8 as CI/CD, agent-friendly deployment, release evidence, and release gates. |
| 99.9% monthly uptime measured externally, with alerts and planned-maintenance exclusion | Preserved in NFR-4 and the PRD addendum; NFR-9 assigns incident ownership. |
| High-change backgrounds, testimonies, events, announcements, and media | Preserved in FR-16 and FR-17. |
| Razorpay, calendar, and YouTube integration anchors | Preserved as downstream candidates in the PRD addendum. Razorpay is the intended one-time offering provider; calendar integration is intentionally limited to one-way personal-calendar actions at launch. |

### Original open questions

| Source question | Current disposition |
|---|---|
| CMS/admin model | Correctly retained as an open downstream decision in the PRD addendum. FR-16 defines the product outcomes any model must satisfy. |
| Calendar ownership and conflict rules | Resolved in FR-5, Decision Register item 3, and the PRD addendum: the approved website event record is authoritative; calendar actions are one-way exports; external calendars and registration forms cannot update or override it; bidirectional synchronization is out of launch scope. |
| Giving compliance, receipts, refunds, and audit | Substantially resolved in FR-14, FR-15, FR-18, NFR-5, the Decision Register, and the PRD addendum. Finance still owns the organisation-specific, adviser-reviewed approval gate. |
| Prayer privacy, routing, retention, and access | Resolved at PRD level in FR-7, FR-10, NFR-5, the Decision Register, and the email-routing addendum. Named recipients and approved wording remain appropriate pre-implementation approvals. |
| Testimony consent, including minors and sensitive stories | Resolved in FR-9, FR-10, NFR-5, and the Decision Register. |
| Live social embeds versus curated content | Correctly retained as an open downstream decision in the PRD addendum. |
| Draft, review, publish, archive/delete roles | Binding draft/review/publish and emergency-unpublish responsibilities are defined in FR-16/FR-17 and the Decision Register. Sensitive-data deletion is separately governed by NFR-5. The content-class assignment matrix remains an appropriate operational approval. |
| Monitoring coverage, thresholds, escalation, and payment-failure reporting | Preserved through NFR-4, NFR-8, NFR-9, the Decision Register, and the addendum. Specific production responder names remain an appropriate readiness gate. |

## Intentional Later Decisions, Not Gaps

- Recurring giving is excluded; launch supports voluntary one-time offerings only.
- Native event-registration workflows are excluded; event pages may link to approved external registration.
- Bidirectional event-calendar synchronization is excluded; launch calendar support is a one-way personal-calendar action from the approved website event record.
- Public user/member accounts and profiles are excluded.
- “Volunteer Team” is the canonical operational term.
- Confirmed offerings and current receipts are stored in the database and covered by recovery and retention requirements.
- Failed and cancelled attempts are discarded as offering records but emit privacy-preserving aggregate failure metrics.
- Offerings are normally final, with Finance-approved seven-day exceptions for duplicate, incorrect-amount, or demonstrably unauthorised transactions.
- Finance export and reconciliation are launch requirements even though a website-based accounting product is out of scope.
