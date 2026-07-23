# Validation Report — HSG Website Product Requirements Document

- **PRD:** `/Users/udeetgulati/Projects/hsg-website/_bmad-output/planning-artifacts/prds/prd-hsg-website-2026-07-18/prd.md`
- **Rubric:** `/Users/udeetgulati/Projects/hsg-website/.agents/skills/bmad-prd/assets/prd-validation-checklist.md`
- **Run at:** 2026-07-23T06:08:47Z
- **Grade:** Fair

## Overall verdict

This is a product-specific, coherent PRD with credible user journeys, explicit launch exclusions, unusually good counter-metrics, and a clean separation between product requirements and technical handoffs. It is ready to guide early UX exploration, but it is not yet safe as a green-light-to-build contract: several policy and ownership decisions that shape data, payments, publishing, and launch operations remain deferred, while many functional outcomes still depend on subjective words rather than observable completion conditions.

The product/UX and delivery parties reinforced that result. They found no critical defect and did not recommend restarting the PRD, but they showed that the unresolved source-of-truth, sensitive-data, offering, editorial-governance, security, recovery, and launch-ownership contracts would force downstream teams to invent product policy. UX and architecture discovery may proceed conditionally; implementation-ready stories for those affected flows should remain blocked until the high findings are resolved.

## Dimension verdicts

- Decision-readiness — **thin**
- Substance over theater — **adequate**
- Strategic coherence — **adequate**
- Done-ness clarity — **thin**
- Scope honesty — **adequate**
- Downstream usability — **adequate**
- Shape fit — **adequate**

## Findings by severity

### Critical (0)

No critical findings.

### High (9)

**[Decision-readiness / All reviewers] — Deferred blockers have no decision contract (§10, Open Questions 1–7)**

The PRD identifies the right unresolved questions but assigns no owner, resolution milestone, downstream dependency, or approval gate. The target still says only “15 September,” with no year or final launch approver.

Fix: Add an owner, resolve-by milestone, affected work, required evidence, and explicit gate to every open question. Resolve the launch year, final approver, and primary/backup operational owners immediately.

**[Decision-readiness / Product-UX / Delivery] — Sensitive prayer and testimony data lack a complete lifecycle (§6.3 FR-7 and FR-10; §7 NFR-5; §10 Questions 4–5)**

Notice, consent, HSG approval, and authorised access are stated, but recipient roles, minimum fields, retention, deletion, withdrawal, cache/media unpublication, consent versioning, re-consent after edits, minor handling, and audit evidence remain undefined. Email routing adds uncontrolled copies without a custody contract.

Fix: Define a lifecycle per sensitive submission: purpose, fields, recipients, access/audit rules, consent evidence, minor/safeguarding handling, review/publication states, retention/deletion, withdrawal-to-unpublish target, and accountable owner. Obtain qualified privacy/legal review where required.

**[Decision-readiness / Product-UX / Delivery] — Editorial governance and source-of-truth semantics are unresolved (§6.2 FR-4; §6.6 FR-16–FR-17; §9 SM-3 and SM-6; §10 Questions 2–3)**

The website promises dependable current information and lets Volunteer Teams draft, preview, and publish, but it does not define authoritative sources, content-risk classes, exact-revision preview, approval invalidation, public verification, emergency unpublish, audit evidence, correction ownership, or freshness limits.

Fix: Define the authority and governance contract by content class: source of truth, primary/backup owner, permitted roles/actions, draft-review-approve-publish-expire states, exact preview binding, verified-public meaning of “published,” audit fields, freshness/safe-stale targets, and emergency correction path.

**[Scope honesty / Product-UX / Delivery] — The offering contract is internally incomplete (§4.1 Offerings; §6.5 FR-14–FR-15; §9 SM-4; §10 Question 6)**

Launch scope promises finance-team exports and the addendum assumes exported reconciliation, but no FR defines the export. The payer flow also leaves confirmation authority, duplicate or late callbacks, retry safety, anonymity limits, receipt identity, refunds/corrections, reconciliation exceptions, retention, and audit evidence open.

