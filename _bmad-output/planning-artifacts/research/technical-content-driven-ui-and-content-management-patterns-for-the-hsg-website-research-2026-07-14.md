---
stepsCompleted: [1, 2]
inputDocuments:
  - '_bmad-output/planning-artifacts/briefs/brief-hsg-website-2026-07-09/brief.md'
  - '_bmad-output/planning-artifacts/briefs/brief-hsg-website-2026-07-09/addendum.md'
workflowType: 'research'
lastStep: 2
research_type: 'technical'
research_topic: 'Content-driven UI and content-management patterns for the HSG website'
research_goals: 'Compare fixed templates, modular content blocks, custom Supabase admin, headless CMS, and other current approaches for frequent content updates, non-technical editing, approval and preview, reliable rendering, regional reuse, and agent-friendly deployment; provide PRD options, tradeoffs, and constraints without creating the final architecture.'
user_name: 'Udeet'
date: '2026-07-14'
web_research_enabled: true
source_verification: true
---

# Research Report: Technical

**Date:** 2026-07-14
**Author:** Udeet
**Research Type:** Technical

---

## Research Overview

This research evaluates content-driven UI and content-management patterns for the HSG website as decision input for the PRD. It compares implementation and operating models against HSG's editorial, governance, reuse, rendering, and deployment needs without prescribing a final architecture.

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

---

<!-- Content will be appended sequentially through research workflow steps -->
