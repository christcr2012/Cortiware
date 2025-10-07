# Testing Mode Guide - Safe Deployment Testing

**Purpose:** Keep your Vercel deployment safe for testing with test accounts while preventing public access.

**Status:** Ready to implement after initial deployment completes

---

## Quick Summary

Your site will be deployed and live on Vercel, but protected by multiple layers:
1. ✅ **Stripe Test Mode** - No real charges possible
2. ✅ **Password Protection** - Optional site-wide password gate
3. ✅ **Preview URLs Only** - No public domains yet
4. ✅ **Test Accounts** - Use fake data safely

---

## Step 1: Verify Stripe is in Test Mode

**Check your environment variables in Vercel:**

```bash
# These should all start with "sk_test_" or "pk_test_"
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

✅ **Test mode keys start with `sk_test_` and `pk_test_`**
❌ **Live mode keys start with `sk_live_` and `pk_live_`**

**How to verify:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `STRIPE_SECRET_KEY`
3. Click "Show" to reveal the value
4. Confirm it starts with `sk_test_`

---

## Step 2: Enable Site-Wide Password Protection (Optional but Recommended)

This adds a password gate to your entire site. Anyone visiting will need to enter a password first.

### Add Environment Variables in Vercel:

**For each of your 4 Vercel projects, add these:**

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add these two variables:

```bash
# Enable the password protection
SITE_PROTECTION_ENABLED=true

# Set your password (change this to something secure)
SITE_PROTECTION_PASSWORD=MyTestPassword123
```

3. **Important:** Set these for **all environments** (Production, Preview, Development)
4. Click "Save"
5. Redeploy the project (Settings → Deployments → Click "..." → Redeploy)

### How It Works:

- ✅ Anyone visiting your site sees a password prompt
- ✅ After entering the correct password, they get a 24-hour cookie
- ✅ You can share the password with testers
- ✅ To disable later, just set `SITE_PROTECTION_ENABLED=false`

### Testing the Password Protection:

1. Visit your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. You should see a "🔒 Site Access" page
3. Enter your password
4. You should be redirected to the site

---

## Step 3: Use Vercel Preview URLs (Not Production Domains)

**What are Preview URLs?**
- Every Vercel deployment gets a unique URL
- Format: `https://your-app-abc123.vercel.app`
- These are hard to guess and not indexed by search engines

**Where to find them:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Copy the "Preview URL"

**Advantages:**
- ✅ Not publicly discoverable
- ✅ Can share with specific testers
- ✅ Each branch gets its own URL
- ✅ No DNS configuration needed

**Don't configure custom domains yet:**
- ❌ Don't add `cortiware.com` yet
- ❌ Don't add `robinsonaisystems.com` yet
- ❌ Don't add wildcard domains yet

---

## Step 4: Create Test Accounts

### Test Data Guidelines:

**Use obviously fake data:**
```bash
# Good test data
Email: test@example.com
Name: Test User
Phone: 555-0100
Organization: ACME Test Corp
```

**Don't use:**
- ❌ Real email addresses
- ❌ Real phone numbers
- ❌ Real company names
- ❌ Real credit card numbers (use Stripe test cards)

### Stripe Test Cards:

Use these for testing payments:

```bash
# Success
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)

# Decline
Card: 4000 0000 0000 0002

# Requires 3D Secure
Card: 4000 0025 0000 3155
```

**Full list:** https://stripe.com/docs/testing#cards

---

## Step 5: Testing Checklist

Before inviting others to test:

- [ ] Verify Stripe is in test mode (keys start with `sk_test_`)
- [ ] Enable password protection (optional)
- [ ] Test the password protection works
- [ ] Create a test account and log in
- [ ] Try a test payment with Stripe test card
- [ ] Verify no real charges are made
- [ ] Share preview URL + password with testers

---

## Step 6: Monitoring During Testing

### Check Stripe Dashboard:

1. Go to https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in top right)
3. Check Payments → All payments
4. You should see test payments with "TEST MODE" badge

### Check Vercel Logs:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on a deployment
3. Click "Functions" tab to see logs
4. Look for errors or issues

---

## Step 7: When Ready for Production

**Only do this when you're ready for real users:**

1. **Get Stripe Live Keys:**
   - Go to Stripe Dashboard
   - Switch to "Live Mode"
   - Copy live API keys (start with `sk_live_`)

2. **Update Vercel Environment Variables:**
   ```bash
   STRIPE_SECRET_KEY=sk_live_...  # Change from sk_test_
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Change from pk_test_
   ```

3. **Disable Password Protection:**
   ```bash
   SITE_PROTECTION_ENABLED=false
   ```

4. **Configure Custom Domains:**
   - Add `cortiware.com`
   - Add `robinsonaisystems.com`
   - Configure DNS

5. **Final Checks:**
   - [ ] All test data removed
   - [ ] Real payment processing tested
   - [ ] SSL certificates active
   - [ ] Error monitoring enabled

---

## Common Questions

### Q: Can real users accidentally find my test site?
**A:** Very unlikely. Preview URLs are:
- Not indexed by Google
- Hard to guess (random characters)
- Can be password protected
- Not linked from anywhere

### Q: What if I accidentally use live Stripe keys?
**A:** You'll see real charges in your Stripe dashboard. Check the dashboard - if you see "TEST MODE" badge, you're safe.

### Q: Can I test with real credit cards?
**A:** No! Always use Stripe test cards. Real cards won't work in test mode anyway.

### Q: How do I share with testers?
**A:** 
1. Send them the Vercel preview URL
2. Send them the password (if enabled)
3. Give them test account credentials
4. Remind them to use Stripe test cards only

### Q: What if I need to reset everything?
**A:**
1. Delete all test data from database
2. Run seed script again
3. Redeploy from Vercel

---

## Emergency: Disable Everything

If something goes wrong and you need to shut down immediately:

### Option 1: Disable in Vercel
1. Go to Vercel Dashboard → Project → Settings
2. Scroll to "Deployment Protection"
3. Enable "Password Protection" (built-in Vercel feature)

### Option 2: Delete Deployment
1. Go to Vercel Dashboard → Project → Deployments
2. Click "..." on the deployment
3. Click "Delete"

### Option 3: Environment Variable Kill Switch
Add this to Vercel:
```bash
MAINTENANCE_MODE=true
```

Then update your middleware to check for it.

---

## Summary: Your Safety Layers

When properly configured, you have:

1. ✅ **Stripe Test Mode** - No real money
2. ✅ **Password Protection** - No unauthorized access
3. ✅ **Preview URLs** - Not publicly discoverable
4. ✅ **Test Accounts** - Fake data only
5. ✅ **No Custom Domains** - Not on Google yet

**You can test safely with confidence!**

---

## Next Steps

After you finish deployment:
1. Come back to this guide
2. Follow Step 2 to enable password protection
3. Follow Step 4 to create test accounts
4. Start testing!

**Questions?** Just ask and I'll walk you through each step.

