# Complete Deployment Guide - Railway & Vercel

This guide provides step-by-step checklists for deploying WhatSummary to Railway (Python API) and Vercel (Next.js frontend).

---

## 🚂 RAILWAY SETUP (Python API Server)

### Prerequisites
- Railway account connected to GitHub
- Repository: `antonhantel/whatsapp`
- Branch: `claude/clone-whatsapp-mcp-lUAlL`

### Step-by-Step Railway Configuration

#### 1. Create New Project

- [ ] Go to https://railway.app/dashboard
- [ ] Click **"New Project"**
- [ ] Select **"Deploy from GitHub repo"**
- [ ] Choose repository: **`antonhantel/whatsapp`**
- [ ] Select branch: **`claude/clone-whatsapp-mcp-lUAlL`**

#### 2. Configure Service Settings

Click on your service, then go to **Settings** tab:

##### Root Directory
```
whatsapp-mcp
```
**CRITICAL:** This must be set! Railway needs to look in the `whatsapp-mcp` subdirectory.

- [ ] Set **Root Directory** to: `whatsapp-mcp`

##### Build Settings (Optional - Railway auto-detects)

Railway will auto-detect from these files:
- `requirements.txt` ✅ (exists)
- `Procfile` ✅ (exists)
- `runtime.txt` ✅ (exists)
- `nixpacks.toml` ✅ (exists)

**Build Command** (auto-detected):
```bash
pip install -r requirements.txt && pip install -e whatsapp-mcp-server
```

**Start Command** (from Procfile):
```bash
python api-server.py
```

If Railway doesn't auto-detect, manually set:
- [ ] **Build Command**: `pip install -r requirements.txt && pip install -e whatsapp-mcp-server`
- [ ] **Start Command**: `python api-server.py`

##### Environment Variables

- [ ] **No environment variables needed!** (Railway sets PORT automatically)

Optional for debugging:
```env
PYTHONUNBUFFERED=1
```

#### 3. Deploy & Get URL

- [ ] Click **"Deploy"** or wait for auto-deployment
- [ ] Watch build logs for errors
- [ ] Once deployed, Railway will show a URL like:
  ```
  https://whatsapp-api-production-xxxx.up.railway.app
  ```
- [ ] Copy this URL for Vercel configuration

#### 4. Generate Public Domain (Optional)

- [ ] Go to **Settings** → **Networking**
- [ ] Click **"Generate Domain"**
- [ ] Railway provides a public URL (or use custom domain)

#### 5. Test the Deployment

```bash
# Test health endpoint
curl https://your-railway-url.railway.app/health

# Expected response:
{"status":"ok"}

# Test chats endpoint
curl https://your-railway-url.railway.app/api/chats

# Expected: JSON array (may be empty if no data)
```

### Railway Troubleshooting Checklist

**If build fails:**
- [ ] Verify **Root Directory** is set to `whatsapp-mcp`
- [ ] Check that `requirements.txt` exists in `whatsapp-mcp/`
- [ ] Check that `api-server.py` exists in `whatsapp-mcp/`
- [ ] Look at build logs for specific error
- [ ] Try redeploying: **Deployments** → **⋯** → **Redeploy**

**If "pip not found":**
- [ ] Ensure `requirements.txt` exists (not `requirements-api.txt`)
- [ ] Ensure `runtime.txt` exists with `python-3.10.12`
- [ ] Clear cache and redeploy

**If app crashes on start:**
- [ ] Check that `whatsapp-mcp-server` directory exists
- [ ] Check logs for Python import errors
- [ ] Verify `Procfile` has correct start command

---

## ⚡ VERCEL SETUP (Next.js Frontend)

### Prerequisites
- Vercel account connected to GitHub
- Repository: `antonhantel/whatsapp`
- Branch: `claude/clone-whatsapp-mcp-lUAlL`

### Step-by-Step Vercel Configuration

#### 1. Import Project

- [ ] Go to https://vercel.com/dashboard
- [ ] Click **"Add New..."** → **"Project"**
- [ ] Import **`antonhantel/whatsapp`**
- [ ] **Don't deploy yet!** Configure settings first

