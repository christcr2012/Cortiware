# Quick Start: Rename & Deploy

**Quick reference for renaming project and deploying to Vercel**

---

## Step 1: Rename Project Folder (5 minutes)

### Before You Start
- [ ] Close VS Code completely
- [ ] Commit all changes: `git add -A && git commit -m "Pre-rename checkpoint" && git push`

### Rename the Folder

**Option A: File Explorer**
1. Navigate to `C:\Users\chris\Git Local\`
2. Right-click `StreamFlow` → Rename
3. Type `Cortiware` → Press Enter

**Option B: PowerShell**
```powershell
cd "C:\Users\chris\Git Local"
Rename-Item -Path "StreamFlow" -NewName "Cortiware"
```

### Reopen Project
1. Open VS Code
2. File → Open Folder
3. Navigate to `C:\Users\chris\Git Local\Cortiware`
4. Verify git works: `git status`

---

## Step 2: Remove Old Logos (10 minutes)

### Find Logo Files
```powershell
# Search for logo/favicon files
Get-ChildItem -Recurse -Include *.ico,favicon.*,logo.*,*icon*.png,*icon*.svg -Exclude node_modules
```

### Common Locations
- `public/favicon.ico`
- `public/logo.png`, `public/logo.svg`
- `public/icons/*`
- `apps/*/public/favicon.ico`
- `apps/*/public/logo*`

### Remove Files
```powershell
# Example - adjust based on what you find
Remove-Item public/favicon.ico -ErrorAction SilentlyContinue
Remove-Item public/logo.png -ErrorAction SilentlyContinue
Remove-Item -Recurse public/icons -ErrorAction SilentlyContinue
```

### Commit Changes
```bash
git add -A
git commit -m "chore: remove old StreamFlow branding"
git push
```

---

## Step 3: Vercel Project Strategy (IMPORTANT)

### ⚠️ DO NOT Rename Existing Vercel Project

**Why?** Renaming breaks:
- Authentication tokens
- Federation keys
- OIDC configurations
- Stripe webhooks

### Recommended Approach

**Keep your existing Vercel project** and:

1. **Update existing project settings:**
   - Settings → General → Root Directory: `apps/provider-portal`
   - Settings → General → Build Command: `cd ../.. && npm run build -- --filter=provider-portal`
   - Keep all environment variables as-is

2. **Create 3 new projects:**
   - `cortiware-marketing-robinson`
   - `cortiware-marketing-cortiware`
   - `cortiware-tenant-app`

---

## Step 4: Update Existing Vercel Project (15 minutes)

1. Go to your Vercel project dashboard
2. **Settings → General:**
   - Root Directory: `apps/provider-portal`
   - Build Command: `cd ../.. && npm run build -- --filter=provider-portal`
   - Install Command: `cd ../.. && npm install`
3. **Redeploy:**
   - Deployments tab → Latest deployment → "..." → Redeploy
4. **Verify:** Build succeeds with monorepo structure

---

## Step 5: Create New Projects (30 minutes)

### marketing-robinson
```
Project Name: cortiware-marketing-robinson
Root Directory: apps/marketing-robinson
Build Command: cd ../.. && npm run build -- --filter=marketing-robinson
Install Command: cd ../.. && npm install
```

### marketing-cortiware
```
Project Name: cortiware-marketing-cortiware
Root Directory: apps/marketing-cortiware
Build Command: cd ../.. && npm run build -- --filter=marketing-cortiware
Install Command: cd ../.. && npm install
```

### tenant-app
```
Project Name: cortiware-tenant-app
Root Directory: apps/tenant-app
Build Command: cd ../.. && npm run build -- --filter=tenant-app
Install Command: cd ../.. && npm install
```

---

## Step 6: Configure Domains (20 minutes)

### robinsonaisystems.com
- Project: cortiware-marketing-robinson
- Add domain: robinsonaisystems.com
- Add domain: www.robinsonaisystems.com (redirect to apex)
- DNS: A record @ → 76.76.21.21

### cortiware.com
- Project: cortiware-marketing-cortiware
- Add domain: cortiware.com
- Add domain: www.cortiware.com (redirect to apex)
- DNS: A record @ → 76.76.21.21

### *.cortiware.com (Requires Pro Plan)
- Project: cortiware-tenant-app
- Add domain: *.cortiware.com
- DNS: CNAME * → cname.vercel-dns.com

---

## Step 7: Add New Branding (Optional)

### Generate Favicons
1. Go to https://realfavicongenerator.net/
2. Upload your Cortiware logo
3. Download generated package

### Add to Apps
```
apps/provider-portal/public/favicon.ico
apps/marketing-robinson/public/favicon.ico
apps/marketing-cortiware/public/favicon.ico
apps/tenant-app/public/favicon.ico
```

### Commit
```bash
git add -A
git commit -m "feat: add Cortiware branding"
git push
```

---

## Verification Checklist

- [ ] Folder renamed to Cortiware
- [ ] Git still works in new location
- [ ] Old logos removed and committed
- [ ] Existing Vercel project updated (not renamed)
- [ ] 3 new Vercel projects created
- [ ] All 4 projects build successfully
- [ ] Domains configured
- [ ] SSL certificates active
- [ ] Authentication still works
- [ ] No broken tokens or webhooks

---

## Troubleshooting

### Git Not Working After Rename
```bash
cd "C:\Users\chris\Git Local\Cortiware"
git status
git remote -v
```
The `.git` folder should be intact. If issues persist, check you're in the correct directory.

### Vercel Build Fails
- Check Root Directory is set correctly
- Verify Build Command includes `cd ../..`
- Ensure Install Command includes `cd ../..`

### Authentication Broken
- Did you rename the Vercel project? (Don't do this!)
- Check environment variables are still set
- Verify PROVIDER_SESSION_SECRET, FED_HMAC_MASTER_KEY unchanged

---

**Full Guide:** See `ops/vercel/VERCEL_DEPLOYMENT_GUIDE.md` for complete details.

