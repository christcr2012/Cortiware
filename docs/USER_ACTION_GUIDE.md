# User Action Guide - What You Need to Do

This guide lists all actions YOU need to take to complete the deployment and Phase 2 setup.

---

## Part 1: Domain Setup (30 minutes)

### Step 1: Identify Your Domains

**What domains did you purchase?** List them here:
- Provider Portal domain: `_________________` (e.g., `provider.cortiware.com`)
- Tenant App domain: `_________________` (e.g., `app.cortiware.com`)
- Marketing Robinson: `_________________` (e.g., `robinson.com`)
- Marketing Cortiware: `_________________` (e.g., `cortiware.com`)

### Step 2: Add Domains to Vercel Projects

For each Vercel project, you need to add the custom domain:

#### Provider Portal Domain

1. Go to: https://vercel.com/dashboard
2. Click on your **provider-portal** project
3. Click **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your provider domain (e.g., `provider.cortiware.com`)
6. Click **Add**
7. Vercel will show you DNS records to configure

#### Tenant App Domain

1. Go to your **tenant-app** project in Vercel
2. **Settings** → **Domains**
3. **Add Domain**
4. Enter your tenant domain (e.g., `app.cortiware.com`)
5. Click **Add**
6. Note the DNS records shown

#### Marketing Sites (repeat for each)

Same process for:
- marketing-robinson project
- marketing-cortiware project

### Step 3: Configure DNS Records

**Where did you buy your domains?** (GoDaddy, Namecheap, Cloudflare, etc.)

Go to your domain registrar's DNS management page and add the records Vercel provided.

**Typical records needed:**

For root domain (e.g., `cortiware.com`):
```
Type: A
Name: @
Value: 76.76.21.21
```

For subdomain (e.g., `app.cortiware.com`):
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

**Important**: DNS propagation can take 5-60 minutes. Be patient!

### Step 4: Verify Domain Setup

