# Vercel Deployment Fix Summary

## Problem

All Vercel deployments were failing with permission errors when trying to execute the Next.js binary.

## Root Cause Analysis

### Issue 1: Prisma Permission Error (Initial)
```
sh: line 1: /vercel/path0/node_modules/.bin/prisma: Permission denied
npm error code 126
npm error command failed
npm error command sh -c prisma generate
```

**Cause:** The `postinstall` script was running `prisma generate` during `npm install`, but Vercel's build environment had permission issues with the Prisma binary.

**Fix Applied:** 
- Removed `postinstall` script from `package.json`
- Added `vercel-build` script: `npx --yes prisma generate && npx --yes next build`
- Added Prisma binary targets: `["native", "rhel-openssl-3.0.x"]` in `prisma/schema.prisma`

### Issue 2: Next.js Binary Permission Error (Secondary)
```
sh: line 1: /vercel/path0/node_modules/.bin/next: Permission denied
Error: Command "next build" exited with 126
```

**Cause:** Vercel was auto-detecting Next.js and running `next build` directly instead of using our custom `vercel-build` script. The Next.js binary didn't have execute permissions in Vercel's environment.

**Fix Applied:**
- Updated `package.json` scripts to use `npx --yes` for better permission handling
- Added `buildCommand` to `vercel.json` to explicitly tell Vercel to use our custom build script

## Changes Made

### 1. `package.json`
```json
{
  "scripts": {
    "build": "npx --yes next build",
    "vercel-build": "npx --yes prisma generate && npx --yes next build"
  }
}
```

**Removed:** `postinstall` script  
**Changed:** `build` script to use `npx --yes`  
**Changed:** `vercel-build` script to use `npx --yes` and removed `prisma migrate deploy`

### 2. `prisma/schema.prisma`
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```

**Added:** `binaryTargets` for Vercel's RHEL-based environment

### 3. `vercel.json`
```json
{
  "buildCommand": "npm run vercel-build",
  "crons": [...]
}
```

**Added:** `buildCommand` to override Vercel's auto-detected build command

## Why These Fixes Work

1. **`npx --yes`**: Ensures binaries are executed with proper permissions by using npx's execution wrapper
2. **`vercel-build` script**: Provides a custom build process that Vercel will use instead of auto-detection
3. **`buildCommand` in vercel.json**: Explicitly tells Vercel which command to run, preventing auto-detection
4. **Prisma binary targets**: Ensures the correct Prisma binary is generated for Vercel's Linux environment
5. **No `postinstall`**: Avoids permission issues during `npm install` phase

## Deployment Status

**Latest Commits:**
- `de076da5bd`: Initial fix for Prisma permission error
- `47bc1b3b62`: Added npx to avoid Next.js binary permission issues
- `616da3a96e`: Configured Vercel to use vercel-build script

**Expected Outcome:**
- Vercel should now successfully run `npm run vercel-build`
- This will execute: `npx --yes prisma generate && npx --yes next build`
- Build should complete successfully
- Deployment should go live

## Verification Steps

1. Check latest deployment status in Vercel dashboard
2. Look for "Running \"npm run vercel-build\"" in build logs
3. Verify Prisma generates successfully
4. Verify Next.js build completes
5. Test deployed URL

## Environment Variables Required

Make sure these are set in Vercel → Settings → Environment Variables:

- `DATABASE_URL` (required) - PostgreSQL connection string
- `FED_ENABLED` (optional) - Enable federation features (default: false)
- `FED_OIDC_ENABLED` (optional) - Enable OIDC authentication (default: false)
- `NEXTAUTH_SECRET` (if using NextAuth)
- `NEXTAUTH_URL` (if using NextAuth)

## Troubleshooting

If deployment still fails:

1. **Check build logs** for the exact error message
2. **Verify environment variables** are set correctly
3. **Check DATABASE_URL** is accessible from Vercel
4. **Try manual redeploy** from Vercel dashboard
5. **Check Prisma schema** is valid: `npx prisma validate`
6. **Test locally**: `npm run vercel-build` should work locally

## Related Documentation

- `docs/VERCEL_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `docs/VERCEL_TROUBLESHOOTING.md` - Troubleshooting guide
- `.env.example` - Example environment variables

## Timeline

- **2025-10-05 07:11**: Initial deployment failure (Prisma permission error)
- **2025-10-05 07:24**: First fix applied (removed postinstall, added vercel-build)
- **2025-10-05 07:31**: Second fix applied (added npx to scripts)
- **2025-10-05 07:34**: Third fix applied (configured vercel.json buildCommand)

## Status

🔄 **Waiting for Vercel deployment to complete...**

Check deployment status at:
https://vercel.com/chris-projects-de6cd1bf/stream-flow

