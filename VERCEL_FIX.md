# Fix Vercel "No Next.js version detected" Error

## The Problem

You're seeing this error:
```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies".
```

**Root Cause:** Vercel is looking at the wrong `package.json` file (the root one, which doesn't have `next` as a dependency). It needs to look at `apps/web/package.json` instead.

## The Solution

You **MUST** set the Root Directory in Vercel dashboard settings. This cannot be done via config files alone.

### Step-by-Step Fix

#### 1. Go to Vercel Dashboard

- Navigate to https://vercel.com/dashboard
- Find your project
- Click on it

#### 2. Go to Settings

- Click **"Settings"** in the top navigation
- Click **"General"** in the left sidebar

#### 3. Find Root Directory Setting

Scroll down to the **"Build & Development Settings"** section

#### 4. Edit Root Directory

- You'll see **"Root Directory"**
- It's probably set to `./` or blank
- Click the **"Edit"** button next to it

#### 5. Set to apps/web

- In the text field, enter: `apps/web`
- Click **"Save"**

#### 6. Redeploy

- Go to the **"Deployments"** tab
- Find your latest failed deployment
- Click the **"⋯"** (three dots) menu
- Click **"Redeploy"**
- ✅ The build should now succeed!

## Visual Guide

```
Settings → General → Build & Development Settings

┌─────────────────────────────────────────┐
│ Root Directory                          │
│                                         │
│ [         apps/web         ]  [Edit]    │  ← Change this!
│                                         │
│ By default, the deployment will be     │
│ built from the root directory.          │
└─────────────────────────────────────────┘
```

## After Setting Root Directory

Once `apps/web` is set as Root Directory, Vercel will:

✅ Find `apps/web/package.json` (which has `next` dependency)
✅ Run `npm install` in `apps/web/`
✅ Run `npm run build` in `apps/web/`
✅ Deploy the `.next` folder
✅ Your build will succeed!

## Verification

After redeploying, check the build logs. You should see:

```
✓ Detected Next.js version: 16.1.1
✓ Installing dependencies...
✓ Running "npm run build"
✓ Compiled successfully
```

## Alternative: Delete and Reimport

If setting Root Directory doesn't work:

1. **Delete the Vercel project** entirely
2. **Reimport** from GitHub
3. During import, **before clicking Deploy**:
   - Set Framework Preset to **"Next.js"**
   - Set Root Directory to **"apps/web"**
   - Add environment variables
4. Then click **"Deploy"**

## Common Mistakes

❌ **Don't** leave Root Directory blank
❌ **Don't** set it to `./`
❌ **Don't** set it to `apps` (missing the `/web`)
✅ **Do** set it to exactly: `apps/web`

## Still Not Working?

If you've set Root Directory to `apps/web` and it still fails:

1. **Clear the build cache:**
   - Settings → General → scroll to bottom
   - Click "Clear Build Cache"
   - Redeploy

2. **Check your branch:**
   - Make sure Vercel is deploying from `claude/clone-whatsapp-mcp-lUAlL`
   - Settings → Git → Production Branch

3. **Verify package.json exists:**
   - Go to your GitHub repo
   - Navigate to `apps/web/package.json`
   - Verify `"next": "^16.1.1"` is in dependencies

## Why Can't This Be Fixed With Config Files?

Vercel's Root Directory setting is a **project-level setting** that determines:
- Which directory to start from
- Which `package.json` to use
- Where to run commands

This setting **must** be configured in the dashboard before any config files are read. That's why `vercel.json` at the root won't help - Vercel hasn't changed directories yet!

---

**TL;DR:** Go to Vercel Settings → General → Set Root Directory to `apps/web` → Save → Redeploy ✅
