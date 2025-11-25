# 💰 Cheap Hosting Guide (VPS + Coolify)

If you want **better performance** for a **lower price** ($5-10/mo), this is the best way.

We will use **Coolify**. It's a free, open-source tool that makes your cheap server look and feel like Vercel/Render.

## 🏗️ Architecture

| Component | Service | Cost | Location |
|-----------|---------|------|----------|
| **Server (VPS)** | **Contabo** | ~$9/mo | Singapore 🇸🇬 |
| **Control Panel** | **Coolify** | Free | Hosted on your VPS |
| **Database** | **PostgreSQL** | Free | Hosted on your VPS |
| **Backend** | **NestJS** | Free | Hosted on your VPS |
| **Frontend** | **Next.js** | Free | Hosted on your VPS |

**Total Cost**: ~$9/month for EVERYTHING (and it's fast!).

---

## 1️⃣ Buy a Server (VPS)

1.  Go to [contabo.com](https://contabo.com).
2.  Select **Cloud VPS S** (or M for more power).
    *   **Cost**: ~$6-9 USD/month.
3.  **Configure**:
    *   **Region**: **Singapore** (Best for Myanmar/Thailand).
    *   **Storage**: 200GB SSD (Plenty!).
    *   **Image**: **Ubuntu 22.04**.
4.  **Purchase** and wait for the email with your **IP Address** and **Password**.

---

## 2️⃣ Install Coolify (The Magic Tool)

1.  **Connect to your server** (using Terminal or Command Prompt):
    ```bash
    ssh root@YOUR_SERVER_IP
    # Enter your password when asked (you won't see typing)
    ```
2.  **Run this ONE command** to install everything:
    ```bash
    curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
    ```
3.  **Wait** 5-10 minutes.
4.  Visit `http://YOUR_SERVER_IP:8000` in your browser.
5.  **Create an account** (this is your private admin panel).

---

## 3️⃣ Deploy Your App

### A. Connect GitHub
1.  In Coolify, go to **Keys & Tokens**.
2.  Connect your **GitHub** account.

### B. Create Database
1.  Click **"+ New Resource"** -> **Databases** -> **PostgreSQL**.
2.  Click **Start**.
3.  Copy the **Connection String** (starts with `postgres://...`).

### C. Deploy Backend (API)
1.  Click **"+ New Resource"** -> **Project** -> **Production**.
2.  Select **GitHub** -> `Antigravity` repo.
3.  **Build Pack**: `Nixpacks` (Automatic).
4.  **Directory**: `apps/api`.
5.  **Environment Variables**:
    *   `DATABASE_URL`: Paste the connection string from step B.
    *   `JWT_SECRET`: Random password.
    *   `PORT`: `3001`.
6.  Click **Deploy**.
7.  Copy the **Domain** (e.g., `http://api.xxxx.coolify.io`).

### D. Deploy Frontend (Web)
1.  Click **"+ New Resource"** -> **GitHub** -> `Antigravity` repo.
2.  **Directory**: `apps/web`.
3.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: Paste the API Domain from step C.
4.  Click **Deploy**.

---

## 4️⃣ Mobile App
1.  Update `apps/mobile/constants.ts` with your new Coolify API URL.
2.  Build the APK as usual.

---

## ✅ Why is this better?
*   **No "Sleep"**: Your app is always online and fast.
*   **Cheap**: Fixed price ($9), no matter how many users (up to ~50k).
*   **Control**: You own the data and the server.
