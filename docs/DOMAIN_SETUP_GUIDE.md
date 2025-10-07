# Domain Setup Guide - Step by Step

This guide walks you through connecting your purchased domains to your Vercel projects.

---

## Prerequisites

✅ You have purchased domains (e.g., from GoDaddy, Namecheap, Google Domains, etc.)  
✅ You have Vercel projects deployed (provider-portal, tenant-app, marketing sites)  
✅ You have access to your domain registrar's DNS management

---

## Step 1: Identify Your Domains

**Write down your domains here:**

| Purpose | Domain | Vercel Project |
|---------|--------|----------------|
| Provider Portal | `_________________` | provider-portal |
| Tenant App | `_________________` | tenant-app |
| Marketing (Robinson) | `_________________` | marketing-robinson |
| Marketing (Cortiware) | `_________________` | marketing-cortiware |

**Example:**
| Purpose | Domain | Vercel Project |
|---------|--------|----------------|
| Provider Portal | `provider.cortiware.com` | provider-portal |
| Tenant App | `app.cortiware.com` | tenant-app |
| Marketing (Robinson) | `robinson.com` | marketing-robinson |
| Marketing (Cortiware) | `cortiware.com` | marketing-cortiware |

---

## Step 2: Add Domains to Vercel (For Each Project)

### Provider Portal Domain

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Login if needed

2. **Select Project**
   - Click on **provider-portal** project

3. **Navigate to Domains**
   - Click **Settings** tab
   - Click **Domains** in left sidebar

4. **Add Domain**
   - Click **Add** button
   - Enter your provider domain (e.g., `provider.cortiware.com`)
   - Click **Add**

5. **Note DNS Records**
   - Vercel will show you DNS records to configure
   - **Keep this page open** - you'll need these records in Step 3

### Repeat for Other Projects

Do the same for:
- **tenant-app** → your tenant domain
- **marketing-robinson** → your Robinson domain
- **marketing-cortiware** → your Cortiware domain

---

## Step 3: Configure DNS Records

### Where to Configure DNS

Go to your domain registrar's website:
- **GoDaddy**: https://dcc.godaddy.com/manage/dns
- **Namecheap**: https://ap.www.namecheap.com/domains/list
- **Google Domains**: https://domains.google.com/registrar
- **Cloudflare**: https://dash.cloudflare.com

### DNS Record Types

Vercel will show you one of these configurations:

#### Option A: Subdomain (e.g., `app.cortiware.com`)

**Add a CNAME record:**
```
Type: CNAME
Name: app (or the subdomain part)
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

#### Option B: Root Domain (e.g., `cortiware.com`)

**Add an A record:**
```
Type: A
Name: @ (or leave blank for root)
Value: 76.76.21.21
TTL: 3600 (or Auto)
```

**Also add a CNAME for www:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

### Example: GoDaddy DNS Configuration

1. Login to GoDaddy
2. Go to **My Products** → **Domains**
3. Click **DNS** next to your domain
4. Click **Add** button
5. Select record type (A or CNAME)
6. Fill in Name and Value from Vercel
7. Click **Save**

### Example: Namecheap DNS Configuration

1. Login to Namecheap
2. Go to **Domain List**
3. Click **Manage** next to your domain
4. Click **Advanced DNS** tab
5. Click **Add New Record**
6. Select record type (A or CNAME)
7. Fill in Host and Value from Vercel
8. Click **Save All Changes**

---

## Step 4: Wait for DNS Propagation

**How long?** 5 minutes to 48 hours (usually 15-30 minutes)

**Check propagation status:**
- Visit: https://dnschecker.org
- Enter your domain
- Select record type (A or CNAME)
- Check if it shows the correct value globally

**What to expect:**
- ✅ Green checkmarks = propagated
- ⏳ Red X's = still propagating (wait longer)

---

## Step 5: Verify Domain in Vercel

1. **Go back to Vercel project**
2. **Settings** → **Domains**
3. **Check domain status:**
   - ⏳ "Pending" = DNS not propagated yet
   - ✅ "Valid" = Domain is working!
   - ❌ "Invalid Configuration" = DNS records incorrect

4. **If Invalid:**
   - Click on the domain
   - Vercel will show what's wrong
   - Fix DNS records and wait

---

## Step 6: Enable HTTPS (SSL Certificate)

**Automatic!** Vercel handles this for you.

**Timeline:**
- Domain added → SSL certificate requested
- DNS propagated → SSL certificate issued
- Usually takes 5-10 minutes after DNS propagates

**Check SSL:**
1. Visit your domain in browser
2. Look for 🔒 lock icon in address bar
3. Click lock → should show "Certificate (Valid)"

**If no SSL after 30 minutes:**
- Check DNS is fully propagated
- Try removing and re-adding domain in Vercel
- Contact Vercel support

---

## Step 7: Test Each Domain

### Provider Portal
1. Visit: `https://your-provider-domain.com`
2. Should see provider portal login page
3. Try logging in
4. Check theme switcher works

