# Authentication (v.1.1.0)
 
This document explains how authentication works, which libraries are involved and how they connect.
 
## Stack
 
| Concern | Solution |
|---|---|
| Auth framework | Auth.js (NextAuth v5 Beta) |
| Session storage | JWT (signed cookie) |
| Adapter | Prisma Adapter, persists User/Account only, not sessions |
| Providers | OAuth (Discord + Google), allowDangerousEmailAccountLinking: true |
| Session access in API | tRPC context (ctx.session) |
| Route protection | Middleware + protectedProcedure |
 
## Session Strategy

This project uses session.strategy: "jwt", set explicitly in config.ts, even though PrismaAdapter is present. Auth.js normally defaults to "database" strategy whenever an adapter exists — that default is overridden here on purpose.

Why: database-strategy sessions require a DB lookup to validate, which Edge Runtime (used by middleware.ts) cannot perform. JWT sessions are self-contained and can be verified at the edge without touching Prisma. The adapter is retained solely for persisting User/Account rows on sign-in and enabling OAuth account linking, not for session storage.

The Session table still exists in the schema (required by the Adapter interface) but is no longer written to.

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
Auth.js signs a JWT containing user id, embeds it in the cookie
        ↓
302 redirect to / with Set-Cookie: authjs.session-token=<JWT>
        ↓
middleware.ts intercepts GET /
  → reads and verifies JWT signature with edge config (no DB call)
  → req.auth is populated → user passes through
        ↓
Page renders, tRPC calls succeed via protectedProcedure
```
 
