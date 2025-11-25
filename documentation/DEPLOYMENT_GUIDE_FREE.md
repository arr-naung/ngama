# 🪄 Magic Deployment Guide (The Easiest Way)

You said the other guides were too complex. I heard you!
This is the **"Magic File"** method. I wrote a file called `render.yaml` that does all the hard work for you.

## 🏗️ The Plan (2 Steps Only)

1.  **Supabase**: Holds your data (Users, Posts).
2.  **Render**: Runs your code (Web + API).

*Why two? Because Render's free database deletes itself after 90 days. Supabase is free forever.*

---

## 1️⃣ Step 1: Get a Database (Supabase)

1.  Go to [supabase.com/dashboard](https://supabase.com/dashboard).
    *   *Note: If you already see a project (e.g., "Project 1"), click on it.*
    *   *If not, click "New Project".*
2.  **Region**: **Singapore** (Important for speed!).
3.  **Password**: Write it down! (If you forgot it, you can reset it in Settings -> Database).
4.  **Find Connection String**:
    *   **Method A**: Look for a **"Connect"** button at the very top right of the dashboard. Click it -> "URI".
    *   **Method B**: Go to **Settings** (Gear icon) -> **Database** -> Scroll down to the "Connection string" panel -> Click **"URI"**.
5.  Copy the string.
    *   It looks like: `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres`
    *   **Replace `[PASSWORD]` with your actual password.**
    *   **Keep this safe.**

---

## 2️⃣ Step 2: The Magic Button (Render)

1.  Go to [render.com](https://render.com) and sign up with GitHub.
2.  Click **"New +"** -> **"Blueprint"**.
3.  Select your `Antigravity` repository.
4.  Render will find the `render.yaml` file I made.
5.  It will ask for **ONE thing**:
    *   `DATABASE_URL`: Paste the connection string from Step 1.
6.  Click **"Apply Blueprint"**.

---

## 🎉 That's it!

Render will now:
1.  Deploy your **API**.
2.  Deploy your **Web App**.
3.  **Automatically connect** them together.

Wait 5-10 minutes. You will see two green "Live" links.

---

## 📱 Mobile App (Last Step)

Once Render is green:
1.  Copy your **API URL** from Render (e.g., `https://antigravity-api.onrender.com`).
2.  Paste it here in the chat.
3.  I will build the Android app for you.
