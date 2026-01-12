# AI-TO-AI HANDOVER: Deploying "Project A" on youtubersity.xyz

**OBJECTIVE:** Deploy a second independent project (Tech Stack: Next.js + NestJS) on the existing Contabo VPS without breaking the current "MasteryLearning" production app.

---

## 1. Current VPS Snapshot (The "Source of Truth")
- **OS:** Ubuntu
- **Web Server:** Nginx (Proxy)
- **Process Manager:** PM2
- **SSL:** Certbot (Let's Encrypt)
- **Active Project:** MasteryLearning (`youtubersity.online`)
  - **Folder:** `/var/www/app`
  - **Ports:** Frontend: `3000` | Backend: `3001`
  - **PM2 Names:** `api`, `web`

---

## 2. Requirements for Project A
- **Name:** Project A
- **Domain:** `youtubersity.xyz` & `www.youtubersity.xyz`
- **Installation Path:** `/var/www/project-a`

### Port Assignments (NON-NEGOTIABLE)
To avoid 502/EADDRINUSE errors, use these ports for Project A:
- **Frontend Port:** `4000`
- **Backend Port:** `4001`

---

## 3. Nginx Strategy
Create a **NEW** virtual host file. **Do not modify** the existing `/etc/nginx/sites-available/app` file.

**File Path:** `/etc/nginx/sites-available/project-a`
**Configuration:**
```nginx
server {
    server_name youtubersity.xyz www.youtubersity.xyz;

    # Frontend (Next.js - Port 4000)
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
        proxy_buffering off;
    }

    # Backend API (NestJS - Port 4001)
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

---

## 4. PM2 Deployment Commands
Use unique names to ensure `pm2 list` and logs are distinct.

```bash
# Backend
pm2 start dist/main.js --name "project-a-api"

# Frontend
pm2 start npm --name "project-a-web" -- start
```

---

## 5. SSL & Activation
1. Enable the config: `ln -s /etc/nginx/sites-available/project-a /etc/nginx/sites-enabled/`
2. Test Nginx: `nginx -t`
3. Restart Nginx: `systemctl restart nginx`
4. Run Certbot: `certbot --nginx -d youtubersity.xyz -d www.youtubersity.xyz`

---

## 📋 Note to Agent
Check the backend's `main.ts` and enable `trust proxy` to ensure secure cookies work behind the Nginx proxy:
`(app.getHttpAdapter().getInstance() as any).set('trust proxy', 1);`