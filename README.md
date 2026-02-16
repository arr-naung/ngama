# ngama

A full-stack X (Twitter) clone built with a Turborepo monorepo.

## Architecture

```
apps/
  api/      → NestJS 11 REST API + WebSocket notifications
  web/      → Next.js 16 frontend
  mobile/   → Expo 54 (React Native) mobile app

packages/
  db/       → Prisma ORM + PostgreSQL schema
  schema/   → Shared Zod validation schemas
  ui/       → Shared UI components (WIP)
  eslint-config/ → Shared ESLint config
  typescript-config/ → Shared tsconfig
```

## Features

- 🔐 JWT authentication (signup/signin)
- 📝 Posts with image uploads (Sharp + Cloudinary)
- 💬 Threaded replies with ancestor chain
- ❤️ Likes with real-time notifications (Socket.IO)
- 🔁 Reposts & quote tweets
- 👤 User profiles with stats & follow system
- 🔍 Search (users + posts)
- 🌙 Light/dark theming
- 📱 Mobile app (Expo)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account (for image uploads)

### Environment Variables

Copy `.env.example` to `.env` in `apps/api/`:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-strong-random-secret"
CORS_ORIGINS="http://localhost:4000"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

Copy `.env.local.example` to `.env.local` in `apps/web/`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Install & Run

```bash
npm install
npx turbo db:generate   # Generate Prisma client
npm run dev              # Start all apps in dev mode
```

- **API**: http://localhost:3000
- **Web**: http://localhost:4000

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| API       | NestJS 11, Passport JWT, Prisma   |
| Web       | Next.js 16, React 19, Tailwind v4 |
| Mobile    | Expo 54, React Native, NativeWind |
| Database  | PostgreSQL                        |
| Uploads   | Sharp + Cloudinary                |
| Realtime  | Socket.IO                         |
| Monorepo  | Turborepo                         |