### Tenant App
1. Visit: `https://your-tenant-domain.com`
2. Should see tenant app login page
3. Try logging in
4. Check dashboard loads

### Marketing Sites
1. Visit each marketing domain
2. Should see marketing pages
3. Check all links work

---

## Troubleshooting

### Domain shows "Deployment not found"

**Cause**: Domain is connected but no deployment is set as production.

**Fix**:
1. Go to Vercel project
2. **Deployments** tab
3. Find latest deployment
4. Click **⋯** → **Promote to Production**

### Domain shows old content or 404

**Cause**: DNS is pointing to wrong place or cached.

**Fix**:
1. Verify DNS records match Vercel's instructions exactly
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try incognito/private browsing
4. Wait longer for DNS propagation

### SSL certificate not working

**Cause**: DNS not fully propagated or certificate issuance failed.

**Fix**:
1. Wait 30 minutes after DNS propagates
2. Check https://dnschecker.org shows correct records globally
3. Remove domain from Vercel and re-add
4. Contact Vercel support if still failing

### "This site can't be reached"

**Cause**: DNS records not configured or incorrect.

**Fix**:
1. Double-check DNS records in registrar
2. Verify you're using correct record type (A vs CNAME)
3. Ensure no typos in domain name or values
4. Wait for DNS propagation

---

## Advanced: Custom Nameservers (Optional)

For better performance and features, you can use Vercel's nameservers:

1. **Get Vercel nameservers:**
   - In Vercel project → Settings → Domains
   - Click domain → "Use Vercel Nameservers"
   - Note the nameserver addresses

2. **Update at registrar:**
   - Go to domain registrar
   - Find "Nameservers" or "DNS Settings"
   - Change from registrar's nameservers to Vercel's
   - Save changes

3. **Wait for propagation:**
   - Can take 24-48 hours
   - Check with `nslookup your-domain.com`

**Benefits:**
- Faster DNS resolution
- Automatic SSL renewal
- Better DDoS protection
- Easier management

---

## Domain Checklist

Use this checklist to track your progress:

### Provider Portal Domain
- [ ] Domain added to Vercel project
- [ ] DNS records configured at registrar
- [ ] DNS propagated (checked with dnschecker.org)
- [ ] Domain shows "Valid" in Vercel
- [ ] SSL certificate issued (🔒 in browser)
- [ ] Site loads correctly
- [ ] Login works
- [ ] Theme switcher works

### Tenant App Domain
- [ ] Domain added to Vercel project
- [ ] DNS records configured at registrar
- [ ] DNS propagated
- [ ] Domain shows "Valid" in Vercel
- [ ] SSL certificate issued
- [ ] Site loads correctly
- [ ] Login works
- [ ] Dashboard loads

### Marketing Domains (repeat for each)
- [ ] Domain added to Vercel project
- [ ] DNS records configured
- [ ] DNS propagated
- [ ] Domain shows "Valid" in Vercel
- [ ] SSL certificate issued
- [ ] Site loads correctly
- [ ] All pages work

---

## Next Steps After Domains Are Working

1. ✅ Update environment variables with actual domain URLs
2. ✅ Test SSO flow between provider and tenant apps
3. ✅ Configure email sending (SendGrid, etc.)
4. ✅ Set up monitoring and alerts
5. ✅ Configure custom error pages
6. ✅ Add analytics (Google Analytics, Plausible, etc.)

---

## Getting Help

**Vercel Support:**
- Dashboard → Help → Contact Support
- Include: domain name, project name, error message

**DNS Issues:**
- Contact your domain registrar's support
- Provide: domain name, DNS records you're trying to set

**Community:**
- Vercel Discord: https://vercel.com/discord
- Vercel Discussions: https://github.com/vercel/vercel/discussions

