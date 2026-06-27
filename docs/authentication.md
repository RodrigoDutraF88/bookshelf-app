# Authentication (v.1.0.2)
 
This document explains how authentication works, which libraries are involved and how they connect.
 
## Stack
 
| Concern | Solution |
|---|---|
| Auth framework | Auth.js (NextAuth v5 Beta) |
| Session storage | Database (via Prisma Adapter) |
| Providers | OAuth (Discord) + optional Credentials |
| Session access in API | tRPC context (ctx.session) |
| Route protection | Middleware + protectedProcedure |
 
## Session Strategy
 
Auth.js determines the session strategy from the presence of an adapter:
 
| Config | Strategy | Cookie value |
|---|---|---|
| No adapter | `jwt` (default) | Signed JWT (JWE) |
| Adapter present | `database` | Opaque token referencing DB row |
 
This project uses PrismaAdapter, so the strategy is `database`. **This must be declared explicitly** in both config files — not just the full one. Omitting it from the edge config causes the middleware to default to `jwt` and attempt to decrypt an opaque database token as a JWE, producing `JWTSessionError: JWEInvalid` after every OAuth callback.

### File structure
 
```
src/server/auth/
├── config.ts          ← Full config. PrismaAdapter + all callbacks. Node.js only.
├── index.ts           ← Re-exports { auth, handlers, signIn, signOut } from full config.
└── index.edge.ts      ← Edge-safe config. No adapter, no Prisma. Used by middleware only.
```
 
## Auth Flow (Discord OAuth)
 
```
User clicks "Sign in with Discord"
        ↓
POST /api/auth/signin/discord  →  302 to Discord
        ↓
Discord redirects to /api/auth/callback/discord?code=...
        ↓
Auth.js exchanges code for tokens, finds or creates User + Account
        ↓
Prisma INSERT INTO "Session" (opaque token, userId, expires)
        ↓
302 redirect to / with Set-Cookie: authjs.session-token=<opaque>
        ↓
middleware.ts intercepts GET /
  → reads cookie with edge config (database strategy)
  → looks up session in DB via session token
  → req.auth is populated → user passes through
        ↓
Page renders, tRPC calls succeed via protectedProcedure
```
 
