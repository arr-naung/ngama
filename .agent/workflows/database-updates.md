---
description: How to update the database schema or switch between Dev and Prod
---

# 🗄️ Database Management Workflow (SAFE)

## 1. On Local Computer (Dev)
Whenever you change the database structure:
```powershell
cd packages/db
cmd /c "npx prisma migrate dev --name update_schema"
cmd /c "npx prisma generate"
cmd /c "npm run build"
```
*Note: This creates the "migration record" needed for Production.*

## 2. On GitHub
Push your changes (including the new files in `packages/db/prisma/migrations`).

## 3. On VPS (Production)
Run this after `git pull`:
```powershell
cd packages/db
cmd /c "npx prisma migrate deploy"
cmd /c "npx prisma generate"
cmd /c "npm run build"
```

---

## ⚠️ Key Rules
- **LOCAL:** Always use `migrate dev` (creates records).
- **VPS:** Always use `migrate deploy` (reads records safely).
- **NEVER** use `db push` if you want to keep your Production records.
