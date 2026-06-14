# 📚 Bookshelf App(1.0)
 
> A full-stack personal reading tracker to organize, monitor, and analyze your reading habits.
 
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![tRPC](https://img.shields.io/badge/tRPC-v11-398CCB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)
 
Bookshelf App lets you build a personal digital library, track reading progress, visualize your reading habits over time. Discover trending titles and receive **personalized book recommendations & summaries powered by AI**. Built on the **T3 Stack** with end-to-end type safety across the database, API, and UI.

## Documentation
 
| Doc | Description |
|---|---|
| [Architecture](docs/architecture.md) | System overview, request flow, and decision log |
| [Data Model](docs/data-model.md) | Database schema and entity relationships |
| [Authentication](docs/authentication.md) | Auth.js + tRPC + Prisma Adapter setup |
| [tRPC Guide](docs/trpc-guide.md) | How to work with the API layer |
| [Environment Variables](docs/environment.md) | Full env reference and setup notes |
| [Contributing](docs/contributing.md) | Conventions, branching, and commit style |
 

## Features
 
- **Personal Library** — add, edit, and remove books with full metadata
- **Reading Status** — Want to Read · Currently Reading · Completed · Dropped
- **Progress Tracking** — current page, percentage, start/finish dates
- **Reviews & Ratings** — rate books, write notes, keep a private journal
- **Statistics Dashboard** — pages read, streaks, activity over time, genre distribution
- **Search & Filtering** — filter by status, genre, rating, or date;

 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS v4 |
| API | tRPC v11, SuperJSON |
| Database | PostgreSQL (Supabase), Prisma ORM |
| Auth | Auth.js (NextAuth v5 Beta), Prisma Adapter |
| Validation | Zod |
| Data Fetching | TanStack React Query |
| Env | @t3-oss/env-nextjs |
 
