# Deployment Guide

Guide for deploying the X-Clone application to production.

## Deployment Options

### Vercel (Recommended for Web)

Vercel is the easiest option for deploying Next.js applications.

#### Prerequisites
- Vercel account
- GitHub repository
- PostgreSQL database (not SQLite!)

#### Steps

1. **Migrate to PostgreSQL**

> [!CAUTION]
> **You MUST migrate from SQLite to PostgreSQL before deploying to production.**

Update `packages/db/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Get a PostgreSQL database:
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Neon](https://neon.tech/)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)

2. **Push to GitHub**

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

3. **Deploy to Vercel**

- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Connect your GitHub repository
- Configure environment variables:
  - `DATABASE_URL`: Your PostgreSQL connection string
  - `JWT_SECRET`: Strong random secret (use `openssl rand -base64 32`)
- Deploy!

4. **Run Migrations**

After first deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Run migration
vercel env pull .env.local
cd packages/db
npx prisma migrate deploy
```

---

### Mobile App (Expo)

#### Option 1: Expo Go (Development/Testing)

Users can test via Expo Go app:

1. Publish to Expo:
```bash
cd apps/mobile
npx eas update --branch production
```

2. Share the QR code with testers

#### Option 2: Standalone Builds (Production)

Build native iOS/Android apps:

1. **Set up EAS Build**:
```bash
npm install -g eas-cli
eas login
eas build:configure
```

2. **Update API URL**:

In `apps/mobile/constants.ts`:
```typescript
export const API_URL = 'https://your-vercel-app.vercel.app';
```

3. **Build for Android**:
```bash
eas build --platform android --profile production
```

4. **Build for iOS**:
```bash
eas build --platform ios --profile production
```

5. **Submit to Stores**:
```bash
# Google Play
eas submit --platform android

# App Store
eas submit --platform ios
```

---

## Environment Variables

### Production Environment Variables

#### Web Application

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT Secret (CRITICAL: Use a strong random string!)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# API URL for client-side
NEXT_PUBLIC_API_URL="https://your-domain.com"

# File Upload (when using S3)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"

# Optional: Sentry for error tracking
SENTRY_DSN="your-sentry-dsn"

# Optional: Redis for caching
REDIS_URL="redis://user:password@host:6379"
```

#### Mobile Application

```env
EXPO_PUBLIC_API_URL="https://your-domain.com"
```

---

## Pre-Deployment Checklist

### Security

- [ ] Migrate from SQLite to PostgreSQL
- [ ] Generate strong JWT secret (`openssl rand -base64 32`)
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Implement rate limiting
- [ ] Add input sanitization (DOMPurify)
- [ ] Move to cloud storage (S3/Cloudinary) for uploads
- [ ] Add CSRF protection
- [ ] Improve password validation

### Performance

- [ ] Add database indexes
- [ ] Implement pagination for feed
- [ ] Set up Redis caching
- [ ] Enable Next.js caching with `revalidate`
- [ ] Add CDN for static assets
- [ ] Optimize images (Next.js Image component)

### Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Add application monitoring (Vercel Analytics, New Relic)
- [ ] Configure database query monitoring
- [ ] Set up uptime monitoring

### Testing

- [ ] Write and run tests
- [ ] Manual testing of all features
- [ ] Load testing
- [ ] Security audit

---

## Database Migration (SQLite → PostgreSQL)

### Step 1: Export Data from SQLite

```bash
cd packages/db
npx prisma db pull
# This creates a schema based on current SQLite DB
```

### Step 2: Update Schema for PostgreSQL

Change `schema.prisma`:

```diff
datasource db {
-  provider = "sqlite"
+  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Create PostgreSQL Database

Get a PostgreSQL database from:
- Vercel Postgres (free tier available)
- Neon (free tier available)
- Supabase (free tier available)

### Step 4: Update Environment Variables

```env
# Old (SQLite)
DATABASE_URL="file:./dev.db"

# New (PostgreSQL)
DATABASE_URL="postgresql://user:password@host.db.vercel.com:5432/database"
```

### Step 5: Run Migrations

```bash
cd packages/db
npx prisma migrate dev --name init_postgresql
npx prisma generate
```

### Step 6: Migrate Data (if needed)

If you have existing data to migrate:

```bash
# Export from SQLite
sqlite3 dev.db .dump > data.sql

# Convert and import to PostgreSQL (manual process)
# Or use a migration tool like pgloader
```

---

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run check-types
      # - run: npm run test  # When tests are added

  deploy-web:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/actions/deploy@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Scaling Recommendations

### Phase 1: Basic Production (1-10K users)
- PostgreSQL database
- Vercel for web hosting
- Basic monitoring
- CDN for assets

### Phase 2: Growth (10K-100K users)
- Add Redis caching
- PostgreSQL read replicas
- Implement rate limiting
- Add message queue for notifications
- Load testing and optimization

### Phase 3: Scale (100K-1M users)
- Separate API service
- Multiple database replicas
- Advanced caching strategies
- WebSocket servers for real-time features
- Microservices architecture

See [PROJECT_FEEDBACK.md](./PROJECT_FEEDBACK.md) for detailed scaling recommendations.

---

## Monitoring & Maintenance

### Essential Monitoring

1. **Error Tracking**: Sentry
   ```bash
   npm install @sentry/nextjs
   ```

2. **Analytics**: Vercel Analytics (built-in)

3. **Uptime**: UptimeRobot or Pingdom

4. **Database**: Built-in PostgreSQL monitoring

### Logs

- **Vercel**: Automatic log aggregation
- **PostgreSQL**: Query logs and slow query analysis

### Backups

- **Database**: Automated backups (Vercel Postgres, Neon, etc.)
- **User uploads**: S3 versioning

---

## Troubleshooting

### Build Failures

**Issue**: TypeScript errors during build

**Solution**:
```bash
npm run check-types
# Fix all errors before deploying
```

### Database Connection Errors

**Issue**: "Can't reach database server"

**Solution**:
- Check DATABASE_URL is correctly set
- Ensure database is accessible from Vercel IP ranges
- PostgreSQL requires SSL: add `?sslmode=require` to connection string

### 500 Errors in Production

**Issue**: App crashes with Internal Server Error

**Solution**:
- Check Vercel logs: `vercel logs`
- Add error tracking with Sentry
- Ensure all environment variables are set

---

## Rollback Strategy

### Web (Vercel)

1. Go to Vercel dashboard
2. Select previous deployment
3. Click "Promote to Production"

### Mobile

1. Use Expo Updates for quick rollbacks:
   ```bash
   eas update --branch production --message "Rollback"
   ```

2. For native builds, resubmit previous version to stores

---

## Further Reading

- [Vercel Documentation](https://vercel.com/docs)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [PROJECT_FEEDBACK.md](./PROJECT_FEEDBACK.md) - Security and performance recommendations
