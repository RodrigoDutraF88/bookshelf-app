# 📚 Bookshelf App

> A full-stack personal reading tracker to organize, monitor, and analyze your reading habits — with AI-powered recommendations, ISBN barcode scanning, and a fully containerized dev environment.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![tRPC](https://img.shields.io/badge/tRPC-v11-398CCB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![CI](https://github.com/<your-username>/bookshelf-app/actions/workflows/ci.yml/badge.svg)

**[🔗 Live Demo](https://bookshelf-app-pearl-theta.vercel.app)** &nbsp;·&nbsp; **[🎨 Figma Design](#design)** &nbsp;·&nbsp; **[🐳 Run with Docker](#run-with-docker)**

---

## Overview

Bookshelf App lets you build a personal digital library, track reading progress, and visualize your reading habits over time, search millions of titles via Google Books, scan a barcode to add a book by ISBN, and get personalized AI reading recommendations powered by Gemini.

Built on the **T3 Stack** with end-to-end type safety from database to UI: a schema change in Prisma is felt as a compile error in a React component, with no manual type-syncing or codegen step in between.

## Screenshots

<!-- Add screenshots/GIFs here — a mobile + desktop pair for 2-3 key screens
     (Library shelf view, Dashboard, Explore) makes the biggest impact.
     Example:
     <p align="center">
       <img src="docs/screenshots/library-mobile.png" width="260" />
       <img src="docs/screenshots/dashboard-desktop.png" width="500" />
     </p>
-->
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

## Design

The UI was designed from scratch in Figma before implementation — mobile-first, with a warm parchment color palette and a custom "bookshelf" visual language (3D book spines, wood-textured shelves) rather than a generic component-library look.

<p align="center">
  <img src="docs/design/figma-prototype.png" width="700" alt="Figma prototype of Bookshelf App" />
</p>

## Features

- **Personal Library** — add, edit, and remove books with full metadata (title, author, cover, genres, ISBN, publication year)
- **Reading Status** — Want to Read · Currently Reading · Completed · Dropped, with a shelf view organized by category or all-in-one
- **Progress Tracking** — current page, completion percentage, start/finish dates
- **Reviews & Ratings** — 5-star ratings, personal notes, private reading journal
- **Statistics Dashboard** — total books, pages read, average rating, reading streaks, activity over time, genre distribution
- **Explore & Discover** — search millions of books via the Google Books API, view details, add straight to your shelf
- **AI Recommendations** — Gemini-powered personalized suggestions based on completed books, one click away from finding the real title via Google Books
- **Barcode Scanning** — add books instantly by scanning an ISBN barcode with your camera (`@zxing/browser`)
- **OAuth Authentication** — sign in with Discord or Google, with automatic account linking by verified email
- **Responsive, Mobile-First UI** — dedicated mobile bottom nav, desktop top nav, and a fully adapted layout for every screen size


## Engineering Practices

This project was built with production-grade practices, not just "make it work":

- **End-to-end type safety** — tRPC infers the full API contract from server code; a broken contract fails `tsc`, not at runtime
- **CI pipeline** — every push runs typecheck → lint → test → build → Docker smoke test via GitHub Actions ([workflow](.github/workflows/ci.yml))
- **Automated testing** — Vitest unit tests for tRPC routers with mocked Prisma and session context
- **Containerized dev environment** — anyone can clone and run the full stack (app + Postgres) with one command, no local Postgres or Supabase account required — see [Run with Docker](#run-with-docker)
- **Edge/Node runtime split for auth** — middleware runs edge-safe Auth.js config (no Prisma) while API routes use the full Node config, with JWT sessions bridging both consistently
- **Conventional commits** — `feat/`, `fix/`, `chore/` prefixes, branch-per-feature with `--no-ff` merges to preserve history
- **Repo-embedded documentation** — architecture decisions, data model, and auth flow are documented in [`/docs`](docs), not just in code comments

## Documentation

| Doc | Description |
|---|---|
| [Architecture](docs/architecture.md) | System overview, request flow, and decision log |
| [Data Model](docs/data-model.md) | Database schema and entity relationships |
| [Authentication](docs/authentication.md) | Auth.js + tRPC + Prisma Adapter setup |
| [Project Overview](docs/project-overview.md) | Full feature and stack summary |
| [Development Order](docs/development-order.md) | Build phases and branch history |

## Getting Started

### Prerequisites

- Node.js 22+ (managed via [nvm](https://github.com/nvm-sh/nvm) recommended)
- A PostgreSQL database (local, Docker, or [Supabase](https://supabase.com))
- Discord and/or Google OAuth app credentials ([Discord Developer Portal](https://discord.com/developers/applications), [Google Cloud Console](https://console.cloud.google.com))

### Local setup

```bash
git clone https://github.com/<your-username>/bookshelf-app.git
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