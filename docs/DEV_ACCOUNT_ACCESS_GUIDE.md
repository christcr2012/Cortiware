# Development Account Access Guide

## 🎯 Quick Reference: How to Log In During Development

### **TL;DR - Use ANY Credentials**

When dev escape hatches are enabled, you can log in with **literally any email and password**:

```
Email: test@test.com
Password: test
→ Works! ✅
```

The system auto-detects account type based on what you're trying to access.

---

## 🔓 Development Mode Setup

### **Step 1: Enable Dev Escape Hatches**

Add these to your `.env.local`:

```bash
# Allow ANY credentials during development
DEV_ACCEPT_ANY_PROVIDER_LOGIN=true
DEV_ACCEPT_ANY_DEVELOPER_LOGIN=true
DEV_ACCEPT_ANY_TENANT_LOGIN=true
DEV_ACCEPT_ANY_ACCOUNTANT_LOGIN=true
DEV_ACCEPT_ANY_VENDOR_LOGIN=true
```

### **Step 2: Restart Your Dev Server**

```bash
npm run dev
```

### **Step 3: Log In**

Go to `http://localhost:5000/login` and use any credentials!

---

## 🧪 Testing Different Account Types

### **1. Provider Account (Cross-Client Admin)**

**Portal:** `/provider` (Green theme)

**How to Access:**
```
Method 1: Direct URL
→ Go to http://localhost:5000/provider/login
→ Email: admin@test.com
→ Password: test
→ Redirects to /provider ✅

Method 2: Unified Login
→ Go to http://localhost:5000/login
→ Email: provider@test.com
→ Password: anything
→ System detects "provider" in email → redirects to /provider ✅
```

**What You'll See:**
- Green futuristic theme
- Cross-client navigation
- Full system access
- "PROVIDER PORTAL" label

---

### **2. Developer Account (Platform Development)**

**Portal:** `/developer` (Green theme)

**How to Access:**
```
Method 1: Direct URL
→ Go to http://localhost:5000/developer/login
→ Email: dev@test.com
→ Password: test
→ Redirects to /developer ✅

Method 2: Unified Login
→ Go to http://localhost:5000/login
→ Email: developer@test.com
→ Password: anything
→ System detects "developer" in email → redirects to /developer ✅
```

**What You'll See:**
- Green futuristic theme
- Platform development tools
- System configuration
- "DEVELOPER PORTAL" label

---

### **3. Tenant User (Owner/Admin/User)**

**Portal:** `/dashboard` (Brand-configurable theme)

**How to Access:**
```
Method 1: Unified Login
→ Go to http://localhost:5000/login
→ Email: owner@company.com
→ Password: test
→ Redirects to /dashboard ✅

Method 2: Any email without special keywords
→ Email: john@anything.com
→ Password: test
→ Redirects to /dashboard ✅
```

**What You'll See:**
- Brand-configurable theme
- Tenant-specific data
- RBAC permissions
- Business operations

**Testing Different Roles:**
```
# Owner
Email: owner@test.com → Full access

# Admin
Email: admin@test.com → Admin access

# User
Email: user@test.com → Limited access
```

---

### **4. Accountant Account (Client-Side, Special)**

**Portal:** `/accountant` (Brand-configurable theme)

**How to Access:**
```
Method 1: Direct URL
→ Go to http://localhost:5000/accountant/login
→ Email: accountant@test.com
→ Password: test
→ Redirects to /accountant ✅

Method 2: Unified Login
→ Go to http://localhost:5000/login
→ Email: accountant@company.com
→ Password: anything
→ System detects "accountant" in email → redirects to /accountant ✅
```

**What You'll See:**
- Brand-configurable theme
- Financial data only
- Compliance features
- Limited scope (finance-only)

**Important:** Accountant is CLIENT-SIDE (not provider-side), but has special implementation for cross-tenant financial access.

---

### **5. Vendor Account (External Access)**

**Portal:** `/vendor` (Brand-configurable theme)

**How to Access:**
```
Method 1: Unified Login
→ Go to http://localhost:5000/login
→ Email: vendor@company.com
→ Password: test
→ Redirects to /vendor ✅
```

**What You'll See:**
- Brand-configurable theme
- Limited vendor scope
- Job/project access only
- External user experience

---

## 🎨 Visual Guide: Account Type Detection

The unified login system detects account type based on email patterns:

```
Email contains "provider" → Provider Account
Email contains "developer" OR "dev@" → Developer Account
Email contains "accountant" → Accountant Account
Email contains "vendor" → Vendor Account
Everything else → Tenant User
```

**Examples:**
```
provider@test.com → Provider ✅
admin-provider@company.com → Provider ✅
dev@test.com → Developer ✅
developer@company.com → Developer ✅
accountant@test.com → Accountant ✅
vendor@test.com → Vendor ✅
owner@company.com → Tenant User ✅
john.doe@anything.com → Tenant User ✅
```

---

## 🧪 Testing Recovery Flows

### **Test Recovery Codes**

```bash
# 1. Create a test user with recovery codes
→ Sign up as owner@test.com
→ Download recovery codes
→ Log out

# 2. Test recovery code login
→ Go to /login
→ Click "Can't access your account?"
→ Select "Use recovery code"
→ Enter one of your codes
→ Should log you in ✅
```

