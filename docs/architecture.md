# Holy Spirit Generation — Architecture

High-level architecture only. Feature design waits for the vertical slice that needs it.

## System Overview

Public website for Holy Spirit Generation. Visitors and members share the same pages: church information, events that gain content over time, and YouTube or Instagram embeds on one or two pages.

```
Visitors and members
         |
         v
+------------------------+
|   Church website       |
|   Next.js on Vercel    |
+-----------+------------+
            |
     +------+------+
     |             |
     v             v
 YouTube       Instagram
 (embed)       (embed)

Content lives in the repository and is published by deploy.
```

## Major Components

- **Church website** — one Next.js app. The only product surface.

## Technology Choices

- **Hosting:** Vercel.
- **Frontend:** Next.js App Router, TypeScript. Pages are static unless a feature needs per-request data.
- **UI:** Tailwind CSS and shadcn/ui.
- **Brand:** `public/brand/hsg-logo.jpg`. Navy `#020411`, blue `#06154b`, gold `#d0af3b`.
- **Content:** files in the repository, published by deploy.

## System Boundaries

- YouTube and Instagram stay external. This site embeds them.
- No backend until a feature needs persisted server state or a trusted server. Supabase is allowed then.

## Architectural Constraints

- Add a backend only when a feature needs persisted server state or a trusted server.
- Add member accounts only when a feature needs private content.
- Design schemas, APIs, and workflows in the slice that needs them.
- The first slice that needs a deferred decision sets the pattern. Later slices follow it.
- Theme the UI from the logo. Do not introduce a second palette.

## Deferred Decisions

- Authentication and authorization.
- Embed mechanism, content file format, event model, and page structure.

## Decisions Made

1. **Audience** — Visitors seeking information and members who want to know more, on one public site.
2. **Hosting** — Vercel.
3. **Backend** — Optional. Supabase is available, not a default.
4. **Scope** — Public information, updatable events, and embeds. Page details wait for each slice.
5. **Publishing** — Content lives in the repository and reaches the site through a Vercel deploy.
6. **Frontend** — Next.js App Router.
7. **Language** — TypeScript.
8. **UI** — Tailwind CSS and shadcn/ui.
9. **Brand** — The church logo is the gold-on-navy globe mark. The site palette is that navy, blue, and gold.