After DNS propagates:
1. Visit each domain in your browser
2. You should see your app (or Vercel's "Deployment not found" if not deployed yet)
3. Check for SSL certificate (🔒 in browser)

---

## Part 2: Environment Variables Setup (45 minutes)

### Step 1: Generate Secrets

Open PowerShell and run these commands:

#### Generate HMAC Secret (for SSO)

```powershell
# Generate a random base64 string
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Copy the output** - this is your `AUTH_TICKET_HMAC_SECRET`

#### Generate Cookie Secret (for tenant sessions)

```powershell
# Generate another random string
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Copy the output** - this is your `TENANT_COOKIE_SECRET`

#### Generate Password Hashes (for emergency access)

```powershell
# Install bcryptjs if needed
npm install -g bcryptjs

# Generate provider hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YOUR-PROVIDER-PASSWORD', 10));"

# Generate developer hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YOUR-DEVELOPER-PASSWORD', 10));"
```

**Replace `YOUR-PROVIDER-PASSWORD` and `YOUR-DEVELOPER-PASSWORD` with actual passwords you'll remember!**

**Copy both hashes** - these are your:
- `PROVIDER_ADMIN_PASSWORD_HASH`
- `DEVELOPER_ADMIN_PASSWORD_HASH`

### Step 2: Add Environment Variables to Vercel

#### Provider Portal Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click **provider-portal** project
3. **Settings** → **Environment Variables**
4. Add these variables (click **Add** for each):

```
Name: AUTH_TICKET_HMAC_SECRET
Value: <paste the HMAC secret you generated>
Environment: Production, Preview, Development
```

```
Name: DATABASE_URL
Value: <your PostgreSQL connection string>
Environment: Production
```

```
Name: PROVIDER_ADMIN_PASSWORD_HASH
Value: <paste the provider hash you generated>
Environment: Production
```

```
Name: DEVELOPER_ADMIN_PASSWORD_HASH
Value: <paste the developer hash you generated>
Environment: Production
```

**Optional external service keys** (if you have them):
- `SENDGRID_API_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`

#### Tenant App Environment Variables

1. Go to **tenant-app** project in Vercel
2. **Settings** → **Environment Variables**
3. Add these:

```
Name: AUTH_TICKET_HMAC_SECRET
Value: <SAME secret as provider-portal>
Environment: Production, Preview, Development
```

```
Name: TENANT_COOKIE_SECRET
Value: <paste the cookie secret you generated>
Environment: Production, Preview, Development
```

```
Name: PROVIDER_ADMIN_PASSWORD_HASH
Value: <SAME hash as provider-portal>
Environment: Production
```

```
Name: DEVELOPER_ADMIN_PASSWORD_HASH
Value: <SAME hash as provider-portal>
Environment: Production
```

```
Name: EMERGENCY_LOGIN_ENABLED
Value: true
Environment: Production
```

```
Name: NEXT_PUBLIC_APP_URL
Value: https://app.cortiware.com (or your actual tenant domain)
Environment: Production
```

### Step 3: Redeploy Apps

After adding environment variables:

1. Go to each project in Vercel
2. Click **Deployments** tab
3. Find the latest deployment
4. Click **⋯** (three dots) → **Redeploy**
5. Check **Use existing Build Cache** (optional)
6. Click **Redeploy**

Wait for deployments to complete (usually 2-5 minutes each).

---

## Part 3: Database Setup (if not done)

### Option A: Vercel Postgres (Recommended)

1. Go to: https://vercel.com/dashboard
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name (e.g., `cortiware-db`)
6. Select region (closest to your users)
7. Click **Create**
8. Once created, click **Connect**
9. Select **provider-portal** project
10. Click **Connect**
11. Vercel will automatically add `DATABASE_URL` to your project

### Option B: External Postgres (Supabase, Railway, etc.)

1. Create a Postgres database on your provider
2. Get the connection string (format: `postgresql://user:password@host:5432/database`)
3. Add as `DATABASE_URL` environment variable in provider-portal

### Run Migrations

After database is connected:

```powershell
cd "C:\Users\chris\Git Local\Cortiware\apps\provider-portal"
npm run prisma:migrate
npm run prisma:seed
```

---

## Part 4: Verify Everything Works

### Test Provider Portal

1. Visit your provider domain (e.g., `https://provider.cortiware.com`)
2. Try logging in with provider credentials
3. Check that theme switcher works
4. Verify dashboard loads

### Test Tenant App

1. Visit your tenant domain (e.g., `https://app.cortiware.com`)
2. Try logging in with tenant user credentials
3. Check theme switcher in dashboard
4. Verify emergency access works (if enabled)

### Test SSO Flow

1. Login to provider portal
2. Navigate to a feature that redirects to tenant app
3. Should automatically authenticate via SSO ticket
4. No second login required

---

## Part 5: Phase 2 Setup (Redis/KV for Nonce Store)

### Option A: Vercel KV (Recommended)

1. Go to: https://vercel.com/dashboard
2. Click **Storage** tab
3. Click **Create Database**
4. Select **KV** (Redis-compatible)
5. Choose a name (e.g., `cortiware-kv`)
6. Select region
7. Click **Create**
8. Once created, click **Connect**
9. Select **tenant-app** project
10. Click **Connect**
11. Vercel will add these environment variables:
    - `KV_URL`
    - `KV_REST_API_URL`
    - `KV_REST_API_TOKEN`
    - `KV_REST_API_READ_ONLY_TOKEN`

### Option B: Upstash Redis (Alternative)

1. Go to: https://upstash.com
2. Create account (free tier available)
3. Create a new Redis database
4. Copy connection details
5. Add to tenant-app environment variables:
   - `REDIS_URL`

---

## Troubleshooting

### Domain not working?

- Check DNS records are correct
- Wait 30-60 minutes for DNS propagation
- Use https://dnschecker.org to verify propagation
- Ensure SSL certificate is issued (can take 5-10 minutes)

### Environment variables not working?

- Verify you clicked **Save** after adding each variable
- Redeploy the app after adding variables
- Check variable names match exactly (case-sensitive)
- For secrets, ensure no extra spaces or newlines

### Database connection failing?

- Verify `DATABASE_URL` format is correct
- Check database is accessible from Vercel's IP ranges
- Run migrations: `npm run prisma:migrate`
- Check Vercel logs for specific error messages

### SSO not working?

- Verify `AUTH_TICKET_HMAC_SECRET` is IDENTICAL in both apps
- Check `NEXT_PUBLIC_APP_URL` matches your actual tenant domain
- Verify both apps are deployed and accessible
- Check browser console for errors

---

## Next Steps After Setup

Once everything is working:

1. ✅ Test all authentication flows
2. ✅ Verify theme switching works
3. ✅ Test emergency access (if enabled)
4. ✅ Check audit logs are being created
5. ✅ Monitor Vercel logs for errors
6. ✅ Set up monitoring/alerting (optional)
7. ✅ Configure custom error pages (optional)
8. ✅ Set up analytics (optional)

---

## Getting Help

If you encounter issues:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Review `docs/ENVIRONMENT_VARIABLES.md`
4. Review `docs/runbooks/SSO_OUTAGE_RECOVERY.md`
5. Ask for help with specific error messages

