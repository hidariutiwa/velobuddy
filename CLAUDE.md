# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Velobuddy is a cycling companion web app (Japanese locale). Users log in via Google, search for places via Google Places API, save favorites, track cycling activities, and manage their profile.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL via Prisma (with `@prisma/adapter-pg` driver adapter)
- **Auth**: NextAuth v4 with Google OAuth provider
- **Maps**: Google Maps via `@vis.gl/react-google-maps`
- **Testing**: Jest (unit), Playwright (e2e)
- **Deployment**: Heroku (Procfile-based)

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Generate Prisma client + build Next.js
npm run lint         # ESLint
npm run format       # Prettier (auto-fix)
npm test             # Run all Jest tests
npm test -- --testPathPattern=<pattern>  # Run a single test file
npx playwright test              # Run all e2e tests
npx playwright test e2e/home.spec.ts  # Run a single e2e test
npx prisma migrate dev           # Create/apply migrations in dev
npx prisma generate              # Regenerate Prisma client
```

## Architecture

### Path alias

`@/*` maps to `./src/*` (configured in tsconfig.json and jest.config.ts).

### Source layout (`src/`)

- **`app/`** — Next.js App Router pages and API routes
    - `api/auth/[...nextauth]/` — NextAuth route handler
    - `api/places/search/` — Proxies Google Places Text Search API, caches results in DB
    - `api/favorites/` and `api/favorites/[id]/` — CRUD for user favorite places
    - `api/users/profile/` — User profile endpoint
    - Pages: `/` (home), `/places`, `/places/[id]`, `/favorites`, `/activities`, `/activities/[id]`, `/profile`, `/profile/edit`
- **`components/`** — React components organized by domain (`layout/`, `map/`, `favorites/`, `utils/`)
- **`lib/`** — Server-side code
    - `auth.ts` — NextAuth configuration (Google provider, JWT callbacks with DB user lookup)
    - `db/user.ts`, `db/place.ts` — Prisma data access functions
    - `generated/prisma/` — Auto-generated Prisma client (do not edit)
- **`types/`** — Shared TypeScript type definitions

### Database

- Prisma schema at `prisma/schema.prisma`, client generated to `src/lib/generated/prisma/`
- Each DB module (`lib/db/*.ts`) creates its own PrismaClient with PrismaPg adapter (SSL enabled)
- Key models: User, Place (cached Google Places data), UserFavoritePlace (join), Activity, Prefectures

### Auth flow

- Google OAuth via NextAuth → `findOrCreateUserByGoogle` upserts user in DB
- JWT token carries `userId` (DB primary key) set in the `jwt` callback
- Session exposes `user.id` via the `session` callback

### Testing

- Jest config uses `testEnvironment: "node"` (not jsdom by default)
- Tests live alongside source files (`route.test.ts`, `__tests__/` dirs)
- Playwright e2e tests in `e2e/`, dev server runs on port 3001 during e2e

### Environment variables

- `DATABASE_URL` — PostgreSQL connection string
- `GOOGLE_AUTH_CLIENT_ID`, `GOOGLE_AUTH_CLIENT_SECRET` — Google OAuth
- `NEXT_PUBLIC_GOOGLE_MAP_API_KEY` — Google Maps/Places API key
