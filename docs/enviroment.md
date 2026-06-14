# Environment Variables (v.1.0.0)
 
All environment variables are validated at build time using `@t3-oss/env-nextjs`. If a required variable is missing or malformed, the build (and dev server start) will fail with a clear error message.
 
The schema lives in `src/env.js`.
 
## Setup
 
```bash
cp .env.example .env
```
 
Never commit `.env` — it's git-ignored. Commit only `.env.example` with placeholder values.
 
## Variables Reference
 
