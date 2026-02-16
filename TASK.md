# Tasks

## ✅ Completed

- [x] Monorepo Setup (Turborepo, Next.js, Expo, Prisma)
- [x] Core Features (Web & Mobile)
    - [x] Shared Types/Validation
    - [x] Feed Implementation
    - [x] Create Post
    - [x] Likes & Follows (API + UI + Optimistic UI)
    - [x] Follow Lists (Followers/Following)
    - [x] User Profiles (Page, Tabs, Stats)
    - [x] Post Details & Replies
    - [x] Notifications (Real-time via Socket.IO)
    - [x] Light/Dark Theming
    - [x] Retweets & Quote Tweets
    - [x] Post Media (Image uploads via Cloudinary)
    - [x] Search (Users + Posts)
- [x] Security Hardening
    - [x] Input sanitization (XSS protection)
    - [x] Rate limiting (Throttler)
    - [x] JWT secret hardening (removed fallback)
    - [x] CORS restriction
    - [x] Upload auth guard + file type validation
- [x] Architecture Improvements
    - [x] Centralized Cloudinary module
    - [x] Typed PostsService.create (removed `data: any`)
    - [x] Fixed Zod/class-validator schema mismatch
    - [x] N+1 ancestor query fix (depth limit)
    - [x] Frontend token expiry + server verification

## 🚀 Production Deployment

- [x] Locate project root on VPS
- [x] Pull latest changes from GitHub
- [x] Configure `.env` in `apps/api`
- [x] Configure `.env.local` in `apps/web`
- [x] Rebuild and restart application

## 🔜 Future Work

- [ ] Convert public pages to Server Components (SEO)
- [ ] Add unit & E2E tests
- [ ] Mobile app feature parity with web
