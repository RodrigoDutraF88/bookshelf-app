# Architecture (v.1.0.3)

This document covers the overall system design, request flow, folder structure, and the reasoning behind key technical decisions.

## Overview

Bookshelf App follows the T3 Stack, a server-centric, full-stack TypeScript architecture. The guiding principle is end-to-end type safety: types flow from the database schema through the API layer into the UI without manual duplication or code generation steps.

### Server Components (SSR)

Server components call tRPC directly via a server side caller, no HTTP round-trip involved. This is used for initial page loads where data must be present before render.

### Client Components (CSR / mutations)

Client components use TanStack React Query with the tRPC React client. All requests go through the /api/trpc HTTP handler.

## Folder Structure
since its still early development, I'll update this later.

### Why tRPC instead of REST or GraphQL?

tRPC infers the full API contract from TypeScript types on the server, no schema file, no code generation, no drift between client and server types. When a procedure's input or output changes, TypeScript surfaces the breakage immediately across the entire codebase.

### Why Prisma instead of direct Supabase queries?

Supabase exposes a JavaScript client that can query the database directly from the browser using Row Level Security (RLS). Instead, all database access goes through Prisma on the server, for three reasons:

1. Centralized authorization: all access control logic lives in tRPC procedures, in TypeScript, testable and auditable in one place.
2. Type safety: Prisma generates types from the schema. Every query result is fully typed.
3. Consistency: one query layer means one set of abstractions to reason about.

### Why NextAuth instead of a simpler solution?

NextAuth is purpose-built for the App Router. It handles the session cookie, OAuth provider integrations, and database persistence via the Prisma Adapter, out of the box. The alternative, rolling your own session logic, introduces security surface area we don't need to own.

The Prisma Adapter stores accounts (and users) in the database. Sessions themselves use JWT strategy rather than database storage, see the Authentication doc's "Session Strategy" section for why.

## The Edge / Node.js Config Split
 
This is the most important architectural constraint in the auth layer.
 
### Why two configs exist
 
Both configs must also agree on session strategy. Since only the Node config has the adapter, `session.strategy: "jwt"` is set explicitly there, see the Authentication doc for details on why the edge config must never be given a database-strategy session.

### Why no RLS?

RLS would be a redundant layer,the tRPC context already scopes every query to the authenticated user. Keeping it out simplifies the database schema.

## Future Considerations

1. Social features: following users, activity feeds will require thinking about public vs private data scopes.

## Delivered Since Last Revision

- External book search via Google Books API (Explore page, Add/Edit modals)
- ISBN barcode scanning (`@zxing/browser`)
- AI-powered reading recommendations (Gemini Flash-Lite)