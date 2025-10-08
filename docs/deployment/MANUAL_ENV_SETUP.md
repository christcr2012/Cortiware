# Manual Environment Variable Setup for Vercel

**Date:** October 8, 2025  
**Status:** Ready for deployment

---

## Quick Setup Guide (5 minutes)

### Step 1: Access Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select team: **Robinson AI Systems** (`chris-projects-de6cd1bf`)

---

### Step 2: Configure provider-portal

1. Click on **cortiware-provider-portal** project
2. Go to **Settings** → **Environment Variables**
3. Add the following variable:

**Variable 1:**
- **Key:** `AUTH_TICKET_HMAC_SECRET`
- **Value:** `5f8bd6c4c819aa626b389cbf1e0c95c178b30e0fa27aedc016baaf22d6fa5a20`
- **Environments:** Production, Preview, Development (select all)
- Click **Save**

---

### Step 3: Configure tenant-app

1. Go back to dashboard
2. Click on **cortiware-tenant-app** project
3. Go to **Settings** → **Environment Variables**
4. Add the following 5 variables:

**Variable 1:**
- **Key:** `AUTH_TICKET_HMAC_SECRET`
- **Value:** `5f8bd6c4c819aa626b389cbf1e0c95c178b30e0fa27aedc016baaf22d6fa5a20`
- **Environments:** Production, Preview, Development (select all)
- Click **Save**

**Variable 2:**
- **Key:** `TENANT_COOKIE_SECRET`
- **Value:** `5f8b02b1c2523185a667082a2cdfce3bb633b0bc478b26c424d3bded47e72744`
- **Environments:** Production, Preview, Development (select all)
- Click **Save**

**Variable 3:**
- **Key:** `PROVIDER_ADMIN_PASSWORD_HASH`
- **Value:** `$2b$12$XYWtnQK8Z4GhYEKIGwvo5e5vhS6MkmVOPzUAWBlxLXlKDYMjqCsye`
- **Environments:** Production, Preview, Development (select all)
- Click **Save**

**Variable 4:**
- **Key:** `DEVELOPER_ADMIN_PASSWORD_HASH`
- **Value:** `$2b$12$GTar80xmtoOUYxVCjVUN8OXgOzEDIuOZmq1CHUyjpfLPM667kT5bDu`
- **Environments:** Production, Preview, Development (select all)
- Click **Save**

**Variable 5:**
- **Key:** `EMERGENCY_LOGIN_ENABLED`
- **Value:** `false`
- **Environments:** Production, Preview, Development (select all)
- Click **Save**

---

### Step 4: Trigger Redeployment

**Option A: Automatic (Recommended)**
1. Go to **Deployments** tab for each project
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Confirm redeployment

**Option B: Git Push**
- Environment variables will be used on next git push
- Already pushed latest code, so just wait for auto-deploy

---

### Step 5: Verify Deployment

1. Wait for deployments to complete (~2-3 minutes)
2. Check deployment logs for any errors
3. Visit the deployed URLs:
   - Provider Portal: https://cortiware-provider-portal.vercel.app
   - Tenant App: https://cortiware-tenant-app.vercel.app

---

## Emergency Access Credentials

**⚠️ IMPORTANT: Store these in your password manager!**

### Provider Admin Access
- **Username:** `provider` (or as configured)
- **Password:** `8ee1d99b806fd9d349df5e9083f5a85b`
- **Hash:** `$2b$12$XYWtnQK8Z4GhYEKIGwvo5e5vhS6MkmVOPzUAWBlxLXlKDYMjqCsye`

### Developer Admin Access
- **Username:** `developer` (or as configured)
- **Password:** `e77e80ffd8a5dfa54077d59b69e98964`
- **Hash:** `$2b$12$GTar80xmtoOUYxVCjVUN8OXgOzEDIuOZmq1CHUyjpfLPM667kT5bDu`

**Note:** Emergency access is disabled by default (`EMERGENCY_LOGIN_ENABLED=false`). Only enable when SSO is down.

---

## Verification Checklist

After deployment, verify:

- [ ] Both apps deployed successfully
- [ ] No errors in deployment logs
- [ ] Provider portal loads at https://cortiware-provider-portal.vercel.app
- [ ] Tenant app loads at https://cortiware-tenant-app.vercel.app
- [ ] SSO ticket flow works (login to provider, navigate to tenant)
- [ ] Emergency access is disabled (returns error when accessed)

---

## Testing Emergency Access (Preview Environment Only)

**DO NOT test in production!**

1. Go to tenant-app Settings → Environment Variables
2. Find `EMERGENCY_LOGIN_ENABLED`
3. Change value to `true` for **Preview** environment only
4. Redeploy to preview
5. Access: `https://[preview-url]/api/auth/emergency`
6. Test with emergency credentials above
7. Verify single-tenant mode banner appears
8. Set `EMERGENCY_LOGIN_ENABLED` back to `false`

---

## Troubleshooting

### Deployment Fails
- Check deployment logs in Vercel dashboard
- Verify all environment variables are set correctly
- Ensure no typos in variable names or values

### SSO Not Working
- Verify `AUTH_TICKET_HMAC_SECRET` is identical in both apps
- Check browser console for errors
- Review audit logs in database

### Emergency Access Not Working
- Verify `EMERGENCY_LOGIN_ENABLED=true` (only for testing)
- Check password hash is correct
- Review rate limiting logs

---

## Security Reminders

1. **Never commit secrets to git** - All secrets are gitignored
2. **Emergency access disabled by default** - Only enable during SSO outage
3. **Rotate secrets regularly** - Every 90 days recommended
4. **Monitor audit logs** - Review for unauthorized access
5. **Use IP allowlist** - Add `EMERGENCY_IP_ALLOWLIST` for production

---

## Next Steps After Deployment

1. ✅ Monitor deployments for 24 hours
2. ✅ Test all authentication flows thoroughly
3. ✅ Begin Phase 2: Redis/KV and refresh tokens
4. ✅ Plan Epic #43: Provider/Developer portals

---

## Support Documentation

- `docs/implementation/OPTION_C_PHASE_1_COMPLETE.md` - Implementation details
- `docs/runbooks/SSO_OUTAGE_RECOVERY.md` - Emergency procedures
- `docs/deployment/GENERATED_SECRETS.md` - All secrets (gitignored)
- `docs/deployment/PHASE1_DEPLOYMENT_STATUS.md` - Deployment status

---

**Ready to deploy!** Follow the steps above to complete Phase 1 deployment.

