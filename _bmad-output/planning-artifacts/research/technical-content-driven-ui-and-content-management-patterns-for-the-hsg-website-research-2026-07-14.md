---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - '_bmad-output/planning-artifacts/briefs/brief-hsg-website-2026-07-09/brief.md'
  - '_bmad-output/planning-artifacts/briefs/brief-hsg-website-2026-07-09/addendum.md'
workflowType: 'research'
lastStep: 6
research_type: 'technical'
research_topic: 'Content-driven UI and content-management patterns for the HSG website'
research_goals: 'Compare fixed templates, modular content blocks, custom Supabase admin, headless CMS, and other current approaches for frequent content updates, non-technical editing, approval and preview, reliable rendering, regional reuse, and agent-friendly deployment; provide PRD options, tradeoffs, and constraints without creating the final architecture.'
user_name: 'Udeet'
date: '2026-07-14'
web_research_enabled: true
source_verification: true
---

# Governed Content, Reliable Delivery: HSG Website Content UI and Management Technical Research

**Date:** 2026-07-14
**Author:** Udeet
**Research Type:** Technical

---

## Research Overview

This research evaluates content-driven UI and content-management patterns for the HSG website as decision input for the PRD. It treats UI composition, authoring/data topology and public rendering as three separate decisions, then compares how fixed templates, governed modular blocks, a custom Supabase admin, managed headless CMS products, Git-backed content, self-hosted CMS products and federated patterns can be combined.

The analysis uses current first-party platform documentation, standards and engineering guidance, checked on 2026-07-14, together with HSG's product brief and addendum. It covers frequent changes to events, announcements, testimonies, media and background imagery; non-technical editing; exact preview and approval; regional/locale reuse; reliable delivery; migration, recovery and cost; and least-privileged agent-assisted development.

The principal finding is not a final architecture: HSG should first fix measurable PRD constraints, then run the same representative vertical slice through credible finalists. Across all options, durable requirements include typed content contracts, bounded composition, revision-bound preview, explicit regional provenance, independently recoverable content and assets, observable publication, and human-gated production authority. The full cross-option conclusion and decision framework appear in the **Research Synthesis** near the end of this report.

## Technical Research Scope Confirmation

**Research Topic:** Content-driven UI and content-management patterns for the HSG website

**Research Goals:** Compare fixed templates, modular content blocks, a custom Supabase admin, a headless CMS, and other current approaches. Account for frequent updates to events, announcements, testimonies, media, and background imagery; non-technical editors; approval and preview; reliable rendering; regional reuse; and agent-friendly deployment. Produce options, tradeoffs, and constraints for the PRD without creating the final architecture.

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-07-14

## Technology Stack Analysis

### Research Coverage and Decision Frame

Research was conducted on 2026-07-14 against current first-party documentation for Next.js, Vercel, Supabase, GitHub, Playwright, Sanity, Storyblok, Contentful, Payload, Directus, Decap CMS, TinaCMS, Keystatic, and Astro. The repository contains planning artifacts but no application implementation or package manifest, so the stack is greenfield rather than inherited.

The most important framing result is that HSG faces two independent technology decisions:

1. **UI composition model:** fixed templates, a finite registry of modular content blocks, or a freer visual page builder.
2. **Content storage and authoring model:** custom Supabase admin, managed headless CMS, self-hosted/database-first CMS, Git-backed CMS, or a hybrid/federated model.

A modular-block UI can be backed by Supabase, a headless CMS, or Git. Conversely, a headless CMS can feed fixed templates rather than a page builder. The PRD should specify the required editorial capabilities and rendering guardrails without treating one axis as a proxy for the other.

**Evidence confidence:** High for documented platform capabilities and plan gates; medium for HSG editor usability, total cost, and operational fit until representative editors complete a prototype trial. Vendor feature availability and pricing must be rechecked at procurement.

### Programming Languages

