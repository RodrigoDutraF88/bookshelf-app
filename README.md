# 📚 Bookshelf App
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![tRPC](https://img.shields.io/badge/tRPC-v11-398CCB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![CI](https://github.com/RodrigoDutraF88/bookshelf-app/actions/workflows/ci.yml/badge.svg)

**[🔗 Live Demo](https://bookshelf-app-pearl-theta.vercel.app)** &nbsp;·&nbsp; **[🐳 Run with Docker](#run-with-docker)**

No account needed to look around: pick *Try it without signing up* on the login screen.

🇬🇧 English &nbsp;·&nbsp; [🇧🇷 Português](README.pt-BR.md) &nbsp;·&nbsp; [🇮🇹 Italiano](README.it.md)

---

## Overview

Bookshelf App lets you build a personal digital library, track reading progress, and visualize your reading habits over time, search millions of titles via Google Books, scan a barcode to add a book by ISBN, and get personalized AI reading recommendations powered by Gemini.

Built on the **T3 Stack** with end-to-end type safety from database to UI: a schema change in Prisma is felt as a compile error in a React component, with no manual type-syncing or codegen step in between.

## Screenshots


<p align="center">
     <img width="1440" height="777" alt="Screenshot 2026-07-20 at 18 55 08" src="https://github.com/user-attachments/assets/5877c17b-cfc1-4e33-a103-2a23e9f481f6" />
     <img width="1440" height="779" alt="Screenshot 2026-07-20 at 18 55 23" src="https://github.com/user-attachments/assets/9de223a0-3461-4c8e-adfb-cee514d35629" /> 
     <img width="1440" height="778" alt="Screenshot 2026-07-20 at 18 55 50" src="https://github.com/user-attachments/assets/eed9e7cf-cb90-404b-a5ec-2f36e2e9b694" />

<img width="1428" height="777" alt="Screenshot 2026-07-20 at 19 02 10" src="https://github.com/user-attachments/assets/ea12c9ba-51ed-4155-a747-cb9f358f8642" />
     <img width="328" height="607" alt="Screenshot 2026-07-20 at 18 59 17" src="https://github.com/user-attachments/assets/19d8e6ab-c736-416b-bfb7-35a90fdd0bcb" />
<img width="328" height="606" alt="Screenshot 2026-07-20 at 19 00 42" src="https://github.com/user-attachments/assets/02a6318e-9f1e-43e1-a9d5-15d854b47bc8" />
<img width="328" height="604" alt="Screenshot 2026-07-20 at 18 59 41" src="https://github.com/user-attachments/assets/1ad90599-bf54-4563-b64a-a068aab4c6ab" />


</p>


## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict, end-to-end) |
| UI | React 19, Tailwind CSS v4 |
| API | tRPC v11, SuperJSON |
| Database | PostgreSQL (Supabase), Prisma ORM |
| Auth | Auth.js (NextAuth v5 Beta), Prisma Adapter, JWT sessions |
| Validation | Zod |
| Data Fetching | TanStack React Query |
| AI | Google Gemini 2.5 Flash-Lite |
| External APIs | Google Books API |
| Testing | Vitest, mocked Prisma & sessions |
| CI/CD | GitHub Actions → Vercel |
| Containerization | Docker, Docker Compose |
| Env Validation | @t3-oss/env-nextjs |

## Features

- **Personal Library**: add, edit, and remove books with full metadata (title, author, cover, genres, ISBN, publication year)
- **Reading Status**: Want to Read · Currently Reading · Completed · Dropped, with a shelf view organized by category or all-in-one
- **Progress Tracking** : current page, completion percentage, start/finish dates
- **Reviews & Ratings** : 5-star ratings, personal notes, private reading journal
- **Statistics Dashboard** : total books, pages read, average rating, reading streaks, activity over time, genre distribution
- **Explore & Discover** : search millions of books via the Google Books API, view details, add straight to your shelf
- **AI Recommendations** : Gemini-powered personalized suggestions based on completed books, one click away from finding the real title via Google Books
- **Barcode Scanning** : add books instantly by scanning an ISBN barcode with your camera (`@zxing/browser`)
- **OAuth Authentication** : sign in with Discord or Google, with automatic account linking by verified email
- **Responsive, Mobile-First UI** : dedicated mobile bottom nav, desktop top nav, and a fully adapted layout for every screen size


## Engineering Practices

This project was built with production-grade practices, not just "make it work":

- **End-to-end type safety** : tRPC infers the full API contract from server code; a broken contract fails `tsc`, not at runtime
- **CI pipeline** : every push runs typecheck → lint → test → build → Docker smoke test via GitHub Actions ([workflow](.github/workflows/ci.yml))
- **Automated testing** : Vitest unit tests for tRPC routers with mocked Prisma and session context
- **Containerized dev environment** : anyone can clone and run the full stack (app + Postgres) with one command, no local Postgres or Supabase account required, see [Run with Docker](#run-with-docker)
- **Edge/Node runtime split for auth** : middleware runs edge-safe Auth.js config (no Prisma) while API routes use the full Node config, with JWT sessions bridging both consistently
- **Conventional commits** : `feat/`, `fix/`, `chore/` prefixes, branch-per-feature with `--no-ff` merges to preserve history
- **Repo-embedded documentation** — architecture decisions, data model, and auth flow are documented in [`/docs`](docs), not just in code comments

## What I Learned

This project doubled as a hands-on crash course in the T3 Stack, I kept a running list of "things learned" while building it.
**Database & Prisma**
- Prisma's `String` maps to `VARCHAR(191)` by default, OAuth tokens/JWTs can exceed that. `@db.Text` avoids silent truncation.
- Prisma translates TS objects into SQL, manages queries, enforces type safety, and handles migrations.
- `upsert` = `where` (find it) + `create` (if missing) + `update` (if it exists).
**tRPC & validation**
- Zod validates input *before* a procedure runs: `.input(schema).mutation(...)`.
- `.mutation` = write, `.query` = read-only; `ctx` carries `{ db, session }`.
- `...(input?.status && { status: input.status })` — conditional object keys, no `if` pile-up.
- `.refine()` enforces cross-field rules Zod can't express alone (e.g. "at least one of rating/body must be set").
**Architecture & runtime**
- How the App Router actually resolves layouts/pages and server vs. client components.
- Edge Runtime = lightweight, V8-based, web-standard APIs, low latency, trades away full Node compatibility.
- That's why Prisma needs its own Node-only config, separate from edge-safe middleware.
**Shipping it**
- First real CI pipeline: typecheck → lint → test → build via GitHub Actions.
- Deploying to Vercel, env vars, build settings, local vs. serverless quirks.
- Sharper React instincts around server/client boundaries and data fetching.
**External APIs**
- First time treating rate limits as a design constraint, shaped debouncing and minimum query length for Google Books search.
## Documentation

| Doc | Description |
|---|---|
| [Architecture](docs/architecture.md) | System overview, request flow, and decision log |
| [Data Model](docs/data-model.md) | Database schema and entity relationships |
| [Authentication](docs/authentication.md) | Auth.js + tRPC + Prisma Adapter setup |
| [Project Overview](docs/project-overview.md) | Full feature and stack summary |
| [Development Order](docs/development-order.md) | Build phases and branch history |

## Design

The UI was designed from scratch in Figma before implementation, mobile-first, with a warm parchment color palette and a custom "bookshelf" visual language (3D book spines, wood-textured shelves) rather than a generic component-library look.

<p align="center">
  <img width="331" height="195" alt="Screenshot 2026-07-20 at 19 34 15" src="https://github.com/user-attachments/assets/2a3226ab-4a2d-4e24-91a3-ec0cdd6b6572" />

</p>

## Getting Started

### Prerequisites

- Node.js 22+ (managed via [nvm](https://github.com/nvm-sh/nvm) recommended)
- A PostgreSQL database (local, Docker, or [Supabase](https://supabase.com))
- Discord and/or Google OAuth app credentials ([Discord Developer Portal](https://discord.com/developers/applications), [Google Cloud Console](https://console.cloud.google.com))

### Local setup

```bash
git clone https://github.com/RodrigoDutraF88/bookshelf-app.git
cd bookshelf-app
npm install
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, OAuth credentials, etc.
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run with Docker

The fastest way to try the full app — no local Postgres or Supabase account needed:

```bash
cp .env.docker.example .env.docker   # fill in your own OAuth/API credentials
docker compose up --build
```

This starts a local Postgres container and the Next.js app together, running Prisma migrations automatically on first boot. Open [http://localhost:3000](http://localhost:3000).

> OAuth providers require `http://localhost:3000/api/auth/callback/{provider}` registered as an authorized redirect URI in your Discord/Google app settings.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run typecheck` | Run TypeScript compiler checks |
| `npm run test` | Run Vitest unit tests |
| `npx prisma studio` | Browse the database visually |
| `docker compose up --build` | Run the full stack in containers |

## License

MIT
