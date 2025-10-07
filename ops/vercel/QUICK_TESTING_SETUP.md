# Quick Testing Setup - After Deployment

**Goal:** Make your deployed site safe for testing in 5 minutes

---

## ✅ Checklist (Do this after deployment works)

### 1. Verify Stripe Test Mode (2 minutes)

Go to each Vercel project → Settings → Environment Variables:

```bash
# Should start with "sk_test_" ✅
STRIPE_SECRET_KEY=sk_test_...

# Should start with "pk_test_" ✅  
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**If they start with `sk_live_` or `pk_live_` → STOP and change them!**

---

### 2. Enable Password Protection (3 minutes)

**For EACH of your 4 Vercel projects:**

1. Go to: Settings → Environment Variables
2. Click "Add New"
3. Add these two variables:

```bash
Name: SITE_PROTECTION_ENABLED
Value: true
Environments: ✅ Production ✅ Preview ✅ Development

Name: SITE_PROTECTION_PASSWORD  
Value: TestPass2025
Environments: ✅ Production ✅ Preview ✅ Development
```

4. Click "Save"
5. Go to: Deployments → Latest → Click "..." → "Redeploy"

**Test it:**
- Visit your Vercel URL
- You should see password prompt
- Enter: `TestPass2025`
- You should get in

---

### 3. Create Test Account

Use this test data:

```bash
Email: test@example.com
Password: Test123!
Name: Test User
Organization: ACME Test Corp
```

---

### 4. Test Payment

Use Stripe test card:

```bash
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

---

## 🎯 You're Done!

Your site is now:
- ✅ Live on Vercel
- ✅ Protected by password
- ✅ Using Stripe test mode
- ✅ Safe to test with fake data

---

## 📋 Share with Testers

Send them:
1. **URL:** `https://your-app.vercel.app`
2. **Password:** `TestPass2025`
3. **Test Card:** `4242 4242 4242 4242`

---

## 🚨 When Ready for Production

**Only do this when ready for real users:**

1. Change Stripe to live keys (`sk_live_...`)
2. Set `SITE_PROTECTION_ENABLED=false`
3. Add custom domains
4. Remove all test data

---

## 💡 Quick Tips

- **Preview URLs are private** - Hard to guess, not on Google
- **Test mode = no real charges** - Safe to test payments
- **Password expires in 24 hours** - Testers need to re-enter
- **Change password anytime** - Just update the env var

---

**Need help?** See full guide: `ops/vercel/TESTING_MODE_GUIDE.md`

