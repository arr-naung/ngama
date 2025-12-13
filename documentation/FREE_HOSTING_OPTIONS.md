# Free Hosting Options for Testing

## Quick Comparison

| Service | API | Web | Database | Cost | Speed |
|---------|-----|-----|----------|------|-------|
| **Render** | ✅ | ✅ | ⚠️ 90-day limit | Free | ⭐⭐ |
| **Railway** | ✅ | ✅ | ✅ | $5 credit/mo | ⭐⭐⭐ |
| **Vercel** | ❌ | ✅ | ✅ (Postgres) | Free | ⭐⭐⭐ |

**Recommendation:** Use **Render + Supabase** (both free forever).

---

## Option 1: Render + Supabase (Recommended)

### Step 1: Database (Supabase - Free Forever)
1. Go to [supabase.com](https://supabase.com)
2. Create project → **Region: Singapore**
3. Copy connection string from Settings → Database → URI
4. Replace `[YOUR-PASSWORD]` with your password

### Step 2: Deploy (Render)
1. Go to [render.com](https://render.com)
2. New → Blueprint → Select your GitHub repo
3. Paste `DATABASE_URL` → Apply

**Done!** API + Web deployed in ~10 minutes.

---

## Option 2: Railway ($5 Credit/Month)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Add PostgreSQL service
4. Link environment variables
5. Deploy

**Pro:** Faster, includes database. **Con:** $5 monthly credit limit.

---

## Option 3: Vercel (Web Only)

Best for: Frontend only (requires separate API hosting)

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo → Select `apps/web`
3. Add environment variables
4. Deploy

**Note:** NestJS API requires a Docker-capable host (Render/Railway).

---

## Environment Variables Needed

```env
# API
DATABASE_URL=postgresql://user:password@host:5432/db
JWT_SECRET=your-secret-key-min-32-chars

# Web
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

---

## After Deployment

1. Copy your API URL (e.g., `https://ngama-api.onrender.com`)
2. Update `apps/mobile/constants.ts` with this URL
3. Build mobile app: `eas build --platform android`
