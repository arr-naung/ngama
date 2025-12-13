# Fresh Deployment Guide (Neon + Koyeb)

## ✅ 100% Free, No Credit Card Required

| Service | Purpose | Cost | Card? |
|---------|---------|------|-------|
| **Neon** | PostgreSQL Database | Free forever | ❌ No |
| **Koyeb** | API + Web Hosting | Free forever | ❌ No |

---

## Prerequisites

- GitHub account with your project repository
- Project pushed to GitHub with latest code

---

## Step 1: Create Database (Neon)

1. Go to [neon.tech](https://neon.tech)
2. Click **"Sign Up"** → Use **GitHub** login
3. Click **"Create a project"**
   - **Name**: `ngama-db`
   - **Region**: `Singapore` (closest to you)
   - **PostgreSQL Version**: 16 (default)
4. Click **"Create Project"**
5. **Copy the connection string** (looks like):
   ```
   postgresql://neondb_owner:PASSWORD@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
   **Save this! You'll need it for Step 2.**

---

## Step 2: Initialize Database Schema

Run this on your **local machine**:

```bash
cd packages/db

# Set the DATABASE_URL temporarily
$env:DATABASE_URL = "postgresql://neondb_owner:PASSWORD@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Push your schema to Neon
npx prisma db push

# Verify it worked
npx prisma studio
```

You should see your tables (User, Post, Like, etc.) in Prisma Studio.

---

## Step 3: Deploy API (Koyeb)

1. Go to [koyeb.com](https://www.koyeb.com)
2. Click **"Sign Up"** → Use **GitHub** login
3. Click **"Create App"**
4. Select **"GitHub"** → Choose your `Antigravity` repository
5. Configure:
   - **Branch**: `main`
   - **Build and run commands**:
     - **Build**: `cd apps/api && npm install && npm run build`
     - **Run**: `cd apps/api && npm run start:prod`
   - **Exposed port**: `3001`
6. **Environment Variables** (click "Add Variable"):
   ```
   DATABASE_URL = postgresql://neondb_owner:PASSWORD@ep-xxx.../neondb?sslmode=require
   JWT_SECRET = your-super-secret-key-minimum-32-characters-long
   PORT = 3001
   ```
7. Click **"Deploy"**
8. Wait 5-10 minutes
9. **Copy the API URL** (e.g., `https://ngama-api-xxx.koyeb.app`)

---

## Step 4: Deploy Web (Koyeb)

1. In Koyeb, click **"Create Service"** (in the same app)
2. Select **"GitHub"** → Same repository
3. Configure:
   - **Branch**: `main`
   - **Build and run commands**:
     - **Build**: `cd apps/web && npm install && npm run build`
     - **Run**: `cd apps/web && npm run start`
   - **Exposed port**: `3000`
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL = https://ngama-api-xxx.koyeb.app
   ```
5. Click **"Deploy"**
6. Wait 5-10 minutes

---

## Step 5: Update Mobile App

Update `apps/mobile/constants.ts`:

```typescript
export const BASE_URL = 'https://ngama-api-xxx.koyeb.app';
```

Then rebuild the mobile app:
```bash
cd apps/mobile
eas build --platform android --profile preview
```

---

## Step 6: Test Everything

1. **Web App**: Visit your Koyeb web URL
2. **API Health**: Visit `https://your-api.koyeb.app/health`
3. **Mobile**: Install the APK and test

---

## Troubleshooting

### "Build failed"
- Check Koyeb build logs
- Ensure `npm install` runs in the correct directory

### "Database connection failed"
- Verify `DATABASE_URL` has `?sslmode=require`
- Check Neon dashboard - is the project active?

### "CORS error"
- API needs `app.enableCors()` (already in your code)
- Ensure `NEXT_PUBLIC_API_URL` is correct

---

## Free Tier Limits

| Service | Limit |
|---------|-------|
| Neon | 0.5GB storage, 3GB compute/month |
| Koyeb | 2 nano instances (256MB RAM each) |

Both are **enough for testing** with ~1000 users.
