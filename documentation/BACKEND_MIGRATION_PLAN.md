# Backend Migration Plan: Next.js -> NestJS

The goal is to move the "heavy" backend logic out of Next.js API Routes into a dedicated **NestJS** application (`apps/api`). This maintains the **Monorepo** structure (easy development) but allows the backend to be robust, scalable, and independently deployable.

## User Review Required

> [!IMPORTANT]
> This is a significant architectural change.
> - We will create a new folder `apps/api`.
> - We will move database logic from `apps/web` to `apps/api`.
> - `apps/web` will become a pure frontend (fetching from `http://localhost:3001` instead of `/api`).

## Proposed Changes

### 1. Initialize NestJS Application
- Create `apps/api` using NestJS CLI.
- Configure it to work with Turborepo (tsconfig, eslint).

### 2. Database Integration
- Reuse `@repo/db` (Prisma) in `apps/api`.
- Ensure `apps/api` can connect to the SQLite (later Postgres) database.

### 3. Migrate Features (Iterative)
We will migrate features one by one to avoid breaking everything at once.

#### Phase 1: Foundation
- [NEW] `apps/api/src/app.module.ts`: Main module.
- [NEW] `apps/api/src/main.ts`: Entry point (Port 3001).
- [NEW] `apps/api/src/prisma/`: Database service.

#### Phase 2: Authentication
- Move JWT logic and `auth` routes (`signup`, `signin`, `me`) to NestJS.
- Update `apps/web` and `apps/mobile` to point to new Auth endpoints.

#### Phase 3: Posts & Feed
- Move Post creation, Feed fetching, and Likes to NestJS Controllers/Services.
- Implement proper Pagination and DTOs (Data Transfer Objects).

## Verification Plan

### Automated Tests
- Run `npx turbo dev` and ensure both `web` (3000) and `api` (3001) start.
- Test API endpoints using `curl` or Postman.

### Manual Verification
- **Web**: Log in, view feed, create post (should route through new API).
- **Mobile**: Update `API_URL` to point to new API port, verify app works.
