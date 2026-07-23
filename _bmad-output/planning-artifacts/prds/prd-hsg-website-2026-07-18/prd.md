---
title: HSG Website Product Requirements Document
status: final
created: "2026-07-18"
updated: "2026-07-23"
---

# HSG Website Product Requirements Document

## Table of Contents

- [1. Vision](#1-vision)
- [2. Target Audiences and Needs](#2-target-audiences-and-needs)
  - [2.1 Primary Audiences](#21-primary-audiences)
  - [2.2 Secondary Beneficiaries](#22-secondary-beneficiaries)
  - [2.3 Operational Users](#23-operational-users)
  - [2.4 Core User Needs](#24-core-user-needs)
- [3. Key User Journeys](#3-key-user-journeys)
  - [UJ-1. Ananya decides whether to visit HSG](#uj-1-ananya-decides-whether-to-visit-hsg)
  - [UJ-2. Ravi prepares to seek healing prayer](#uj-2-ravi-prepares-to-seek-healing-prayer)
  - [UJ-3. Meera participates in church life](#uj-3-meera-participates-in-church-life)
  - [UJ-4. Neha publishes a time-critical update](#uj-4-neha-publishes-a-time-critical-update)
  - [UJ-5. Arjun gives and Finance reconciles the offering](#uj-5-arjun-gives-and-finance-reconciles-the-offering)
- [4. Launch Scope](#4-launch-scope)
  - [4.1 In Scope](#41-in-scope)
  - [4.2 Launch Priority and Gates](#42-launch-priority-and-gates)
  - [4.3 Out of Scope for Launch](#43-out-of-scope-for-launch)
- [5. Product Terms](#5-product-terms)
- [6. Features and Requirements](#6-features-and-requirements)
  - [6.1 Understand HSG and Plan a Visit](#61-understand-hsg-and-plan-a-visit)
  - [6.2 Stay Current and Watch Services](#62-stay-current-and-watch-services)
  - [6.3 Prayer, Healing, and Testimonies](#63-prayer-healing-and-testimonies)
  - [6.4 Grow, Join a Powerhouse, and Serve](#64-grow-join-a-powerhouse-and-serve)
  - [6.5 Give an Offering](#65-give-an-offering)
  - [6.6 Keep Content Current](#66-keep-content-current)
  - [6.7 Export and Reconcile Offerings](#67-export-and-reconcile-offerings)
  - [6.8 Find Verified Contact Routes](#68-find-verified-contact-routes)
- [7. Quality Requirements](#7-quality-requirements)
  - [NFR-1: Accessibility](#nfr-1-accessibility)
  - [NFR-2: Responsive Usability](#nfr-2-responsive-usability)
  - [NFR-3: Performance](#nfr-3-performance)
  - [NFR-4: Reliability](#nfr-4-reliability)
  - [NFR-5: Privacy and Security](#nfr-5-privacy-and-security)
  - [NFR-6: Discoverability](#nfr-6-discoverability)
  - [NFR-7: Future Readiness](#nfr-7-future-readiness)
  - [NFR-8: End-to-End Release Evidence](#nfr-8-end-to-end-release-evidence)
  - [NFR-9: Monitoring and Incident Ownership](#nfr-9-monitoring-and-incident-ownership)
- [8. Experience and Tone](#8-experience-and-tone)
  - [8.1 Visual Direction](#81-visual-direction)
  - [8.2 Content Tone](#82-content-tone)
- [9. Success Metrics](#9-success-metrics)
  - [Primary Metrics](#primary-metrics)
  - [Secondary Metrics](#secondary-metrics)
  - [Counter-Metrics](#counter-metrics)
  - [Measurement Protocol](#measurement-protocol)
- [10. Decision Register and Approval Gates](#10-decision-register-and-approval-gates)
  - [10.1 Resolved Product Decisions](#101-resolved-product-decisions)
  - [10.2 Remaining Operational Approvals](#102-remaining-operational-approvals)

## 1. Vision

Holy Spirit Generation (HSG) is a vibrant, Word-based, Spirit-filled church founded and led by Apostle Dr. P. S Rambabu and Pastor Vinita Rambabu. Building on more than three decades of ministry, HSG equips believers through the Word of faith and the supernatural power of God, raising disciples to carry the gospel into the world.

The HSG website will be the church's official digital home for India: a welcoming doorway for newcomers, a dependable source of current information for members and visitors, and a credible view of the ministry for associated pastors. It will bring together services, events, testimonies, prayer support, contact information, and offerings in one clear, mobile-friendly experience that Volunteer Teams can keep current without depending on developers.

## 2. Target Audiences and Needs

### 2.1 Primary Audiences

- **Newcomers in Bangalore** who want to understand HSG, know what to expect, and plan their first visit.
- **Church members** who need a reliable place for current services, events, announcements, testimonies, prayer support, and giving.
- **Outstation visitors** who need service timings, location details, directions, and current contact information before visiting.

### 2.2 Secondary Beneficiaries

- **Associated pastors** who benefit from the same credible ministry information, current activity, and verified contact points provided to the public.

### 2.3 Operational Users

HSG's media, social-media, technology, and finance teams will maintain content and support giving operations. Routine updates should not require developer involvement.

### 2.4 Core User Needs

Visitors need to be able to:

- Understand who HSG is and what it believes.
- See what is happening today and what is coming next.
- Find service timings, location details, and directions quickly.
- Watch live and recent services.
- Discover events and save relevant dates.
- Read or watch testimonies.
- Request prayer, attendance or accessibility help, newcomer connection, or pastoral contact through a supported channel.
- Learn how to seek healing prayer, including the Sunday process of creating a healing card before service so the Pastor and healing teams can pray for them.
- Contact the church through the appropriate channel.
- Give offerings through a clear and trustworthy process.

## 3. Key User Journeys

### UJ-1. Ananya decides whether to visit HSG

- **Context:** Ananya is a newcomer who hears about HSG through search, social media, an event, or a personal invitation.
- **Journey:** She checks HSG's location, beliefs, worship style, pastors, languages, and ministries. Sermons, testimonies, children's church information, and accessibility details help her understand what the church is like. She then finds service times, directions, parking, children's arrangements, and a way to contact the Newcomer Volunteer Team.
- **Value moment:** Ananya knows what to expect and feels confident planning her first visit.
- **Next step:** After attending, she can register to connect with the Newcomer Volunteer Team, request prayer, learn more about Jesus and discipleship, begin serving, or give.

### UJ-2. Ravi prepares to seek healing prayer

- **Context:** Ravi is seeking healing from sickness and hears about HSG through social media or a personal healing testimony.
- **Journey:** He explores healing testimonies, sermons, and clips that explain HSG's belief in healing. He learns how the Sunday healing-card process works and confirms the service time, directions, parking, and wheelchair support before visiting.
- **Value moment:** Ravi understands how he can receive prayer from the Pastor and healing teams and can attend with confidence.
- **Next step:** After attending, he can report his healing status or submit a testimony. A separate, optional thanksgiving-offering path is available without implying that prayer, follow-up, or a healing outcome depends on giving.

### UJ-3. Meera participates in church life

- **Context:** Meera is an existing HSG member who returns to the website with a specific purpose.
- **Journey:** She checks important updates, upcoming events, and recent sermons; registers for events; and finds opportunities to volunteer. She can also access discipleship teachings, prayer timings, and Powerhouse information and express interest in joining.
- **Value moment:** Meera completes her intended task quickly without searching across multiple channels.
- **Next step:** She becomes more connected, active, and planted in church life.

### UJ-4. Neha publishes a time-critical update

- **Context:** Neha is an authorised Social Media or Media Volunteer Team member who learns that a service time, venue detail, or parking instruction has changed.
- **Journey:** She opens the authoritative content record, edits the affected information, previews the exact revision, requests approval from the designated content owner, and publishes or schedules the approved revision. She verifies the public page and, if the wrong version appears, uses the correction path to unpublish or replace it.
- **Value moment:** Visitors see one accurate version of critical information before the affected service, and the change has a review and publication audit trail.
- **Fallback:** If the normal workflow is unavailable, Neha escalates to the Tech Volunteer Team, which can publish a safe notice or temporarily unpublish incorrect content.

### UJ-5. Arjun gives and Finance reconciles the offering

- **Context:** Arjun chooses to make a voluntary one-time offering and may choose not to identify himself beyond details required to process the payment.
- **Journey:** He selects a category and amount, reviews them, and completes payment. The website shows success only after authoritative confirmation and provides a receipt. If the result is interrupted or uncertain, he sees how to verify the transaction before retrying. A Finance Volunteer Team member later exports confirmed and corrected records for a selected period, matches them to the payment-provider settlement, and resolves missing, duplicate, refunded, or disputed items.
- **Value moment:** Arjun has an unambiguous result and Finance has one auditable record for each confirmed offering.
- **Fallback:** Failed attempts are not retained as offering records; they produce privacy-preserving aggregate failure telemetry. Duplicate confirmations do not create duplicate offering records or receipts.

## 4. Launch Scope

### 4.1 In Scope

- **HSG identity and trust:** beliefs, pastors, ministries, languages, worship experience, testimonies, and sermons.
- **Visit planning:** service times, location, directions, parking, children's arrangements, accessibility and wheelchair support, and Newcomer Volunteer Team contact.
- **Current church life:** today's information, announcements, upcoming events, calendar support, live services, and recent sermons. Event registration may link to Google Forms or another approved external solution.
- **Prayer and spiritual next steps:** general prayer requests, the Sunday healing-card process, healing-focused content, learning about Jesus, discipleship resources, prayer timings, Powerhouse information, and serving opportunities.
- **Connection and follow-up:** newcomer registration, contact channels, healing-status follow-up, and testimony submission.
- **Offerings:** a trustworthy one-time online giving experience supporting offering categories, anonymous giving, receipts, and Finance Volunteer Team exports.
- **Content operations:** authorised Volunteer Teams can keep routine information current without developer support.
- **Responsive experience:** clear and usable across mobile, tablet, and desktop, with particular attention to mobile visitors.

### 4.2 Launch Priority and Gates

The indispensable launch spine is HSG identity, visit planning, current service and location information, verified contact routes, accessible mobile use, and a content workflow that keeps those details accurate. These capabilities must ship for the website to serve as HSG's official digital home.

Prayer and follow-up submissions, offerings, livestreams, event registration links, Powerhouse enquiries, and testimony publishing remain launch scope only when their policy, ownership, privacy, failure, and end-to-end release gates are satisfied. If a gate is not satisfied by the content-freeze milestone, the affected capability is replaced with a safe verified contact path or link, without delaying the indispensable launch spine. HSG leadership approves any such scope cut.

### 4.3 Out of Scope for Launch

- Regional website experiences outside India.
- Product sales and ticket commerce.
- Recurring giving.
- Event registration forms or registration workflows hosted by the HSG website.
- User accounts, member login, member profiles, or an account-based member-data system.
- A full church-management system.
- Deep donor relationship management or accounting automation.

## 5. Product Terms

- **HSG:** Holy Spirit Generation Church.
- **Newcomer:** Someone exploring HSG or preparing for an early visit, whether based in Bangalore or visiting from elsewhere.
- **Service:** A scheduled HSG church gathering that people may attend in person or watch online when streaming is available.
- **Pastor:** The HSG pastoral leader assigned to the healing-card prayer process for the applicable service.
- **Healing card:** A card created on Sunday before service for someone seeking healing prayer; the Pastor and healing teams use it as part of the prayer process.
- **Powerhouse:** An HSG small group that meets midweek in a senior church member's home in one of several parts of the city.
- **Testimony:** A written, photographic, or video account of a personal experience connected to HSG, including healing.
- **Offering:** A voluntary financial gift to HSG, distinct from purchasing a product or ticket.
- **Current:** Active and applicable at the time shown in India Standard Time (IST), not expired or superseded.
- **Today:** The current IST calendar day; a named website view may include live activity, today's services and announcements, and the next upcoming item when nothing remains today.
- **Published:** The exact approved revision is publicly available on the canonical HSG URL and has been verified there.
- **Offering receipt:** HSG's acknowledgement of a confirmed offering. It is not described as a tax-deduction certificate unless Finance has approved the applicable wording and donor-data requirements.
- **Content freeze:** The milestone seven calendar days before the target launch date, after which launch-critical content changes require the urgent-correction workflow.
- **Volunteer Team:** An authorised HSG group of volunteers responsible for a particular area of church life or website operations.

## 6. Features and Requirements

### 6.1 Understand HSG and Plan a Visit

The website should help newcomers decide whether HSG is right for them and remove uncertainty about attending for the first time. This feature supports UJ-1 and UJ-2.

#### FR-1: Understand HSG

Visitors can learn about HSG's story, beliefs, founders and senior pastors, worship experience, languages, and ministries.

**Expected outcomes:**

- The public identity content names HSG's story, Word-based and Spirit-filled beliefs, mission, founders and senior pastors, worship experience, ministries, and the languages used in services.
- “Languages” at launch means published service-language information; website UI and content localisation are out of scope.
- Identity pages link to at least one relevant sermon or testimony where approved content exists.

#### FR-2: Plan a Visit

Visitors can find the practical information needed to attend an HSG service confidently.

**Expected outcomes:**

- A first-time mobile visitor can find the next service time, venue, and directions within the SM-1 threshold.
- Each visit-planning view includes or explicitly marks as unavailable the current service schedule, full public venue details, map link, parking, children's arrangements, accessibility and wheelchair support, service languages, and what to expect.
- The next service time and venue remain available without playing video or loading non-essential media.

#### FR-3: Connect with the Newcomer Volunteer Team

Visitors can contact or register their interest with the Newcomer Volunteer Team before or after attending.

**Expected outcomes:**

- A verified contact method or approved external connection form is labelled with its purpose and owning Volunteer Team.
- A successful website-hosted submission confirms delivery into HSG's routing process, not a guaranteed human response; an external form is responsible for its own confirmation and accessibility.
- A failure leaves the visitor's entered information intact where safe and provides a verified alternative contact route.

### 6.2 Stay Current and Watch Services

The website should give members and visitors one reliable place to see what is happening at HSG and engage with current church content. This feature supports UJ-1 and UJ-3.

#### FR-4: See What Is Happening Now

Visitors can quickly see today's service information, important announcements, and the next relevant activities.

**Expected outcomes:**

- The Today view uses IST and shows the active service state, applicable announcements, and next activity; every time-sensitive item displays its date and time.
- Expired or superseded content is not labelled current, and the next upcoming item is used when no activity remains today.
- Conflicting service, location, parking, or healing-card information is a release-blocking content defect until one canonical version is restored.
- The mobile home experience combines what is happening now with a live-service state or recent approved service content and does not rely on hover, video playback, or social-media access.

#### FR-5: Discover Events

Visitors can browse upcoming events and open a page with the information needed to participate.

**Expected outcomes:**

- Before publication, each event has a title, status, IST start date and time, location or approved online-access route, description, and registration instructions when registration is required.
- Optional end times or participation instructions are omitted when they do not apply; a required field that is still unknown blocks publication rather than showing a placeholder as current information.
- Visitors can save the approved website event details to their personal calendar through a one-way calendar action.
- The approved, publicly verified website event record is the public source of truth. Personal calendars and external registration forms do not update it or override conflicting details.
- When registration is required, the event links to Google Forms or another approved external solution.
- Event registration is not hosted or managed by the HSG website.
- Events are ordered by their IST start time; ended or cancelled events are removed from upcoming views, and cancellations show an explicit status when the page remains public.
- A registration link is checked before publication and has a verified owner and alternative contact path.

#### FR-6: Watch Live and Recent Services

Visitors can access an active HSG livestream and watch recent services or sermons.

**Expected outcomes:**

- A service is labelled live only while the approved stream source reports or the authorised content owner declares an active broadcast.
- When no service is live, the same area shows the next service time and at least one recent approved item when available.
- If the live source fails, visitors see a non-playing fallback with the next service time, recent content, and a verified HSG channel rather than an indefinite loading state.

### 6.3 Prayer, Healing, and Testimonies

The website should help people seek prayer, understand HSG's healing-prayer process, and share what happened afterward. This feature supports UJ-1 and UJ-2.

#### FR-7: Request Prayer or Supported Help

Visitors can submit a prayer request or ask for attendance or accessibility help, newcomer connection, or pastoral contact through an approved channel. The launch flow is not an emergency, medical, financial-assistance, housing, legal, or safeguarding-response service.

**Expected outcomes:**

- Before submission, the visitor sees the supported purpose, minimum required fields, six-month retention period, pastoral-care recipient role, and a link to the applicable privacy notice and consent version.
- The form advises people in immediate danger or with urgent medical or safeguarding needs to use appropriate local emergency or specialist services; it does not promise that HSG monitors submissions continuously.
- A website-hosted success state means the submission was stored and routed to the configured pastoral-care recipients; it does not promise that a person has read or answered it.
- Duplicate submission does not expose previous content and is either safely accepted as a new request or identified without revealing sensitive data.
- Failed routing alerts the Tech Volunteer Team and gives the visitor a verified alternative without disclosing the request in public logs.

#### FR-8: Understand the Healing-Prayer Process

Visitors can learn what HSG believes about healing and how to receive prayer during a Sunday service.

**Expected outcomes:**

- The website explains that healing cards are created before the Sunday service for prayer by the Pastor and healing teams.
- The same view links directly to the next Sunday service time, directions, parking, and wheelchair-support information.
- The content assures visitors that prayer is available without promising a specific healing outcome.

#### FR-9: Explore Healing Content

Visitors can find healing testimonies, sermons, and short clips in one clearly identified area.

**Expected outcomes:**

- Content can be presented in text, image, or video formats as appropriate.
- Each item is titled, dated, attributed according to its recorded publication consent, and distinguishable from teaching or a promise of individual outcome.

#### FR-10: Follow Up After Prayer

Visitors can report their healing status or submit a testimony after receiving prayer.

**Expected outcomes:**

- The submission process states that website submissions are private inputs for review and follow-up and are never published automatically.
- The submission records its privacy-notice and consent versions and is retained for six months unless a documented safeguarding or legal hold applies.
- If HSG selects a testimony for publication, an authorised Volunteer Team prepares a final revision through the existing internal approval process and obtains separate recorded consent for that exact text and each name, image, audio, or video before publication.
- A parent or legal guardian must provide publication consent for a minor; absent verified guardian consent, the testimony is not published.
- A person can request withdrawal through a verified contact route. HSG unpublishes content under its control within two business days and completes removal from HSG-controlled media and caches within seven calendar days, subject to documented legal holds.
- The thanksgiving-offering path is separate and optional, has no preselected amount, and does not imply that prayer, follow-up, publication, or healing depends on giving.

### 6.4 Grow, Join a Powerhouse, and Serve

The website should help newcomers and members take practical next steps in their faith and participation at HSG. This feature supports UJ-1 and UJ-3.

#### FR-11: Find Spiritual Next Steps

Visitors can learn about Jesus, access discipleship teachings, and find current prayer timings.

**Expected outcomes:**

- The page distinguishes learning about Jesus, discipleship teachings, and current prayer timings as separate tasks.
- Each task has a direct path from the main navigation and an explicit next action or verified contact route.

#### FR-12: Find and Join a Powerhouse

Visitors can understand what a Powerhouse is, find an option in a relevant part of the city, and express interest in joining.

**Expected outcomes:**

- The website explains that Powerhouses meet midweek in homes and are led by senior church members.
- Available Powerhouses can be discovered by broad city area.
- Visitors can express interest through an approved contact method or external form.
- Private home addresses are not displayed publicly.
- A submission confirmation means the enquiry was delivered to the configured owner, not that placement is guaranteed; failures provide a verified alternative route.

#### FR-13: Find Opportunities to Serve

Visitors can explore Volunteer Teams and express interest in serving.

**Expected outcomes:**

- Each opportunity explains the purpose of the Volunteer Team and who the opportunity is suited for.
- A clear contact method or approved external form is provided.
- The contact route identifies the owning Volunteer Team and distinguishes successful delivery from a promised response or placement.

### 6.5 Give an Offering

The website should provide a clear and trustworthy way to give a one-time offering to HSG. This feature supports the giving steps in UJ-1, UJ-2, UJ-3, and UJ-5.

#### FR-14: Give a One-Time Offering

Visitors can choose an offering category, enter an amount, provide required details, and complete payment.

**Expected outcomes:**

- The experience clearly presents giving as an offering rather than a purchase.
- Visitors can choose from current offering categories, including a thanksgiving offering where applicable.
- Giving is voluntary; there is no preselected amount, outcome-linked language, or requirement to give before accessing prayer, follow-up, testimony, or other church information.
- “Anonymous” means no public attribution and no donor follow-up beyond the receipt or transaction support the giver requests. HSG and the payment provider may still retain details required for payment, fraud prevention, finance, tax, or regulatory obligations.
- The flow accepts only launch-approved India payment sources until Finance confirms any required foreign-contribution registration, account, and operating controls.
- The visitor can review the amount and category before confirming payment.
- The flow states that offerings are normally final. Finance may approve a refund for a duplicate payment, an incorrect amount, or a demonstrably unauthorised transaction when requested within seven calendar days; refunds return to the original payment method.
- Tax-deduction language and collection of tax-identity fields appear only after Finance confirms HSG's eligibility and approved receipt requirements.

#### FR-15: Understand the Payment Result

Visitors receive a clear result after attempting payment.

**Expected outcomes:**

- A payment is confirmed only from the authenticated, captured result of the payment provider; a browser redirect alone is not confirmation.
- Initiated, pending/uncertain, confirmed, failed, cancelled, refunded, partially refunded, and disputed outcomes have distinct user-visible or finance-visible states as applicable.
- A confirmed payment creates exactly one retained offering record and one current receipt even if callbacks or page refreshes repeat.
- The receipt includes a unique HSG receipt reference, provider transaction reference, IST timestamp, amount, offering category, current status, and donor identity/contact only when supplied or required.
- Pending or interrupted results tell the giver how to verify the transaction before retrying. Failed and cancelled attempts are not retained as offering records.
- Each failed attempt emits a privacy-preserving operational metric with timestamp and failure category but no donor-entered content or full payment credentials.
- A refund or correction preserves the original record and records the reason, approver, amount, provider reference, and time. The system issues an updated receipt or correction notice.

### 6.6 Keep Content Current

The website should allow authorised Volunteer Teams to maintain routine content through an agreed content workflow without depending on developers.

#### FR-16: Maintain Routine Content

Authorised Volunteer Teams can create, update, preview, and publish the content assigned to them.

**Expected outcomes:**

- Routine content includes service times and locations, parking information, healing-card instructions, announcements, events, pages, ministries, sermons, testimonies, and approved media embeds or links.
- Approved background and banner images can be replaced without code changes.
- Social Media and Media Volunteer Team members may draft assigned public content; a designated content owner reviews it; only a designated publisher may publish it.
- Preview is bound to the exact revision submitted for approval. Editing an approved revision invalidates that approval and requires review again.
- The publication audit records the content item, revision, drafter, reviewer, publisher, approval time, publication time, and public verification result.
- The Tech Volunteer Team administers access and may emergency-unpublish unsafe or incorrect content, but does not approve ministry content merely by administering the platform.
- Routine updates do not require code changes or developer support.
- Representative authoring tasks meet the keyboard, screen-reader, visible-status, labelled-error, heading, alt-text, and contrast requirements in NFR-1.

#### FR-17: Manage Time-Sensitive Content

Authorised Volunteer Teams can control when time-sensitive content appears as current.

**Expected outcomes:**

- Announcements and events include applicable start, end, publication, expiry, and cancellation states in IST.
- The designated source owner supplies service, location, parking, and healing-card updates; the approved website record becomes the public source of truth once verified.
- Critical updates are published and publicly verified before the affected service. If verification fails, the Tech Volunteer Team publishes a safe notice or unpublishes the conflicting item.
- Past events and expired announcements do not continue to appear as current.
- Dates and times are displayed clearly and consistently.

### 6.7 Export and Reconcile Offerings

The website should give the Finance Volunteer Team complete, non-duplicated offering records for the operational half of UJ-5 without becoming an accounting product.

#### FR-18: Export and Reconcile Offerings

Authorised Finance Volunteer Team members can export offering records for reconciliation without requiring a website-based accounting feature.

**Expected outcomes:**

- An export supports a selected IST date range and includes receipt reference, provider transaction reference, confirmed timestamp, amount, category, status, refund/correction references, settlement reference when available, and donor fields only where authorised.
- The same confirmed provider transaction never appears as more than one offering in an export, and every confirmed offering in the selected range is represented.
- Export access is restricted to the Finance Volunteer Team and produces an audit event naming the requester, range, and time.
- Finance reviews exceptions at least weekly and before monthly close; missing, duplicate, refunded, disputed, or unmatched records remain visible until resolved.
- Offering records and receipts are retained for eight completed financial years after the transaction year unless Finance's qualified adviser approves a longer period.

### 6.8 Find Verified Contact Routes

#### FR-19: Contact HSG

Visitors can find current, verified HSG contact channels for the purpose they need.

**Expected outcomes:**

- The website identifies official phone, email, Instagram, YouTube, location, prayer, newcomer, and support routes that HSG has approved for public use.
- Each route names its purpose; private operational addresses and unverified personal accounts are not exposed.
- The home experience provides a direct path to who HSG is, what is happening now, and how to join, visit, contact, or ask for supported help.
- The owning Volunteer Team verifies critical contact routes at least monthly and after any reported failure.

## 7. Quality Requirements

### NFR-1: Accessibility

- Public pages and key journeys conform to WCAG 2.2 Level AA.
- Content remains usable with a keyboard, screen reader, larger text, and sufficient colour contrast.
- Images have appropriate text alternatives, and forms provide clear labels and error messages.
- Representative authoring tasks for drafting, previewing, approving, publishing, and correcting content are operable by keyboard and screen reader and expose validation, approval, and publication status programmatically.
- Release evidence covers the current and previous major versions of Chrome, Safari, Firefox, and Edge; iOS Safari and Android Chrome; keyboard-only use; VoiceOver; and one Windows screen reader.

### NFR-2: Responsive Usability

- All public journeys work across mobile, tablet, and desktop.
- At 320 CSS pixels wide and at 200% browser zoom, essential information and actions remain readable and usable without two-dimensional scrolling except for content that intrinsically requires it.
- The experience does not depend on hover interactions or a particular screen size.
- Pre-launch moderated testing uses at least five first-time participants for each critical public journey and records task completion without facilitator assistance.

### NFR-3: Performance

- At the 75th percentile, key public pages display their primary content and enabled primary action within three seconds on the launch reference profile: an Android device class with at least four CPU cores and 4 GB RAM, the current major Chrome version, a cold browser cache, 10 Mbps download, 2 Mbps upload, 75 ms round-trip latency, and no injected packet loss.
- Large images and video content do not block access to essential information.
- The release evidence records the device, browser, network profile, cold/warm cache state, sample count, and 75th-percentile result so the threshold is reproducible.

### NFR-4: Reliability

- Automated external monitoring verifies at least every five minutes that the home page and visit-planning page return usable semantic content. Monthly availability is at least 99.9%, excluding announced planned maintenance.
- Failures involving livestreams, forms, or payments show a clear fallback or next step.
- Published content has a recovery point objective (RPO) of 24 hours and recovery time objective (RTO) of four hours. Confirmed offering records and receipts have an RPO of zero after authoritative confirmation and an RTO of four hours.
- Before launch and at least annually, the Tech Volunteer Team demonstrates restoration of one published-content record and one confirmed-offering record into a non-production environment.

### NFR-5: Privacy and Security

- Prayer, testimony, contact, and offering flows collect only the information needed for their stated purpose.
- Visitors are told how submitted information will be used.
- Prayer, healing-status, and private testimony submissions are accessible only to designated pastoral-care or testimony-review recipients. Finance records are accessible only to designated Finance Volunteer Team members. Tech administrators may access sensitive data only for authorised support and recovery work.
- Role assignment follows least privilege, privileged access requires multi-factor authentication, access is removed when a person leaves the role, and reads, exports, changes, and deletions of sensitive data are auditable.
- Prayer, healing-status, and unpublished testimony submissions are deleted automatically after six months unless an authorised owner records a safeguarding or legal hold. Holds are reviewed monthly and deleted when the reason ends.
- Public forms have rate limiting, automated-abuse protection, server-side validation, safe error logging, and a way for the Tech Volunteer Team to disable a compromised flow while retaining a verified alternative contact route.
- Full payment-card or bank-account credentials are not stored by the HSG website.
- Secrets, full payment credentials, prayer text, testimony text, and donor-entered content do not appear in client analytics, operational metrics, or routine application logs.

### NFR-6: Discoverability

- Public content can be found through search engines and shared clearly on social platforms.
- Service times, location details, events, sermons, and testimonies use clear page titles and descriptions.
- Private submissions, authoring views, finance exports, receipts, and preview links are excluded from public indexing and social previews.

### NFR-7: Future Readiness

- Every public content record has an explicit region identity and distinguishes region from language or locale.
- Global content and India-specific overrides retain their provenance, and authorisation prevents an India publisher from gaining access to a future region by default.
- Architecture review demonstrates one representative future region override without requiring any non-India public experience at launch.

### NFR-8: End-to-End Release Evidence

- Every release runs automated checks for the public home and visit-planning pages, current service information, event expiry, prayer submission success and safe failure, testimony privacy, content preview/approval/publication, livestream fallback, verified contact routes, offering confirmation and retry idempotency, receipt creation, finance export completeness, access denial, and backup restoration evidence.
- A failed critical check blocks production release unless the affected contingent capability is safely disabled under the launch cut policy and HSG leadership records the decision.
- Manual release evidence covers accessibility tasks that cannot be reliably automated, public verification of critical content, and named owner/backup readiness.

### NFR-9: Monitoring and Incident Ownership

- The Tech Volunteer Team owns operational response for website, form, livestream, payment, and integration failures and designates a primary and backup responder before launch.
- Monitoring distinguishes public-site availability, critical-content freshness, form delivery, livestream availability, payment confirmation, and aggregate payment-failure rate.
- A confirmed payment with no offering record, public exposure of sensitive data, or contradictory critical visit information is a launch-blocking or production-critical incident and alerts the Tech Volunteer Team immediately.
- Incident records capture detection time, affected capability, public fallback, owner, resolution, and follow-up action without copying sensitive submission or full payment data.

## 8. Experience and Tone

### 8.1 Visual Direction

- The experience should feel youth-forward, current, alive, and distinctly HSG.
- A dark visual direction is preferred, while readability and accessibility remain non-negotiable.
- Authentic HSG photography and video should help visitors understand the church, its people, and its worship experience.
- Background imagery should support the content rather than reduce text clarity, and authorised Volunteer Teams should be able to update it.
- The overall experience should remain clear and welcoming to people of all ages.

### 8.2 Content Tone

- Use warm, welcoming, faith-filled language that is easy for newcomers to understand.
- Explain church-specific terms and processes instead of assuming prior knowledge.
- Keep practical information direct, current, and easy to scan.
- Present prayer, healing, testimonies, and offerings with dignity and without pressure.
- Clearly distinguish HSG's beliefs and testimonies from promises about an individual's outcome.

## 9. Success Metrics

### Primary Metrics

- **SM-1 — Visit planning:** At least 90% of first-time mobile test participants can find the next service time and location within 60 seconds. Validates FR-2 and FR-4.
- **SM-2 — Healing-process clarity:** At least 90% of first-time test participants can explain when and how to create a healing card after using the website. Validates FR-8.
- **SM-3 — Content independence:** Designated Volunteer Team participants complete at least 90% of routine update scenarios without developer help. Validates FR-16 and FR-17.
- **SM-4 — Offering integrity:** Every confirmed provider transaction creates exactly one retained offering record and current receipt, appears once in its reconciliation export, and no unconfirmed attempt is presented as successful. Validates FR-14, FR-15, and FR-18.
- **SM-5 — Reliability:** External semantic monitoring records at least 99.9% monthly public availability under NFR-4's measurement contract. Validates NFR-4 and NFR-9.

### Secondary Metrics

- **SM-6 — Critical content trust:** A named content owner verifies service-time, location, parking, healing-card, and critical-contact information at least weekly and before each affected service; no contradictory or expired critical item remains public after verification.
- **SM-7 — Submission completion:** At least 85% of first-time participants can submit a prayer or follow-up request, identify what confirmation means, and find the urgent-needs guidance without assistance.
- **SM-8 — Offering completion:** At least 85% of first-time participants can make a test offering, distinguish confirmed from uncertain or failed status, and find transaction-support guidance without assistance.
- **SM-9 — Publishing completion:** At least 90% of designated authoring participants can draft, preview, approve, publish, publicly verify, and correct an assigned content revision without developer help or bypassing approval.
- **SM-10 — Reconciliation completion:** A Finance Volunteer Team participant can export a selected period, match confirmed records, and identify missing, duplicate, refunded, disputed, and unmatched test cases without developer help.

### Counter-Metrics

- **SM-C1 — Trust:** No approved content promises a specific healing outcome or uses pressure to obtain an offering.
- **SM-C2 — Privacy:** No sensitive prayer, testimony, contact, or offering information is exposed to unauthorised people.
- **SM-C3 — Task efficiency:** Longer session duration is not treated as success; visitors should be able to complete practical tasks quickly.
- **SM-C4 — Content contradiction:** No two current public pages show conflicting service, venue, parking, healing-card, or critical-contact information.

### Measurement Protocol

- The Product Owner owns pre-launch usability evidence; the Tech Volunteer Team owns automated release and production evidence; content owners own freshness evidence; and the Finance Volunteer Team owns offering reconciliation evidence.
- Each usability metric uses at least five representative first-time participants per critical journey on launch-supported mobile devices. The report records recruitment criteria, device/browser, assistive technology where applicable, assistance given, start/end event, completion, time, and observed failure.
- Release gates are evaluated for every production release. Production availability and failure metrics are reviewed weekly for the first month after launch and monthly thereafter; content freshness is reviewed weekly and before each affected service; Finance reviews reconciliation weekly and before monthly close.
- A metric aggregated across journeys cannot hide a failure to meet the independent payment, sensitive-submission, publishing, or reconciliation threshold.

## 10. Decision Register and Approval Gates

### 10.1 Resolved Product Decisions

1. **Launch target:** 15 September 2026. An HSG leadership designee gives final launch approval after receiving Product/Content, Finance, and Tech sign-offs.
2. **Content roles:** The Social Media and Media Volunteer Teams draft assigned content; the designated content owner reviews it; designated publishers publish it; and the Tech Volunteer Team administers access and emergency unpublishing. FR-16 and FR-17 define the binding workflow.
3. **Public source of truth:** The designated Volunteer Team remains authoritative for the facts in its content class. After approval and public verification, the canonical HSG website record is the public source of truth. Conflicting drafts, messages, or social posts do not override it.
   - For events, calendar actions are one-way exports from the approved website record; personal calendars and external registration forms are not authoritative sources.
4. **Sensitive submissions:** Designated pastoral-care and testimony-review recipients may access them; Tech administrators have support-only access; ordinary retention is six months; and NFR-5 defines access, audit, deletion, and hold rules.
5. **Testimony publishing:** Website submissions never publish automatically. A Volunteer Team follows HSG's existing internal approval process and obtains separate, recorded consent for the exact website publication and media, including guardian consent for minors. FR-10 defines withdrawal.
6. **Offerings:** FR-14, FR-15, and FR-18 define anonymity, confirmation, receipts, refunds, corrections, reconciliation, retention, and audit. Receipts and confirmed offering records are retained; failed attempts are discarded as offering records and emitted only as privacy-preserving aggregate failure metrics.
7. **Operational ownership:** The Tech Volunteer Team owns failures involving the website, forms, livestreams, payments, and integrations and appoints a primary and backup responder before launch.

### 10.2 Remaining Operational Approvals

| Approval | Owner | Resolve by | Required evidence | Gate |
|---|---|---|---|---|
| Name the final HSG launch approver and the Product/Content, Finance, and Tech signatories. | HSG leadership | Before content freeze | Recorded names and backups | Launch approval |
| Publish the content-class assignment matrix naming each source owner, reviewer, publisher, freshness limit, and backup. | HSG leadership and Volunteer Team leads | Before content migration | Approved role/content matrix | Content migration and authoring acceptance |
| Approve prayer/help privacy notice, recipient list, urgent-needs wording, and safeguarding/legal-hold procedure. | Pastoral lead with qualified privacy/safeguarding review | Before sensitive-form implementation | Approved notice, recipient list, and escalation procedure | Prayer and follow-up forms |
| Confirm HSG's tax-deduction status, receipt wording and fields, foreign-contribution eligibility and controls, refund approvers, and eight-financial-year retention period. | Finance lead with a qualified CA/legal adviser | Before production payment enablement | Signed finance policy and approved receipt sample | Offerings |
| Name the Tech primary and backup responders and approve the incident escalation/contact roster. | Tech Volunteer Team lead | Before production readiness review | Tested alert and escalation roster | Production readiness |

These approvals fill organisation-specific names, wording, and compliance evidence without changing the product behavior defined in this PRD. A missed gate disables only the affected contingent capability under Section 4.2; it does not permit downstream teams to invent a substitute policy.
