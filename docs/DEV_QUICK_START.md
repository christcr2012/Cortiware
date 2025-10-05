# Development Quick Start Guide

**Last Updated:** 2025-01-15

---

## 🚀 Quick Start (5 Minutes)

### **1. Start Dev Server**
```bash
npm run dev
```

### **2. Login Credentials (Dev Mode)**

**ANY email and password works!** Just use these patterns:

| Account Type | Email Pattern | Password | Redirects To |
|--------------|---------------|----------|--------------|
| **Provider** | `admin@test.com` | `test` | `/provider` |
| **Developer** | `dev@test.com` | `test` | `/developer` |
| **Tenant (Owner)** | `owner@test.com` | `test` | `/dashboard` |
| **Accountant** | `accountant@test.com` | `test` | `/accountant` |
| **Vendor** | `vendor@test.com` | `test` | `/vendor` |

**Note:** In dev mode, you can use ANY email/password combination!

---

## 🔑 Login URLs

### **Provider Portal (Green Theme)**
```
URL: http://localhost:5000/provider/login
Email: admin@test.com
Password: test
→ Redirects to /provider
```

### **Developer Portal (Green Theme)**
```
URL: http://localhost:5000/developer/login
Email: dev@test.com
Password: test
→ Redirects to /developer
```

### **Client Login (Unified)**
```
URL: http://localhost:5000/login
Email: owner@test.com (or accountant@test.com, vendor@test.com)
Password: test
→ Auto-detects account type and redirects
```

---

## 🎨 Current UI Status

### **✅ Working Pages**
- `/provider/login` - Green futuristic theme ✅
- `/developer/login` - Green futuristic theme ✅
- `/login` - Needs green theme update 🔄

### **❌ Missing Pages (404)**
- `/provider` - Provider dashboard (needs creation)
- `/developer` - Developer dashboard (needs creation)
- `/accountant` - Accountant portal (needs creation)
- `/vendor` - Vendor portal (needs creation)

---

## 🛠️ Development Functions

### **Environment Variables (`.env.local`)**

```bash
# Dev Mode - Allow ANY credentials
DEV_ACCEPT_ANY_PROVIDER_LOGIN=true
DEV_ACCEPT_ANY_DEVELOPER_LOGIN=true
DEV_ACCEPT_ANY_TENANT_LOGIN=true
DEV_ACCEPT_ANY_ACCOUNTANT_LOGIN=true
DEV_ACCEPT_ANY_VENDOR_LOGIN=true

# Database (placeholder for now)
DATABASE_URL="postgresql://user:password@localhost:5432/streamflow?schema=public"

# Federation (disabled for now)
FED_ENABLED=false
FED_OIDC_ENABLED=false
```

### **Useful Commands**

```bash
# Start dev server
npm run dev

# Check TypeScript errors
npx tsc --noEmit

# Run linter
npm run lint

# Build for production
npm run build

# View database (when connected)
npx prisma studio

# Run migrations (when DATABASE_URL is set)
npx prisma migrate dev

# Seed database (when connected)
npm run seed
```

---

## 🧪 Testing Workflows

### **Test Provider Features**
```bash
1. Go to http://localhost:5000/provider/login
2. Email: admin@test.com, Password: test
3. Should redirect to /provider
4. (Currently 404 - needs dashboard creation)
```

### **Test Developer Features**
```bash
1. Go to http://localhost:5000/developer/login
2. Email: dev@test.com, Password: test
3. Should redirect to /developer
4. (Currently 404 - needs dashboard creation)
```

### **Test Client Features**
```bash
1. Go to http://localhost:5000/login
2. Email: owner@test.com, Password: test
3. Should redirect to /dashboard
4. (Should work if dashboard exists)
```

### **Test Unified Login Auto-Detection**
```bash
# Provider detection
Email: provider@anything.com → /provider

# Developer detection
Email: developer@anything.com → /developer

# Accountant detection
Email: accountant@anything.com → /accountant

# Vendor detection
Email: vendor@anything.com → /vendor

# Default (Tenant)
Email: anything@else.com → /dashboard
```

---

## 📊 Current Implementation Status

### **✅ Complete**
- [x] Database schema (ready for migration)
- [x] Unified login API (`/api/auth/login`)
- [x] Provider login page (green theme)
- [x] Developer login page (green theme)
- [x] Environment configuration
- [x] Dev escape hatches
- [x] Documentation

### **🔄 In Progress**
- [ ] Main login page (needs green theme)
- [ ] Provider dashboard page
- [ ] Developer dashboard page
- [ ] Accountant portal
- [ ] Vendor portal

### **📋 Planned**
- [ ] Recovery system
- [ ] Email verification
- [ ] Automated breakglass
- [ ] Database integration
- [ ] TOTP (2FA)
- [ ] Admin dashboard

---

## 🐛 Known Issues

### **Issue 1: Provider/Developer Dashboards 404**
**Problem:** Login works, but `/provider` and `/developer` pages don't exist yet.

**Workaround:** Pages need to be created.

**Fix:** Creating now...

### **Issue 2: Main Login Page Needs Green Theme**
**Problem:** `/login` page doesn't have the green futuristic theme yet.

**Workaround:** Use direct login URLs (`/provider/login`, `/developer/login`).

**Fix:** Updating now...

---

## 🎯 Next Steps

### **Immediate (Today)**
1. ✅ Create provider dashboard page
2. ✅ Create developer dashboard page
3. ✅ Apply green theme to main login page
4. ✅ Test all login flows

### **Short Term (This Week)**
1. Create accountant portal
2. Create vendor portal
3. Implement recovery codes
4. Add email verification

### **Medium Term (Next Week)**
1. Connect real database
2. Implement password hashing
3. Add TOTP (2FA)
4. Build admin dashboard

---

## 📞 Quick Reference

### **Login Credentials (Dev Mode)**
```
Provider:   admin@test.com / test
Developer:  dev@test.com / test
Tenant:     owner@test.com / test
Accountant: accountant@test.com / test
Vendor:     vendor@test.com / test
```

### **Portal URLs**
```
Provider:   /provider/login → /provider
Developer:  /developer/login → /developer
Client:     /login → /dashboard (or /accountant, /vendor)
```

### **Important Files**
```
Login API:     src/app/api/auth/login/route.ts
Provider UI:   src/app/(provider)/provider/login/page.tsx
Developer UI:  src/app/(developer)/developer/login/page.tsx
Main Login:    src/app/login/page.tsx
Env Config:    .env.local
```

---

## 🔧 Troubleshooting

### **"Invalid credentials" error**
- Check `.env.local` has `DEV_ACCEPT_ANY_*_LOGIN=true`
- Restart dev server after changing env vars
- Check console logs for authentication flow

### **404 after login**
- Dashboard page doesn't exist yet
- Check redirect URL in browser
- Verify cookie is set (DevTools → Application → Cookies)

### **TypeScript errors**
```bash
npx tsc --noEmit
# Fix errors before continuing
```

### **Build fails**
```bash
npm run build
# Check error messages
# Usually missing dependencies or TypeScript errors
```

---

## 📚 Documentation Links

- **Full System Docs:** `docs/UNIFIED_AUTH_SYSTEM.md`
- **Testing Guide:** `docs/DEV_ACCOUNT_ACCESS_GUIDE.md`
- **Production Checklist:** `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- **Implementation Plan:** `docs/AUTH_IMPLEMENTATION_PLAN.md`
- **Current Status:** `docs/IMPLEMENTATION_STATUS.md`

---

**🎉 You're all set! Start with `npm run dev` and test the login flows!**

