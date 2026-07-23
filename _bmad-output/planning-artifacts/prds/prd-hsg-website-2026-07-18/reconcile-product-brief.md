# Product-Brief Reconciliation

## Source

- **Input:** `brief-hsg-website-2026-07-09/brief.md`
- **Compared with:** `prd.md` and `addendum.md`
- **Verdict:** The PRD and addendum preserve the brief's product intent and substantially strengthen it into testable requirements. Two non-blocking outcome gaps remain. Later product decisions that narrow launch scope are intentional overrides, not reconciliation defects.

## Intentional Later Overrides

| Brief statement | Current decision | Reconciliation result |
|---|---|---|
| Giving included recurring options. | Launch supports one-time offerings only; recurring giving is explicitly out of scope. | Preserved as an intentional later override in Sections 4.1, 4.3, and FR-14. |
| Events implied registration support and dedicated pages. | Event pages and registration links remain in scope, while registration forms and workflows are hosted by Google Forms or another approved external solution. | Preserved as an intentional later override in Sections 4.1, 4.3, and FR-5. |
| The brief did not define accounts. | User accounts, member login, profiles, and an account-based member-data system are explicitly out of scope. | Preserved as an intentional later scope boundary in Section 4.3. |

## Coverage

### Problem, vision, and audiences

- The website remains HSG's official India digital home and public source of truth for identity, current activity, visit planning, prayer support, contacts, events, testimonies, services, and offerings.
- Newcomers in Bangalore, church members, and outstation visitors remain primary audiences. Associated pastors remain an explicit secondary beneficiary.
- The operational need for media, social-media, technology, and finance teams to maintain the site without routine developer dependence is retained.

### Product principles and experience

- “Alive, not brochure-like” is carried through the Today experience, announcements, events, livestreams, recent sermons, testimonies, and time-sensitive-content requirements.
- The youth-forward, dark, current visual direction is preserved, with clearer accessibility constraints.
- Content freshness ownership is strengthened into a draft, review, approval, publish, verification, correction, and audit workflow.
- Giving is framed as voluntary, trustworthy, non-transactional church support and explicitly separated from prayer or healing outcomes.
- India-first, future-region readiness is preserved through explicit region identity and override requirements without introducing non-India launch scope.

### Launch capabilities

- Home and visit-planning needs are covered by FR-1 through FR-4 and FR-19, including identity, Today, announcements, service time, location, directions, newcomers, prayer/help, and contact paths.
- Events, calendar saving, dedicated event details, expiry/cancellation, and external registration links are covered by FR-5.
- Live and recent YouTube-oriented service access and safe fallback behavior are covered by FR-6 and the addendum's integration candidates.
- Testimony writeups, images, videos, consent, private submission, publication approval, withdrawal, and minors' consent are covered by FR-9, FR-10, and FR-16.
- Prayer-request routing is resolved to configured email recipients, with Supabase as the private system of record and email treated as notification rather than an uncontrolled second record.
- Contact routes include official phone, email, Instagram, YouTube, location, prayer, newcomer, and support routes under FR-19.
- Responsive mobile, tablet, and desktop behavior is retained and strengthened by WCAG 2.2 AA, narrow-width, zoom, assistive-technology, and browser evidence requirements.
- Supabase, Razorpay, end-to-end testing, agent-friendly CI/CD, external monitoring, recovery, and release gates are retained in the addendum and NFRs without overloading the product requirements with implementation detail.

### Offerings and receipts

- Razorpay remains the intended provider.
- Confirmed offering records and current receipts are stored in Supabase and included in recovery requirements.
- Payment confirmation is authoritative and idempotent; redirects alone cannot create success.
- Receipt and export fields are specified in FR-15 and FR-18, while exact tax wording and organisation-specific compliance fields remain gated on Finance and qualified-adviser approval.
- Failed and cancelled attempts are discarded as offering records. Each failure may emit a privacy-preserving operational metric containing timestamp and failure category, but not donor-entered content or payment credentials.
- Refunds, corrections, disputes, exports, audit, reconciliation, and retention are materially more complete than in the brief.

### Original open questions

| Brief open question | Current disposition |
|---|---|
| Content approval workflow | Product behavior resolved in FR-16 and FR-17; organisation-specific role assignments remain an operational approval before migration. |
| Prayer-request destination | Resolved to configured HSG email recipients, with Supabase as private system of record. |
| Receipt and finance-export data | Product fields and storage behavior are defined; exact tax status, wording, and compliance fields remain a Finance gate. |
| Instagram embedded, curated, or linked | Still open in the addendum. FR-19 guarantees at least an approved official route, so the undecided presentation does not block launch. |
| Launch date and sign-off | Target resolved to 15 September 2026; required sign-off functions are defined, while the final named people and backups remain an operational approval. |

## Material Gaps

### G-1 — Production adoption is not measured

The brief says launch succeeds when members use the site as a reliable source for announcements, events, testimonies, and giving. The PRD measures task success, content correctness, uptime, publishing independence, offering integrity, and reconciliation, but it does not define a production adoption or returning-use outcome for members. Add an adoption measure only if HSG intends to use traffic or repeat-use data for post-launch product decisions; doing so must respect the PRD's privacy constraints.

### G-2 — The associated-pastor outcome is not independently testable

Associated pastors remain named as secondary beneficiaries, but the PRD has no journey, acceptance outcome, or success measure confirming that they can find HSG's current activity, events, testimonies, and verified contacts. The common public requirements likely serve them, so this is not a launch blocker; a lightweight stakeholder-validation task would close the brief-to-PRD loop without adding a separate feature set.

## Tracked Open Decisions That Are Not Reconciliation Gaps

- The Instagram/social-content presentation model is deliberately still open; the approved-link fallback already satisfies the launch contact need.
- The exact administration product is deliberately open; the required authoring behavior and accessibility baseline are defined.
- Vercel remains a hosting candidate rather than a product commitment.
- Named approvers, recipient lists, role/content assignments, receipt wording, tax and foreign-contribution controls, refund approvers, and incident responders are organisation-specific launch approvals, not missing product behavior.

## Conclusion

No brief capability has been silently dropped. The deliberate launch-scope changes are explicit, the user's offering-storage and failure-telemetry decisions are captured, and the remaining two gaps concern outcome validation rather than missing launch functionality.
