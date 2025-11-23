# PostgreSQL Migration Guide

## Overview

This guide will help you migrate from SQLite to PostgreSQL for production scalability.

**Status**: Ready to migrate  
**Difficulty**: Easy (with Prisma)  
**Time Required**: ~15-20 minutes  
**Installation Method**: Local Windows Installation

---

## Why Migrate Now?

✅ **Development Phase** - Minimal data to migrate  
✅ **Easy Rollback** - SQLite file remains as backup  
✅ **Production Ready** - PostgreSQL handles 1M+ users  
✅ **Prisma Support** - Automated migration process

---

## Step 1: Install PostgreSQL Locally

### Download and Install

1. **Download PostgreSQL**:
   - Go to: https://www.postgresql.org/download/windows/
   - Download the latest version (PostgreSQL 16 recommended)
   - Run the installer

2. **Installation Settings**:
   - **Port**: 5432 (default)
   - **Password**: Choose a strong password (you'll need this!)
   - **Components**: Install PostgreSQL Server, pgAdmin, and Command Line Tools
   - **Locale**: Default

3. **Verify Installation**:
   ```powershell
   # Open PowerShell and check version
   psql --version
   # Should show: psql (PostgreSQL) 16.x
   ```

### Create Database

Open **pgAdmin** (installed with PostgreSQL) or use command line:

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE antigravity;

# Verify
\l  # List databases (should see 'antigravity')

# Exit
\q
```

---

## Step 2: Update Prisma Schema

**File**: `packages/db/prisma/schema.prisma`

Change line 9 from:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

To:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Step 3: Configure Database URL

**File**: `packages/db/.env`

Create or update this file with:

```env
# PostgreSQL Connection String
# Replace YOUR_PASSWORD with the password you set during installation
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/antigravity"
```

**Example**:
```env
DATABASE_URL="postgresql://postgres:MySecurePass123@localhost:5432/antigravity"
```

---

## Step 4: Run Migration

Open PowerShell in your project root:

```powershell
# Navigate to database package
cd packages/db

# Generate new Prisma client for PostgreSQL
npx prisma generate

# Create and run migration
npx prisma migrate dev --name migrate_to_postgresql

# You should see: "Your database is now in sync with your schema"
```

---

## Step 5: Verify Migration

### Option A: Prisma Studio
```powershell
# From packages/db
npx prisma studio
```
Opens browser showing your PostgreSQL database.

### Option B: pgAdmin
1. Open pgAdmin
2. Connect to localhost server
3. Navigate to: Servers → PostgreSQL 16 → Databases → antigravity → Schemas → public → Tables
4. You should see: User, Post, Like, Follow, Notification

---

## Step 6: Test Your Application

1. **Start Development Servers**:
   ```powershell
   # From project root
   npx turbo dev
   ```

2. **Test Authentication**:
   - Go to `http://localhost:3000/auth/signup`
   - Create a new test account
   - Sign in

3. **Test Core Features**:
   - Create a post
   - Like a post
   - Follow a user
   - Check if followers count updates

4. **Check Database**:
   - Open Prisma Studio: `npx prisma studio`
   - Verify your test data appears in PostgreSQL

---

## Rollback (If Needed)

If something goes wrong, you can easily revert:

1. **Revert Prisma Schema**:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Update .env**:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. **Regenerate Client**:
   ```powershell
   cd packages/db
   npx prisma generate
   ```

Your SQLite file (`packages/db/prisma/dev.db`) remains untouched!

---

## Troubleshooting

### "Connection refused" Error
- **Check PostgreSQL is running**:
  ```powershell
  # Open Services (Windows + R, type 'services.msc')
  # Look for "postgresql-x64-16"
  # Make sure Status is "Running"
  ```

### "Authentication failed" Error
- **Check your password** in `.env` matches installation password
- **Try resetting password**:
  ```powershell
  # As postgres user
  psql -U postgres
  ALTER USER postgres PASSWORD 'new_password';
  ```

### "Database does not exist" Error
- **Create it manually**:
  ```powershell
  psql -U postgres
  CREATE DATABASE antigravity;
  ```

### Migration Fails
- **Check syntax** in your `.env` file (no spaces around `=`)
- **Verify DATABASE_URL** format is exactly:
  ```
  postgresql://postgres:password@localhost:5432/antigravity
  ```

---

## What Changed?

### Changed:
- ✅ Database engine (SQLite → PostgreSQL)
- ✅ Connection string in `packages/db/.env`
- ✅ Prisma migration files

### Unchanged:
- ✅ All application code
- ✅ API endpoints
- ✅ Frontend components
- ✅ Mobile app
- ✅ Prisma schema models

---

## Next Steps

After successful migration:

1. **Phase 1 Complete** ✅
   - Database ready for production scale

2. **Next Priority**:
   - Add pagination to feed/posts
   - Implement Redis caching

3. **Later**:
   - Set up cloud storage (S3)
   - Deploy to production

---

## PostgreSQL Tips

### Useful Commands

```powershell
# Start PostgreSQL service
net start postgresql-x64-16

# Stop PostgreSQL service
net stop postgresql-x64-16

# Connect to database
psql -U postgres -d antigravity

# List all databases
psql -U postgres -c "\l"
```

### GUI Tools
- **pgAdmin** (installed with PostgreSQL) - Full-featured
- **Prisma Studio** (`npx prisma studio`) - Simple, focused

---

## Benefits of PostgreSQL

Now that you're on PostgreSQL:

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Concurrent Writes | ❌ Limited | ✅ Excellent |
| Scalability | 📊 ~1K users | 📊 1M+ users |
| Replication | ❌ No | ✅ Yes |
| JSON Support | ⚠️ Basic | ✅ Advanced |
| Full-Text Search | ⚠️ Limited | ✅ Built-in |
| Production Ready | ❌ No | ✅ Yes |

---

## Summary

This migration is:
- ✅ **Safe** - Reversible, SQLite backup remains
- ✅ **Quick** - ~15 minutes total
- ✅ **Essential** - Required for 1M users
- ✅ **Simple** - Prisma handles complexity

**You're now ready for production! 🚀**