**Primary web language candidate — TypeScript.** Next.js App Router is a React framework with first-class TypeScript project setup, and TypeScript provides compile-time checking over JavaScript. This is useful for enforcing a closed union of content block types, validating renderer props, and keeping CMS or database contracts visible to coding agents. [Next.js App Router](https://nextjs.org/docs/app) and [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html).

**Database language — SQL and PostgreSQL migrations.** Supabase supplies a full PostgreSQL database rather than an abstraction. Its CLI can keep migrations in Git and generate TypeScript definitions from the live or local schema. This gives a custom admin a type path from database constraints to UI code, but generated types do not create editorial workflow semantics by themselves. [Supabase database](https://supabase.com/docs/guides/database/overview), [database migrations](https://supabase.com/docs/guides/deployment/database-migrations), and [generated TypeScript types](https://supabase.com/docs/guides/api/rest/generating-types).

**Content representation — structured JSON plus constrained rich text; Markdown/MDX for Git-backed variants.** SaaS and self-hosted CMS products expose typed documents, fields, references, arrays, or blocks. Git-backed tools persist Markdown, MDX, YAML, or JSON. For HSG, the format should preserve explicit fields such as event start/end, region, testimony consent state, media metadata, and publication state rather than hiding them inside rich text.

**Language evolution and suitability.** The relevant trend is not a move to a new programming language; it is movement from untyped page blobs toward schema-defined content with generated TypeScript contracts. TypeScript plus SQL is the best-supported common denominator across Next.js, Supabase, Payload, CMS SDKs, test tooling, and deployment automation. This is a candidate stack finding, not a final stack mandate.

### Development Frameworks and Libraries

#### Frontend Rendering Envelope

**Next.js App Router** is the strongest-fit reference implementation because HSG already identifies Vercel as a hosting candidate and needs static reliability, draft preview, selective freshness, media optimization, and server endpoints for integrations. App Router supports server and client components; Draft Mode lets an authenticated editor see unpublished content through the production renderer; and ISR can update cached pages without a complete redeploy. [App Router](https://nextjs.org/docs/app), [Draft Mode](https://nextjs.org/docs/app/api-reference/functions/draft-mode), and [ISR](https://nextjs.org/docs/app/guides/incremental-static-regeneration).

The rendering modes impose different constraints:

- **Static export:** most portable and easy to cache, but every content change requires a build. It does not support ISR, Draft Mode, or the default Next.js image optimizer. [Static exports](https://nextjs.org/docs/app/guides/static-exports).
- **Static generation plus ISR:** serves cached/last-known-good output and refreshes in the background. ISR requires the Node runtime and is not available in static export. On-demand path/tag invalidation fits frequent announcements and events, but the PRD must state acceptable publish latency. [ISR](https://nextjs.org/docs/app/guides/incremental-static-regeneration) and [revalidation](https://nextjs.org/docs/app/getting-started/revalidating).
- **Dynamic rendering:** gives request-time freshness but puts CMS/database latency and availability on the public request path. It is useful selectively, not automatically preferable for public content.

**Astro** is a credible content-first alternative: static by default, selectively hydrates interactive islands, supports typed content collections, and has server adapters when runtime rendering is needed. Generic draft preview, approval, on-demand invalidation, and media behavior would still need CMS/application integration. [Astro islands](https://docs.astro.build/en/concepts/islands/), [content collections](https://docs.astro.build/en/guides/content-collections/), and [on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/).

#### UI Composition Patterns

| Composition pattern | Technology embodiment | Rendering reliability | Editorial flexibility | Main constraint |
|---|---|---:|---:|---|
| Fixed templates | Typed route/component with fixed named slots | Highest | Lowest | New layouts and uncommon storytelling require code |
| Governed modular blocks | Finite, versioned block registry; editors select/reorder allowed blocks | High when schema and renderer stay aligned | High for campaign and landing pages | Every block/variant needs schema, renderer, validation, preview, tests, and migration policy |
| Free-form visual page builder | Broad layout/style controls and nested components | Lowest unless heavily constrained | Highest | Responsive, accessibility, performance, brand, and regression surface expands sharply |
| Hybrid templates plus blocks | Fixed domain templates for events/testimonies; governed sections for home/editorial pages | High to medium | Targeted flexibility | PRD must define which pages and regions may compose blocks |

Structured page builders are supported by multiple products: Sanity uses arrays of typed objects, Storyblok uses components/blocks, Payload has a Blocks field, Directus can model reusable many-to-any components, and Git-backed tools offer variable block lists. The platform does not guarantee reliable rendering; HSG still needs a closed component registry, validation, an unknown-block fallback, and a schema migration policy. [Sanity structured page building](https://www.sanity.io/docs/developer-guides/how-to-use-structured-content-for-page-building), [Storyblok Visual Editor](https://www.storyblok.com/docs/manuals/visual-editor), [Payload Blocks](https://payloadcms.com/docs/fields/blocks), and [Directus reusable components](https://docs.directus.io/guides/headless-cms/reusable-components).

#### Content and Admin Platform Families

| Platform family | Representative technologies | Capabilities supplied | Capabilities HSG must add or verify |
|---|---|---|---|
| Custom backend/admin | Supabase Postgres, Auth, Storage, custom Next.js admin | Data model, APIs, authentication, RLS, files/CDN | Editor UX, rich text/blocks, drafts, revisions, approval queue, preview, scheduling, notifications, restore UI, content audit trail |
| Managed headless CMS | Sanity, Storyblok, Contentful | Structured models, assets, draft/publish, APIs; varying visual editing, workflow, localization, and roles | Frontend renderers, preview integration, plan/cost verification, schema governance, vendor outage/export strategy |
| Self-hosted/code-first CMS | Payload | TypeScript schemas/admin, blocks, drafts, versions, preview, programmable access | Hosting, database, object storage, email/jobs, backups, upgrades, security, monitoring; multistage approval remains custom |
| Database-first CMS/data studio | Directus | Admin over relational data, permissions, versions, translations, preview, flows | Editor-oriented page model, workflow design, hosting/licensing choice, safe coexistence with operational data |
| Git-backed CMS | Decap CMS, TinaCMS, Keystatic | Files in Git, form or visual editor, PR/build preview possibilities | Editor identity model, media strategy, workflow/plan limits, build latency, scheduling, merge conflicts, regional conventions |
| Federated/hybrid content | Supabase for operational data, CMS/Git for editorial content, external sources for Calendar/YouTube | Lets each source own the data it handles best | Clear source-of-truth rules, identifiers, failure fallbacks, synchronization, preview across sources, cache invalidation |

This family map is a research inventory, not an architecture selection.

#### Managed CMS Capability Snapshot

- **Sanity:** code-defined schemas, structured arrays, visual editing, localization options, hosted APIs, webhooks, CLI, and a first-party MCP server. Contributor/publisher separation and coordinated releases exist, but custom roles and Content Releases are plan-gated, with Content Releases documented as an Enterprise feature. [Visual Editing](https://www.sanity.io/docs/visual-editing), [localization](https://www.sanity.io/docs/studio/localization), [roles](https://www.sanity.io/docs/user-guides/roles), [Content Releases](https://www.sanity.io/docs/user-guides/content-releases), and [MCP server](https://www.sanity.io/docs/ai/mcp-server).
- **Storyblok:** visual editing is central; editors can compose and preview typed blocks with draft/changed/published states. It supports roles and field-, folder-, or space-level regional strategies. Advanced workflow/release features are plan-dependent and each block still requires a frontend renderer. [Visual Editor](https://www.storyblok.com/docs/manuals/visual-editor), [roles](https://www.storyblok.com/docs/manuals/roles.html), and [internationalization](https://www.storyblok.com/docs/concepts/internationalization).
- **Contentful:** mature content types, entries, references, locales, preview/delivery APIs, roles, workflows, assets, and webhooks. Live Preview, locale-based publishing, workflow depth, cross-space reuse, and Studio capabilities have material plan gates. Webhook consumers must be asynchronous and idempotent because delivery can be duplicated and timeouts are not retried. [Data model](https://www.contentful.com/developers/docs/concepts/data-model/), [Live Preview](https://www.contentful.com/help/content-preview/live-preview/), [Workflows](https://www.contentful.com/help/ai-automations/workflows/), and [webhooks](https://www.contentful.com/developers/docs/extensibility/webhooks/overview/).
- **Payload:** code-first and TypeScript-native with blocks, drafts, versions, preview, localization, uploads, and programmable access control. It is agent-friendly at the schema/code layer, but HSG would own production operations and would compose rather than buy a turnkey multistage approval product. [Drafts](https://payloadcms.com/docs/versions/drafts), [versions](https://payloadcms.com/docs/versions/overview), [access control](https://payloadcms.com/docs/access-control/overview), and [production deployment](https://payloadcms.com/docs/production/deployment).
- **Directus:** database-first with granular collection/item/field permissions, relational reusable components, versions, revision history, live preview, translations, files, and flows. The current versioning flow is draft-first, but the frontend must fetch the selected version for accurate preview. Approval stages are assembled from versions, permissions, and automation rather than assumed. [Content versioning](https://directus.com/docs/guides/content/content-versioning), [Live Preview](https://directus.com/docs/guides/content/live-preview), [translations](https://directus.com/docs/guides/content/translations), and [access control](https://directus.com/docs/guides/auth/access-control).

#### Git-Backed and Managed-Git Patterns

- **Plain content-as-code:** Markdown/MDX/YAML/JSON changes are diffable, reversible, testable, and compatible with CODEOWNERS, required reviews, branch previews, and agent-created pull requests. It is weak for frequent non-technical editing without another UI and should not make the repository the primary store for high-resolution changing media. [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners), [protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches), and [repository limits](https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits).
- **Decap CMS:** lightweight structured forms over Git, with an editorial mode and deploy-preview links. Approval should be enforced by protected branches/status checks rather than treating workflow columns as the security boundary. Media-in-Git, authentication direction, and custom preview work are significant constraints. [Editorial workflow](https://decapcms.org/docs/editorial-workflows/), [deploy previews](https://decapcms.org/docs/deploy-preview-links/), and [configuration](https://decapcms.org/docs/configuration-options/).
- **TinaCMS:** Git-backed Markdown/MDX/JSON with code schemas, blocks, visual editing, and paid editorial workflow/branch previews. Indexing latency, plan coupling, modeled rather than native regional inheritance, and agent-created branch indexing must be tested. [TinaCMS docs](https://tina.io/docs), [editorial workflow](https://tina.io/docs/tinacloud/editorial-workflow), and [internationalization](https://tina.io/docs/guides/internationalization).
- **Keystatic:** lean code-defined content for Next.js/Astro/Remix with Git/local storage and blocks. It is strong for simple typed content-as-code; full editorial approval, preview, and localization conventions remain project concerns. [GitHub mode](https://keystatic.com/docs/github-mode), [Cloud mode](https://keystatic.com/docs/cloud), and [blocks](https://keystatic.com/docs/fields/blocks).

### Database and Storage Technologies

**Relational database.** Supabase Postgres is the intended HSG backend direction and fits operational records, regional relationships, content status, event dates, giving metadata, and access policies. RLS combines with Supabase Auth; custom claims can implement application roles. Any table exposed through the Data API must have appropriate grants and RLS. [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [API security](https://supabase.com/docs/guides/api/securing-your-api), and [custom-claims RBAC](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac).

For a custom content admin, PostgreSQL can represent published/draft/version tables, review assignments, regions, shared records, and overrides. That flexibility is not a CMS feature: the state machine, transaction rules, revision diff, restore behavior, scheduler, approval UI, and content audit UX would all be HSG-owned product surface. Supabase database branches are engineering preview environments and start data-less by default; they are not editorial drafts. [Supabase branching](https://supabase.com/docs/guides/deployment/branching).

**Headless content stores.** Managed CMS products keep editorial content in their own content store and deliver it via APIs/CDNs. This buys editorial semantics but creates a second source beside Supabase. The PRD must prevent ambiguous duplication: operational/sensitive data such as giving and prayer requests should not be casually copied into an editorial SaaS, while public content references should have stable IDs and explicit ownership.

**Object and media storage.** Supabase Storage provides S3-compatible object storage, RLS-backed access, CDN delivery, and image transformations. Image transformations and Smart CDN are paid-plan features. CDN invalidation can take up to 60 seconds and browser caches can remain stale, so frequently replaced backgrounds should use immutable/versioned paths rather than overwriting the same URL. [Storage](https://supabase.com/docs/guides/storage), [image transformations](https://supabase.com/docs/guides/storage/serving/image-transformations), and [Smart CDN](https://supabase.com/docs/guides/storage/cdn/smart-cdn).

Database backups do not include Supabase Storage objects, only their metadata. HSG therefore needs a separate media recovery/versioning requirement regardless of whether media is selected from a custom admin. [Supabase backups](https://supabase.com/docs/guides/platform/backups).

Every media technology should expose a contract for intrinsic dimensions, alt text, focal point/crop, allowed type and size, attribution/consent where relevant, immutable URL/version, responsive derivatives, and orphan/replacement behavior. Next.js remote images also require restricted remote patterns and known dimensions or fill/sizes; static export cannot use the default optimizer. [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image).

**NoSQL, in-memory cache, and data warehouse.** No launch requirement currently justifies a separate document database, Redis-class cache, or analytics warehouse. CMS vendors may use non-relational internal stores, but HSG consumes their documented APIs. Adding another data tier would increase consistency and operations burden without solving the core editorial requirement.

### Development Tools and Platforms

**Source control and review.** GitHub pull requests, CODEOWNERS, protected branches, and required checks can govern code, schema migrations, and Git-backed content. Git approval is not equivalent to CMS content approval unless content actually flows through pull requests. [Pull request reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews).

**Schema and contract tooling.** The stack should keep database migrations, CMS schemas where supported, block-registry types, generated API/database types, content fixtures, and renderer tests in version control. A publish pipeline should validate schema, references, dates, region/fallback rules, media metadata, accessibility-critical fields, and that every permitted block has a renderer.

**Testing.** Next.js documents unit, component, integration, and end-to-end approaches and recommends end-to-end testing for async Server Components where unit tooling has limitations. Playwright runs real browser flows in CI and provides an official GitHub Actions pattern. HSG's highest-value flows include draft preview, publish-to-visible latency, invalid/unknown block behavior, regional fallback, media crop/layout, calendar/media-source failure fallback, permissions, and rollback. [Next.js testing](https://nextjs.org/docs/app/guides/testing) and [Playwright CI](https://playwright.dev/docs/ci).

**Preview separation.** Four controls must not be conflated:

1. **Code preview** — branch/PR deployment proves a code and configuration revision.
2. **Content preview** — production renderer displays unpublished content.
3. **Editorial approval** — an authorized reviewer changes content state.
4. **Production promotion/publication** — approved code/content becomes public.

Vercel branch previews provide the first. Next.js Draft Mode plus a draft-capable content source provides the second. CMS roles/workflows or custom state transitions provide the third. Git deployment checks or content publication/invalidation provide the fourth.

**Agent-friendly deployment constraints.** Agent friendliness should be defined as deterministic, non-interactive and reversible delivery: repository-contained configuration; pinned dependencies; CLI/API deploy paths; migrations and seeds in Git; machine-readable checks; isolated preview environments; scoped short-lived credentials; draft-only default for content mutations; approval gates; immutable audit identity; and rollback. Supabase CLI supports local services, migrations, type generation, and CI; Vercel supports Git/CLI/API deployment; CMSs vary from schema/code friendliness to first-party APIs, CLIs, or MCP tooling. [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started), [Vercel deployment methods](https://vercel.com/docs/deployments/overview), and [GitHub deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).

### Cloud Infrastructure and Deployment

**Vercel.** Vercel supplies Local, Preview, and Production environments; non-production branches and pull requests receive unique Preview URLs. Custom longer-running environments are plan-gated. Git-connected production deploys can be automated or promotion-controlled. [Vercel environments](https://vercel.com/docs/deployments/environments) and [Vercel Git](https://vercel.com/docs/git).

For content freshness:

- A CMS or Supabase webhook can call an authenticated application endpoint that maps changed content to cache paths/tags.
- A Vercel Deploy Hook can trigger a full rebuild without a code commit, but the hook URL is effectively a secret and full builds increase latency and load for frequent edits. [Deploy Hooks](https://vercel.com/docs/deploy-hooks).
- Managed Next.js ISR on Vercel provides durable, globally coordinated caching and last-known-good behavior that generic self-hosted multi-instance Next.js does not provide automatically. Self-hosting requires shared durable cache and invalidation coordination. [Vercel ISR](https://vercel.com/docs/incremental-static-regeneration) and [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting).

**Supabase environments.** Supabase GitHub branching can create isolated preview instances for database schema, Auth, API, Storage, and Functions. Branches have distinct credentials and are data-less by default, so preview seed content and media behavior must be planned; an application preview accidentally pointed at production data would defeat isolation. [Supabase branching](https://supabase.com/docs/guides/deployment/branching).

**CMS deployment integration.** Managed CMSs generally publish data independently of code and notify downstream systems by webhook. The reliable pattern is asynchronous, authenticated, idempotent handling with bounded retries, audit logs, selective invalidation, a dead-letter/manual replay path, and last-known-good public rendering. Contentful explicitly warns that duplicate webhooks can occur and that timed-out requests are not retried, illustrating why these properties belong in the PRD rather than being vendor assumptions. [Contentful webhook behavior](https://www.contentful.com/developers/docs/extensibility/webhooks/overview/). Supabase Database Webhooks are asynchronous wrappers over triggers and can send insert/update/delete events to HTTP endpoints. [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks).

**Availability.** The HSG brief's 99.9% monthly target must be measured externally. A static/ISR last-known-good public site reduces dependence on CMS availability for every request; dynamic rendering increases runtime coupling. Provider uptime, content-source availability, webhook success, cache freshness, and asset availability need separate monitoring because a technically up page can still show stale or broken content.

### Technology Adoption Trends

1. **Structured content with visual context.** The leading products combine typed fields/references with visual preview or click-to-edit rather than choosing between raw forms and unrestricted WYSIWYG. Sanity, Storyblok, Contentful Studio, Directus, Payload, and TinaCMS express variants of this pattern.
2. **Governed blocks over blank-canvas builders.** Component/block schemas let editors reorder approved units while developers retain responsive, accessible renderers. This is a cross-platform pattern, not evidence for any one vendor.
3. **Hybrid rendering over all-static or all-dynamic delivery.** Static/ISR public pages, draft-mode preview, and selective on-demand invalidation separate reliability from freshness.
4. **Preview and approval as distinct systems.** Visual proof does not authorize publication; code deployment approval does not approve editorial claims. Products expose separate mechanisms and often gate advanced governance by plan.
5. **Regional reuse through explicit modeling.** Field localization, document/entry variants, folders/spaces/datasets, and relational overrides have different propagation and duplication behavior. “Regional support” is not a checkbox; the PRD must define global source, regional override, locale variant, fallback order, and publication independence.
6. **Media as managed content, not repository decoration.** Frequent high-resolution background changes favor object/CDN storage, versioned URLs, derived renditions, and editorial metadata rather than binary-heavy Git histories.
7. **Automation through APIs, CLIs, webhooks, and increasingly MCP.** This improves agent operability but also expands the mutation surface. Agent writes should default to drafts, use scoped credentials, undergo the same validation/preview as human edits, retain actor identity, and require human publication approval where policy demands it.
8. **Plan-gated governance is a recurring commercial constraint.** Custom roles, multistep workflows, coordinated releases, localization variants, protected previews, and advanced media frequently sit above entry plans. Feature-level plan verification and a realistic editor-seat count are required before a CMS is treated as satisfying the PRD.

### Technology Stack Findings for Subsequent Evaluation

- TypeScript/React with a Next.js reference frontend, SQL/Postgres through Supabase, GitHub, Vercel previews, and Playwright form a coherent candidate delivery/tooling envelope; this remains subject to later option evaluation.
- Fixed templates, governed blocks, and free-form builders are composition choices. Custom Supabase, headless CMS, self-hosted CMS, and Git-backed CMS are authoring/storage choices. The PRD should score combinations, not only labels.
- Supabase is a strong operational backend and can store content, but a custom admin means HSG owns the CMS product surface.
- A managed headless CMS buys editor and governance capability fastest, but introduces a second data source, vendor/plan dependency, and schema-to-renderer integration work.
- Git-backed approaches maximize auditability, reversibility, and agent compatibility, but frequent non-technical updates and high-churn media expose editor, authentication, build-latency, and repository constraints.
- Reliable rendering depends more on a finite renderer contract, validation, last-known-good behavior, immutable assets, and tested invalidation than on the selected CMS brand.

## Integration Patterns Analysis

### Research Coverage and Integration Frame

This stage verified current first-party documentation for Supabase data APIs, Auth/RLS, Edge Functions, Realtime and webhooks; Next.js Draft Mode and revalidation; Vercel deployment hooks; managed CMS delivery, preview, management and webhook APIs; Google Calendar sync and notifications; YouTube Data and IFrame APIs; GitHub deployment controls; and relevant IETF/CNCF standards.

The integration problem is not “connect the CMS to the website” as one opaque task. It has six separate contracts:

1. retrieve published content;
2. retrieve unpublished content for authorized preview;
3. mutate drafts;
4. authorize review and publication;
5. signal that published content changed;
6. prove the public renderer has accepted or recovered from that change.

Products implement these contracts differently. The PRD should specify their observable behavior without prematurely fixing the vendor or final topology.

Two independent dimensions must remain explicit throughout those contracts: **region** (for example, India versus North America) and **locale** (for example, English versus Hindi). Regional ownership, legal/contact details and event eligibility are not translation. Each content response and invalidation decision therefore needs a defined global source, regional override, locale fallback, publication state and provenance; otherwise public delivery, preview and automation can resolve the same record differently.

**Confidence:** High for HTTP/API, preview, webhook, Calendar and YouTube capabilities; medium for Instagram feed automation because official access, account eligibility and product behavior require a dedicated provider spike. A simple official link or manually curated post reference remains independently feasible.

### API Design Patterns

#### Separate Delivery, Preview and Management Surfaces

The safest cross-platform abstraction is three logical API surfaces:

- **Published delivery:** read-only, cacheable, public-safe representation containing only approved content.
- **Preview delivery:** read-only to the renderer but authenticated, uncached, and permitted to return drafts or release versions.
- **Management:** authenticated read/write operations for editors, automation and agents; never used as the high-volume public delivery path.

Contentful documents this separation directly through its Delivery, Preview and Management APIs. Its Preview API uses a distinct token so production credentials do not accidentally expose drafts. Sanity provides published, draft and release query perspectives and requires authentication for drafts. The same separation would have to be modeled explicitly in a custom Supabase admin. [Contentful API basics](https://www.contentful.com/developers/docs/references/api-basics/), [Contentful Preview API](https://www.contentful.com/developers/docs/references/content-preview-api/overview/), and [Sanity Query API](https://www.sanity.io/docs/http-reference/query).

For Supabase, the auto-generated REST and GraphQL APIs reflect the database schema and use PostgreSQL grants/RLS. HSG could expose a published-only view to anonymous reads while editor/admin queries use authenticated policies, but the PRD must require that drafts, review notes, consent metadata and privileged operational records cannot leak through the public schema. [Supabase REST API](https://supabase.com/docs/guides/api), [Supabase GraphQL](https://supabase.com/docs/guides/graphql), and [securing the Data API](https://supabase.com/docs/guides/api/securing-your-api).

#### REST, GraphQL and Provider Query Languages

- **REST/HTTPS with JSON** is sufficient for stable content-by-slug, lists of upcoming events, asset metadata, and command endpoints. It is the broadest interoperability baseline across Supabase, Google, YouTube and CMS platforms.
- **GraphQL** can reduce over-fetching for deeply referenced modular pages, but adds query/schema tooling and does not solve publishing, preview, invalidation or authorization. Supabase, Contentful and Storyblok expose GraphQL alongside REST.
- **Provider query languages such as GROQ** give precise projections and reference traversal but couple renderer queries to that provider. Sanity recommends authenticated, non-CDN queries for drafts and CDN queries for appropriate published content. [Sanity GROQ introduction](https://www.sanity.io/docs/content-lake/groq-introduction).
- **RPC/gRPC** provides no material benefit for HSG's browser/server-to-SaaS integrations. There is no high-frequency internal binary service boundary that justifies Protocol Buffers, service discovery or generated RPC clients at launch.

The renderer should depend on an HSG-owned normalized content contract rather than spreading vendor response shapes throughout UI components. A provider adapter can translate Supabase rows, CMS documents or Git files into the same page, event, announcement, testimony, region and asset models. This improves testability and preserves an exit path without pretending provider capabilities are identical.

#### Backend-for-Frontend Boundary

A thin server-side boundary can protect preview/management tokens, normalize provider errors, attach region/locale context, enforce timeouts, and map provider content to renderer types. This can be implemented by the frontend framework's server components or route handlers; it does not require a separate API-gateway product.

Direct browser access to Supabase can be valid when RLS is complete and tested. Direct browser use of service-role keys, CMS management tokens, Google OAuth refresh tokens, webhook secrets, or preview tokens is forbidden. Supabase explicitly distinguishes RLS-scoped user clients from admin clients that bypass RLS. [Securing Supabase Edge Functions](https://supabase.com/docs/guides/functions/auth).

#### Webhook Pattern

Webhooks are change signals, not proof that the website changed. A reliable consumer should:

1. verify signature or channel token and reject stale/replayed requests;
2. record a provider event ID or deterministic deduplication key;
3. acknowledge quickly;
4. process invalidation/rebuild asynchronously;
5. retry with bounds and backoff;
6. verify the expected content version is publicly visible;
7. retain failure state and allow manual replay or reconciliation.

The receiver should derive affected cache tags/routes from trusted content identity and server-side rules, never accept an arbitrary path or cache tag from the request. Delete and unpublish notifications may contain only an ID/tombstone, so the integration must retain an ID-to-dependency mapping or refetch canonical state before acting.

Contentful documents duplicate delivery risk, an idempotency header, only two retries for common retryable responses, and no retry after a timeout; it recommends asynchronous processing. Sanity changed its webhook retry policy in April 2026 to two retries at 30-second intervals. Storyblok documents no retry of failed webhooks. Supabase Database Webhooks are asynchronous, but the underlying `pg_net` response history is short-lived and its queue/response tables are unlogged, so no durable publication guarantee should be inferred. Provider retry behavior is therefore insufficient as the only recovery mechanism. [Contentful webhooks](https://www.contentful.com/developers/docs/extensibility/webhooks/overview/), [Sanity webhook retry change](https://www.sanity.io/docs/changelog/50ec6abf-fe0c-475b-ae72-314148860132), [Storyblok webhooks](https://www.storyblok.com/docs/concepts/webhooks.html), and [Supabase `pg_net`](https://supabase.com/docs/guides/database/extensions/pg_net).

### Communication Protocols

**HTTPS request/response** should carry all API reads, writes, preview entry, OAuth callbacks, webhook delivery and deployment/revalidation commands. HTTP caching semantics, ETags where available, timeouts and bounded retries are more important here than a newer transport.

**WebSockets/realtime subscriptions** are optional for an editor experience that reflects changes while typing or for live collaboration. Supabase Realtime supports broadcast, presence and database-change subscriptions, but public announcements, events and testimonies do not require a persistent connection. Public rendering should not depend on WebSocket availability. [Supabase Realtime](https://supabase.com/docs/guides/realtime).

**Webhooks over HTTPS POST** fit publication, asset change and external-source notification. They are commonly at-least-once or best-effort signals, so consumers must tolerate duplicates, gaps and reordering.

**Message queues** are not a launch prerequisite. A small durable job/event table is sufficient if content publication must survive process failure and be replayed. A managed queue becomes justified only if measured volume, long-running media work, multiple downstream consumers, or repeated delivery failure exceeds what a database-backed job can operate safely.

**AMQP, MQTT, gRPC and service mesh protocols** do not address HSG's current content workflow. Their use should require a later evidenced need rather than appearing as speculative infrastructure.

### Data Formats and Standards

**JSON** is the primary exchange format. Normalized content payloads should carry schema/content-model version, stable ID, content type, revision/version, publication timestamp, region, locale, source, fallback provenance and referenced asset IDs. Unknown fields should be tolerated at integration boundaries; unknown block types must fail safely at rendering boundaries.

**Webhook event envelope.** Even if providers send different bodies, the internal record should retain at least source, provider event ID, event type, subject/content ID, content revision, occurred time, received time, region/locale scope, attempt count and raw-payload reference. CloudEvents standardizes common source/type/id metadata and defines source plus ID as the duplicate identity; adopting its full format is optional, but the metadata pattern is useful. [CloudEvents specification](https://cloudevents.io/) and [CloudEvents duplicate identity](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md).

**iCalendar (.ics).** Calendar download/subscription interoperability should use the IETF iCalendar format rather than a proprietary event export. The website's event schema must still resolve timezone, all-day versus timed events, recurrence, cancellation, stable UID and region before generating or mapping calendar records. [RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545).

**Media references.** Content should store stable provider IDs and structured metadata rather than arbitrary embed HTML. Examples are YouTube video/playlist ID, Supabase/CMS asset ID, versioned delivery URL, dimensions, focal point, alt text and consent/attribution metadata. Rendering code should own the embed markup and allowed origins.

**CSV/flat files** remain appropriate for administrative export such as finance reporting, not as the website's live content integration protocol. **XML, MessagePack and Protobuf** have no evidenced launch use.

### System Interoperability Approaches

#### Source-of-Truth Matrix

| Content class | Plausible source patterns | Required interoperability rule |
|---|---|---|
| Announcements | CMS/custom admin/Git | One authoritative record; status and schedule control visibility |
| Testimonies | CMS/custom admin plus asset store | Consent/publication metadata must travel with the content; public API excludes private review fields |
| Background and editorial imagery | CMS asset library or Supabase object storage | Immutable/versioned URL, crop/focal metadata, derivatives and recovery policy |
| Events | CMS/custom admin, Google Calendar, or a controlled hybrid | Stable cross-system ID, owner of canonical fields, timezone/recurrence mapping and conflict rule |
| Live/recent services | Curated YouTube IDs/playlist, or cached Data API discovery | Curated fallback and graceful behavior when API/embed is unavailable |
| Regional variants | Shared base plus overrides, locale documents, folders/spaces or independent records | Explicit inheritance, fallback, publication independence and region-aware invalidation |
| Navigation/contact/global facts | Shared structured singleton with optional regional override | Prevent duplicate manual copies and define propagation behavior |

#### Point-to-Point Adapters over an Integration Platform

HSG has a small number of well-known external systems. Direct server-side adapters with a common normalized contract are easier to test and operate than an enterprise service bus. A full API gateway, service mesh or enterprise integration platform is unwarranted unless the project later has many independently deployed services, many consumers, or organization-wide traffic policies.

The frontend/server boundary can act as a lightweight gateway for public reads and preview. It should not become a second general-purpose CMS: content validation, workflow state and author identity belong in the selected authoring system.

#### Event Integration Options

Three calendar ownership patterns remain valid options:

1. **Website content source is canonical; Calendar is an output.** Rich event pages and approval live in the CMS/admin. Publication creates or updates Google Calendar and generates per-event iCalendar. This needs idempotent writes and stores the external event ID.
2. **Google Calendar is canonical; website is a projection.** The site reads/synchronizes Calendar events and may attach website-only enrichment by stable Calendar ID. This is familiar for schedulers but Calendar fields are not a complete testimony/event-page CMS.
3. **Split ownership with explicit field authority.** Calendar owns date/time/recurrence/cancellation; CMS owns copy, media, SEO and page composition. This reduces duplication only if identity, missing-match behavior and conflict resolution are explicit.

Unspecified bidirectional last-write-wins synchronization is the highest-risk variant because editors cannot predict which system wins.

Google Calendar supports incremental synchronization using a stored sync token; a 410 response means the local projection must be cleared and fully resynchronized. Push notifications contain no changed-event body, expire and require manual channel renewal, and Google states that some messages can be dropped in normal operation. Notifications must therefore trigger incremental reconciliation rather than act as the authoritative event payload. [Google Calendar incremental sync](https://developers.google.com/workspace/calendar/api/guides/sync), [events list](https://developers.google.com/workspace/calendar/api/v3/reference/events/list), and [push notifications](https://developers.google.com/workspace/calendar/api/guides/push).

Google allows clients to choose an event ID during creation, which can prevent duplicate creation after an ambiguous failure and maintain a local-to-Calendar mapping. [Creating Calendar events](https://developers.google.com/workspace/calendar/api/guides/create-events).

A public Google Calendar iframe or public iCalendar feed is a lower-effort display option, but the iframe gives HSG little control over rendering and the feed supplies no website editorial workflow. A secret iCalendar address is a bearer credential and must never be exposed in the browser. Whichever pattern is considered, public page rendering should use a local/edge cache with a freshness timestamp and last-known-good event data rather than make Google availability part of every page request. [Google Calendar embedding](https://support.google.com/calendar/answer/41207), [calendar sharing and public iCalendar](https://support.google.com/calendar/answer/37083), and [secret iCalendar warning](https://support.google.com/calendar/answer/37648).

#### YouTube and Social Media Integration

The lowest-dependency YouTube pattern is to let an editor curate a video or playlist ID and render an official iframe with a normal link fallback. A discovery pattern can cache channel/upload or live/upcoming results from the YouTube Data API, but it adds credentials, quota, staleness, error handling and the possibility that an item is deleted, private or non-embeddable. For automatic “recent uploads,” the channel uploads playlist plus `playlistItems.list` is the appropriate low-quota path; `search.list` is materially more expensive and should be reserved for a verified live/upcoming discovery requirement. The cached projection should check embeddability and periodically reconcile because YouTube push notifications do not cover every deletion, privacy, embed-policy or live-state change. [Retrieving channel uploads](https://developers.google.com/youtube/v3/guides/implementation/videos), [YouTube playlist items](https://developers.google.com/youtube/v3/docs/playlistItems/list), [YouTube search](https://developers.google.com/youtube/v3/docs/search/list), [YouTube push notifications](https://developers.google.com/youtube/v3/guides/push_notifications), and [YouTube API quotas](https://developers.google.com/youtube/v3/getting-started).

The public page should retain useful title, thumbnail or link content when the player script is blocked or YouTube is unavailable. Autoplay should not be assumed: YouTube documents that autoplay begins playback data collection on page load.

For Instagram, the PRD should choose between an official outbound link, editor-curated post references/media, or an authenticated provider integration after a capability spike. The current Instagram API with Instagram Login is for professional Business/Creator accounts and requires managed tokens; Meta's documented webhooks do not provide a general new-feed-post event, so a “latest posts” feature implies polling/reconciliation. Returned CDN URLs are not durable asset identities. A live feed should not be a critical rendering dependency; its failure must not break the page or determine the only copy of an announcement. [Instagram API overview](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/overview).

### Microservices Integration Patterns

The current scope is best treated as one deployable web application plus managed dependencies, not a network of HSG-owned microservices. The following patterns are still relevant at external boundaries:

- **Gateway/BFF:** framework server routes normalize APIs and protect secrets; no separate gateway product required initially.
- **Timeout, retry and graceful fallback:** remote calls must have short bounded timeouts. Retry only transient failures, honor Retry-After, use exponential backoff/jitter, and do not stack retry layers. Microsoft documents retry budgets and the risk of retry storms. [Transient fault handling](https://learn.microsoft.com/en-us/azure/architecture/best-practices/transient-faults).
- **Circuit breaker:** consider only for a repeatedly failing request-path dependency. Cached/ISR content and explicit fallback often provide simpler isolation for public pages. [AWS circuit breaker pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/circuit-breaker.html).
- **Transactional outbox:** relevant if a custom Supabase publication transaction must reliably emit an invalidation/sync event. Writing content state and an outbox row in one database transaction avoids the “published but event lost” dual-write gap; the consumer must still deduplicate. [AWS transactional outbox pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html).
- **Saga:** not justified for ordinary content publication. It becomes relevant only to a separate multi-system transactional process requiring compensating actions; version history is not a saga.
- **Service discovery/mesh:** not relevant while HSG does not operate many independently deployed services.

### Event-Driven Integration

#### Publication Lifecycle

The platform-neutral publication sequence should be expressible as:

1. author saves a draft;
2. validation runs and the exact renderer previews the draft;
3. reviewer approves or requests changes;
4. authorized publisher changes the canonical content state;
5. the source emits a publication/version event;
6. an authenticated consumer records and deduplicates the event;
7. affected region/locale/content cache keys or paths are invalidated, or a build is triggered;
8. the public renderer serves the new or last-known-good version;
9. an automated check records success, latency or recoverable failure.

Only steps 1–4 are editorial workflow. Steps 5–9 are delivery workflow. A CMS “Published” badge is not evidence that downstream invalidation and rendering succeeded.

#### Cache Invalidation versus Rebuild

- **Targeted revalidation:** map stable content identities to cache tags/paths, including region and locale. This suits frequent updates and limits build work.
- **Full deploy/rebuild hook:** simpler for low-frequency Git/static content, but slower and coarser. Vercel Deploy Hook URLs contain a bearer-like identifier and let anyone holding the URL trigger a deployment, so they must be treated as secrets and rotated if exposed. [Vercel Deploy Hooks](https://vercel.com/docs/deploy-hooks).
- **Time-based revalidation:** useful as a safety net/reconciliation interval, not a substitute for a publication signal when freshness matters.

Next.js Draft Mode bypasses caches for the editor while ordinary visitors continue seeing published cached content. The entry route must validate a shared secret, validate that the content/slug exists, and redirect to a CMS-derived path to avoid open redirects. Draft responses are private and no-store. [Next.js Draft Mode guide](https://nextjs.org/docs/app/guides/draft-mode).

Invalidation must follow references, not just routes: changing a shared testimony, background image, navigation singleton or regional default can affect every page that embeds or inherits it. Visibility can also change when time crosses `publishAt`, `expiresAt`, `startsAt` or `endsAt`; no editor save and therefore no CMS webhook occurs at that instant. The PRD must pair webhook invalidation with a scheduler or bounded cache TTL for time-driven transitions.

#### Delivery Semantics and Reconciliation

At-least-once processing plus idempotent consumers is the practical baseline. HTTP defines idempotence as repeated identical requests having the same intended effect, but webhook POST handlers must implement this explicitly with event IDs/version checks. [RFC 9110 HTTP semantics](https://httpwg.org/specs/rfc9110.html#idempotent.methods).

Reconciliation is required because any webhook can be lost, disabled, misconfigured or exhausted. A scheduled job or operator action should be able to compare source revisions/update times with the last successfully rendered version and replay missing invalidations without republishing content.

### Integration Security Patterns

**Transport security:** all APIs, preview entry points, OAuth callbacks and webhooks use HTTPS. Remote media origins and iframe sources should be allowlisted.

**Credential separation and least privilege:**

- public delivery key: read published content only;
- preview key/session: read drafts only for authorized editors;
- editor identity: draft mutation within role/region;
- publisher identity: explicit publish permission;
- automation/agent identity: narrow content types/actions, draft by default;
- server integration secret: specific webhook, calendar or deployment purpose;
- service/admin key: server-only, never shipped to a browser.

OAuth 2.0 provides delegated access to HTTP services and should use the minimum Google scopes necessary. JWTs carry claims but are not a replacement for authorization policy. [OAuth 2.0 RFC 6749](https://www.rfc-editor.org/info/rfc6749/) and [JWT RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519).

**Webhook verification:** use provider HMAC/signature support where available, compare against the raw request, check timestamp/TTL, rotate secrets, and deduplicate after successful verification. Contentful exposes a signature, signed-header list and timestamp specifically for verification and replay control. External webhooks to Supabase Edge Functions disable platform JWT verification only because the provider lacks a Supabase token; the handler must then verify the provider signature itself. [Contentful request verification](https://www.contentful.com/developers/docs/extensibility/webhooks/request-verification/) and [Supabase external webhook security](https://supabase.com/docs/guides/functions/auth).

**Preview security:** preview tokens must not appear in client bundles, analytics or ordinary links. Preview pages should be authenticated, private/no-store and visibly marked as preview; slugs/redirect destinations must be validated. Unpublished testimony/media must remain inaccessible to anonymous delivery APIs.

**Agent safety:** API/CLI/MCP capability is not authority. Require a distinct agent identity, schema-aware validation, idempotency key, reason/change reference, draft-only default, rate limit, preview URL, immutable audit record and human approval for publication. Direct database/service-role writes bypassing workflow should not count as an agent-friendly deployment path.

### Integration Failure and Recovery Requirements

| Failure | Required behavior |
|---|---|
| CMS/content API unavailable | Serve last-known-good published content where allowed; do not expose draft or blank the site |
| Duplicate webhook | Deduplicate by source plus event ID/version; return success without repeating harmful work |
| Lost webhook | Scheduled/manual reconciliation finds version drift and replays invalidation |
| Out-of-order event | Compare monotonic revision/version before applying |
| Scheduled publish/expiry boundary passes | Scheduler or bounded TTL recomputes visibility without waiting for a webhook |
| Revalidation or build fails | Keep previous public output, record failure and expose manual retry |
| Calendar notification lost/expired | Incremental sync continues; channels renew; 410 triggers full resync |
| YouTube API quota/outage | Serve cached curated result or normal YouTube link; page remains usable |
| External embed blocked | Preserve title/context/link and stable layout |
| Media URL overwritten/cached | Use immutable asset path/version and explicit replacement |
| Regional override missing | Apply documented fallback or intentional not-found; never silently leak another region's private draft |
| Preview token/URL leaked | Revoke/rotate, expire sessions and prevent public indexing/caching |

### Integration Constraints for the PRD

- Name one source of truth per field, not merely per content type, whenever systems share ownership.
- Define freshness and maximum publish-to-visible latency by content class.
- Require exact-renderer preview for nested references, media and region/locale variants.
- Treat editorial approval, public publication and deployment promotion as separate authorization events.
- Require stable IDs, content revisions and region/locale scope in every invalidation contract.
- Model region and locale separately, including base ownership, override/fallback order, publication independence and visible fallback provenance.
- Require dependency-aware invalidation plus scheduled or TTL-based evaluation for time-driven visibility.
- Require signed/verified, deduplicated, observable and replayable change processing.
- Require last-known-good and explicit external-source fallbacks.
- Require Calendar recurrence/timezone/cancellation mapping and a reconciliation strategy if Calendar participates.
- Prefer curated YouTube identities over an uncached search dependency unless automatic discovery is a verified product requirement.
- Keep service-role, management, preview, OAuth refresh and deploy-hook credentials server-side and separately scoped.
- Do not require Kafka/RabbitMQ, service mesh, gRPC, ESB, event sourcing, CQRS or sagas without a measured launch need.

## Architectural Patterns and Design

### System Architecture Patterns

#### Architectural Decision Frame

An architecture style is a set of constraints that produces particular qualities, not a fashionable label. Microsoft’s current architecture guidance recommends starting from business drivers and prioritized non-functional requirements, and notes that microservices earn independent deployment and fault isolation only by accepting independent services, private data ownership and distributed-system complexity. HSG should therefore compare patterns against editorial usability, publication correctness, public availability, regional governance, delivery speed and operating capacity rather than optimize for theoretical scale. [Azure architecture styles](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/) and [microservices readiness](https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/microservices-assessment).

The decision has at least three independent axes:

1. **page-composition authority** — what layouts editors may construct;
2. **authoring/data topology** — where content, workflow, identity and assets live;
3. **public rendering topology** — when and where provider data becomes HTML.

Choosing “headless CMS,” “Supabase,” or “Next.js” answers only part of the problem. The PRD should keep these axes separate so a vendor preference does not silently grant unbounded page-building authority or force request-time rendering.

#### Page-Composition Architecture

| Pattern | Architectural boundary | Strengths for HSG | Trade-offs and PRD constraints |
|---|---|---|---|
| Fixed domain templates | Editors supply typed fields; code owns order and layout | Highest rendering predictability; easiest automated validation; excellent for events, announcements and testimony detail | Layout change requires code deployment; can push editors toward misusing fields if the model is too rigid |
| Freeform rich document/page builder | Editors control arbitrary structure or markup | Maximum editorial autonomy | Weak design-system enforcement, fragile responsive/accessibility behavior, harder migrations and agent verification; arbitrary HTML/JS must not be accepted |
| Governed modular blocks | Editors choose and order a closed registry of typed sections | Flexible campaigns/home pages while preserving known renderers and design tokens | Every block needs schema, renderer, preview, validation, accessibility contract, compatibility policy and tests; block count can sprawl |
| Hybrid templates plus governed slots | Domain templates remain fixed; selected pages expose limited block regions | Separates stable high-value information architecture from legitimate campaign flexibility | PRD must name which page types/slots are composable, allowed block combinations and maximum nesting |

Structured page builders are normally arrays of typed objects or references mapped to frontend components. Sanity’s current guidance explicitly frames this as giving editors enough composition control without breaking layout and recommends modeling meaning rather than presentation; Payload likewise models blocks as discriminated schema objects. Those mechanics do not themselves provide governance—the allowed registry, nesting, validation and lifecycle remain product decisions. [Sanity structured page building](https://www.sanity.io/docs/developer-guides/how-to-use-structured-content-for-page-building) and [Payload Blocks field](https://payloadcms.com/docs/fields/blocks).

#### Authoring and Data Topologies

| Topology option | Logical shape | Architectural advantage | Architectural pressure / constraint |
|---|---|---|---|
| Git-backed content and static build | Content files, assets/references and schemas in a repository; commit triggers build | One versioned change stream, strong code-agent ergonomics, reproducible builds | Non-technical workflow, high-frequency edits, scheduling, large media and merge conflicts become repository concerns; freshness is coupled to build success |
| Managed headless CMS plus web application | Hosted authoring/workflow/delivery plane; HSG renderer consumes delivery/preview APIs | Editors and workflow are separated from public rendering; provider operates authoring infrastructure | Vendor model/API/plan dependency; integration, renderer registry, cache invalidation and exit/export strategy remain HSG responsibilities |
| Custom Supabase content admin plus web application | HSG-owned admin and workflow over Postgres/Auth/Storage; public renderer uses constrained projections | One programmable relational core and maximum control over regional relationships | HSG owns the CMS product: workflow state machine, versions/diffs, scheduling, asset UX, preview, accessibility, audit, migrations and support |
| Integrated/self-hosted headless CMS | CMS runtime/admin and possibly frontend share a repository or deployment estate | Code-defined schemas and close application integration; less SaaS content-model lock-in | Runtime upgrades, security, queues, backups, asset recovery and editorial availability become HSG operations; “self-hosted” is not “no-cost” |
| Federated content architecture | Editorial CMS/admin, Supabase operational data and selected external sources each retain authority; renderer consumes adapters/projections | Each content class can use a fitting source and operational data need not be forced into page documents | Highest need for field-level source ownership, stable cross-system IDs, preview composition, reconciliation and failure isolation |

These are candidates rather than a recommendation. A managed CMS may still store relationships; a custom Supabase admin may still use governed blocks; Git may be appropriate for low-change policy copy while another source owns events. The PRD should reject accidental federation—multiple writable copies with no declared field authority—not federation itself.

#### Deployment Shape: Modular Application, Worker, or Distributed Services

A **modular monolith** here means one independently deployable web codebase with explicit internal modules such as content contracts, renderers, preview, publication integration, regional resolution and external-source adapters. It can depend on managed CMS/Supabase services without becoming a microservice estate. This shape preserves atomic refactoring and simple operations while allowing a module to be extracted later if its scale, ownership or security boundary becomes genuinely independent.

A **web-plus-worker** variation adds scheduled/background execution for reconciliation, media processing, Calendar synchronization or reliable publication jobs. Azure describes this pattern as appropriate for a relatively simple domain with some long-running or batch work, while warning about the dual-write gap between database updates and queued work. HSG does not need a worker merely to serve pages, but the pattern becomes relevant if scheduled visibility and retries cannot safely complete inside short web requests. [Azure Web-Queue-Worker](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/web-queue-worker).

A **microservice architecture** would require independent business capabilities, ownership, data stores, deployment and operational maturity. HSG’s current content domain, team context and launch scope do not evidence those conditions. If later regional teams need independent release cadences or a media pipeline has materially different scale/security characteristics, extraction can be reconsidered from measured boundaries. Microsoft advises coarse-grained boundaries when uncertain and calls out chatty calls, coupled deployment and consistency problems as reasons to merge rather than split services. [Microservice boundary guidance](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/microservice-boundaries).

#### Authoring Plane versus Delivery Plane

Regardless of vendor, a useful architectural boundary separates:

- an **authoring control plane** for authenticated drafts, workflow, versions, approvals, asset management and agent mutations; and
- a **public delivery plane** containing only published, policy-compliant projections optimized for anonymous reads.

Preview crosses the boundary deliberately: it uses the production renderer but an authenticated draft perspective. Public rendering must never query the broad management surface. Contentful explicitly separates its high-volume Delivery API from its Management API, whose responses include localized and unpublished state; the same boundary would need to be constructed in Supabase through schemas/views, grants and RLS. [Contentful Management API](https://www.contentful.com/developers/docs/references/content-management-api/overview/) and [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api).

### Design Principles and Best Practices

#### Content Semantics before Page Appearance

The durable model should describe an event, testimony, announcement, call to action, media asset or regional contact—not “a 420-pixel left column.” Presentation variants may be constrained enumerations, but essential meaning must remain usable after a redesign or in another region/channel. This improves accessibility, regional reuse, SEO, API export and agent comprehension. Contentful likewise defines content through typed fields and references, while Sanity’s page-building guidance recommends modeling for meaning instead of presentation. [Contentful data model](https://www.contentful.com/developers/docs/concepts/data-model/) and [Sanity structured page building](https://www.sanity.io/docs/developer-guides/how-to-use-structured-content-for-page-building).

#### Stable Domain Contract and Provider Adapters

Frontend renderers should consume HSG-owned domain types, not raw vendor payloads. A provider adapter/anti-corruption layer translates CMS documents, Supabase rows, Git records or external feeds into stable page, event, announcement, testimony, media and regional contracts. AWS describes the anti-corruption layer as a façade/adapter for systems with different semantics, including external systems. This boundary reduces migration blast radius but must not erase meaningful provider differences such as draft perspectives, references or publication versions. [AWS anti-corruption layer pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/acl.html).

The PRD should require:

- stable content and block IDs;
- explicit schema/contract versions;
- generated/static types where supported plus runtime validation at external boundaries;
- deterministic resolution of region, locale, publication time and fallback provenance;
- safe rendering for unknown/deprecated blocks;
- contract fixtures and provider-adapter tests;
- optimistic concurrency or conflict detection for human and agent writes.

#### Closed Renderer Registry

Every content shape that can reach production needs a registered renderer and validation contract. Publication should fail before public delivery when a required renderer, reference, asset metadata or accessibility field is missing. An unknown block in already-published content should degrade to an observable safe state rather than crash the full route or execute arbitrary markup. This gives agents a finite search space: add or change a block through schema, renderer, fixture, preview and tests as one governed change.

#### Exact-Renderer Preview, Not a Second Mock Renderer

Preview should execute the same component registry, responsive rules and regional resolver as production while switching only content perspective, authentication and caching policy. CMS form previews or isolated component thumbnails are useful supplements but cannot prove nested references, backgrounds, navigation, third-party embeds and responsive composition together. Sanity’s Presentation tooling explicitly bridges structured drafts to the actual frontend; the architectural requirement is provider-neutral. [Sanity preview and page building](https://www.sanity.io/docs/user-guides/preview-and-page-building).

#### Explicit Invariants and Reversible Decisions

Cross-option invariants belong in the PRD: anonymous users never receive drafts; published content has a stable revision; each permitted block renders safely; regional fallback is deterministic; testimony consent gates publication; and failed refresh preserves the last known good result. Vendor choice, framework caching API and precise table/document layout are later decisions.

Architecturally significant choices should be captured as short ADRs with context, considered alternatives, decision, consequences and reversal conditions. Microsoft recommends ADRs for decisions affecting structure, quality attributes or hard-to-reverse commitments. This is especially valuable for agent-driven delivery because a coding agent can distinguish an intentional constraint from incidental code. [Microsoft ADR guidance](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record).

#### Accessibility and Safety as Schema Concerns

Accessibility cannot be repaired only in CSS after editors compose content. Block contracts should encode heading behavior, link purpose, alt-text requirements, decorative-image intent, caption/transcript fields, keyboard-safe interaction choices and limits on text embedded in images. Background imagery needs overlay/contrast rules and a meaningful non-image fallback. These become publish validation plus renderer tests, not optional editor guidance.

### Scalability and Performance Patterns

#### Read-Heavy Traffic and Rendering Options

HSG’s public site is read-heavy and shared across visitors; authoring is low-volume and authenticated. The architecture can scale these paths differently.

| Rendering pattern | Availability/performance behavior | Update behavior | Architectural constraint |
|---|---|---|---|
| Static export | HTML/assets can be served from almost any CDN with no application runtime | Every content change needs a build/deploy unless data is fetched client-side | Strong reliability, but slow/coarse publishing and no ISR; preview and authenticated server capabilities require separate handling |
| Full static generation per deployment | Data is resolved at build time and deployed as immutable output | Freshness tied to build duration and success | Appropriate only if content volume/change frequency fits the publish-latency requirement |
| Static generation with ISR/on-demand revalidation | Cached pages serve quickly; regeneration updates selected content and preserves the last successful result after regeneration errors | Webhook plus TTL can update without full rebuild | Requires a compatible runtime/cache; invalidation dependency mapping becomes correctness-critical |
| Dynamic server rendering | Fresh source query on each uncached request | Immediate source freshness | CMS/database latency and availability move onto the public request path; requires timeouts, isolation and scaling |
| Client-only fetching | Static shell loads data in the browser | Can be fresh independently of deploy | Weak initial/SEO/no-JS behavior and visible loading/failure; secrets and privileged APIs cannot be used |
| Mixed/partial rendering | Static shell and cached public sections coexist with selected dynamic islands | Freshness can vary by component | More nuanced caching/debugging and platform capability; use only where differing freshness is a real requirement |

Next.js documents that ISR updates static content without rebuilding the whole site, serves stale content while regenerating, retains the last successfully generated result after an error, requires the Node runtime and is unavailable in static export. It also documents static, cached and dynamic composition within a route. These are capabilities to evaluate, not a predetermined framework configuration. [Next.js ISR](https://nextjs.org/docs/app/guides/incremental-static-regeneration) and [Next.js public-page rendering](https://nextjs.org/docs/app/guides/public-static-pages).

Pure Next.js static export also omits runtime-dependent features including Draft Mode, cookies, Server Actions and the default image optimizer; equivalent preview, mutation and responsive-image behavior would need a separate service or build-time/client-safe mechanism. [Next.js static export](https://nextjs.org/docs/app/guides/static-exports).

#### Cache Hierarchy and Correctness

A possible read path has several caches: browser, CDN, framework-render/data cache, normalized external-source projection and provider CDN. Each layer must have an owner, key, maximum age, invalidation mechanism and stale-on-error policy. Cache keys must vary on every dimension that changes the result—at least content ID/revision, publication perspective, region and locale—and preview responses must never enter shared caches.

Targeted invalidation should follow content references: a shared background, testimony or global navigation change affects all dependent pages. Time-bounded visibility also needs TTL/scheduling because crossing a start/expiry time emits no edit webhook. A bounded TTL provides a recovery ceiling even when targeted invalidation is lost.

Custom CDN use needs integration testing. Current Next.js guidance notes that framework on-demand invalidation does not automatically purge a separate CDN copy and that React Server Component variants require correct cache keys/headers. Self-hosted multi-instance ISR similarly needs shared cache/tag coordination to prevent instances serving divergent versions. [Next.js CDN caching](https://nextjs.org/docs/app/guides/cdn-caching) and [Next.js deployment platform requirements](https://nextjs.org/docs/app/guides/deploying-to-platforms).

#### Horizontal Scale and Regional Delivery

Public stateless rendering plus CDN delivery can scale horizontally for announcement/event spikes. Database connection pooling, provider quotas and image transformation limits remain shared bottlenecks even when function instances scale automatically. The PRD should state expected peak traffic and external API budgets rather than assume “serverless” removes limits.

If dynamic functions connect directly to the intended Supabase Postgres backend, compute placement and connection mode matter: a Supabase project has one primary region, and Supabase documents transaction-mode pooling for transient serverless/edge clients. Globally multiplying functions against a single-region database can add latency and exhaust finite connections faster than the database scales. [Supabase regions](https://supabase.com/docs/guides/platform/regions) and [Supabase database connections](https://supabase.com/docs/guides/database/connecting-to-postgres).

Regional content reuse does **not** imply multi-region databases or independent regional deployments. A single delivery system can resolve several regions; multi-region runtime/data replication should require measured latency, residency, autonomy or availability needs. Distributed authoring or multiple regional stacks create consistency, schema-drift, release and support costs that content taxonomy alone does not justify.

#### Media and Background Delivery

Original media, structured metadata and generated delivery variants are separate concerns. Asset records should retain dimensions, MIME type, checksum/version, focal point/crop, alt/decorative intent, attribution/consent and references. Public URLs should be immutable or versioned so browser/CDN caching cannot serve an overwritten background indefinitely. Responsive derivatives should be generated by a controlled media service or build/runtime pipeline, with maximum upload dimensions/size and failure fallbacks.

Supabase can transform and optimize images on demand on eligible paid plans, but database backups include storage metadata rather than the stored objects themselves. A Supabase-based option therefore needs a distinct object-backup/restore policy; the same recovery question applies to any CMS asset store. [Supabase image transformations](https://supabase.com/docs/guides/storage/serving/image-transformations) and [Supabase database backups](https://supabase.com/docs/guides/platform/backups).

#### Reliability and Measurable Performance

The 99.9% monthly target should be expressed as user-visible SLIs rather than provider uptime alone. Candidate measures include successful public page responses, usable render latency percentiles, asset/embed failure rate, content correctness/freshness, and publish-to-visible latency. External black-box checks should cover critical regional routes and verify recognizable current content, not only HTTP 200.

Google’s SRE guidance distinguishes availability, latency, throughput and correctness and recommends defining indicators from what users care about. AWS reliability guidance adds automatic recovery, tested recovery procedures and change automation. For HSG, graceful last-known-good delivery is usually more valuable than failing a whole page to obtain the newest non-critical embed. [Google SRE service-level objectives](https://sre.google/sre-book/service-level-objectives/) and [AWS reliability principles](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel-dp.html).

“Serve stale” must be classified by content risk rather than set once site-wide. An old testimony or background may be temporarily acceptable; an expired emergency announcement, event cancellation or withdrawn testimony may not be. The PRD should define maximum stale age, forced-unpublish behavior and operator override for each content class.

Performance budgets should cover page weight, responsive image bytes, largest background variant, JavaScript/hydration, font loading and third-party embeds. Block-level budgets prevent a new gallery, autoplay player or oversized hero from invalidating site-wide performance assumptions.

### Integration and Communication Patterns

#### Synchronous Reads, Asynchronous Change Processing

Public page delivery and editorial commands have different communication needs:

| Boundary | Suitable baseline | Reason |
|---|---|---|
| Browser to public site | HTTPS, cacheable HTML/assets and limited JSON | Broad interoperability, CDN support and accessible initial rendering |
| Renderer to published content | Build-time/cached server read through a provider adapter | Keeps credentials server-side and permits a stable HSG contract |
| Renderer to draft content | Authenticated server read, private/no-store | Preserves exact preview without leaking draft credentials |
| Admin/agent mutation | Authenticated command/API with schema, version and policy validation | Captures intent and prevents arbitrary table/document mutation |
| Publication to revalidation/sync | Verified webhook into idempotent asynchronous handling | Keeps editor response fast and tolerates duplicates/retries |
| External Calendar/media source | Scheduled/invalidation-triggered cached projection | Isolates quotas, latency and outages from public traffic |

Synchronous request chains should stay short: public page → local/cacheable content boundary, not public page → CMS → Calendar → YouTube → social provider. Asynchronous processing is warranted for retries, reconciliation, scheduled transitions, asset derivatives or fan-out. A broker/service bus is not required merely because a job is asynchronous; a durable database job/outbox can be sufficient until volume or independent consumers justify more.

#### Provider Isolation and Read Projections

For a federated option, avoid critical request-time joins across providers. Resolve/cache a published projection at build, publication or bounded refresh time, retain source revision/provenance, and serve the last known good projection during source failure. This resembles a materialized read view without requiring full CQRS. Azure describes a materialized view as a pre-populated, replaceable read structure optimized for queries; the cost is refresh and consistency management. [Azure Materialized View pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view).

The projection must be reproducible or reconcilable from authoritative sources. It must never become another independently edited source of truth. Event and external-media snapshots should retain stable provider IDs, fetched time, source revision/update time and stale/fallback status.

#### Contract Evolution

All provider APIs, content queries and webhook formats should be pinned to explicit supported versions where possible. Additive fields should be tolerated, but removed/renamed required fields, new block types and changed publication semantics need contract tests before production. Content-model migrations should support both active and rollback application versions during deployment. Adapter fixtures should cover published, draft, missing reference, deleted asset, fallback, old revision and unknown schema cases.

#### Integration Complexity Boundaries

Event-driven architecture, CQRS, event sourcing, service mesh, gRPC and enterprise integration platforms solve real problems but not HSG’s evidenced launch problem. Azure’s CQRS guidance says ordinary CRUD remains suitable for simple domains and that separate read/write stores introduce messaging and eventual-consistency complexity; its event-sourcing guidance says the pattern is a poor fit for straightforward current-state CRUD or mostly static reference/catalog data. A published projection does not require an event-sourced domain. [Azure CQRS pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs) and [Azure Event Sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing).

### Security Architecture Patterns

#### Trust Zones and Attack Surface

| Zone | Permitted capability | Architectural boundary |
|---|---|---|
| Anonymous public delivery | Read currently published, region-eligible content and public assets | No route to drafts, consent evidence, review notes or management credentials |
| Authenticated preview | Read a named draft/release revision through the production renderer | Private/no-store, non-indexed, visibly marked, time/session bounded |
| Editor/reviewer/publisher admin | Mutate or transition content only within assigned scope | Server-side validation plus role/content/region policy and audit |
| Integration/webhook worker | Verify one provider and perform narrow idempotent actions | Separate secret/principal per integration; no general editorial login |
| Agent/CI identity | Create drafts/branches, run checks, inspect allowed logs and request promotion | Distinct revocable identity; no inherited human session or default production authority |
| Production administration | Secrets, migrations, domains, rollback and emergency actions | Smallest membership, stronger authentication, explicit audit and break-glass process |

This separation is structural: hiding a menu item is not authorization, and a public query that merely filters `status = published` in browser code is not a public-data boundary.

#### Authorization: Roles Plus Content Context

Stable roles such as author, reviewer, publisher and administrator are understandable to non-technical teams, but HSG also needs attributes: assigned region, locale, content type, ownership, workflow state and testimony sensitivity. The policy may therefore combine RBAC with attribute/relationship checks. OWASP recommends least privilege, deny-by-default authorization and consideration of attribute/relationship-based access for object-level rules. [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

For a Supabase option, database grants and RLS should both constrain exposed tables; internal workflow/consent tables can remain in an unexposed schema, while deliberately narrow published views/API functions serve anonymous users. PostgreSQL views need `security_invoker` where underlying RLS must apply. Supabase secret/service-role credentials bypass RLS and cannot serve as ordinary editor or agent identities. [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), and [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys).

The PRD must decide separation of duty by risk. A small team might allow an author to self-publish a low-risk event correction while requiring a different approver for testimonies, legal/contact facts or broad regional changes. The model must support the chosen rule rather than assume every CMS “publisher” role implements it.

#### Draft, Approval and Published Revision Separation

Viable patterns include one store with strict published-only views, separate draft/published representations, immutable revisions with a published pointer, a separate public projection, or an immutable static/ISR artifact. Isolation and operational work increase along that list.

Approval should bind an exact resolved revision, including relevant inherited base content, referenced testimonies/media and region/locale perspective. If any approval-relevant dependency changes, approval must be invalidated or a new resolved release snapshot created. Otherwise a reviewer can approve one composition and publish another through a mutable reference.

Version history and workflow audit are related but distinct. Authentication logs or database statement audit do not answer “which testimony revision did this reviewer approve for which region and why?” A semantic append-only audit record should retain principal type/ID, content and revision IDs, region, locale, transition, time, reason/change reference and trace/request ID. Rollback should create a new publication action referencing an earlier revision, not erase intervening history.

#### Preview Boundary

An exact-renderer preview must authenticate the editor, authorize the requested revision/region, protect the CMS preview credential server-side, validate a stable content identity, and redirect only to a server-resolved route. Responses are private/no-store and non-indexable; preview state must not enter analytics, error URLs, public metadata or shared cache keys. Next.js’s current Draft Mode guide requires secret and slug validation, CMS-derived redirects and private cache behavior. [Next.js Draft Mode](https://nextjs.org/docs/app/guides/draft-mode).

Protecting a branch deployment is complementary, not sufficient: deployment authentication governs who can open that deployment, while the application still governs who may retrieve each draft. Draft or consent-sensitive assets need private storage and short-lived access rather than public URLs.

#### Agent and Automation Boundary

Agent-friendly means safe, inspectable and automatable—not omnipotent. Each agent/service should have its own revocable principal and narrowly scoped API/robot token. The common mutation contract should require a base revision, schema version, region/locale scope, idempotency key and reason/trace ID. Agents default to drafts and preview; production publication/promotion requires the explicit policy chosen by HSG.

Three patterns remain open:

- a Supabase Auth machine principal constrained by grants/RLS;
- a narrow server-side command endpoint that centralizes editorial invariants; or
- a CMS robot/scoped token limited to content types/actions.

A shared service-role key, shared human personal token or direct production SQL is not a safe agent interface. CI/CD workload identity is separate again: GitHub environments can restrict branches, require reviewers and withhold environment secrets until approval, while OIDC can replace long-lived cloud keys. [GitHub deployments and environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments) and [GitHub OIDC](https://docs.github.com/en/actions/reference/security/oidc).

#### Content, Embed and Upload Safety

Prefer structured rich text and typed embed IDs over arbitrary editor HTML, JavaScript, CSS, iframes or remote URLs. Renderers should allowlist protocols/origins and apply output encoding/sanitization appropriate to each context. Content Security Policy is a defense-in-depth layer against XSS, clickjacking and untrusted remote scripts, not a replacement for safe rendering. [OWASP CSP guidance](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html) and [Next.js CSP guide](https://nextjs.org/docs/app/guides/content-security-policy).

Uploads require allowlisted types, actual signature/decode validation, generated safe names, size/pixel limits, authorization and non-executable serving. OWASP warns that client-supplied MIME type is spoofable and recommends defense in depth for public files. [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

#### Testimony Consent Boundary

Public testimony copy/media, private person/contact data, private consent evidence and derived publication eligibility should be separate records or access domains. Publication must fail closed if consent is absent, withdrawn, expired or does not cover the resolved copy, media, channel or region. Withdrawal needs a defined end-to-end unpublish SLA across references, caches/CDNs and derivatives.

Consent and minors require product/legal decisions, not a CMS checkbox. India’s DPDP commencement is staged, so counsel should confirm launch obligations; nevertheless, the technical model should support purpose/notice version, exact approved revision/media, identity presentation, regions/channels, subject or guardian evidence, status, withdrawal and retention. [Digital Personal Data Protection Act, 2023](https://www.indiacode.nic.in/bitstream/123456789/22037/1/a2023-22.pdf). This report does not make a legal determination.

#### Secrets and Audit Hygiene

Preview secrets, CMS management tokens, Supabase secret keys, Google refresh tokens and deploy-hook URLs must be separately scoped, centrally stored, rotatable, revocable and absent from content, browser bundles and logs. OWASP recommends least-privilege CI/CD access plus lifecycle controls for creation, rotation, revocation, expiry, auditing and recovery. [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).

### Data Architecture Patterns

#### Storage Model Options

| Model | Strengths | Weaknesses / constraints |
|---|---|---|
| Fully relational typed tables | Foreign keys, constraints, transactional workflow, strong queries and granular RLS | More migrations and joins; deeply variable block trees can become cumbersome |
| Structured document model | Natural page graphs and immutable snapshots; flexible CMS editing | Referential integrity, cross-document policy and whole-document contention may move to application/provider semantics |
| Typed relational envelope plus JSON block payload | Stable identity/workflow/region/consent around flexible, versioned sections | Requires rigorous block schemas, runtime validation, renderer registry and JSON migration discipline |
| Vendor-native CMS documents/references | Productized schemas, editor controls, previews and versions | Provider limits, reference semantics, migration/export behavior and plan features constrain the model |
| Git files | Human/agent-readable diffs and immutable commit history | Cross-record constraints, scheduling, media, high-churn editing and partial publication are harder |

PostgreSQL notes that relational and JSON approaches can complement one another but recommends predictable JSON structure; updating JSON also locks the whole row. A hybrid is therefore a legitimate option, not a compromise that eliminates validation. [PostgreSQL JSON types](https://www.postgresql.org/docs/current/datatype-json.html).

#### Identity, Revision and Publication Model

Irrespective of storage, distinguish:

- stable entity/content ID;
- immutable or monotonic revision/version;
- region and locale variant identity;
- authoring/workflow state;
- exact published revision or resolved snapshot;
- effective publish/expiry interval;
- referenced asset versions and external IDs;
- approval and consent references.

The workflow may include draft, review, approved, scheduled/published and archived/expired states, plus rejection, cancellation, withdrawal and rollback transitions. The exact state machine remains a PRD decision, but a single `is_published` boolean cannot express approval binding, scheduling, rejection, restoration or verified public delivery.

Optimistic concurrency is required for both humans and agents. Contentful requires the current entry version on updates, and Sanity supports revision-matched mutations. A custom Supabase model needs an equivalent compare-and-swap/version condition rather than last-write-wins. [Contentful Management API concurrency](https://www.contentful.com/developers/docs/references/content-management-api/overview/) and [Sanity mutations](https://www.sanity.io/docs/apis-and-sdks/js-client-mutations).

#### Regional and Locale Reuse Patterns

| Pattern | Reuse/autonomy benefit | Architectural constraint |
|---|---|---|
| Field-level localized values in one regional record | Compact shared editing | Languages often share revision/publication; independent approvals may be hard |
| Linked document per region/locale | Independent workflow and structure | More records and reference/fallback management |
| Global base plus sparse regional overrides | Maximum reuse and clear regional differences | Must distinguish inherit, intentionally blank and remove; base changes can invalidate approvals |
| Materialized regional snapshot/copy | Reviewer sees and approves a deterministic result | Propagation, drift and conflict resolution become explicit work |
| Separate space/dataset per region | Strong access and operational autonomy | Schema sync, shared content, coordinated release, cross-store preview and plan dependency |

Fallback chains must be explicit, acyclic, observable and content-type aware. A decorative global background may fall back; a local event, contact fact, legal notice or consent-scoped testimony may require an intentional absence. Locale fallback must never grant authorization to another region’s draft. Effective content should expose provenance so editors, tests and agents can explain why a value appeared.

#### Structured Blocks and Reference Integrity

Each block instance should carry stable ID, registered type and schema version, typed configuration and explicit content/asset references. Per-slot allowlists, maximum counts, bounded nesting and compatibility rules prevent combinatorial layout states. Reusable referenced blocks improve consistency but broaden invalidation and approval dependency; embedded objects are easier to snapshot but duplicate content. The PRD should specify which items are truly shared entities rather than make every section reusable.

Schema evolution needs additive transition windows or migrations that preserve already-published content. Deleting a renderer before all old revisions are migrated breaks rollback. Reference deletion should be blocked, soft-deleted or converted to an explicit fallback; silent nulls are not reliable rendering.

#### Published Read Model and Data Minimization

A separate published view/projection can omit editor notes, consent evidence, internal identities and unused localized fields while presenting renderer-ready data. This reduces public attack surface and query cost. It can live in the same database/schema boundary, a CMS delivery API, a cache/projection store or the generated page artifact. Stronger separation increases refresh/reconciliation work.

CQRS terminology is unnecessary unless command and read models truly evolve and scale independently. A read-only published DTO or view is ordinary separation of concerns; it does not require event sourcing, independent databases or a message broker.

#### Assets, Retention and Recovery

Binary assets should be versioned independently from content references. Retain source originals and every object needed by an eligible content/deployment rollback; overwrite-in-place and immediate hard deletion make historical reproduction impossible. Draft/private assets stay access-controlled, while published delivery uses immutable paths and controlled derivatives.

The data architecture must set separate retention, backup and restore objectives for database records, asset binaries, CMS exports/version history and external-source snapshots. Supabase database backup does not restore Storage objects, so a Supabase topology requires an object-specific backup/export and tested restore. [Supabase backups](https://supabase.com/docs/guides/platform/backups).

### Deployment and Operations Architecture

#### Three Independent Change Streams

HSG will operate at least three kinds of change:

1. **code/configuration** — renderers, integrations and infrastructure;
2. **schema/content model** — database/CMS fields, block versions and policies;
3. **content/assets** — records, revisions, schedules and media binaries.

These may be coordinated but are not interchangeable. A Git rollback changes code, not mutable CMS content or deleted assets. A content rollback does not reverse a schema migration. The release design should make each stream’s identity, compatibility and recovery action visible.

#### Environment and Preview Model

| Environment/view | Purpose | Data/credential constraint |
|---|---|---|
| Local/test | Fast deterministic development and contract fixtures | Synthetic/sanitized data; no production write keys |
| Code preview deployment | Review a branch/commit and its schema-compatible renderer | Protected URL; isolated preview credentials; never assumed to be editorial approval |
| Content preview | Review a named draft/release through the production renderer | Authenticated, revision/region/locale bound, private/no-store |
| Staged production candidate | Run production-like checks on the exact artifact/configuration intended for release | Production-shaped but not public; promotion authority separated |
| Production | Serve approved artifact and published content | Least-privileged runtime credentials; externally monitored |

Code preview and content preview may intersect but solve different problems. The PRD should require representative viewport, region, locale, scheduled-time and failure-state review without assuming one provider feature covers all dimensions.

#### Promotion and Rollback

Git-integrated immutable deployments suit agents because commit, checks, preview URL, logs and deployment identity are machine-readable. Production should, where feasible, promote the already-tested artifact rather than rebuild from mutable inputs. GitHub protected branches/status checks and deployment environments can gate changes and secrets; exact capabilities for private repositories are plan-dependent. [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) and [GitHub environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).

Vercel supports staged production deployments, promotion and instant domain reassignment to a prior production deployment. Its rollback documentation warns that external APIs, databases and CMS data may have changed and that environment configuration may be stale. HSG therefore needs separate runbooks and RTO/RPO for application deployment, content revision, schema/database and assets. [Vercel deployment promotion](https://vercel.com/docs/deployments/promoting-a-deployment) and [Vercel Instant Rollback](https://vercel.com/docs/instant-rollback).

A release manifest can correlate deployment ID, Git commit, content release/published revision, schema version, build time, regions and referenced asset/source snapshot versions. This makes monitoring, rollback and agent diagnosis reproducible without prescribing a CMS.

#### Agent-Safe Release Flow

The deployment architecture should support this provider-neutral control sequence:

1. agent creates a branch/PR or draft using a scoped identity;
2. CI validates schemas, contracts, renderer exhaustiveness, links, representative regional/localized routes, accessibility, media and build determinism;
3. an authenticated preview is generated and tied to exact code/content revisions;
4. an authorized human or explicit release policy approves production promotion;
5. the tested immutable artifact is promoted where supported;
6. external semantic smoke checks verify critical routes and release identity;
7. failures expose logs, replay/retry and a least-privileged rollback path.

Agents get preview/build/log access by default, not production CMS/database/domain/secret access. Deployment hooks and automation-bypass URLs are bearer secrets. Non-interactive scripts should be idempotent, bounded, documented and emit machine-readable results so an agent can diagnose without dashboard-only knowledge.

#### Schema Deployment Compatibility

Schema/content-model migrations must be in version control, reviewable and tested against production-like fixtures. Prefer expand/migrate/contract sequencing: add compatible fields or tables, deploy readers/writers that understand both forms, migrate content, verify, then remove the old form after rollback retention expires. CMS schema changes need the same discipline even if applied through a vendor UI/CLI.

The active and rollback application versions must both tolerate the current data shape. Content-model API versions and generated types should be pinned. Destructive migrations, renderer removal and asset deletion need explicit retention gates because infrastructure rollback cannot reconstruct them.

#### Scheduled and Background Operations

Reconciliation, scheduled publication/expiry, Calendar channel renewal and asset cleanup require an owned scheduler/worker boundary if selected. Jobs must be idempotent, concurrency-safe, observable and manually replayable; no scheduler should be assumed to guarantee retries or singleton execution. For example, Vercel documents that cron invocations can overlap, can occasionally duplicate and do not retry failed jobs. [Vercel Cron management](https://vercel.com/docs/cron-jobs/manage-cron-jobs).

#### Observability and SLOs

Platform telemetry and external black-box monitoring answer different questions. Internal metrics/logs/traces should correlate deployment, content revision and request/region, including:

- request status and latency plus upstream/provider latency;
- cache hit/miss/stale state, revalidation duration/failure and invalidation age;
- webhook deduplication, retry, reconciliation lag and publish-to-visible latency;
- scheduled-job success, duration, overlap and last success;
- build/deploy duration, artifact size, promotion and rollback;
- broken assets/transforms/embeds and media egress;
- editor preview errors and authorization denials without logging private content.

Next.js supports OpenTelemetry instrumentation, and OpenTelemetry provides vendor-neutral traces, metrics and logs. [Next.js instrumentation](https://nextjs.org/docs/app/guides/instrumentation) and [OpenTelemetry](https://opentelemetry.io/docs/).

External monitoring should run independently of hosting, CMS and database providers from relevant geographies; validate the custom domain, TLS/DNS, critical regional routes, meaningful page content and key assets—not merely HTTP 200. The PRD’s 99.9% monthly objective should define the measurement interval, locations, success criteria, exclusions, owner and response. At 99.9%, the rough average-month error budget is about 44 minutes. Separate SLOs are needed for content freshness/publish latency and rendering correctness because a stale or blank `200` response can meet infrastructure availability while failing users.

#### Recovery and Operating Constraints

Require tested recovery, not just a provider backup checkbox:

- code/deployment rollback with expected time;
- content revision restore/unpublish and cache purge;
- schema/database restore with migration compatibility;
- asset binary restore plus reference/derivative recovery;
- external projection rebuild from authoritative IDs/tokens;
- secret rotation and preview-session revocation;
- webhook/scheduler replay and reconciliation.

AWS reliability guidance recommends automated recovery, testing recovery procedures and managing change through automation. HSG’s operational target should include runbooks, ownership and periodic restore exercises proportional to risk. [AWS reliability design principles](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel-dp.html).

#### Architectural Questions the PRD Must Resolve

This research deliberately leaves the final architecture open. The PRD should make the following choices measurable before architecture selection:

1. Which content types are fixed templates, which pages expose governed blocks, and what composition/nesting limits apply?
2. What are the maximum approved-publish-to-public times and safe stale ages for announcements, event corrections/cancellations, testimonies, media and backgrounds?
3. Does “published” mean accepted by the authoring system or verified on the public site?
4. Must author and publisher be different people for each content-risk class?
5. What exact revision, inherited base, references, media and regional/localized view does approval bind?
6. What launch and two-year route × region × locale counts, edit frequency, traffic baseline and event burst should be tested?
7. Which regional values may inherit, which must be explicit, and can regional/language variants publish independently?
8. What is the testimony consent/withdrawal/minor policy, retention period and unpublication SLA?
9. What are RTO, RPO and retention for code, content database, CMS versions/exports, assets and external snapshots separately?
10. Must rollback reproduce the exact historical content and binary assets, or only restore current valid content?
11. Which permissions may agents hold for drafts, preview, CI, schema changes, promotion, rollback and secrets?
12. Which provider/plan-specific workflow, localization, role, media and deployment capabilities are acceptable dependencies?
13. How are 99.9% availability, content freshness and rendering correctness measured and externally verified?

Patterns currently disproportionate without new evidence include HSG-owned microservices, service mesh, active-active multi-region authoring, distributed databases, Kafka-class brokers, gRPC, event sourcing, full CQRS, sagas, unrestricted WYSIWYG/layout code and a general-purpose CMS/DAM/workflow product built from scratch.

## Implementation Approaches and Technology Adoption

### Technology Adoption Strategies

HSG should evaluate adoption through the same working content journey in each serious option, not through feature matrices or vendor demonstrations alone. A time-boxed vertical-slice bake-off should cover the risks that distinguish the choices:

1. create and cancel a timezone-aware event;
2. create a regional announcement with activation and expiry;
3. submit, approve, publish and urgently withdraw a testimony while preserving consent/provenance;
4. select a responsive background image with focal-point, crop, alt-text and contrast checks;
5. add a media item with an approved failure fallback;
6. compose one governed landing-page section from permitted blocks;
7. resolve global, regional and locale-specific content with visible fallback provenance;
8. preview the exact resolved revision, approve it, publish it, verify it publicly and roll it back or unpublish it;
9. have an agent propose a safe draft/change through the same reviewed delivery controls; and
10. export the content, references, original assets and configuration needed for an exit rehearsal.

The shortlist should include a credible managed headless CMS and a bounded custom Supabase-admin spike. A Git-backed or self-hosted candidate should enter the bake-off only if HSG is genuinely willing to accept its editor-support or operational ownership model. This avoids funding full parallel implementations while retaining evidence across the main economic choices.

Use a weighted score agreed before the trials. Candidate measures should include editor task completion, time, errors and help required; preview fidelity; approval correctness; publish-to-verified latency; schedule/expiry and regional behavior; degraded rendering; implementation effort; recurring operational effort; three-year total cost; agent safety; and exit/export completeness. Representative non-technical editors must perform the trial—an engineer successfully demonstrating an interface is not editor acceptance.

The first production increment should be a walking skeleton: one content class crossing authoring, validation, preview, approval, public rendering, observability and recovery. Extend content types only after the control path works. This is especially important for a custom Supabase admin, where forms can appear inexpensive while workflow recovery, authorization, preview, media operations and editor support remain unbuilt.

Adoption must remain reversible. Keep the public renderer dependent on HSG-owned typed content contracts and provider adapters; put schemas, model changes and migrations under review; preserve original assets; document plan entitlements and non-exported configuration; and rehearse export plus re-import before selection. Contentful, for example, documents that its CLI export/import omits version history, releases, tasks, workflows, memberships, apps and webhook credentials, illustrating why a vendor export is not automatically a full operational restore. [Contentful import/export limitations](https://www.contentful.com/developers/docs/tutorials/cli/import-and-export/).

#### Content Migration and Cutover

Use an inventory-led migration regardless of the selected store:

1. inventory pages, structured records, assets, embeds, URLs, metadata, ownership, update frequency, region/locale and consent status;
2. classify records into canonical content types and explicitly quarantine duplicates, obsolete content and unknown rights/consent;
3. map source fields and references to versioned target contracts;
4. automate import with stable source identifiers and idempotent upserts;
5. validate counts, required fields, relationships, redirects, SEO metadata, media binaries and representative renders;
6. rehearse against an isolated environment and record time, failures and recovery actions;
7. obtain editor/content-owner sign-off;
8. freeze or tightly control legacy editing, run a final delta sync, cut traffic over, execute semantic smoke checks and retain a predefined rollback checkpoint; and
9. reconcile post-cutover content and retire the legacy path only after the retention gate.

Phased cutover lowers blast radius and speeds local rollback but creates temporary dual-system and synchronization complexity; an all-at-once cutover is simpler but concentrates risk. AWS recommends that the choice follow the migration’s dependencies and risk, with freeze, backup, synchronization, validation and rollback criteria prepared before the event. [AWS migration cutover guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-migration-cutover/cutover-stage.html).

Schema change is not content migration. Sanity documents that changing a schema does not automatically transform existing documents, while Supabase and Payload both expose explicit migration workflows. The implementation plan therefore needs expand–migrate–validate–contract sequencing rather than dashboard-only edits. [Sanity schema and content migrations](https://www.sanity.io/docs/content-lake/schema-and-content-migrations), [Supabase database migrations](https://supabase.com/docs/guides/deployment/database-migrations), [Payload migrations](https://payloadcms.com/docs/database/migrations).

### Development Workflows and Tooling

The implementation workflow should make every meaningful system change reviewable and reproducible from the repository. At minimum, version:

- application and renderer code;
- the block/component registry and its context/nesting rules;
- HSG domain schemas, provider normalizers and generated types;
- database or CMS schema/content migrations;
- representative content and media fixtures safe for non-production use;
- authorization/RLS policies where applicable;
- deployment, validation, migration, smoke and reconciliation scripts;
- architecture decision records for later architecture work; and
- runbooks, content ownership and supported-version policy.

The preferred change path is short-lived branch → required pull-request checks → protected immutable preview → human review of exact code/content revisions → tested production candidate → authorized promotion → external verification. GitHub rulesets can require status checks, code-owner approval and fresh review after changed code; GitHub environments can scope secrets and deployment protections, although entitlements vary by plan and repository visibility. [GitHub rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets) and [deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).

Code release and editorial publication remain separate change streams. A content publish may not have a Git commit, while a model or renderer change must not bypass code review merely because a CMS UI can make it. The release record should correlate code commit/deployment, schema version, content revision/release, relevant region/locale and verification result.

Option-specific workflow consequences are:

| Option | Repository-controlled implementation work | Extra discipline required |
|---|---|---|
| Managed headless CMS | Schemas/models where supported, migrations, generated types, adapters, preview, renderer and webhook handlers | Isolated environments/datasets, validation of existing content, entitlement tracking, configuration/export inventory and provider API version pinning |
| Custom Supabase admin | SQL migrations, RLS, functions, generated types, seeds, admin UI, workflow state machine, renderer and jobs | Local reset, database/RLS tests, serialized production migrations, representative branch fixtures and separate Storage-object recovery |
| Git-backed content | Content schemas, content files, media references, codemods, editor configuration, renderer and build workflow | Conflict/build-queue handling, scheduled trigger reliability, content PR ergonomics and safe large-media strategy |
| Self-hosted CMS | CMS configuration/extensions, application/runtime, database migrations, adapter and renderer | Supported-version upgrades, infrastructure, secrets, email, object storage, backup/restore, capacity and vulnerability response |
| Federated/hybrid | Source adapters, canonical IDs, reconciliation, projections and renderer | Explicit authority per field, conflict policy, cross-system tracing and combined failure/runbook ownership |

For Supabase, the official local workflow supports version-controlled migrations, seed data, local reset, database tests and generated TypeScript types. Preview branches do not carry production data, so deterministic representative fixtures are a requirement rather than a convenience. [Supabase local development](https://supabase.com/docs/guides/local-development/overview), [database testing](https://supabase.com/docs/guides/database/testing), [generated types](https://supabase.com/docs/guides/api/rest/generating-types).

Agent-friendly delivery requires a pinned runtime and lockfile, non-interactive documented commands, stable uniquely named CI checks, machine-readable validation output, scoped environment configuration and safe fixtures. Agents should receive read-only or draft-only credentials by default, operate through branches/PRs, declare migration and rollback effects, and never hold routine production publish, domain, destructive database or secret authority. Workflow tokens should use least privilege; third-party actions should be pinned to full commit SHAs and secrets protected from accidental pushes. [GitHub secure use reference](https://docs.github.com/en/actions/reference/security/secure-use).

### Testing and Quality Assurance

Reliable rendering needs a layered portfolio; no single end-to-end suite can cover the combinatorial space of blocks, regions, locales, schedules and media states.

**Blocking pull-request checks:**

- schema and content-fixture validation, including existing documents affected by a model change;
- pure resolver tests for publication state, timezone, schedule/expiry, region inheritance, locale fallback and consent withdrawal;
- provider-adapter contract tests against missing, unknown, malformed and old/new schema versions;
- component tests for every registered block, including empty, boundary, loading, failure and prohibited-context states;
- authorization/RLS and draft-leak tests;
- a production build and representative route generation;
- automated accessibility checks and critical keyboard behavior;
- targeted responsive visual comparisons for high-risk compositions and background imagery;
- migration rehearsal plus forward-fix/restore evidence;
- dependency, code-scanning, secret and configuration-policy checks; and
- critical browser flows through preview, approval, publish, verification and unpublish/rollback.

**Scheduled or broader checks:** full route/link/media crawl; wider browser, viewport, region and locale matrix; scheduled publication/expiry and webhook-reconciliation scenarios; repeated performance runs; visual suite; and degraded external-integration tests.

**Manual and periodic checks:** representative screen-reader and keyboard evaluation, non-technical-editor task testing, urgent cancellation and testimony-withdrawal drills, and isolated recovery exercises for code, content, schema/database and media. W3C guidance notes that no single accessibility tool can determine accessibility, and Playwright similarly recommends combining automation with manual and inclusive evaluation. [W3C test and evaluate guidance](https://www.w3.org/WAI/test-evaluate/) and [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing).

Preview is a quality gate only if it uses the production renderer and exact resolved revision. Test the inherited base, region, locale, viewport, scheduled time, draft references and responsive crop that the approver is authorizing. Keep previews authenticated, non-indexed and uncached; do not expose management tokens in browser code or URLs. A screenshot should be paired with semantic assertions for content identity, event/announcement state, CTA, asset, canonical/robots metadata and resolved region/locale.

Next.js documents unit, component, integration and end-to-end approaches and recommends E2E coverage for async Server Components. Playwright provides browser assertions, trace artifacts and screenshot comparisons; visual baselines should run in a consistent operating system/browser environment. Lighthouse can add lab regression checks in CI, while field telemetry remains necessary for user performance. [Next.js testing guide](https://nextjs.org/docs/app/guides/testing), [Playwright CI](https://playwright.dev/docs/ci), [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots), [Lighthouse overview](https://developer.chrome.com/docs/lighthouse/overview).

Composition changes the test burden. Fixed templates have the smallest state space. Governed modular blocks require per-block executable states, allowed-parent/context tests and a curated pairwise page matrix. Hybrid slots require both template-invariant and permitted-slot tests. Unrestricted builders make exhaustive visual, accessibility and agent verification impractical; if retained as an option, the PRD must constrain nesting, layouts, design tokens, responsive behavior and unsupported combinations.

### Deployment and Operations Practices

Treat code, schema/model, content and assets as related but separately recoverable change streams. Use isolated development/preview environments with synthetic or sanitized fixtures, a production-like validation target where justified, and production. Promote a tested immutable application candidate when the platform supports it; do not rebuild different bits after approval. Vercel documents immutable deployment URLs, protected previews and deployment checks that can hold a candidate before domain promotion. [Vercel deployments](https://vercel.com/docs/deployments/overview), [deployment protection](https://vercel.com/docs/deployment-protection), [deployment checks](https://vercel.com/docs/deployment-checks).

Every release should have a rollback or forward-fix decision, external semantic smoke tests and an owner. The smoke check must verify critical text/state, assets, region/locale and content revision—not only a successful HTTP response. Deployment rollback does not restore mutable CMS/database records, schema state or deleted media.

For model/data evolution, use expand–migrate–validate–contract:

1. add compatible fields/types while readers still accept the old form;
2. deploy compatible readers before new-only writers;
3. rehearse against an isolated dataset/export;
4. run an idempotent backfill with counts, failures and revision IDs;
5. validate affected documents and representative renders;
6. switch writers/editors;
7. observe and retain a restore/forward-fix path; and
8. remove old fields/parsers only in a later release after proving zero use.

Operational signals should cover public semantic availability, publish-to-visible latency and stale age by content type, preview failures, webhook age/retry/deduplication/reconciliation, scheduled-job success, build/deploy/rollback outcome, broken media, provider latency/status, storage/egress and budget/quota thresholds. Correlate signals by deployment, content revision, region and locale. Independent monitoring is necessary because provider dashboards and SLAs do not measure HSG’s complete user journey.

Define separate RTO, RPO, retention and restore procedures for code/deployment, content and revisions, schema/model state, original assets and derivatives, identities/secrets, and external projections/jobs. Supabase explicitly notes that database backups do not include Storage objects; asset recovery must therefore be designed and tested separately if that option is used. [Supabase backups](https://supabase.com/docs/guides/platform/backups). AWS guidance calls for business-defined recovery objectives and tested recovery procedures, not the existence of a backup checkbox. [AWS disaster-recovery guidance](https://docs.aws.amazon.com/wellarchitected/2024-06-27/framework/rel-13.html).

Scheduled publication, expiry, cache reconciliation, Calendar channel renewal and asset cleanup must be idempotent, concurrency-safe, observable and manually replayable. Production runbooks should cover bad publication, code regression, provider outage, asset loss, account compromise, stale invalidation, external-source failure and runaway spend. Incident practice needs named command/operations/communications responsibilities, a live record and early declaration; Google’s SRE incident guidance emphasizes predefined roles, communication and prioritizing mitigation before root-cause work. [Google SRE incident response](https://sre.google/workbook/incident-response/).

### Team Organization and Skills

Every production responsibility needs a named primary and trained backup even when one person fills several roles:

- **product/content owner:** content scope, business rules, prioritization and acceptance;
- **editorial governance owner:** roles, approval, schedule, emergency unpublish, regional ownership and training;
- **content-model/platform owner:** schemas, migrations, vendor configuration and portability;
- **frontend/design-system owner:** renderer, block registry, responsive media, accessibility and performance;
- **backend/integration/security owner:** adapters, RLS/authorization, jobs, secrets, audit and external services;
- **deployment/reliability owner:** CI/CD, monitoring, incidents, rollback, backups/restores and cost signals;
- **privacy/consent decision owner:** testimony collection, minors where applicable, withdrawal, retention and evidence; and
- **regional editor champions:** validate inheritance, localization and real editorial workflows.

Option choice changes the skill concentration. A managed headless CMS reduces CMS infrastructure work but still needs content modeling, integration, workflow administration, export and vendor-management competence. A custom Supabase admin requires product ownership of an internal application plus full-stack TypeScript/Postgres, RLS, migration, usability, accessibility and support skills. Git-backed content needs strong Git/CI ownership and ongoing editor enablement. Self-hosting adds runtime, database, object storage, email, patching, capacity, backup and on-call competence. A hybrid adds authority mapping, reconciliation and cross-vendor incident diagnosis.

Before launch, train editors on common tasks, validation errors, exact preview, request-review/publish roles, scheduling, regional fallback, media rights/alt text and emergency unpublish. Train technical owners on migration/rollback, secret rotation, provider outage, asset restore, reconciliation and incident communication. Run these as witnessed tasks rather than document-read acknowledgements.

### Cost Optimization and Resource Management

Compare options over at least a three-year total-cost horizon:

`subscription + seats + environments + usage + media/CDN + observability/security + backup/DR + implementation + recurring engineering/editor support + expected incident cost + migration/exit cost`

The input model should state launch and growth assumptions for editors/publishers, roles, regions/locales, content records, changes per day, traffic/event bursts, API requests, original-media storage, transforms/egress, builds/previews, branches/environments, log retention and support/SLA. Show a base case plus sensitivity to editor count, traffic/media and regional growth; do not compare a managed plan’s price with only the raw database bill for a custom admin.

Principal option-specific drivers are:

- **managed CMS:** seats, custom roles/workflows, locales/regions/spaces, environments, releases/scheduling, API/CDN/image-transform volume, asset traffic, retention/backups, SSO, SLA and support;
- **custom Supabase:** admin implementation and continuing product support, project compute per environment, database/storage, egress/transforms/functions/auth, PITR/log drains, email, frontend hosting and recovery/security labor;
- **Git/static:** repository seats, CI/build minutes, preview/hosting traffic, image processing, media storage, editor layer and support for build or merge failure;
- **self-hosted:** license/support where relevant, application capacity, database, object storage/CDN/cache, WAF/DNS/email, monitoring, backups, patching/upgrades, vulnerability response and on-call; and
- **hybrid:** combined vendor bills plus adapters, reconciliation and cross-system support.

Current vendor pages demonstrate why capabilities must be priced against the exact HSG scenario on a dated quote. Contentful gates locales, roles, API/asset usage and governance by plan; Storyblok gates traffic, locales, preview URLs, scheduled content, roles/workflows, releases, SLA and backup features; Supabase bills an organization plan plus per-project compute and variable services; Vercel combines plan and usage charges. [Contentful pricing](https://www.contentful.com/pricing/), [Storyblok pricing](https://www.storyblok.com/pricing), [Supabase billing](https://supabase.com/docs/guides/platform/billing-on-supabase), [Vercel pricing](https://vercel.com/pricing).

Use caching and last-known-good delivery to reduce upstream calls where freshness permits, expire preview/branch environments, cap media dimensions and formats, define artifact/log retention, and place budgets/alerts around each environment. Supabase notes that preview branches are full environments with separate compute and that branch compute is not covered by a spend cap, so lifecycle cleanup must be automated if used. [Supabase branching usage](https://supabase.com/docs/guides/platform/manage-your-usage/branching) and [cost controls](https://supabase.com/docs/guides/platform/cost-control).

Track provider bills and labor with unit measures such as cost per active editor, published change, 1,000 visits, GB of delivered media and active region. A nominally free or open-source option can have higher TCO if editor support, upgrades or incident recovery consume scarce engineering time.

### Risk Assessment and Mitigation

| Risk | Options most exposed | Mitigation and PRD gate |
|---|---|---|
| Custom admin expands into an underfunded CMS product | Custom Supabase | Bound launch scope; cost workflow, usability, accessibility, support, security and migrations; pass real-editor acceptance before selection |
| Required governance, localization, retention or SLA causes a plan jump | Managed CMS | Build an entitlement matrix from exact scenarios; obtain dated quotes and renewal/overage assumptions |
| Non-technical editors cannot use Git reliably | Git/static | Run observed task trials and set completion, error and support thresholds |
| Unrestricted composition creates untestable rendering states | Freeform builders | Prefer a closed registry or specify hard nesting/layout/token/responsive limits and pairwise test coverage |
| Preview differs from public rendering or from the approved revision | All | Same renderer, revision-bound preview, resolved inheritance display and post-publish revision verification |
| Existing content becomes invalid after a model change | All | Validate the full affected corpus; use expand–migrate–validate–contract and compatibility retention |
| Provider outage breaks public pages | Live-delivery topologies | Define last-known-good behavior and separate editor-plane/public-plane SLOs; test provider degradation |
| Dropped/duplicated webhook or job leaves stale critical content | Dynamic/ISR/federated | Idempotency, replay, scheduled reconciliation, freshness alerts and semantic probes |
| Backup omits assets, history, workflow or configuration | All | Maintain a recovery inventory, asset backup and configuration-as-code/export; rehearse full restore |
| Regional fallback leaks or misattributes content | All regional models | Explicit inheritance rules, provenance in preview, authorization boundaries and resolver tests |
| Testimony is published or retained without valid consent | All | Separate consent evidence, fail-closed publication, immutable audit and withdrawal/unpublish drill |
| Agent or compromised account publishes harmful content | All | MFA, least privilege, separate identities, draft-only agent default, human promotion, audit and fast revoke/unpublish |
| Usage spike or abandoned environments create runaway cost | Usage-priced services | Budgets, alerts/caps where effective, environment ownership/TTL, attribution and monthly variance review |
| Vendor pricing, entitlement, acquisition or product direction changes | Managed/self-hosted product dependency | Portability contract, export/re-import proof, contract review, exit estimate and supported alternative |
| Self-hosted patch, capacity or single-owner failure | Self-hosted | Supported-version/upgrade policy, named on-call and backup, capacity test, vulnerability SLA and witnessed recovery |
| Launch deadline drives premature irreversible choice | Every option | Time-box the bake-off, select by pre-agreed evidence, ship the thinnest complete control path and defer optional composition/integrations |

## Technical Research Recommendations

These recommendations define a decision and implementation envelope for the PRD. They deliberately do not select the final CMS, storage topology, rendering topology or vendor; that belongs to later architecture work after the PRD fixes the requirements and the bake-off produces evidence.

### Implementation Roadmap

**Gate 0 — Decision inputs.** Complete the content/asset/consent inventory; name editor, approver, regional and operational roles; set weights and pass/fail thresholds; define availability, freshness, RTO/RPO, preview and agent-authority requirements; and price the exact entitlement scenarios.

**Gate 1 — Evidence spike.** Implement the common vertical slice in the credible finalists. Observe non-technical editors and exercise schedule, cancellation, withdrawal, background crop, media failure, regional fallback, exact preview, approval, publish verification, agent draft and export/re-import. Record implementation effort and projected three-year TCO.

**Selection gate.** Choose an option only after resolving failed thresholds or explicitly accepting them. Preserve the scorecard, vendor quotes, export evidence and decision rationale for later architecture work. Do not treat an attractive authoring demo as proof of reliable delivery or recovery.

**Foundation increment.** Establish the typed domain contract and closed renderer registry, identity/roles, exact preview, schema/migration discipline, CI/preview/promotion pipeline, monitoring correlation and recovery inventory. Deliver one content class end to end.

**Editorial increment.** Add the highest-change fixed content types—events, announcements, testimonies and media—with workflow, validation, scheduling/expiry, consent and emergency-unpublish behavior. Expand governed blocks only after template flows are stable.

**Reuse and integration increment.** Add global/regional/locale resolution, provenance, asset/background management, reconciliation and selected external integrations. Test degraded dependencies and burst/freshness expectations.

**Migration and readiness gate.** Rehearse import, final delta, redirects, corpus validation, editor sign-off, asset and consent checks, semantic smoke tests, rollback and full restore. Train primary/backup owners and conduct incident drills.

**Cutover and hypercare.** Freeze or control old editing, run final sync, promote the verified candidate, monitor external semantics and freshness, reconcile content/assets, and retain the rollback checkpoint until defined exit criteria are met.

### Technology Stack Recommendations

The following are option-neutral stack constraints for the PRD and subsequent architecture evaluation:

- Keep public UI components in a typed, HSG-owned renderer with runtime schema validation, a closed/versioned block registry and explicit unknown-version behavior.
- Use fixed schemas for high-frequency repeatable records; if composable pages are required, evaluate governed blocks or bounded slots rather than assuming unrestricted WYSIWYG composition.
- Place a provider adapter between storage/CMS APIs and the renderer’s canonical content model so a vendor document shape does not become the UI contract.
- Keep schema/model changes, migrations, normalizers, generated types, fixtures, policies and deployment scripts in Git regardless of the authoring product.
- Require exact authenticated preview using the production renderer, immutable or revision-identifiable releases, external semantic verification and last-known-good behavior where freshness permits.
- Use a single deployable web application plus bounded jobs/worker functions as the default implementation scale; require evidence before adding independently operated services.
- Use component/unit/contract tests plus Playwright browser journeys, accessibility evaluation, targeted visual regression and performance/field telemetry.
- If Supabase is selected, require version-controlled SQL, RLS/authorization tests, local reset/seeding, generated-type checks, idempotent jobs and independent Storage backup.
- If a managed CMS is selected, require isolated model-change rehearsal, existing-document validation, plan-entitlement proof, configuration inventory and export/re-import testing.
- If Git-backed or self-hosted content remains under consideration, require editor-task and operational-readiness gates that expose the support or on-call cost before selection.

### Skill Development Requirements

Minimum capability coverage is:

- structured content modeling and lifecycle/workflow design;
- TypeScript/React/Next.js rendering, runtime validation and design-system governance;
- responsive images, focal crops, media rights, accessibility and performance;
- test automation across unit, contract, component, browser, visual and accessibility layers;
- Git/CI/CD, protected preview, promotion, observability and incident response;
- provider-specific CMS migration/API knowledge or Postgres/Supabase SQL, RLS and recovery knowledge, depending on selection;
- localization, region inheritance and time-zone/scheduling semantics;
- privacy/consent handling for testimonies and auditable urgent withdrawal;
- cost modeling, quotas, vendor entitlement/contract review and exit planning; and
- safe agent workflows: scoped identities, deterministic commands/fixtures, reviewable changes and human production gates.

Any missing production-critical capability needs an explicit training, specialist or managed-support plan plus a named backup; it should not be hidden as assumed platform behavior.

### Success Metrics and KPIs

The PRD should set baselines, targets, measurement windows and owners for:

| Outcome | Candidate measures |
|---|---|
| Editorial usability | Task completion rate; median time/error/help per common edit; training time; support requests per 100 changes; preview success |
| Workflow integrity | Draft-to-review time; approval-to-public p50/p95/max; percentage resolving the approved revision first time; unauthorized or bypassed publishes |
| Time-sensitive correctness | Scheduled publish/expiry verification; stale critical-content incidents; emergency cancellation and testimony-withdrawal time |
| Preview/render quality | Preview-parity defects after publish; unknown-block/fallback rate; broken-reference and broken-media rate; responsive-background defects |
| Regional reuse | Incorrect-region exposures; fallback/provenance defects; time and effort to launch a region or locale; unauthorized cross-region resolution |
| Public reliability | At least the stated 99.9% semantic availability objective with locations/exclusions defined; critical-route success; provider/cache/revalidation age; error-budget consumption |
| Delivery performance | Pull-request lead time; deployment frequency; change-fail and deployment-rework rate; failed-deployment recovery time; CI flake rate |
| User experience | Core Web Vitals at the 75th percentile; accessibility defects by automated/manual discovery; key-page performance budget compliance |
| Recovery | Measured RTO/RPO and restore success for code, content, schema/database and media separately; age of last witnessed recovery exercise |
| Security and agent safety | MFA coverage; privileged identities; access-review completion; audit completeness; agent changes using scoped identities and required previews; unauthorized production actions |
| Cost efficiency | Monthly actual versus forecast; cost per editor, published change, 1,000 visits and GB media; seat utilization; unused environment spend; projected exit cost |
| Operational resilience | Critical responsibilities with primary and backup owners; runbook/drill coverage; MTTD/MTTA/MTTR; incident action closure |

Targets should distinguish infrastructure availability from content freshness and semantic correctness. A stale, blank or wrong-region `200` response is not successful content delivery even if hosting uptime remains green.

## Research Synthesis

### Executive Summary

HSG's decision is larger than choosing a CMS. The website needs a content operating model that lets non-technical people change time-sensitive structured records and selected page presentation without weakening accessibility, regional correctness, approval integrity or public reliability. That creates three independent design axes: **what editors may compose**, **where and how content is authored and governed**, and **how validated content is rendered and recovered publicly**. Treating these axes as one product choice hides the most important trade-offs.

The research finds that repeatable, high-change content such as events, announcements, testimonies and media benefits from fixed semantic models. Curated landing pages can add governed blocks or bounded slots when the PRD demonstrates a real composition need. Unrestricted page builders offer maximum apparent freedom but create an unbounded responsive, accessibility and test state space. Sanity's current structured-page guidance similarly recommends modeling content for meaning rather than presentation and questions whether a page builder is needed before introducing one. [Sanity structured page-building guidance](https://www.sanity.io/docs/developer-guides/how-to-use-structured-content-for-page-building).

On the authoring axis, a managed headless CMS buys a mature editor surface and may buy workflow, releases, localization and preview—but those capabilities and recovery guarantees are frequently plan-gated. A custom Supabase admin offers exact HSG behavior and database control but makes HSG the product and operations team for an internal CMS. Git-backed content is operationally attractive for developer-reviewed, lower-frequency material but must prove that HSG's non-technical editors can use it reliably. Self-hosting trades vendor SaaS dependency for patching, scaling, backup and on-call ownership. A federated model can preserve specialist sources but adds authority, reconciliation and incident complexity.

No final platform or topology is selected here. The decision-ready outcome is a PRD framework: define non-negotiable lifecycle, approval, preview, regional, privacy, freshness, recovery and agent-authority requirements; price the exact purchasable plans; and run a common working slice with real editors. Select later architecture from observed evidence rather than marketing completeness.

**Key Technical Findings**

- **Separate the three axes.** A fixed event template can use Supabase, a managed CMS or Git; a governed page can render statically, through ISR or dynamically. The composition model does not determine the storage vendor or delivery mode.
- **Use semantic structure as the stable boundary.** HSG-owned domain contracts and a closed renderer registry protect UI reliability, regional reuse, migration and agent verification from provider-specific document shapes.
- **Bound composition.** Fixed templates have the smallest failure surface; governed blocks add valuable flexibility at a known testing cost; hybrid templates with slots are a middle pattern; unrestricted builders conflict with reliable rendering unless tightly constrained.
- **Approval must bind what users will see.** Preview should resolve the exact content revision, references, inherited global/regional values, locale, responsive media and scheduled state using the production renderer.
- **Published is an observable state.** For time-sensitive content, the platform accepting a publish command is insufficient; HSG needs publish-to-public verification, freshness metrics, replay/reconciliation and an emergency unpublish path.
- **Authoring and delivery failure should be decoupled where practical.** Last-known-good or pre-rendered delivery can keep public pages useful during CMS/database disruption, subject to explicit safe-stale limits.
- **Content, schema, assets and code are separate recovery streams.** A hosting rollback cannot recover a deleted image, mutated content, consent record or destructive model migration.
- **Regional reuse needs provenance.** Editors and reviewers must see whether a value is global, inherited, overridden or localized; silent fallback creates both correctness and authorization risks.
- **Agent friendliness is controlled automation, not broad access.** Current provider guidance supports schema-aware tools, but also reinforces drafts, review, narrow project/tool scopes and non-production access. [Supabase MCP guidance](https://supabase.com/docs/guides/ai-tools/mcp), [Contentful AI-assisted development guidance](https://www.contentful.com/developers/docs/extensibility/app-framework/ai-recommendations/).
- **Editor accessibility is part of platform quality.** W3C ATAG covers both accessibility of the authoring tool and its ability to help authors produce accessible output. [W3C ATAG overview](https://www.w3.org/WAI/standards-guidelines/atag/).

**Strategic Technical Recommendations Without Architecture Selection**

1. Put a managed CMS finalist and a bounded custom Supabase-admin spike through the same evidence test; admit Git-backed or self-hosted finalists only if HSG accepts their editor-support or operations model.
2. Require fixed semantic content types for frequent records and demand evidence before adding governed composition; exclude unrestricted layout/code authoring from the default PRD envelope.
3. Make exact preview, human approval, public verification, regional provenance, emergency unpublish and separate asset recovery platform-independent acceptance criteria.
4. Compare three-year total cost, including implementation, editor support, environments, media, observability, recovery, incident ownership and exit—not only subscription or database price.
5. Preserve reversibility through versioned schemas/migrations, provider adapters, original-asset retention and an export/re-import rehearsal before final selection.

### Table of Contents

1. [Technical Research Introduction and Methodology](#1-technical-research-introduction-and-methodology)
2. [Content UI and Management Landscape and Architecture](#2-content-ui-and-management-landscape-and-architecture)
3. [Implementation Approaches and Best Practices](#3-implementation-approaches-and-best-practices)
4. [Technology Stack Evolution and Current Trends](#4-technology-stack-evolution-and-current-trends)
5. [Integration and Interoperability Patterns](#5-integration-and-interoperability-patterns)
6. [Performance and Scalability Analysis](#6-performance-and-scalability-analysis)
7. [Security, Privacy and Accessibility Considerations](#7-security-privacy-and-accessibility-considerations)
8. [Strategic Technical Recommendations](#8-strategic-technical-recommendations)
9. [Implementation Roadmap and Risk Assessment](#9-implementation-roadmap-and-risk-assessment)
10. [Future Technical Outlook and Innovation Opportunities](#10-future-technical-outlook-and-innovation-opportunities)
11. [Technical Research Methodology and Source Verification](#11-technical-research-methodology-and-source-verification)
12. [Technical Appendices and Reference Materials](#12-technical-appendices-and-reference-materials)

### 1. Technical Research Introduction and Methodology

#### Technical Research Significance

Content correctness is part of website reliability for HSG. An event cancellation that remains cached, a regional announcement shown to the wrong audience, a testimony that cannot be withdrawn, or a background image that destroys text contrast can all return HTTP `200` while failing users. Frequent non-technical editing therefore has to be designed together with validation, approval, rendering, monitoring and recovery.

The authoring interface is also part of the product boundary. W3C defines CMS products, WYSIWYG editors and no-code site builders as authoring tools and distinguishes accessibility of the tool itself from its support for producing accessible content. This makes editor usability and accessibility selection criteria, not post-selection polish. [W3C Authoring Tool Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/atag/).

Structured content is strategically relevant because it lets the same semantic record be reused in different pages, regions and future channels while the frontend retains presentation control. Current Contentful and Sanity documentation both center schemas/content models, typed fields, relationships and APIs as the bridge between editing and delivery. [Contentful data model](https://www.contentful.com/developers/docs/concepts/data-model/) and [Sanity schema introduction](https://www.sanity.io/docs/apis-and-sdks/introduction-to-schemas).

#### Technical Research Methodology

- **Technical scope:** UI composition, authoring/data options, rendering and caching, workflow/preview, integration, region/locale resolution, media, security, accessibility, deployment, migration, recovery, cost and agent operation.
- **Inputs:** HSG's product brief/addendum plus current first-party documentation from framework, hosting, database, CMS, testing and standards bodies.
- **Analysis framework:** separate the three architecture axes; map HSG lifecycles and risks; compare qualitative option fit; identify universal constraints; validate implementation consequences; define evidence gates.
- **Time period:** sources and commercial capability pages were checked on 2026-07-14. Vendor features, prices, plan names and quotas remain volatile and require a dated procurement check.
- **Evidence policy:** platform-specific statements use official documentation; cross-platform recommendations are reasoned synthesis and are labelled as such. No unobserved benchmark, editor result or vendor SLA is presented as HSG evidence.

#### Goals and Objectives Achieved

The research:

- compares fixed templates, governed modular blocks, bounded hybrid slots and freeform builders;
- compares custom Supabase, managed headless CMS, Git-backed, self-hosted and federated authoring models;
- accounts for the distinct lifecycles of events, announcements, testimonies, media and backgrounds;
- specifies non-technical editor, preview, approval and emergency-operation criteria;
- defines region/locale reuse, provenance and failure requirements;
- evaluates delivery reliability, migration, observability, recovery and cost implications;
- turns agent-friendly deployment into least-privileged, reproducible controls; and
- produces PRD options and decision constraints without choosing the final architecture.

### 2. Content UI and Management Landscape and Architecture

#### Three Independent Decision Axes

| Axis | Main options | Decision question | Must not be confused with |
|---|---|---|---|
| UI composition | Fixed templates; governed blocks; hybrid slots; freeform builder | How much page structure may an editor change? | Where content is stored |
| Authoring and governance | Managed CMS; custom Supabase admin; Git-backed; self-hosted; federated | Who provides and operates editing, workflow, versions, roles and media UX? | How every public request renders |
| Public delivery | Build-time/static; on-demand regeneration/ISR; dynamic SSR; client fetch; hybrids | What freshness, resilience and cost behavior does each route/content type need? | Which editor interface is used |

This separation prevents false comparisons such as “fixed templates versus Supabase” or “blocks versus headless CMS.” A block model can be stored in Supabase, and a managed CMS can expose only fixed event forms.

#### Composition Pattern Comparison

| Pattern | Editorial freedom | Reliable rendering | QA state space | Best-fit use | Principal constraint |
|---|---:|---:|---:|---|---|
| Fixed semantic template | Low | Very high | Low | Events, announcements, testimonies, media records, contact/location facts | New structural presentation generally needs a code release |
| Governed modular blocks | High within registry | High if bounded | Medium–high | Curated landing/campaign pages with recurring design-system modules | Requires registry governance, nesting/context rules, versioning and pairwise tests |
| Hybrid template with slots | Medium | High | Medium | Domain page with invariant fields plus optional editorial sections | Boundaries between domain data and presentation slots must remain explicit |
| Unrestricted/freeform builder | Very high | Low–variable | Unbounded | Only where layout autonomy outweighs consistency and assurance | Responsive, accessibility, migration and agent verification become disproportionately difficult |

The practical distinction is not “templates or blocks everywhere.” The PRD should classify content types by lifecycle and composition need. Repeated operational records should not be encoded as generic page blocks merely to gain editing flexibility, while a curated home page need not require a developer for every permitted section reorder.

#### Authoring and Governance Comparison

| Option | Non-technical editor fit | Workflow/preview maturity | Initial engineering | Ongoing HSG operations | Portability/exit concern |
|---|---:|---:|---:|---:|---|
| Managed headless CMS | Usually high | Medium–high, plan-dependent | Medium | Low–medium | Proprietary models/APIs, plan gates, incomplete export of operational state |
| Custom Supabase admin | Potentially high after design | Must be built | Very high | Medium–high | Data is accessible, but custom workflow/UI logic is HSG-specific |
| Git-backed CMS/content | Variable; must be tested | PR/preview oriented | Medium | Low–medium plus editor support | Text history is portable; media, hosted indexes and workflow state still need exit proof |
| Self-hosted CMS | Often medium–high | Product-dependent | Medium–high | High | Code/data access is stronger, but upgrade and extension compatibility can bind |
| Federated/hybrid | Depends on each source | Cross-system | High | High integration burden | Authority, identifiers and projections must be reconstructable |

A managed service removes some infrastructure work, not accountability. HSG still owns its content model, renderer, workflow configuration, access, exports, external monitoring and escalation. A custom admin is not “just forms over tables”; it is a continuing internal product with workflow state, versions/diffs, review recovery, media handling, accessibility, audit and support.

#### Architecture Principles That Survive Option Choice

- Use a canonical HSG domain model between providers and rendering.
- Keep a closed/versioned component registry with explicit unknown-version behavior.
- Model content meaning separately from presentation tokens and layout code.
- Resolve publication, region, locale, references and schedule centrally and deterministically.
- Bind approval to a resolved, identifiable revision and invalidate it when dependencies materially change.
- Separate authoring availability from public delivery availability where safe-stale content is acceptable.
- Prefer idempotent asynchronous work with replay and reconciliation over assuming webhook/job perfection.
- Keep consent evidence and sensitive testimony workflow separate from public display fields.
- Correlate deploy, schema and content identities in logs, previews and verification.
- Preserve the simplest deployable boundary that meets the evidence; independently operated services require a concrete scaling or isolation need.

### 3. Implementation Approaches and Best Practices

#### Common Vertical-Slice Evaluation

Each serious finalist should implement the same test slice: a timezone-aware event cancellation, expiring regional announcement, testimony approval/withdrawal, responsive background, degraded media embed, governed page section, global inheritance plus regional override/locale fallback, exact preview, reject/resubmit, publish verification, prior revision recovery, agent-created draft and export/re-import. This slice exposes the differences that feature checklists obscure.

Set non-negotiables and score weights before the trial. Observe representative editors completing tasks without developer intervention; record completion, errors, assistance, time, preview fidelity, permission failures, publish latency, restore time, export fidelity, implementation effort and projected operating cost. GOV.UK recommends realistic, goal-oriented moderated tasks with actual or likely users, while W3C recommends involving users with disabilities and combining user testing with standards evaluation. [GOV.UK moderated usability testing](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing) and [W3C involving users](https://www.w3.org/WAI/test-evaluate/involving-users/).

#### Development and Release Workflow

The reproducible path is local/agent validation → pull request → required checks → protected immutable preview → human approval → tested candidate → authorized promotion → external semantic verification. GitHub rulesets and environments can enforce parts of this path, with plan/repository-visibility constraints checked during procurement. [GitHub rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets) and [deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).

Content publication remains a separate pipeline because an editor may publish without a code commit. A release manifest should correlate the application commit/deployment, schema/model version, content revision or release, region/locale and verification result.

#### Quality Portfolio

Use layered evidence:

- schema and corpus validation;
- pure lifecycle/region/locale/time resolver tests;
- provider-adapter contract tests;
- per-template/block component and accessibility checks;
- RLS/authorization and draft-leak tests;
- representative production builds;
- critical browser journeys with trace artifacts;
- responsive visual comparison for risky compositions/backgrounds;
- migration and restore rehearsal;
- broader scheduled route/link/media, browser, locale and integration-degradation suites; and
- manual screen-reader, editor usability, urgent-unpublish and recovery exercises.

Next.js documents unit, component, integration and E2E approaches and recommends E2E tests for async Server Components; Playwright supplies browser, trace, accessibility integration and visual-comparison mechanisms. Automation still cannot establish accessibility on its own. [Next.js testing](https://nextjs.org/docs/app/guides/testing), [Playwright CI](https://playwright.dev/docs/ci), [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing).

#### Migration and Rollout

Use inventory → canonical classification → field/reference/asset mapping → idempotent dry-run import → corpus and render validation → editor acceptance → freeze/final delta → cutover → semantic smoke/reconciliation → retained rollback window. Migrate dependencies before dependents and retain stable source IDs, checksums and old-to-new URL/reference maps.

Model changes use expand–migrate–validate–contract. Sanity explicitly notes that schema changes do not automatically rewrite documents, Contentful supports scripted environment/model migration with limits on what export/import preserves, and Supabase uses repository migrations/seeds with separate Storage recovery. [Sanity migrations](https://www.sanity.io/docs/content-lake/schema-and-content-migrations), [Contentful import/export](https://www.contentful.com/developers/docs/tutorials/cli/import-and-export/), [Supabase migrations](https://supabase.com/docs/guides/deployment/database-migrations).

### 4. Technology Stack Evolution and Current Trends

#### Durable Stack Capabilities

| Capability | Durable HSG requirement | Product-specific expression to evaluate later |
|---|---|---|
| Typed application layer | Static types plus runtime validation at external/content boundaries | TypeScript/Next.js and generated CMS/database types are a plausible implementation, not a CMS decision |
| Structured model | Semantic content types, references, lifecycle and version compatibility | CMS schema, Postgres schema/admin metadata, or repository schema |
| Rendering system | HSG-owned template/block registry and fail-safe resolver | React/Next.js components or a later equivalent |
| Authoring workflow | Draft, review, approval, schedule, revision, audit and emergency unpublish | Vendor workflow/release features or HSG-built state machine |
| Preview | Authenticated exact-revision rendering with region/locale/time controls | CMS visual preview, application draft mode or custom preview session |
| Delivery | Per-content freshness, last-known-good behavior and semantic verification | Static build, ISR/regeneration, dynamic server rendering or bounded hybrid |
| Operations | Versioned migrations, CI, observability, replay, backup and restore | Managed platform features plus HSG-owned evidence/runbooks |
| Agent workflow | Machine-readable schemas/errors, deterministic commands, scoped drafts and human promotion | CLI/API/MCP integration only within the same controls |

The relevant trend is toward structured, API-addressable content with visual preview, release workflow and increasingly schema-aware agent tooling. Contentful now documents content-management APIs and MCP access; Sanity documents schema-aware content agents and draft bundles; Supabase exposes project-scoped/read-only MCP options but states that its MCP integration is for development/testing and should not connect to production data. [Contentful developer documentation](https://www.contentful.com/developers/docs/), [Sanity Content Agent](https://www.sanity.io/docs/content-agent), [Supabase MCP security recommendations](https://supabase.com/docs/guides/ai-tools/mcp).

These features are useful selection signals but poor architectural anchors: some are experimental, usage-priced or entitlement-dependent. HSG should anchor on schemas, permissions, audit, drafts, exports and reproducible commands, then treat vendor AI as replaceable acceleration.

#### Adoption and Deprecation Discipline

- Pin runtime, SDK and API versions where supported and commit lockfiles.
- Track supported CMS/self-host versions and name an upgrade owner.
- Put deprecation/removal behind content-usage queries and compatibility retention.
- Validate the existing corpus when rules tighten; many platforms validate new edits without automatically repairing old data.
- Keep vendor entitlements and pricing snapshots dated because current plan matrices can change faster than the implementation.
- Require an export, re-import and replacement-adapter estimate before treating portability as proven.

### 5. Integration and Interoperability Patterns

#### Provider Boundary

The renderer should request canonical content from an HSG adapter rather than embed provider query shapes across UI components. The adapter owns authentication, pagination, preview/published perspectives, normalization, error classification, version mapping and cache metadata. Runtime validation stops malformed or unexpectedly evolved provider data at the boundary.

#### Event and Publication Integration

Use signed webhooks or equivalent notifications as low-latency hints, not the sole source of truth. Verify authenticity and timestamp, deduplicate by event/revision, acknowledge quickly, perform bounded idempotent work, retry, dead-letter or record terminal failure, and reconcile periodically from authoritative state. A duplicate webhook should be harmless and a lost webhook should become detectable stale age.

Scheduled work—publication/expiry verification, reconciliation, Calendar renewal and asset cleanup—needs explicit ownership, overlap safety, replay and last-success signals. External sources such as Calendar or YouTube should be projected behind stable HSG identifiers with freshness and approved fallback behavior rather than queried directly from every UI component.

#### Formats and Protocols

HTTPS plus JSON/REST or GraphQL is sufficient for candidate CMS APIs; SQL/Postgres is suitable inside a custom Supabase boundary. Webhooks plus reconciliation are suitable for content-change propagation. No evidence currently justifies HSG-owned service mesh, Kafka-class broker, gRPC estate, distributed transaction protocol or event-sourced CMS.

Canonical data formats should make timezone, locale, region, lifecycle, consent/publication, references, media metadata and schema version explicit. Asset references should separate immutable original identity from transform/delivery URLs.

#### Integration Failure Matrix

| Failure | Required behavior |
|---|---|
| CMS/database unavailable | Serve safe last-known-good/pre-rendered content where policy allows; show controlled fallback otherwise |
| Webhook missing or duplicated | Deduplicate, retry/replay and reconcile; alert on stale age |
| Calendar/media provider unavailable | Preserve last verified projection or approved fallback; expose freshness internally |
| Referenced content unpublished | Block approval or render an explicit safe fallback according to content type |
| Unknown schema/block version | Fail closed for unsafe content; preserve page shell and observability rather than crash entire route |
| Region/locale missing | Apply explicit allowed fallback with provenance; never infer across an authorization boundary |
| Asset transform/original missing | Use approved fallback and alert; retain independently restorable originals |

### 6. Performance and Scalability Analysis

#### Rendering Strategy by Freshness Class

| Delivery mode | Strength | Constraint | Candidate HSG use subject to PRD targets |
|---|---|---|---|
| Static/build-time | Fast, resilient, inexpensive at request time | Publish latency and build fan-out | Low-frequency pages and safely stale content |
| On-demand regeneration/ISR | Balances cached delivery and editorial freshness | Invalidation/revalidation correctness must be observable | Most public content if publish latency targets permit |
| Dynamic server rendering | Fresh per request and flexible authorization | Couples latency/availability/cost to dependencies unless cached | Preview and content with genuinely strict real-time needs |
| Client-side fetch | Interactive and independently refreshable | Loading/SEO/accessibility complexity; tokens must remain server-side | Bounded live widgets, not primary page content by default |
| Hybrid | Per-route/per-fragment trade-off | More states to understand and test | Mixed sites once freshness classes are explicit |

Select by content risk rather than globally. An event cancellation may need a much shorter maximum publish-to-visible time than a background-image change; a testimony withdrawal may need a strict unpublication objective even if ordinary testimony publication is slower.

#### Optimization and Capacity Planning

- Cache normalized/published content with versioned keys and explicit safe-stale limits.
- Invalidate narrowly by stable content/reference dependency and reconcile in case invalidation is lost.
- Precompute or bound expensive regional/locale resolution.
- Validate and transform images at ingestion; preserve focal metadata and use responsive delivery.
- Cap original dimensions/file sizes and avoid letting editors upload arbitrary unoptimized backgrounds.
- Load-test launch and expected growth for route count × region × locale, edit bursts, preview concurrency, publish fan-out, API quota and media egress.
- Measure real-user performance and critical route behavior; lab scores alone do not describe field experience.

No performance benchmark is claimed by this research because no finalist has been implemented against HSG's corpus or traffic. The PRD should define budgets and the bake-off should produce comparable measurements. Lighthouse can prevent selected lab regressions in CI; field telemetry should track Core Web Vitals and application-specific user outcomes. [Lighthouse overview](https://developer.chrome.com/docs/lighthouse/overview).

#### Reliability Measurement

The stated 99.9% public objective needs an external semantic SLI: monitoring location, frequency, custom domain/TLS, critical route, meaningful content/state, media, exclusions and owner. At 99.9%, an average 30-day month permits roughly 43 minutes 50 seconds of unsuccessful measurement, but separate freshness and correctness objectives remain necessary. A stale or wrong-region `200` is not a success.

Track publish-to-visible p50/p95/max, stale age, cache/revalidation failure, provider latency, job/webhook lag, broken assets and approved-revision match. Set independent recovery objectives for code, content, schema and media.

### 7. Security, Privacy and Accessibility Considerations

#### Security Boundaries

- Keep delivery and management credentials server-side and separated.
- Enforce least privilege at API/database boundaries; client UI hiding is not authorization.
- Require MFA and named identities for publishers and privileged administrators.
- Give agents separate project-scoped, read-only or draft-only identities by default; prohibit routine production data/MCP access.
- Authenticate webhooks, protect preview entry/bypass URLs as secrets and prevent draft indexing/caching.
- Log actor, action, target, before/after revision, approval and production verification without placing private testimony content in operational logs.
- Pin dependencies/actions, scan secrets and introduced dependencies, and maintain an owned vulnerability/update process.

NIST's Secure Software Development Framework provides organization-level practices for integrating secure development into the lifecycle, while OWASP SAMM offers a risk-driven maturity framework rather than a one-size prescription. [NIST SSDF](https://csrc.nist.gov/pubs/sp/800/218/final) and [OWASP SAMM](https://owasp.org/www-project-samm/).

#### Testimony Privacy and Consent

The PRD must define who may submit, review, publish and withdraw a testimony; how consent and provenance are evidenced; any special handling for minors; what edits require renewed approval; retention/deletion; and the maximum withdrawal-to-unpublish time. Keep private contact/consent data out of the public content projection. Publication should fail closed when required evidence is missing, and withdrawal must invalidate public delivery and caches quickly.

Specific legal wording, retention and minor-consent rules require qualified review against HSG's operating jurisdictions. This research defines the technical decision points but does not provide a legal conclusion.

#### Accessibility and Authoring Governance

Test both public rendering and the editor workflow. The authoring option should support accessible keyboard navigation, comprehensible labels/errors/status, non-visual identification of draft/live state and tools that prompt for alt text, heading structure, link purpose and other required metadata. Background imagery needs responsive crop and contrast review using the actual rendered overlay/text.

Automated axe-style checks, semantic snapshots and visual regression are useful gates but must be supplemented with keyboard, representative screen-reader and user evaluation. [W3C evaluation guidance](https://www.w3.org/WAI/test-evaluate/) and [Playwright accessibility guidance](https://playwright.dev/docs/accessibility-testing).

#### Audit and Governance

Define separation-of-duty requirements by content risk rather than assuming one global workflow. Urgent announcements may need fast authorized publication with retrospective review; testimonies may require independent approval; low-risk media metadata may use lighter control. Approval must become stale when a referenced or inherited dependency changes materially. Emergency actions should be fast, individually attributed and followed by reconciliation.

### 8. Strategic Technical Recommendations

#### PRD Decision Framework

Classify requirements into **non-negotiable**, **weighted** and **informational** before evaluating products.

| Category | Candidate non-negotiable | Candidate weighted evidence |
|---|---|---|
| Editorial | Routine HSG content changes without developer intervention; clear draft/live state | Task time, errors, assistance, training and support load |
| Governance | Required roles/approval; audit; emergency unpublish | Workflow flexibility, release ergonomics and entitlement cost |
| Preview | Exact production renderer and revision; authenticated/non-indexed | Viewport, region, locale and schedule controls |
| Reliability | Public verification, failure fallback and stated availability/freshness behavior | Publish latency, degraded behavior and operational effort |
| Region/locale | Explicit precedence, provenance and authorization | Ease/cost of regional rollout and independent publishing |
| Media | Original retention, responsive metadata and recovery | Editor crop UX, transformation cost and DAM capability |
| Testimony | Consent gate, restricted fields and withdrawal path | Reviewer UX and reporting |
| Engineering | Versioned schema/migrations, API/CLI, deterministic non-production setup | SDK quality, local development and test ergonomics |
| Agent safety | Scoped identity, draft/PR default and human production gate | Machine-readable tools, errors, audit and conflict UX |
| Portability | Content/assets export and recovery inventory | Re-import fidelity, adapter effort and contractual exit support |
| Cost | Affordable exact launch capability and named owner | Three-year TCO, sensitivity and renewal/overage exposure |

#### Option Qualification, Not Selection

- **Managed CMS:** qualify exact plan capabilities, API limits, workflow/role/localization/preview entitlements, backup/retention, SLA/support, export gaps and renewal assumptions.
- **Custom Supabase:** qualify the complete admin-product effort, RLS/authorization, revision/workflow model, scheduling, preview, media UX, editor accessibility, object backup, support and migration ownership.
- **Git-backed:** qualify through real non-technical-editor trials, build/index latency, scheduling, media churn, authentication and support burden.
- **Self-hosted:** qualify only with named primary/backup operators, supported upgrade policy, vulnerability SLA, capacity test and witnessed full recovery.
- **Federated:** qualify only when a specialist source must remain authoritative; document canonical IDs, authority per field, conflict/reconciliation and cross-vendor incident ownership.

#### Strategic Value for HSG

The technical advantage is operational trust: editors can update quickly, reviewers can approve exactly what will appear, regional teams can reuse content without hidden drift, the public site remains useful during upstream failure, and agents can accelerate delivery without acquiring uncontrolled authority. These qualities reduce dependence on individual developers while preserving a coherent design system.

#### Patterns to Exclude Unless New Evidence Appears

Unrestricted HTML/layout code in content, a general-purpose CMS/DAM/workflow product built from scratch, HSG-owned microservices/service mesh, active-active multi-region authoring, distributed database complexity, Kafka-class brokers, gRPC estate, event sourcing/full CQRS and synchronous dependency chains on every public request are currently disproportionate to the stated problem.

### 9. Implementation Roadmap and Risk Assessment

#### Evidence-Gated Roadmap

1. **Baseline:** inventory content, URLs, assets and consent; define owners, lifecycles, region/locale rules, volume, freshness, RTO/RPO and non-negotiables.
2. **Qualification:** construct exact-plan/vendor and custom-build capability/TCO matrices; eliminate failures on non-negotiables.
3. **Vertical slice:** implement and measure the shared slice in credible finalists with editors, reviewers and agents.
4. **Selection gate:** record scores, failed thresholds, accepted risks, dated quotes and export evidence for subsequent architecture work.
5. **Foundation:** deliver canonical contracts, registry, identity/roles, exact preview, migrations, CI/promotion, monitoring and recovery inventory for one content class.
6. **Editorial expansion:** add events, announcements, testimonies, media/backgrounds and only then required governed composition.
7. **Regional/integration expansion:** add provenance-aware inheritance/locales, projections, reconciliation and selected external services.
8. **Migration rehearsal:** dry-run import, validate corpus/routes/assets/consent, obtain editor acceptance and rehearse rollback/restore.
9. **Pilot and cutover:** bounded real-editor rollout, training/runbooks, freeze/final delta, semantic smoke checks and predefined go/no-go/rollback thresholds.
10. **Stabilization:** monitor freshness/correctness/cost, close defects and retain the old export/path until rollback and decommission criteria are met.

This sequence defines dependencies rather than a calendar commitment. The delivery plan should map it to HSG's target date only after the inventory, team capacity and finalist evidence are known.

#### Consolidated Technical Risk Register

| Risk | Impact | Primary control | Decision evidence |
|---|---|---|---|
| Custom admin scope is underestimated | Launch delay and continuing support debt | Bound MVP; cost full workflow/recovery/accessibility | Working slice and lifecycle TCO |
| CMS feature is plan-gated | Unplanned cost or missing control | Exact entitlement matrix and dated quote | Contract/plan proof |
| Editor workflow fails in practice | Developer dependency or publication error | Observed representative task tests | Completion/error/help thresholds |
| Composition becomes unbounded | Visual/accessibility regressions | Closed registry, limits and pairwise tests | Representative responsive pages |
| Preview approves wrong state | Trust and governance failure | Exact resolved revision/provenance | Preview-to-public parity test |
| Webhook/job fails silently | Stale critical content | Idempotency, replay, reconciliation and freshness alert | Loss/duplicate fault injection |
| Region fallback is wrong | Incorrect audience or leakage | Explicit precedence/provenance/auth tests | Region/locale matrix |
| Testimony lacks valid consent | Privacy and reputational harm | Restricted evidence, fail-closed publish, withdrawal drill | Audit and unpublish evidence |
| Backup omits assets/config/history | Incomplete recovery | Recovery inventory and independent asset/config backup | Isolated full restore |
| Agent/account is overprivileged | Destructive or unauthorized change | Separate scoped draft identity, MFA and human promotion | Permission-negative tests/audit |
| Vendor direction/pricing changes | Cost or migration shock | Adapter, export/re-import and exit estimate | Portability rehearsal |
| Self-hosting has single-owner risk | Extended outage/security exposure | Primary/backup, upgrade/vulnerability policy, drills | Witnessed operational readiness |
| Traffic/media/environment usage spikes | Runaway spend | Attribution, alerts/caps, TTL cleanup and forecast review | Load/cost sensitivity model |
| Deadline forces irreversible shortcut | Long-term operational debt | Thin complete control path; defer optional scope | Gate-based go/no-go |

#### Resource Planning

Name accountable primary and backup owners for content/product, editorial governance, content model/platform, frontend/design system/accessibility, integration/security, deployment/reliability/cost, privacy/consent and regional editing. One person may cover multiple functions in a small team, but no production-critical responsibility should be implicit.

### 10. Future Technical Outlook and Innovation Opportunities

#### Near Term: One to Two Years

Structured schemas, visual preview, release workflow and schema-aware agent APIs are likely to continue converging in CMS and database tooling. Current examples already include Contentful MCP/agent guidance, Sanity schema-aware content agents and Supabase project-scoped MCP. HSG should exploit them first for discovery, validation, migrations, metadata suggestions and draft preparation under existing review controls.

#### Medium Term: Three to Five Years

Expect greater automation around content health, translation, dependency impact, accessibility prompting and multichannel transformation, but vendor-specific APIs, pricing and governance will continue to move. A semantic HSG model, stable IDs, explicit provenance and provider adapters preserve the ability to adopt improvements without rewriting the public renderer or weakening approval.

#### Long-Term Direction

The durable goal is not autonomous publishing. It is policy-aware content operations where people set intent and approve risk, while automation detects stale/invalid content, proposes bounded changes, proves impact and executes repeatable delivery/recovery controls. Any move toward broader automation should be earned through measured accuracy, reversible drafts, strong audit and narrower blast radius.

#### Candidate Innovation Experiments

- Content-health reports for expired announcements, orphaned media, missing alt text, stale events and unused blocks.
- Impact previews showing every route/region/locale affected by a shared-content change.
- Agent-created draft bundles with provenance, validation and conflict detection.
- Automated responsive background/crop and contrast preflight for human review.
- Region launch simulators that expose inherited, missing and overridden values before publication.
- Release manifests and external probes that prove the exact code/content/schema combination users received.

Review architecture assumptions when editor count, regions/locales, content volume, publish frequency, external sources, privacy requirements, reliability targets or operational team capacity materially change—not merely when a new vendor feature appears.

### 11. Technical Research Methodology and Source Verification

#### Primary Source Groups

- **Web and delivery:** [Next.js documentation](https://nextjs.org/docs), [Vercel deployment documentation](https://vercel.com/docs/deployments/overview).
- **Managed content platforms:** [Sanity documentation](https://www.sanity.io/docs), [Contentful developer documentation](https://www.contentful.com/developers/docs/), [Storyblok documentation](https://www.storyblok.com/docs).
- **Custom data/admin platform:** [Supabase documentation](https://supabase.com/docs).
- **Git-backed and self-hosted references:** [Decap CMS documentation](https://decapcms.org/docs/), [Payload documentation](https://payloadcms.com/docs).
- **Testing and accessibility:** [Playwright documentation](https://playwright.dev/docs/intro), [W3C WAI](https://www.w3.org/WAI/), [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview).
- **Security and operations:** [NIST SSDF](https://csrc.nist.gov/pubs/sp/800/218/final), [OWASP SAMM](https://owasp.org/www-project-samm/), [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [Google SRE Workbook](https://sre.google/workbook/table-of-contents/).
- **Delivery workflow:** [GitHub Actions and deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).

Commercial pages such as CMS, Supabase and Vercel pricing were used only as dated evidence of cost categories and feature gates, not as durable quotes or HSG cost estimates.

#### Web Search and Verification Coverage

Research queries covered current official documentation for:

- Next.js rendering, draft/preview, caching, revalidation, testing, instrumentation, image and deployment behavior;
- Vercel immutable deployments, protection, checks, rollback, cron, observability, pricing and usage;
- Supabase auth/RLS, migrations, branching, backups/Storage, testing, billing/cost controls and MCP security;
- Sanity schemas, page composition, localization/perspectives, releases, migrations, agent tools, billing and backup;
- Contentful models, environments, workflows/releases, localization, migrations/export gaps, pricing and agent guidance;
- Storyblok visual editing, workflows/releases/locales, migrations and pricing/entitlements;
- Payload production/migrations and Decap editorial workflow/deploy preview;
- GitHub rulesets, deployment approvals, secret/supply-chain security and CI controls;
- Playwright testing/accessibility/visual comparison, W3C accessibility/authoring guidance, Lighthouse, NIST, OWASP, AWS reliability/cutover and Google SRE incident response.

#### Quality Assurance and Confidence

- **High confidence:** separation of decision axes; bounded-composition consequences; need for exact preview, layered tests, least privilege, explicit recovery streams and measured migration. These are supported across standards and multiple platform implementations.
- **Medium confidence pending HSG evidence:** relative finalist fit and operating effort. Actual fit depends on content inventory, editor trials, exact vendor plan, team skill and the working slice.
- **Not yet evidenced:** HSG-specific performance, usability times, migration volume/error rate, total cost, recovery duration and vendor acceptance. These must be measured rather than inferred.

#### Research Limitations

- No production application or final content corpus exists in scope for benchmarking.
- No representative HSG editor sessions or accessibility evaluation of finalist admin interfaces have been run.
- No vendor security/DPA/contract review, negotiated quote or support reference has been completed.
- Pricing, plan entitlements, quotas and AI features can change after the research date.
- Vendor documentation describes intended product behavior; critical requirements still need HSG acceptance and failure testing.
- Legal requirements for testimony consent, minors, retention, data residency and regional operation require qualified advice.
- This report intentionally stops before final architecture and does not choose a CMS, database topology or rendering strategy.

### 12. Technical Appendices and Reference Materials

#### Appendix A: Option Scorecard Template

Weights and pass thresholds must be set before trials; the table intentionally contains no winner.

| Criterion | Type | Evidence artifact | Candidate weight/threshold owner |
|---|---|---|---|
| Routine editor tasks without developer | Non-negotiable | Moderated task recording and errors | Product/content owner |
| Exact revision/provenance preview | Non-negotiable | Preview/public parity trace | Editorial governance |
| Required roles and approval | Non-negotiable | Permission-negative tests and audit | Governance/security |
| Public freshness and degraded behavior | Non-negotiable | Publish and provider-failure tests | Reliability owner |
| Testimony consent/withdrawal | Non-negotiable | Lifecycle/audit/unpublish drill | Privacy/content owner |
| Region/locale resolution | Non-negotiable | Matrix with inherited/override cases | Regional owner |
| Media/background workflow | Weighted | Editor task, responsive visual and recovery | Design/content owner |
| Schema/migration ergonomics | Weighted | Rehearsal and corpus validation report | Engineering owner |
| Agent-safe workflow | Weighted | Draft/PR task and permission audit | Engineering/security |
| Three-year TCO | Weighted | Assumption/sensitivity worksheet | Product/cost owner |
| Export/re-import/exit | Non-negotiable or weighted by PRD | Recovery/portability rehearsal | Platform owner |
| Vendor support/SLA/roadmap | Informational or weighted | Dated quote/contract/reference | Procurement/owner |

#### Appendix B: PRD Questions That Must Be Answered

1. Which types are fixed records, which pages need governed blocks, and what nesting/context limits apply?
2. What are maximum publish-to-visible and safe-stale times for each content class, including cancellation and withdrawal?
3. Does “published” mean authoring-system acceptance or verified public visibility?
4. Which changes require a different approver, and what invalidates an approval?
5. What exact revision, references, inheritance, locale, viewport and scheduled time does preview bind?
6. What launch and growth route × region × locale counts, edits, traffic bursts and media volume should trials use?
7. Which fields inherit globally, which require explicit regional ownership, and can regional/locale variants publish independently?
8. What testimony consent, minor handling, retention, withdrawal and unpublication rules apply?
9. What are RTO, RPO and retention for code, content/revisions, schema, assets, secrets and external projections separately?
10. Must rollback reproduce exact historical binaries/content or only restore current valid state?
11. What draft, preview, schema, promotion, rollback, production-data and secret authorities may agents hold?
12. Which vendor-plan workflow, role, localization, release, backup, audit, SLA and support dependencies are acceptable?
13. How will 99.9% semantic availability, freshness, correctness and regional behavior be externally measured?
14. What three-year usage/editor/region growth assumptions and exit cost will govern selection?
15. What failure in the vertical slice disqualifies an option versus becoming an explicitly accepted trade-off?

#### Appendix C: Measurement Plan Instead of Fabricated Benchmarks

| Dimension | Bake-off measurement |
|---|---|
| Editor usability | Success, time, error, assistance and perceived confidence for representative tasks |
| Preview | Draft-to-preview latency and exact revision/region/locale parity |
| Publication | Approval-to-verified-public p50/p95/max and scheduled success |
| Reliability | Provider outage, dropped/duplicate webhook, job overlap and last-known-good behavior |
| Rendering | Representative route generation, critical-request latency and field Core Web Vitals after pilot |
| Media | Upload/validation/transform time, responsive output, broken asset behavior and restore |
| Migration | Records/assets/references/URLs reconciled, exceptions, time and idempotent rerun result |
| Recovery | Code, content, schema and media RTO/RPO measured independently |
| Agent safety | Task completion through scoped draft/PR identity; denied production actions; review evidence |
| Cost | Exact plan plus modeled usage, engineering/support hours, environments, observability and exit |

#### Appendix D: Terminology

- **Fixed template:** a semantic content type with frontend structure controlled by code.
- **Governed block:** a registered structured module with bounded fields, contexts and responsive behavior.
- **Hybrid slot:** a fixed domain template with specifically permitted composable regions.
- **Authoring plane:** editor UI, management APIs, drafts, workflow, permissions and content writes.
- **Delivery plane:** public read path, renderer, caches/CDN and public assets.
- **Resolved revision:** the exact item plus references, inheritance, locale and schedule state rendered for review/publication.
- **Last known good:** a previously validated public representation served when the authoritative source is temporarily unavailable and policy allows staleness.
- **Reconciliation:** periodic comparison with authoritative state to repair or expose missed events.
- **Provider adapter:** HSG-owned translation from vendor/storage APIs to the canonical domain contract.

## Technical Research Conclusion

### Summary of Key Technical Findings

The strongest general pattern is **structured content with bounded composition, explicit governance and decoupled reliable delivery**. That statement does not choose a CMS: fixed templates and governed blocks describe editor composition; managed CMS, Supabase, Git and self-hosting describe responsibility allocation; static, regenerated and dynamic rendering describe delivery behavior. HSG can combine them only after the PRD makes their interfaces and quality targets explicit.

Managed headless CMS and custom Supabase admin represent the clearest primary economic comparison: buy and configure mature content operations versus build and own an exact internal product. Git-backed, self-hosted and federated approaches remain valid conditional options when HSG accepts their editor, operations or integration implications. The common evidence slice, not a generic feature list, should decide which candidates survive.

### Strategic Technical Impact Assessment

The PRD can now specify outcomes without prematurely encoding a vendor: routine editor independence; risk-tiered approval; exact resolved preview; measured publication; bounded design freedom; regional provenance; testimony withdrawal; recoverable originals; safe degraded delivery; and scoped agent participation. This preserves architectural freedom while preventing later design from trading away essential editorial or reliability properties.

### Next Steps Technical Recommendations

1. Convert the Appendix B questions into explicit PRD requirements, assumptions and open decisions.
2. Complete the machine-readable content/URL/asset/consent inventory and launch/growth usage model.
3. Set non-negotiables, score weights and disqualification thresholds with editors, product, privacy and engineering owners.
4. Obtain exact plan/entitlement quotes and size the bounded custom-admin effort on the same lifecycle scope.
5. Run the common vertical slice and editor/accessibility trials.
6. Feed the measured result into later architecture work; do not infer the final architecture from this report alone.

---

**Technical Research Completion Date:** 2026-07-14  
**Research Period:** Current technical analysis using sources verified through 2026-07-14  
**Source Verification:** First-party vendor documentation, standards bodies and authoritative engineering guidance  
**Technical Confidence:** High for cross-option patterns and constraints; medium for HSG-specific option fit until trials, quotes and operational evidence exist  
**Architecture Status:** Deliberately not selected

---

<!-- Content will be appended sequentially through research workflow steps -->