#### 2. Configure Build Settings

##### Framework Preset
- [ ] Set to: **Next.js**

##### Root Directory
- [ ] ⚠️ **CRITICAL**: Set to: `apps/web`
- [ ] Click **"Edit"** next to Root Directory
- [ ] Enter: `apps/web`
- [ ] This tells Vercel where to find Next.js

##### Build & Development Settings

These should auto-populate once Root Directory is set:

- **Build Command**: `npm run build` (auto-detected ✅)
- **Output Directory**: `.next` (auto-detected ✅)
- **Install Command**: `npm install` (auto-detected ✅)
- **Development Command**: `npm run dev` (auto-detected ✅)

- [ ] Verify all commands are auto-detected
- [ ] If not, manually set as shown above

##### Node.js Version
- [ ] Set to: **20.x** (recommended)
- [ ] Or: **18.x** (also supported)

#### 3. Environment Variables

Click **"Environment Variables"** and add the following:

##### Required Variables (All Environments)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lfhslebahujtvwtxqqof.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key...

# Anthropic API (for AI summaries)
ANTHROPIC_API_KEY=sk-ant-...your-key...

# Cron Secret (optional - for scheduled tasks)
CRON_SECRET=random-secret-string-123
```

- [ ] Add **NEXT_PUBLIC_SUPABASE_URL**
- [ ] Add **NEXT_PUBLIC_SUPABASE_ANON_KEY**
- [ ] Add **SUPABASE_SERVICE_ROLE_KEY**
- [ ] Add **ANTHROPIC_API_KEY**
- [ ] Add **CRON_SECRET** (optional)

##### Optional Variables (Add after Railway is deployed)

```env
# WhatsApp API Server (from Railway)
WHATSAPP_API_SERVER_URL=https://your-railway-url.railway.app

