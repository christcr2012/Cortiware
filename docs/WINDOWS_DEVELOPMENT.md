# Windows Development Guide

This guide covers Windows-specific development issues and solutions for the Cortiware monorepo.

## Table of Contents
- [Prisma Client Regeneration](#prisma-client-regeneration)
- [Common Issues](#common-issues)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Prisma Client Regeneration

### The Problem

On Windows, `npx prisma generate` often fails with an EPERM (operation not permitted) error:

```
Error: EPERM: operation not permitted, rename 
'C:\...\node_modules\.prisma\client\query_engine-windows.dll.node.tmp12345' -> 
'C:\...\node_modules\.prisma\client\query_engine-windows.dll.node'
```

**Root Cause:** Node.js processes keep file handles open to the Prisma query engine DLL, preventing Prisma from replacing it during regeneration.

### The Solution

We've created a robust PowerShell script that handles this issue automatically.

#### Quick Fix (Recommended)

```powershell
npm run prisma:regen
```

This runs our custom regeneration script that:
1. Gracefully stops all Node.js processes
2. Clears the Prisma cache
3. Regenerates the client with retry logic
4. Verifies the generation succeeded

#### Manual Fix

If the automated script doesn't work:

```powershell
# 1. Stop all Node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Wait for file handles to release
Start-Sleep -Seconds 3

# 3. Clear Prisma cache
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Regenerate
npx prisma generate
```

#### Nuclear Option

If all else fails:

1. Close VS Code and all terminals
2. Restart your computer (clears all file locks)
3. Run `npm run prisma:regen`

---

## Common Issues

### Issue 1: TypeScript Errors After Schema Changes

**Symptom:** You changed `prisma/schema.prisma` but TypeScript still shows errors for the old schema.

**Solution:**
```powershell
npm run prisma:regen
```

Then restart the TypeScript server in VS Code:
- Press `Ctrl+Shift+P`
- Type "TypeScript: Restart TS Server"
- Press Enter

### Issue 2: "Module not found: @prisma/client"

**Symptom:** Import errors for `@prisma/client` even though it's installed.

**Solution:**
```powershell
# Reinstall Prisma
npm install @prisma/client prisma --force

# Regenerate client
npm run prisma:regen
```

### Issue 3: Dev Server Won't Start After Schema Changes

**Symptom:** `npm run dev` fails with Prisma-related errors.

**Solution:**
```powershell
# Stop all dev servers
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Regenerate Prisma
npm run prisma:regen

# Start dev server
npm run dev
```

### Issue 4: Migration Fails with File Lock

**Symptom:** `npx prisma migrate dev` fails with EPERM error.

**Solution:**
```powershell
# Stop all Node processes first
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait for file handles to release
Start-Sleep -Seconds 3

# Run migration
npx prisma migrate dev
```

---

## Troubleshooting

### Check if Node Processes are Running

```powershell
Get-Process -Name "node" -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, StartTime
```

### Check Prisma Client Status

```powershell
# Check if client exists
Test-Path "node_modules\.prisma\client\index.js"

# Check client file size and timestamp
Get-Item "node_modules\.prisma\client\index.js" | Format-List Name, Length, LastWriteTime
```

### Force Kill All Node Processes

```powershell
# WARNING: This will stop ALL Node.js processes, including dev servers
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Clear All Caches

```powershell
# Clear Prisma cache
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue

# Clear Turbo cache
Remove-Item -Path ".turbo/cache" -Recurse -Force -ErrorAction SilentlyContinue

# Clear Next.js cache (all apps)
Remove-Item -Path "apps/*/.next" -Recurse -Force -ErrorAction SilentlyContinue
```

---

## Best Practices

### 1. Always Use the Regeneration Script

Instead of running `npx prisma generate` directly, use:

```powershell
npm run prisma:regen
```

This ensures proper cleanup and retry logic.

### 2. Stop Dev Servers Before Schema Changes

Before editing `prisma/schema.prisma`:

```powershell
# Stop all dev servers
Ctrl+C in all terminal windows

# Or force kill
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 3. Restart VS Code After Major Changes

After significant schema changes or package updates:

1. Close all files
2. Close VS Code
3. Reopen VS Code
4. Run `npm run prisma:regen`

### 4. Use WSL2 for Better Performance (Optional)

Windows Subsystem for Linux 2 (WSL2) doesn't have these file lock issues:

```bash
# Install WSL2 (PowerShell as Administrator)
wsl --install

# Clone repo in WSL2
cd ~
git clone https://github.com/christcr2012/Cortiware.git
cd Cortiware

# Install dependencies
npm install

# Prisma works normally in WSL2
npx prisma generate
```

### 5. Keep Node.js Updated

Newer versions of Node.js have better file handle management:

```powershell
# Check current version
node --version

# Update to latest LTS (22.x)
# Download from https://nodejs.org/
```

---

## Script Reference

### `npm run prisma:regen`

**Location:** `scripts/regenerate-prisma.ps1`

**What it does:**
1. Stops all Node.js processes gracefully
2. Clears Prisma client cache
3. Runs `npx prisma generate` with retry logic (3 attempts)
4. Uses exponential backoff (2s, 4s, 8s delays)
5. Verifies the client was generated successfully

**Options:**
```powershell
# Custom retry count
.\scripts\regenerate-prisma.ps1 -MaxRetries 5

# Custom retry delay
.\scripts\regenerate-prisma.ps1 -RetryDelaySeconds 3

# Both
.\scripts\regenerate-prisma.ps1 -MaxRetries 5 -RetryDelaySeconds 3
```

**Exit Codes:**
- `0` - Success
- `1` - Failure (check error message)

---

## FAQ

### Q: Why does this only happen on Windows?

**A:** Windows handles file locks differently than Unix-like systems. When a process opens a DLL file on Windows, it gets an exclusive lock that prevents other processes from modifying or deleting it. On Linux/macOS, files can be deleted even while in use.

### Q: Can I just ignore the error and push to CI?

**A:** You can, but it's not recommended. You won't be able to verify your changes locally, and you might push broken code. Always try to fix it locally first.

### Q: Will this affect production deployments?

**A:** No. This is a local development issue only. CI/CD environments (GitHub Actions, Vercel) run in clean Linux containers where this issue doesn't occur.

### Q: Should I commit the `.prisma` folder?

**A:** No. The `.prisma` folder is in `.gitignore` and should never be committed. It's generated automatically during `npm install` and deployment.

### Q: What if the script still fails?

**A:** Try the "Nuclear Option" (restart computer). If that doesn't work, consider using WSL2 for development, or reach out for help with your specific error message.

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma GitHub Issues](https://github.com/prisma/prisma/issues)
- [WSL2 Installation Guide](https://docs.microsoft.com/en-us/windows/wsl/install)
- [Node.js Downloads](https://nodejs.org/)

---

**Last Updated:** 2025-10-08  
**Maintainer:** Cortiware Development Team

