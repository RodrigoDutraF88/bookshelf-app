# Data Model (v.1.0.0)
 
This document describes the database schema, entity relationships.

## Entities
 
### User
 
Managed by Auth.js. Created automatically on first sign-in.
 
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String? | Display name from OAuth |
| `email` | String | Unique |
| `emailVerified` | DateTime? | Set when email is verified |
| `image` | String? | Avatar URL from OAuth provider |
| `createdAt` | DateTime | Auto-set on creation |
| `updatedAt` | DateTime | Auto-updated |
 
Relations: `accounts[]`, `sessions[]`, `books[]`
 
### Account
 
OAuth provider accounts linked to a user. Managed by the Auth.js Prisma Adapter — do not modify directly.
 
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `userId` | String | FK → User |
| `type` | String | e.g. `"oauth"` |
| `provider` | String | e.g. `"Discord"`, `"google"` |
| `providerAccountId` | String | ID from the OAuth provider |
| `access_token` | String? | |
| `refresh_token` | String? | |
| `expires_at` | Int? | Unix timestamp |
 
Unique constraint: `(provider, providerAccountId)`
 
### Session
 
Active user sessions. Managed by Auth.js.
 
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `sessionToken` | String | Unique token stored in cookie |
| `userId` | String | FK → User |
| `expires` | DateTime | Session expiry |
 
### Book
 
A book in a user's personal library.
 
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `userId` | String | FK → User (owner) |
| `title` | String | Required |
| `author` | String | Required |
| `coverImage` | String? | URL to cover art |
| `description` | String? | Synopsis |
| `genres` | String[] | Array of genre tags |
| `publishedYear` | Int? | |
| `isbn` | String? | Optional; not enforced as unique (editions vary) |
| `status` | BookStatus | Enum (see below) |
| `createdAt` | DateTime | When added to library |
| `updatedAt` | DateTime | Last modified |
 
Relations: `readingProgress` (optional 1:1), `review` (optional 1:1)
 
**BookStatus enum:**
 
```prisma
enum BookStatus {
  WANT_TO_READ
  CURRENTLY_READING
  COMPLETED
  DROPPED
}
```
 
### ReadingProgress
 
Tracks a user's progress through a specific book. One record per book.
 
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `bookId` | String | FK → Book (unique — 1:1) |
| `currentPage` | Int | Last recorded page |
| `totalPages` | Int? | Used to calculate percentage |
| `startedAt` | DateTime? | When the user started reading |
| `finishedAt` | DateTime? | When the user finished |
| `updatedAt` | DateTime | Last updated |
 
Progress percentage is computed at the application layer: `(currentPage / totalPages) * 100`. It is not stored to avoid data inconsistency.
 

 
### Review
 
A user's rating and notes for a book. One record per book.
 
| Field | Type | Notes |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `bookId` | String | FK → Book (unique — 1:1) |
| `rating` | Int? | 1–5, nullable until rated |
| `body` | String? | Free-text review or journal entry |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |