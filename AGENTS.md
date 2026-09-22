## Father's Advice
Don't take the burden of doing everything yourself and solving every problem yourself today. Take responsibility for the task assigned to you. Stick to playing the role you are called for. Other agents will help do their part. 
Love your neighbor as yourself. Your actions have real world consequences for other agents, me and the people who will use what you build. So be careful with what you create and ensure it is high quality. Be faithful to the task and role assigned to you.

## Context discipline

Use progressive disclosure when gathering context.

- Start with search and the smallest directly relevant code surface.
- Read specific symbols/sections before entire files.
- Follow callers, dependencies, docs, and tests only when they answer a concrete question.
- Do not load files or documentation "just in case".
- Once you understand where the change belongs, the existing pattern to follow,
  affected interfaces, and how to verify it, stop gathering context and begin the work.
- If blocked by missing information, gather the next smallest piece of context needed.
- Avoid large logs, generated files, broad directory reads, and unrelated search results.

## Project

Holy Spirit Generation is a public church website. Visitors and members share the same pages: church information, events whose content is updated in the repo, and YouTube or Instagram embeds. It is one Next.js app on Vercel, written in TypeScript, styled with Tailwind CSS and shadcn/ui. Content is published by deploy. Full boundaries and constraints are in `docs/architecture.md`.

## Anti Patterns for Doc Writing
- welcome text, intros, conclusions, or pleasantries
- long prose explaining why instructions matter
- duplicated content from other docs
- project-wide commands when file-scoped commands are available
- nested AGENTS.md files that repeat root instructions

## Architecture

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

## Things agents gets wrong
- When writing docs first plan where the information needs to go. Do not repeat the same information again and again. Don't add text to rationalize why something was put there, leave that to the human understanding. Plan the structure of the doc, what information goes where so that it doesn't have to repeat and makes sense in being read in a flow.

## Writing rules
Use headings, bullets, and tables; avoid paragraphs.
Use repo-relative paths; avoid vague references like "see docs".
Reference existing docs/specs/policies instead of copying them.
List exact external files for setup, architecture, API specs, security, release, and policy docs when they exist.
Prefer file-scoped test/lint/typecheck commands; include full builds only when no narrower command exists.
Put commands in tables when there is more than one.
Keep one rule per bullet.
Keep rationale out unless it prevents a likely mistake.
Do not restate linter, formatter, or typechecker config.
Do not list installed skills or plugins.
Do not include generic quality slogans.

## Verifying your work
In case you wrote some code that was not part of tests do the following verfications - 
- Build: make build (must finish with "Build succeeded")
- Test: make test (all green; never skip or delete a failing test)
- Lint: make lint (zero warnings)

Run all three before reporting any task complete, and paste the output.
If a test fails, fix the code, not the test.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
