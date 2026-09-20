---
name: backend-design
description: >
  Design application backends built on Supabase before implementation.
  Use when designing a feature involving data models, Auth, authorization,
  RLS, Storage, RPCs, Edge Functions, Realtime, ownership, or backend
  boundaries.
---

# Supabase Application Design

Before writing migrations or code, establish the backend design.

## 1. Model the domain

Identify:

- entities
- ownership
- cardinality
- lifecycle
- invariants
- deletion behavior

Do not begin with tables.

## 2. Design the data model

Prefer relational modeling for durable application state.

For each entity specify:

- primary key
- foreign keys
- uniqueness constraints
- required fields
- lifecycle timestamps
- indexes implied by access patterns

Use JSONB only for genuinely unstructured or variable data.

## 3. Establish trust boundaries

For every operation decide who performs it:

- browser using Supabase client
- Postgres function/RPC
- Edge Function
- privileged server process

Do not use an Edge Function merely to hide normal CRUD.

Prefer direct database access protected by RLS for ordinary
user-owned CRUD.

Use privileged backend execution when the operation:

- requires secrets
- crosses authorization boundaries
- performs privileged administration
- integrates with external services
- requires trusted validation unavailable through RLS

## 4. Design authorization before implementation

For every table identify:

- who can SELECT
- who can INSERT
- who can UPDATE
- who can DELETE
- how ownership is established
- whether administrators need elevated access

RLS is the default authorization boundary for exposed application data.

Never design a table first and add RLS as an afterthought.

## 5. Design around Auth identity

Treat `auth.users` as authentication identity, not the application's
complete user/domain model.

Create application tables for domain-specific user information and
reference the authenticated user ID where appropriate.

## 6. Review the complete feature

Before implementation produce:

### Entities
...

### Relationships
...

### Access patterns
...

### Authorization
...

### Client vs server operations
...

### Storage
...

### Realtime
...

### Risks / unusual decisions
...
