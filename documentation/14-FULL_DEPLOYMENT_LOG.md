# Deployment Master Guide
**Project:** X-Clone (Antigravity / ngama)
**Stack:** Neon (PostgreSQL) + Koyeb (API & Web)

---

## Step 1: Database Setup (Neon)
**Goal:** Create a free PostgreSQL database.

1.  **Register:** Go to [neon.tech](https://neon.tech) and sign up.
2.  **Create Project:** Create a new project (e.g., `ngama-db`).
3.  **Get Connection String:**
    *   Copy the Postgres Connection string from the dashboard.
    *   *Format:* `postgresql://neondb_owner:PASSWORD@ep-xyz.neon.tech/neondb?sslmode=require`
    *   **Important:** Ensure you copy the unmasked password.
4.  **Initialize Database (Local Terminal):**
    *   Run this command in your local project to create the tables in the cloud:
    ```powershell
    $env:DATABASE_URL = "your_neon_connection_string"; npx prisma db push
    ```

---

## Step 2: Hosting Account (Koyeb)
**Goal:** Set up the platform for running the API and Web App.

1.  **Register:** Go to [koyeb.com](https://koyeb.com) and sign up with GitHub.
2.  **Note:** You may see a "Pro Trial" message. This is normal and will downgrade to Free Tier automatically after 7 days. No credit card is needed.

---

## Step 3: API Service Deployment
**Goal:** Deploy the NestJS Backend (`apps/api`).

1.  **Create Service:** Click **"Create Service"**.
2.  **Source:** Select **GitHub** -> `ngama` repository.
3.  **Configuration:**
    *   **Type:** Web Service
    *   **Builder:** Buildpack (Standard)
    *   **Work Directory:** `.`  *(Crucial: Must be a dot)*
    *   **Build Command:** `npx turbo run build --filter=api`
    *   **Run Command:** `node apps/api/dist/main`
    *   **Instance:** Nano (Free)
    *   **Regions:** Singapore (or nearest)
    *   **Ports:** Internal Port `3001` (expose to Public 80/443)

4.  **Environment Variables:**
    | Key | Value | Note |
    |-----|-------|------|
    | `DATABASE_URL` | `postgresql://...` | Paste exact Neon string. **NO quotes, NO spaces.** |
    | `JWT_SECRET` | `secret123...` | Any long random string. |
    | `PORT` | `3001` | Must match the internal port. |
    | `NODE_ENV` | `production` | Optimizes performance. |
    | `UPLOAD_BASE_URL` | `https://your-api.koyeb.app` | *Add this AFTER first deployment to fix images.* |

5.  **Deploy:** Click "Deploy". Wait for it to match "Healthy".

---

## Step 4: Web Service Deployment
**Goal:** Deploy the Next.js Frontend (`apps/web`).

1.  **Create Service:** Click **"Create Service"** (Add to distinct App or same App).
2.  **Source:** Select **GitHub** -> `ngama` repository.
3.  **Configuration:**
    *   **Type:** Web Service
    *   **Builder:** Buildpack
    *   **Work Directory:** `.`
    *   **Build Command:** `npx turbo run build --filter=web`
    *   **Run Command:** `npm start --workspace=web`
    *   **Ports:** Internal Port `3000`.

4.  **Environment Variables:**
    | Key | Value | Note |
    |-----|-------|------|
    | `NEXT_PUBLIC_API_URL` | `https://your-api.koyeb.app` | **NO trailing slash** (e.g., NOT `...app/`). |

5.  **Deploy:** Click "Deploy". Verify the site loads.

---

## Step 5: Mobile App Configuration (Expo)
**Goal:** Point the mobile app to the cloud backend.

1.  **Update Constants:**
    *   File: `apps/mobile/constants.ts`
    *   Change: `export const BASE_URL = 'https://your-api.koyeb.app';`
2.  **Clear Cache:**
    *   Run: `npx expo start --clear`
3.  **Test:** Scan QR code on your phone. It now connects to the live database.

---
**Deployment Complete.**
