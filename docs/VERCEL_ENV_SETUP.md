# Vercel Environment Variables Setup

## 🚨 Critical: Provider & Developer Login Not Working?

If you're seeing "Server error" when trying to log in as Provider or Developer, it's because the required environment variables are not set in Vercel.

---

## ✅ Required Environment Variables

### **1. Database (Required)**

```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

**Where to get it:**
- Your PostgreSQL database connection string (e.g., from Neon, Supabase, Railway, etc.)
- Must include `?sslmode=require` for production databases

---

### **2. Provider & Developer Authentication (Required for Login)**

You have **two options**:

#### **Option A: Set Specific Credentials (Recommended for Production)**

```
PROVIDER_USERNAME=your-provider-username
PROVIDER_PASSWORD=your-secure-provider-password
DEVELOPER_USERNAME=your-developer-username
DEVELOPER_PASSWORD=your-secure-developer-password
```

**Security Notes:**
- Use strong, unique passwords
- These are environment-based credentials (NOT stored in database)
- Provider and Developer accounts have cross-client access

#### **Option B: Dev Escape Hatch (Testing Only - NOT for Production!)**

```
DEV_ACCEPT_ANY_PROVIDER_LOGIN=true
DEV_ACCEPT_ANY_DEVELOPER_LOGIN=true
```

**⚠️ WARNING:** This allows ANY username/password to log in! Only use for testing/development.

---

## 📝 How to Set Environment Variables in Vercel

### **Step 1: Go to Vercel Dashboard**

1. Visit https://vercel.com/dashboard
2. Select your **StreamFlow** project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar

### **Step 2: Add Each Variable**

For each environment variable:

1. Click **"Add New"**
2. **Key:** Enter the variable name (e.g., `PROVIDER_USERNAME`)
3. **Value:** Enter the value (e.g., `admin`)
4. **Environments:** Select all three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

### **Step 3: Redeploy**

After adding all variables:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger automatic deployment

---

## 🎯 Quick Setup (Copy & Paste)

### **For Testing (Quick Start)**

Add these to Vercel:

```
DATABASE_URL=your-database-url-here
DEV_ACCEPT_ANY_PROVIDER_LOGIN=true
DEV_ACCEPT_ANY_DEVELOPER_LOGIN=true
```

Then you can log in with ANY username/password.

### **For Production (Secure)**

Add these to Vercel:

```
DATABASE_URL=your-database-url-here
PROVIDER_USERNAME=admin
PROVIDER_PASSWORD=your-secure-password-here
DEVELOPER_USERNAME=dev
DEVELOPER_PASSWORD=your-secure-password-here
```

Then log in with the exact credentials you set.

---

## 🔍 Troubleshooting

### **Issue: "Server error" on login**

**Cause:** Environment variables not set in Vercel

**Solution:**
1. Check that `PROVIDER_USERNAME` and `PROVIDER_PASSWORD` are set in Vercel
2. OR set `DEV_ACCEPT_ANY_PROVIDER_LOGIN=true` for testing
3. Redeploy after adding variables

### **Issue: "Invalid credentials" on login**

**Cause:** Username/password doesn't match environment variables

**Solution:**
1. Double-check the values you set in Vercel
2. Make sure there are no extra spaces
3. Username and password are case-sensitive

### **Issue: Login works locally but not on Vercel**

**Cause:** Local `.env.local` has variables, but Vercel doesn't

**Solution:**
1. Copy the values from your local `.env.local`
2. Add them to Vercel Environment Variables
3. Redeploy

---

## 📚 Additional Environment Variables (Optional)

### **Federation (Optional)**

```
FED_ENABLED=false
FED_OIDC_ENABLED=false
```

### **OIDC Authentication (Optional)**

Only needed if `FED_OIDC_ENABLED=true`:

```
OIDC_PROVIDER_ISSUER=https://your-idp.example.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_REDIRECT_URI=https://your-app.vercel.app/api/auth/oidc/callback
OIDC_SCOPE=openid profile email
```

### **Rate Limiting (Optional)**

```
RATE_LIMIT_API_PER_MINUTE=60
RATE_LIMIT_AUTH_PER_MINUTE=20
```

### **Idempotency (Optional)**

```
IDEMPOTENCY_TTL_MINUTES=1440
```

---

## ✅ Verification

After setting up environment variables and redeploying:

1. **Visit your Vercel deployment URL**
2. **Navigate to `/provider/login`**
3. **Enter credentials:**
   - If using specific credentials: Use the exact username/password you set
   - If using dev escape hatch: Use ANY username/password
4. **Should redirect to `/provider` dashboard**

Same process for Developer login at `/developer/login`.

---

## 🔐 Security Best Practices

1. **Never commit credentials to Git**
   - `.env.local` is in `.gitignore`
   - Only use `.env.example` for documentation

2. **Use strong passwords in production**
   - Minimum 16 characters
   - Mix of letters, numbers, symbols

3. **Disable dev escape hatch in production**
   - Never set `DEV_ACCEPT_ANY_*_LOGIN=true` in production
   - Only use for local development/testing

4. **Rotate credentials regularly**
   - Change passwords every 90 days
   - Update in Vercel and redeploy

---

## 📞 Need Help?

If you're still having issues:

1. Check Vercel deployment logs for errors
2. Verify all environment variables are set correctly
3. Make sure you redeployed after adding variables
4. Check that `DATABASE_URL` is valid and accessible

