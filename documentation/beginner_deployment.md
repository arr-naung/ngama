# Beginner Deployment Guide (Step-by-Step)

This guide assumes you are starting from your **Local Computer** and moving to your **VPS**.

## Step 1: Login to your VPS
Open a terminal (PowerShell or Command Prompt) on your computer and run:
`ssh root@<your_vps_ip_address>`
*(Enter your VPS password when asked. You won't see the characters typing.)*

## Step 2: Prepare the Folder
Once logged in to the VPS, run these commands one by one:

```bash
# 1. Go to the web serving directory
cd /var/www

# 2. Clone your project (replacing the URL with your GitHub URL)
# We clone it specifically into a folder named 'A'
git clone https://github.com/arr-naung/ngama.git A

# 3. Enter the new folder
cd A
```

## Step 3: Setup Environment Variables
You need to create the "secrets" files.

```bash
# 1. Create the backend env file
cp apps/api/.env.example apps/api/.env

# 2. Open the file to edit it
nano apps/api/.env
```

**Inside the Nano editor:**
1.  Use arrow keys to move.
2.  Delete the placeholder text for `DATABASE_URL` and paste your **NEON PRODUCTION Connection String**.
3.  Fill in your `CLOUDINARY` keys (same as dev is fine, or different if you have a prod environment).
4.  **Save & Exit**: Press `Ctrl+X`, then type `Y`, then `Enter`.

```bash
# 3. Create the frontend env file
cp apps/web/.env.example apps/web/.env

# > [!IMPORTANT]
# > You MUST edit this file to point to your real domain, NOT localhost!
nano apps/web/.env

# Change NEXT_PUBLIC_API_URL="http://localhost:4001"
# To     NEXT_PUBLIC_API_URL="https://youtubersity.xyz/api"
```

## Step 3.5: Migrate the PROD Database
Now that the `.env` has your PROD database URL, we need to make it visible to the database tool and create tables.

```bash
# 1. Copy the secret file to the main folder so Prisma can see it
cp apps/api/.env .env

# 2. Run the migration command
npx prisma db push --schema=packages/db/prisma/schema.prisma
```
*(It should say "The database is now in sync with your schema.")*

## Step 4: Install & Build
Now we install the software libraries and build the app.

```bash
# 1. Install dependencies (this might take a minute)
npm install

# 2. Build the project
npm run build
```

## Step 5: Start with PM2
We use PM2 to keep the app running forever.

```bash
# 1. Start the apps using our config file
pm2 start ecosystem.config.cjs

# 2. Save the list so they restart if the server reboots
pm2 save
```

## Step 6: Configure Nginx (The Web Server)
This makes your domain point to the app.

```bash
# 1. Create the config file
nano /etc/nginx/sites-available/A
```

**Paste this content into the file:**
*(Copy from below, right-click in terminal to paste)*

```nginx
server {
    server_name youtubersity.xyz www.youtubersity.xyz;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 80;
}
```

**Save & Exit**: `Ctrl+X`, `Y`, `Enter`.

```bash
# 2. Enable the site
ln -s /etc/nginx/sites-available/A /etc/nginx/sites-enabled/

# 3. Test for errors (should say "syntax is ok")
nginx -t

# 4. Restart Nginx
systemctl restart nginx
```

## Step 6.5: Configure Domain (Namecheap)
**Before running the SSL step, point your domain to the VPS.**

1.  Log in to **Namecheap**.
2.  Go to **Domain List** -> Click **Manage** next to `youtubersity.xyz`.
3.  Go to **Advanced DNS**.
4.  Add a new record:
    *   **Type**: `A Record`
    *   **Host**: `@`
    *   **Value**: `84.247.140.9`
    *   **TTL**: Automatic
5.  Add another record (for www):
    *   **Type**: `A Record`
    *   **Host**: `www`
    *   **Value**: `84.247.140.9`
    *   **TTL**: Automatic
6.  **Wait 5-10 minutes** for the changes to propagate.

## Step 7: SSL (HTTPS)
Make it secure.

```bash
certbot --nginx -d youtubersity.xyz -d www.youtubersity.xyz
```
*(Follow the prompts, enter your email, agree to terms)*

## DONE!
Open `https://youtubersity.xyz` in your browser.