Fix: Add an implementation-neutral finance export and reconciliation requirement or remove exports from launch scope. Define the offering state model, authoritative confirmation, idempotency invariants, record/receipt/export fields, access and retention, exception ownership, anonymity boundary, and refund/correction policy.

**[Product-UX / Delivery] — Prayer/help and external submission handoffs lack a duty-of-care contract (§6 FR-3, FR-7, FR-10, FR-12–FR-13)**

“Prayer request,” “practical help,” “approved channel,” and “successful submission” do not distinguish delivery from human response or specify monitoring expectations, urgent/safeguarding guidance, failed delivery, duplicate submissions, abandonment, custody, or accessibility responsibility.

Fix: Define a submission-channel matrix by journey: hosted versus external custody, supported intent categories, minimum fields, privacy/consent owner, delivery and response confirmation semantics, monitoring expectation, urgent-risk guidance, duplicate behavior, failure fallback, retention/access, and accountable handoff.

**[Done-ness clarity / All reviewers] — Functional outcomes and stateful workflows are not consistently verifiable (§6, especially FR-1–FR-4, FR-7, FR-10, and FR-16–FR-18)**

Terms such as “easy,” “clear,” “prominent,” “relevant,” “promptly,” “authorised,” and “coherent” do not identify observable pass/fail conditions. Submission, publishing, payment, expiry, retry, denial, and recovery states are only partially specified.

Fix: Give every FR at least one observable consequence and define the product-significant states and transitions for each stateful flow, including failure, denial, duplicate, interruption, recovery, correction, and expiry.

**[Strategic coherence / Product-UX] — The broad launch has no priority or principled cut line (§4.1; §6; §10 Question 1)**

Eighteen FRs span public content, live media, multiple sensitive forms, volunteer publishing, and payments, but all appear equally launch-critical. The PRD gives no must-ship/deferrable split, dependency order, capacity assumption, or evidence-triggered scope cut.

Fix: Confirm the launch date and authority, mark capabilities as must-ship or contingent, identify dependency gates for sensitive forms, offerings, and publishing, and record the evidence that triggers each scope reduction.

**[Delivery party] — Security, SLO, recovery, and release-gate contracts are not measurable (§7 NFR-3–NFR-5 and NFR-8; §9 SM-5–SM-6; §10 Question 7)**

“Typical 4G,” 99.9% uptime, “protected from accidental loss,” “authorised people,” and “critical end-to-end check” lack reproducible measurement profiles, semantic probes, named principal classes, negative access rules, abuse controls, RTO/RPO, restore evidence, and an enumerated critical test set.

Fix: Define performance profiles and percentiles, semantic availability and freshness SLIs, named principal classes with allowed/denied actions, privileged-authentication and audit expectations, abuse controls, separate recovery objectives by asset class, and a risk-to-evidence release matrix.

**[Product-UX / Shape fit] — The journey set omits the highest-risk operational work (§3; §6.5–§6.6; §9 SM-3 and SM-7)**

Meera’s journey combines several unrelated purposes, while offering failure/uncertainty, Volunteer Team publishing, urgent correction, testimony withdrawal, and finance reconciliation have no coherent end-to-end journeys. Aggregated usability measures could hide failure on a critical task.

Fix: Split multi-purpose journeys into realistic single-goal episodes, add concise publisher and finance journeys, include failure/fallback and responsible handoff states, and assign independent pass criteria to critical payment, sensitive-submission, and content-update journeys.

### Medium (9)

**[Done-ness clarity / Delivery] — NFR and metric measurement protocols are incomplete (§7; §9)**

Sample sizes, recruitment criteria, devices, browsers, assistive technology, network profile, percentiles, assistance rules, start/end events, evidence sources, owners, cadence, and observation windows are not consistently defined.

Fix: Attach a measurement contract to each launch metric and NFR, distinguishing pre-launch usability evidence, release gates, and ongoing production controls.

**[Downstream usability] — Currentness terminology is not canonical (§6 FR-4, FR-6, FR-17–FR-18; §9 SM-6)**