### **Test Email Verification**

```bash
# 1. Request password reset
→ Go to /login
→ Click "Forgot password?"
→ Enter email: owner@test.com
→ Check console/logs for verification code

# 2. Enter verification code
→ Enter the 6-digit code
→ Set new password
→ Log in with new password ✅
```

### **Test Automated Breakglass**

```bash
# 1. Trigger high-risk recovery
→ Use VPN or different IP
→ Clear browser data (new device fingerprint)
→ Request recovery at 3am (unusual hours)
→ Should see: "High risk detected, 4-hour delay"

# 2. Test low-risk recovery
→ Use normal IP
→ Normal browser
→ Normal hours
→ Should see: "Instant recovery" ✅
```

---

## 🔧 Advanced Testing

### **Test Specific Credentials (Without Escape Hatch)**

If you want to test real authentication without escape hatches:

```bash
# .env.local
DEV_ACCEPT_ANY_PROVIDER_LOGIN=false

# Set specific credentials
PROVIDER_USERNAME=admin@test.com
PROVIDER_PASSWORD=SecurePass123!
```

Now only `admin@test.com` with `SecurePass123!` will work.

### **Test Database Users**

```bash
# 1. Create a real user in database
npx prisma studio
→ Create User with email: realuser@test.com
→ Set passwordHash: (use bcrypt to hash "test123")

# 2. Log in with real credentials
→ Email: realuser@test.com
→ Password: test123
→ Should work! ✅
```

### **Test TOTP (2FA)**

```bash
# 1. Enable TOTP for a user
→ Log in as owner@test.com
→ Go to Settings → Security
→ Enable 2FA
→ Scan QR code with Google Authenticator

# 2. Log in with TOTP
→ Email: owner@test.com
→ Password: test123
→ Enter 6-digit TOTP code
→ Should log in ✅
```

---

## 📱 Testing on Different Devices

### **Desktop Browser**
```
Chrome: http://localhost:5000/login
Firefox: http://localhost:5000/login
Safari: http://localhost:5000/login
```

### **Mobile (Local Network)**
```
Find your local IP: ipconfig (Windows) or ifconfig (Mac)
Example: http://192.168.1.100:5000/login
```

### **Vercel Preview**
```
Push to GitHub → Vercel auto-deploys
Preview URL: https://stream-flow-xyz.vercel.app/login
```

---

## 🐛 Troubleshooting

### **"Invalid credentials" even with escape hatch enabled**

**Check:**
1. Is `DEV_ACCEPT_ANY_*_LOGIN=true` in `.env.local`?
2. Did you restart the dev server after adding env vars?
3. Check console logs for authentication flow

**Fix:**
```bash
# Verify env vars are loaded
console.log(process.env.DEV_ACCEPT_ANY_PROVIDER_LOGIN); // Should be "true"
```

### **Redirects to wrong portal**

**Check:**
- Email pattern detection logic
- Cookie being set correctly
- Layout authentication checks

**Fix:**
- Use direct login URLs (`/provider/login`, `/developer/login`, etc.)
- Check browser cookies (DevTools → Application → Cookies)

### **Recovery codes not working**

**Check:**
1. Are codes generated in database?
2. Are codes hashed correctly?
3. Is code marked as "used"?

**Fix:**
```bash
npx prisma studio
→ Check UserRecoveryCode table
→ Verify codeHash exists
→ Verify usedAt is null
```

---

## 📚 Quick Command Reference

```bash
# Start dev server
npm run dev

# Open Prisma Studio (view database)
npx prisma studio

# Generate new migration
npx prisma migrate dev --name your-migration-name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database with test data
npm run seed

# Run tests
npm run test:unit
npm run test:e2e

# Check TypeScript errors
npx tsc --noEmit

# Build for production
npm run build
```

---

## 🎯 Common Development Workflows

### **Workflow 1: Test Provider Features**
```
1. Go to /provider/login
2. Email: admin@test.com, Password: test
3. Navigate provider portal
4. Test cross-client features
5. Log out
```

### **Workflow 2: Test Client Features**
```
1. Go to /login
2. Email: owner@company.com, Password: test
3. Navigate dashboard
4. Test RBAC permissions
5. Log out
```

### **Workflow 3: Test Recovery Flow**
```
1. Go to /login
2. Click "Can't access account?"
3. Test recovery codes
4. Test email verification
5. Test breakglass activation
```

### **Workflow 4: Test All Account Types**
```
1. Provider: provider@test.com → /provider
2. Developer: dev@test.com → /developer
3. Tenant: owner@test.com → /dashboard
4. Accountant: accountant@test.com → /accountant
5. Vendor: vendor@test.com → /vendor
```

---

## 🚀 Next Steps

1. ✅ Enable dev escape hatches in `.env.local`
2. ✅ Restart dev server
3. ✅ Test all account types
4. ✅ Test recovery flows
5. ✅ Build your features
6. ✅ When ready for production, see `PRODUCTION_DEPLOYMENT_CHECKLIST.md`

---

**Questions? Issues? Check the troubleshooting section or review the implementation code!**

