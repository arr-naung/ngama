# Oracle Cloud Free Deployment Guide

## ✅ 100% Free Forever

Oracle Cloud offers an **Always Free Tier** that never expires and never charges you.

| Resource | Free Limit |
|----------|------------|
| ARM VMs | 4 cores, 24GB RAM, 200GB storage |
| AMD VMs | 2 instances, 1GB RAM each |
| Database | 2 Autonomous DBs (20GB each) |
| Outbound Data | 10TB/month |

---

## Step 1: Create Oracle Cloud Account

1. Go to [cloud.oracle.com/free](https://www.oracle.com/cloud/free/)
2. Click **"Start for free"**
3. Fill in your details:
   - **Country**: Your country
   - **Email**: Your email
   - **Home Region**: **Singapore** (closest to Myanmar)
4. **Credit card**: Required for verification only - **you won't be charged**
5. Verify email and complete signup

> ⚠️ **Important**: Choose **Singapore** region for best speed!

---

## Step 2: Create Free VM

1. Go to **Compute** → **Instances** → **Create Instance**
2. **Name**: `ngama-server`
3. **Image**: **Ubuntu 22.04** (Canonical)
4. **Shape**: Click **Change Shape** →
   - Select **Ampere** (ARM) → **VM.Standard.A1.Flex**
   - **OCPUs**: 4 (max free)
   - **Memory**: 24 GB (max free)
5. **Networking**: Keep defaults (creates public IP)
6. **SSH Key**: 
   - Choose **Generate a key pair**
   - **Download both keys** (save them safely!)
7. Click **Create**

Wait 2-3 minutes for the instance to be "Running".

---

## Step 3: Connect to Your Server

### Windows (PowerShell)
```powershell
# Navigate to where you saved the key
cd Downloads

# Fix key permissions
icacls ssh-key*.key /inheritance:r /grant:r "$($env:USERNAME):(R)"

# Connect
ssh -i ssh-key-*.key ubuntu@YOUR_PUBLIC_IP
```

### Mac/Linux
```bash
chmod 400 ~/Downloads/ssh-key-*.key
ssh -i ~/Downloads/ssh-key-*.key ubuntu@YOUR_PUBLIC_IP
```

Find **YOUR_PUBLIC_IP** in Oracle Console → Instance Details.

---

## Step 4: Open Firewall Ports

Oracle blocks ports by default. Run these commands on your server:

```bash
# Open HTTP, HTTPS, and app ports
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3001 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT
sudo netfilter-persistent save
```

Also in Oracle Console:
1. Go to **Networking** → **Virtual Cloud Networks** → Your VCN
2. Click **Security Lists** → **Default Security List**
3. **Add Ingress Rules**:
   - Source: `0.0.0.0/0`, Port: `80`, Protocol: TCP
   - Source: `0.0.0.0/0`, Port: `443`, Protocol: TCP
   - Source: `0.0.0.0/0`, Port: `3000`, Protocol: TCP
   - Source: `0.0.0.0/0`, Port: `3001`, Protocol: TCP
   - Source: `0.0.0.0/0`, Port: `8000`, Protocol: TCP

---

## Step 5: Install Coolify

Run this ONE command:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

Wait 5-10 minutes. Then visit:
```
http://YOUR_PUBLIC_IP:8000
```

Create your admin account.

---

## Step 6: Deploy Your App

### A. Create Database
1. In Coolify: **+ New Resource** → **Database** → **PostgreSQL**
2. Click **Start**
3. Copy **Connection String** (starts with `postgres://...`)

### B. Deploy API
1. **+ New Resource** → **Public Repository**
2. **Repository URL**: `https://github.com/YOUR_USERNAME/Antigravity`
3. **Base Directory**: `apps/api`
4. **Build Pack**: `Nixpacks`
5. **Port**: `3001`
6. **Environment Variables**:
   ```
   DATABASE_URL=postgres://... (from step A)
   JWT_SECRET=your-random-secret-key-minimum-32-characters
   PORT=3001
   ```
7. Click **Deploy**

### C. Deploy Web
1. **+ New Resource** → **Public Repository**
2. **Repository URL**: Same as above
3. **Base Directory**: `apps/web`
4. **Port**: `3000`
5. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=http://YOUR_PUBLIC_IP:3001
   ```
6. Click **Deploy**

---

## Step 7: Access Your App

| Service | URL |
|---------|-----|
| Web App | `http://YOUR_PUBLIC_IP:3000` |
| API | `http://YOUR_PUBLIC_IP:3001` |
| Coolify | `http://YOUR_PUBLIC_IP:8000` |

---

## Step 8: Update Mobile App

Update `apps/mobile/constants.ts`:
```typescript
export const BASE_URL = 'http://YOUR_PUBLIC_IP:3001';
```

---

## 🎉 Done!

Your X-Clone is now running on Oracle Cloud for **$0/month**!

### Tips
- **Always Free** resources have a green badge in Oracle Console
- If ARM instance fails to create, try AMD (VM.Standard.E2.1.Micro)
- Add a free domain via Cloudflare for HTTPS