“Current,” “today,” “next,” “recent,” and the named “Today” experience can be interpreted differently across content modelling, UX, scheduling, time zones, livestream state, and tests.

Fix: Define currentness, time zone, ordering, expiry, stale-state, and manual-override rules per content class.

**[Product-UX / Delivery] — Authoring accessibility is outside the stated accessibility contract (§6.6 FR-16; §7 NFR-1; §9 SM-3)**

The public site must meet WCAG 2.2 AA, but the operational authoring journey has no keyboard, screen-reader, error/status, alt-text, heading, crop, or contrast requirements.

Fix: Add an accessible authoring baseline and representative editor acceptance tasks, including rendered accessibility checks before publication.

**[Scope honesty] — “Practical help” is an undefined service boundary (§2.3; §6.3 FR-7)**

The phrase could encompass pastoral care, financial assistance, emergencies, safeguarding, or health crises, each with distinct routing, privacy, and response obligations.

Fix: Define supported launch categories and response promises, add safe urgent-case routing, and name excluded help types.

**[Product-UX] — The healing-follow-up-to-offering transition needs an observable non-coercion contract (§3 UJ-2; §6.3 FR-10; §8.2; §9 SM-C1)**

Placing a thanksgiving-offering path immediately after a healing-status or testimony flow may feel coercive to a vulnerable visitor even when labelled optional.

Fix: Prefer a separate, non-blocking path; prohibit preselected amounts and outcome-linked language; and usability-test whether prayer and follow-up are understood to be independent of giving.

**[Product-UX] — “Languages” is ambiguous (§3 UJ-1; §6.1 FR-1; §7 NFR-7)**

The PRD does not say whether languages means listing service languages or localising the website.

Fix: State the launch interpretation explicitly, including required service-language fields and whether UI/content localisation is in or out of scope.

**[Substance / Delivery] — Future regional readiness is too abstract (§7 NFR-7)**

The requirement is not testable and may encourage speculative architecture for an explicitly India-only launch.

Fix: Remove it from the launch PRD or define minimum future-ready invariants such as stable region identity, region/locale separation, explicit global/override provenance, safe authorisation boundaries, and a representative architecture validation.

**[Strategic coherence] — Content trust is only partially measured (§1; §9 SM-6)**

Publishing approved changes before a service does not detect contradictory, ownerless, incorrect, or stale critical information when no change was formally approved.

Fix: Add an accuracy and staleness measure for service, location, parking, and healing-card information, plus a counter-metric for contradictory or expired critical content.

**[Product-UX / Substance] — Associated pastors do not alter a launch decision (§1; §2.1; §3)**

They are named as a primary audience but have no distinct journey, requirement, or metric beyond the public trust and contact experience.

Fix: Add an evidence-based differentiated outcome or reclassify associated pastors as a secondary beneficiary.

### Low (1)

**[Mechanical] — Minor terminology drift (§3 UJ-1; §5; §6 FR-3 and FR-18)**

UJ-1 says “welcome team” instead of the canonical “Newcomer Volunteer Team”; “Today” behaves like a product term without a glossary definition; and singular/capitalised “Pastor” is not defined despite two senior leaders being named.

Fix: Normalise the canonical terms and define “Today” if it remains a named experience.

## Mechanical notes

- UJ IDs are contiguous and unique from UJ-1 through UJ-3; every UJ has a named protagonist.
- FR IDs are contiguous and unique from FR-1 through FR-18; explicit UJ, FR, and NFR cross-references resolve.
- Primary and secondary metric IDs are contiguous from SM-1 through SM-7; counter-metrics consistently use SM-C1 through SM-C3.
- No inline `[ASSUMPTION]` tags or Assumptions Index appear; the memlog’s launch-date assumption is surfaced as Open Question 1.
- The expected chain-top sections are present, and technical mechanisms are appropriately separated into the addendum.

## Reviewer files

- `review-rubric.md`
- `review-party-product-ux.md`
- `review-party-delivery.md`
