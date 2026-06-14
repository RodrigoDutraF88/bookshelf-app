# Authentication (v.1.0.0)
 
This document explains how authentication works, which libraries are involved and how they connect.
 
## Stack
 
| Concern | Solution |
|---|---|
| Auth framework | Auth.js (NextAuth v5 Beta) |
| Session storage | Database (via Prisma Adapter) |
| Providers | OAuth (Discord) + optional Credentials |
| Session access in API | tRPC context (ctx.session) |
| Route protection | Middleware + protectedProcedure |
 
