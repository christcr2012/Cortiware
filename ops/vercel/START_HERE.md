# 🚀 START HERE - Cortiware Deployment

**Your complete deployment roadmap**

---

## 📋 What You Need to Do

You have **3 main files** to guide you through deployment:

### 1. **MY_DEPLOYMENT_GUIDE.md** ⭐ START HERE
**Location:** `ops/vercel/MY_DEPLOYMENT_GUIDE.md`

**What it is:** Your personalized step-by-step guide with:
- Your actual database URL
- Your actual email addresses
- Your actual GitHub repo
- Exact commands to run
- No placeholders - real values you can copy/paste

**Use this for:** Following the deployment process step-by-step

---

### 2. **VERCEL_DEPLOYMENT_GUIDE.md** 📚 REFERENCE
**Location:** `ops/vercel/VERCEL_DEPLOYMENT_GUIDE.md`

**What it is:** Complete technical reference with:
- Detailed explanations
- Troubleshooting sections
- Domain configuration
- Advanced options

**Use this for:** When you need more details or run into issues

---

### 3. **QUICK_START.md** ⚡ QUICK REFERENCE
**Location:** `ops/vercel/QUICK_START.md`

**What it is:** Condensed checklist format

**Use this for:** Quick lookups after you've done it once

---

## 🎯 Quick Start (5 Steps)

### Step 1: Generate Secrets (5 minutes)
```bash
cd "C:\Users\chris\Git Local\StreamFlow"
node scripts/generate-secrets.js
```
Copy the output - you'll need it for Vercel.

---

### Step 2: Rename Folder (5 minutes)
1. Close VS Code
2. Commit everything: `git add -A && git commit -m "Pre-rename" && git push`
3. Rename: `StreamFlow` → `Cortiware`
4. Reopen in VS Code

**See:** `MY_DEPLOYMENT_GUIDE.md` Step 1

---

### Step 3: Remove Old Logos (10 minutes)
```powershell
cd "C:\Users\chris\Git Local\Cortiware"
Get-ChildItem -Recurse -Include *.ico,favicon.*,logo.*,*icon*.png,*icon*.svg -Exclude node_modules
```
Delete what you find, then commit.

**See:** `MY_DEPLOYMENT_GUIDE.md` Step 2

---

### Step 4: Export from mountain-vista (10 minutes)
1. Go to Vercel → mountain-vista project
2. Settings → Environment Variables → Download .env
3. Save as `mountain-vista-backup.env` on Desktop

**See:** `MY_DEPLOYMENT_GUIDE.md` Step 3

---

### Step 5: Create New Vercel Projects (45 minutes)
Create 4 new projects:
1. `cortiware-provider-portal` (replaces mountain-vista)
2. `cortiware-marketing-robinson`
3. `cortiware-marketing-cortiware`
4. `cortiware-tenant-app`

**See:** `MY_DEPLOYMENT_GUIDE.md` Step 4 (has all the exact settings)

---

## 📁 Helper Files

### `.env.vercel.template`
Template with your actual values (except secrets).
Use this as a reference when setting up Vercel environment variables.

### `scripts/generate-secrets.js`
Generates all the random secrets you need for Vercel.
Run this first!

---

## ⚠️ Important Notes

### DO NOT Rename "mountain-vista" Project
- Renaming breaks authentication, tokens, OIDC, webhooks
- Instead: Create new projects, test, then delete old one
- **See:** `MY_DEPLOYMENT_GUIDE.md` Step 0.3 for full explanation

### Your Stripe Keys
- Not included in git (GitHub blocks them)
- Copy from your `.env.local` file (lines 35-37)
- Add to Vercel when setting up environment variables

### Test Before Deleting
- Deploy new provider portal
- Test login works
- Test all features
- **ONLY THEN** delete mountain-vista

---

## 🎯 Your Deployment Checklist

- [ ] Run `node scripts/generate-secrets.js` and save output
- [ ] Rename folder: StreamFlow → Cortiware
- [ ] Remove old logos and commit
- [ ] Export environment variables from mountain-vista
- [ ] Create 4 new Vercel projects
- [ ] Add environment variables to each project
- [ ] Test new provider portal thoroughly
- [ ] Update Stripe webhook (if applicable)
- [ ] Delete mountain-vista project
- [ ] Clean up backup files

---

## 📞 Need Help?

### Build Fails
Check: `VERCEL_DEPLOYMENT_GUIDE.md` → Troubleshooting section

### Can't Login
Check: Environment variables are set correctly in Vercel

### Database Errors
Check: DATABASE_URL is correct and Neon database is running

### Domain Issues
Check: `VERCEL_DEPLOYMENT_GUIDE.md` → Step 6 (Configure Domains)

---

## 🎉 After Deployment

Your new URLs will be:
- **Provider Portal:** `https://cortiware-provider-portal.vercel.app`
- **Marketing (Robinson):** `https://cortiware-marketing-robinson.vercel.app`
- **Marketing (Cortiware):** `https://cortiware-marketing-cortiware.vercel.app`
- **Tenant App:** `https://cortiware-tenant-app.vercel.app`

---

## 📚 File Structure

```
ops/vercel/
├── START_HERE.md                    ← You are here
├── MY_DEPLOYMENT_GUIDE.md           ← Your personalized guide (START HERE)
├── VERCEL_DEPLOYMENT_GUIDE.md       ← Complete reference
└── QUICK_START.md                   ← Quick reference

scripts/
└── generate-secrets.js              ← Run this first!

.env.vercel.template                 ← Template with your values
```

---

**Ready to start?** Open `MY_DEPLOYMENT_GUIDE.md` and follow Step 1! 🚀

