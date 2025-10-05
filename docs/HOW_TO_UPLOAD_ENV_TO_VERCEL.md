# How to Upload .env to Vercel

**Last Updated:** 2025-01-15

---

## 📋 STEP-BY-STEP GUIDE

### **Step 1: Edit the .env File**

1. Open `.env` in your editor
2. Replace all `⚠️` placeholders with real values:

```bash
# Change these passwords
PROVIDER_PASSWORD="⚠️CHANGE-THIS-TO-STRONG-PASSWORD⚠️"
# to something like:
PROVIDER_PASSWORD="MyStr0ng!P@ssw0rd2025#Provider"

# Generate encryption keys
BREAKGLASS_MASTER_KEY="⚠️GENERATE-WITH-OPENSSL-RAND-HEX-32⚠️"
# Run this command in terminal:
openssl rand -hex 32
# Then paste the result
```

3. Update your Neon database URL:
```bash
DATABASE_URL="postgresql://user:password@host.neon.tech/streamflow?sslmode=require"
```

4. **CRITICAL:** Set all dev flags to `false`:
```bash
DEV_ACCEPT_ANY_PROVIDER_LOGIN="false"
DEV_ACCEPT_ANY_DEVELOPER_LOGIN="false"
DEV_ACCEPT_ANY_TENANT_LOGIN="false"
DEV_ACCEPT_ANY_ACCOUNTANT_LOGIN="false"
DEV_ACCEPT_ANY_VENDOR_LOGIN="false"
```

---

### **Step 2: Upload to Vercel (Method 1: Dashboard)**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **StreamFlow**
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Click **Import .env** button (top right)
6. Select your `.env` file
7. Choose environment: **Production** (and Preview if you want)
8. Click **Import**

---

### **Step 3: Upload to Vercel (Method 2: CLI)**

If you prefer command line:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (if not already linked)
vercel link

# Pull current environment variables (to see what's there)
vercel env pull

# Add environment variables from .env file
# You'll need to do this manually for each variable:
vercel env add PROVIDER_USERNAME
# Then paste the value when prompted
# Choose: Production

# Or use this script to add all at once:
# (Create a file called upload-env.sh)
```

**upload-env.sh:**
```bash
#!/bin/bash
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ $key =~ ^#.*$ ]] && continue
  [[ -z $key ]] && continue
  
  # Remove quotes from value
  value=$(echo $value | sed 's/^"//;s/"$//')
  
  # Add to Vercel
  echo "$value" | vercel env add "$key" production
done < .env
```

Then run:
```bash
chmod +x upload-env.sh
./upload-env.sh
```

---

### **Step 4: Verify Upload**

1. Go back to Vercel Dashboard → Settings → Environment Variables
2. Check that all variables are listed:
   - ✅ DATABASE_URL
   - ✅ PROVIDER_USERNAME
   - ✅ PROVIDER_PASSWORD
   - ✅ DEVELOPER_USERNAME
   - ✅ DEVELOPER_PASSWORD
   - ✅ BREAKGLASS_MASTER_KEY
   - ✅ JWT_SECRET
   - ✅ All DEV_ACCEPT_ANY_*_LOGIN (should be "false")
   - ✅ NODE_ENV (should be "production")

---

### **Step 5: Redeploy**

After uploading environment variables, you MUST redeploy:

**Option A: Automatic (Recommended)**
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Check **Use existing Build Cache** (faster)
4. Click **Redeploy**

**Option B: Push to Git**
```bash
git commit --allow-empty -m "trigger redeploy"
git push
```

**Option C: CLI**
```bash
vercel --prod
```

---

### **Step 6: Test Production Login**

1. Go to your production URL: `https://streamflow.vercel.app`
2. Test each login:

**Provider Login:**
```
URL: https://streamflow.vercel.app/provider/login
Email: chris.tcr.2012@gmail.com
Password: (the one you set in .env)
```

**Developer Login:**
```
URL: https://streamflow.vercel.app/developer/login
Email: gametcr3@gmail.com
Password: (the one you set in .env)
```

**If login fails:**
- Check Vercel logs: Dashboard → Deployments → Latest → Runtime Logs
- Verify environment variables are set correctly
- Make sure DEV_ACCEPT_ANY_*_LOGIN are all "false"
- Check that passwords don't have special characters that need escaping

---

## 🔐 SECURITY CHECKLIST

Before going to production, verify:

- [ ] All passwords are strong (20+ characters)
- [ ] All passwords are unique (different for each account)
- [ ] BREAKGLASS_MASTER_KEY is generated with `openssl rand -hex 32`
- [ ] JWT_SECRET is generated with `openssl rand -hex 64`
- [ ] All DEV_ACCEPT_ANY_*_LOGIN are set to "false"
- [ ] NODE_ENV is set to "production"
- [ ] DATABASE_URL points to production database (Neon)
- [ ] .env file is NOT committed to git (check .gitignore)
- [ ] Email service is configured (if using password resets)
- [ ] SMS service is configured (if using SMS verification)

---

## 🚨 TROUBLESHOOTING

### **Problem: "Invalid credentials" in production**

**Solution:**
1. Check Vercel environment variables are set
2. Check passwords don't have special characters
3. Check DEV_ACCEPT_ANY_*_LOGIN are "false"
4. Check you're using the correct email

---

### **Problem: "Database connection failed"**

**Solution:**
1. Check DATABASE_URL is correct
2. Check Neon database is running
3. Check connection string has `?sslmode=require`
4. Test connection locally first

---

### **Problem: "Environment variable not found"**

**Solution:**
1. Verify variable is uploaded to Vercel
2. Redeploy after uploading
3. Check variable name matches exactly (case-sensitive)
4. Check variable is set for "Production" environment

---

### **Problem: "Still accepting any password in production"**

**Solution:**
1. Check DEV_ACCEPT_ANY_*_LOGIN are "false" (not "true")
2. Redeploy after changing
3. Clear browser cache
4. Try incognito/private window

---

## 📚 RELATED DOCUMENTATION

- `.env.example` - Template with all categories explained
- `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Full deployment guide
- `docs/DEV_QUICK_START.md` - Development setup
- `docs/EXISTING_AUTH_ANALYSIS.md` - Authentication system details

---

## 💡 TIPS

1. **Use a Password Manager**
   - Generate strong passwords
   - Store securely
   - Never write passwords in plain text

2. **Test Locally First**
   - Copy .env to .env.local
   - Set DEV_ACCEPT_ANY_*_LOGIN to "false"
   - Test with real credentials
   - Fix any issues before deploying

3. **Keep Backup**
   - Save .env file securely (NOT in git)
   - Store in password manager or encrypted drive
   - You'll need it if you redeploy or move servers

4. **Rotate Regularly**
   - Change passwords every 90 days
   - Regenerate encryption keys annually
   - Update after any security incident

---

**Ready to upload?** Follow the steps above and you'll be live in minutes! 🚀

