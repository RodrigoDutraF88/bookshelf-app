# Authentication (v.1.1.0)
 
This document explains how authentication works, which libraries are involved and how they connect.
 
## Stack
 
| Concern | Solution |
|---|---|
| Auth framework | Auth.js (NextAuth v5 Beta) |
| Session storage | JWT (signed cookie) |
| Adapter | Prisma Adapter, persists User/Account only, not sessions |
| Providers | OAuth (Discord + Google), allowDangerousEmailAccountLinking: true, plus a credential-less demo provider |
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

## Demo access

The login page offers "Browse a demo library" so the deployed app can be tried
without an OAuth account. It is a Credentials provider registered under the id
`demo`, and it works precisely because sessions are JWT — the Credentials
provider is incompatible with the database strategy.

`authorize` takes no credentials and reads none. Every call mints a brand new
throwaway `User` with `isDemo: true`, preloaded with a sample library (books,
reading progress, reviews, finish dates spread over the past year so the
dashboard charts have something to plot). There is no shared demo password and
no fixed demo account, so there is nothing to guess and one visitor cannot
disturb another's data.

It lives in `config.ts` rather than `config.edge.ts` because seeding needs
Prisma, which cannot run in the middleware's edge runtime. This does not stop
middleware from accepting demo sessions: the edge config only verifies the JWT
signature, and verification does not require the issuing provider to be
registered.

Demo accounts are disposable. Each demo sign-in first deletes any demo account
older than 24 hours; the `Book`, `ReadingProgress` and `Review` rows follow
through the cascade on `User`. Accounts where `isDemo` is false are never
touched by that sweep.

`isDemo` travels in the JWT and is exposed as `session.user.isDemo`, which lets
`protectedProcedure` resolvers gate on it without a database round trip. The
only feature currently gated is `ai.getRecommendations`, which returns
`FORBIDDEN` for demo accounts so that a public page cannot spend Gemini quota.