# WhatsApp Bridge (if deployed separately)
WHATSAPP_BRIDGE_URL=http://localhost:8080
```

**Note:** Leave these out initially. Add after deploying Railway.

- [ ] **After Railway deploys**, add **WHATSAPP_API_SERVER_URL** with Railway URL
- [ ] Redeploy Vercel after adding new variables

#### 4. Deploy

- [ ] Click **"Deploy"**
- [ ] Watch build logs
- [ ] Deployment should succeed!

#### 5. Post-Deployment

After successful deployment:

- [ ] Copy the Vercel URL (e.g., `https://your-app.vercel.app`)
- [ ] Visit the site and test:
  - [ ] Can access the homepage
  - [ ] Can sign up for an account
  - [ ] Can log in
  - [ ] Settings page loads (may show "not connected" - that's OK!)

### Vercel Troubleshooting Checklist

**If "No Next.js version detected":**
- [ ] **Root Directory** MUST be set to `apps/web`
- [ ] Go to **Settings** → **General** → **Root Directory**
- [ ] Change from `.` or blank to `apps/web`
- [ ] **Redeploy** from Deployments tab

**If "Module not found" errors:**
- [ ] Check that Root Directory is `apps/web`
- [ ] Check that package.json exists at `apps/web/package.json`
- [ ] Try **Clear Cache** and redeploy

**If build succeeds but app doesn't load:**
- [ ] Check browser console for errors
- [ ] Verify all environment variables are set
- [ ] Check Vercel function logs in dashboard

**If Tailwind CSS errors:**
- [ ] Should be fixed in latest commit ✅
- [ ] If not, check that `@tailwindcss/postcss` is in dependencies
- [ ] Check that `postcss.config.mjs` uses `@tailwindcss/postcss`

---

## 🔗 CONNECTING RAILWAY TO VERCEL

After both are deployed:

### 1. Get Railway URL

- [ ] Copy your Railway deployment URL
- [ ] Example: `https://whatsapp-api-production-a1b2c3.up.railway.app`

### 2. Add to Vercel Environment Variables

- [ ] Go to Vercel → **Settings** → **Environment Variables**
- [ ] Add new variable:
  ```
  WHATSAPP_API_SERVER_URL=https://your-railway-url.railway.app
  ```
- [ ] Apply to: **Production**, **Preview**, **Development**
- [ ] Click **"Save"**

### 3. Redeploy Vercel

- [ ] Go to **Deployments** tab
- [ ] Find latest deployment
- [ ] Click **⋯** → **Redeploy**
- [ ] Check "Use existing Build Cache" ✅
- [ ] Click **"Redeploy"**

### 4. Test the Connection

- [ ] Visit your Vercel app
- [ ] Log in
- [ ] Go to **Groups** page
- [ ] If Railway is working, groups should load!
- [ ] If you see "Failed to fetch groups", check:
  - [ ] Railway is actually running (visit Railway URL/health)
  - [ ] WHATSAPP_API_SERVER_URL is set correctly in Vercel
  - [ ] No CORS errors in browser console

---

## 📋 COMPLETE DEPLOYMENT CHECKLIST

Use this as your master checklist:

### Phase 1: Railway Python API
- [ ] Create Railway project from GitHub
- [ ] Set Root Directory to `whatsapp-mcp`
- [ ] Wait for auto-deploy
- [ ] Test health endpoint
- [ ] Copy Railway URL

### Phase 2: Vercel Next.js App
- [ ] Import GitHub repo to Vercel
- [ ] Set Framework to Next.js
- [ ] Set Root Directory to `apps/web`
- [ ] Add environment variables (Supabase, Anthropic)
- [ ] Deploy
- [ ] Test signup/login

### Phase 3: Connect Them
- [ ] Add Railway URL to Vercel env vars
- [ ] Redeploy Vercel
- [ ] Test Groups page loads

### Phase 4: WhatsApp Connection (Local Only for Now)
- [ ] Run Go bridge locally: `cd whatsapp-mcp/whatsapp-bridge && go run main.go`
- [ ] Modify main.go per GO_BRIDGE_SETUP.md
- [ ] Visit Settings page in deployed app
- [ ] Should show "Bridge not available" (expected - it's local)

---

## 🎯 EXPECTED RESULTS

### After Railway Deployment
✅ Can visit: `https://your-railway-url.railway.app/health`
✅ Returns: `{"status":"ok"}`
✅ `/api/chats` returns empty array `[]` (no data yet - normal)

### After Vercel Deployment
✅ Can visit: `https://your-app.vercel.app`
✅ Can sign up and create account
✅ Can log in with email/password
✅ Dashboard loads
✅ Settings page loads

### After Connecting Railway to Vercel
✅ Groups page attempts to fetch from Railway
✅ Returns empty array (no WhatsApp data yet - normal)
✅ No "failed to fetch" errors

### After WhatsApp Bridge (Local)
✅ Settings shows QR code
✅ Can scan with phone
✅ Status updates to "Connected!"
✅ Groups page shows actual WhatsApp groups!

---

## 🆘 GETTING HELP

**Railway Issues:**
- Check build logs in Railway dashboard
- Visit #help in Railway Discord
- Check Railway status: https://status.railway.app

**Vercel Issues:**
- Check deployment logs in Vercel dashboard
- Visit Vercel support: https://vercel.com/support
- Check Vercel status: https://vercel-status.com

**App Issues:**
- Check browser console (F12)
- Check Vercel function logs
- Check Railway application logs

---

## 📝 QUICK REFERENCE

### Railway Settings Summary
```
Root Directory: whatsapp-mcp
Build Command: (auto-detected from requirements.txt)
Start Command: (auto-detected from Procfile)
Environment: (none needed)
```

### Vercel Settings Summary
```
Framework: Next.js
Root Directory: apps/web
Build Command: (auto-detected)
Output Directory: (auto-detected)
Node Version: 20.x
```

### Environment Variables
```
# Vercel - Always Required
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY

# Vercel - After Railway
WHATSAPP_API_SERVER_URL

# Railway
(none needed)
```

---

Good luck with your deployment! 🚀
