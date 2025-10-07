# SSO Outage Recovery Runbook

## Overview

This runbook provides step-by-step instructions for recovering from an SSO outage where Provider/Developer cannot access tenant systems through the normal provider-portal → tenant-app SSO flow.

## Symptoms

- Provider-portal is down or unreachable
- SSO ticket endpoint (`/api/auth/ticket`) is failing
- Ticket verification is failing in tenant-app
- Network connectivity issues between apps
- HMAC secret mismatch between apps

## Emergency Access Method

### Prerequisites

1. Emergency access must be enabled in tenant-app:
   ```bash
   EMERGENCY_LOGIN_ENABLED=true
   ```

2. Emergency password hashes must be configured:
   ```bash
   PROVIDER_ADMIN_PASSWORD_HASH=<bcrypt-hash>
   DEVELOPER_ADMIN_PASSWORD_HASH=<bcrypt-hash>
   ```

3. (Optional) Your IP must be in the allowlist if configured:
   ```bash
   EMERGENCY_IP_ALLOWLIST=1.2.3.4,5.6.7.8
   ```

### Step 1: Access Emergency Login

1. Navigate to tenant-app login page:
   ```
   https://cortiware-tenant-app.vercel.app/login
   ```

2. Click "Emergency access" link at the bottom of the login form

3. The form will switch to emergency mode with a red warning banner

### Step 2: Authenticate

1. Select your role:
   - Provider
   - Developer

2. Enter your emergency credentials:
   - Email: Your provider/developer email
   - Password: Your emergency password (NOT your normal password)

3. Click "Sign in"

### Step 3: Verify Access

1. You should be redirected to:
   - Provider: `/provider` (single-tenant mode)
   - Developer: `/developer` (single-tenant mode)

2. You will see a banner indicating "Direct Access Mode" or "Emergency Mode"

3. Navigation will be restricted to the current tenant context

### Step 4: Perform Recovery Actions

Once logged in via emergency access, you can:

- View and manage tenant data
- Access audit logs
- Perform critical operations
- Investigate the SSO outage
- Fix configuration issues

### Step 5: Monitor and Log

All emergency access is heavily logged:

1. Check application logs for emergency access entries:
   ```
   🚨 EMERGENCY PROVIDER ACCESS: email from IP
   🚨 EMERGENCY DEVELOPER ACCESS: email from IP
   ```

2. Review audit logs in the database:
   ```sql
   SELECT * FROM UserLoginHistory 
   WHERE method = 'emergency' 
   ORDER BY createdAt DESC;
   ```

3. Monitor for suspicious activity

## Troubleshooting

### "Emergency access is not available"

**Cause:** `EMERGENCY_LOGIN_ENABLED` is not set to `true`

**Solution:**
1. Go to Vercel dashboard → tenant-app project
2. Settings → Environment Variables
3. Add or update: `EMERGENCY_LOGIN_ENABLED=true`
4. Redeploy the app

### "Access forbidden"

**Cause:** Your IP is not in the allowlist

**Solution:**
1. Check your current IP: https://whatismyipaddress.com
2. Go to Vercel dashboard → tenant-app project
3. Settings → Environment Variables
4. Update `EMERGENCY_IP_ALLOWLIST` to include your IP
5. Redeploy the app

**Alternative:** Remove the `EMERGENCY_IP_ALLOWLIST` variable entirely to allow all IPs

### "Invalid credentials"

**Cause:** Password doesn't match the bcrypt hash

**Solution:**
1. Verify you're using the emergency password (not your normal password)
2. If you forgot the emergency password, generate a new hash:
   ```bash
   node scripts/generate-bcrypt-hash.js YourNewPassword
   ```
3. Update the hash in Vercel environment variables
4. Redeploy the app

### "Too many attempts"

**Cause:** Rate limiting (3 attempts per hour)

**Solution:**
1. Wait 1 hour for the lockout to expire
2. Or, restart the tenant-app deployment to clear the in-memory rate limit store
3. Or, temporarily disable rate limiting (not recommended):
   - Comment out rate limit check in `/api/auth/emergency/route.ts`
   - Redeploy
   - Re-enable after access is restored

## Restoring Normal SSO

Once the SSO outage is resolved:

### Step 1: Verify Provider-Portal

1. Check provider-portal is accessible:
   ```
   https://cortiware-provider-portal.vercel.app
   ```

2. Test SSO ticket endpoint:
   ```bash
   curl -X POST https://cortiware-provider-portal.vercel.app/api/auth/ticket \
     -H "Content-Type: application/json" \
     -H "Cookie: rs_provider=your-email" \
     -d '{"aud":"tenant-app","email":"your-email","role":"provider"}'
   ```

3. Should return a JWT token

### Step 2: Verify HMAC Secret Match

1. Check provider-portal environment:
   ```bash
   AUTH_TICKET_HMAC_SECRET=<value>
   ```

2. Check tenant-app environment:
   ```bash
   AUTH_TICKET_HMAC_SECRET=<value>
   ```

3. Values MUST be identical

4. If different, update one to match the other and redeploy

### Step 3: Test SSO Flow

1. Log out of emergency session in tenant-app

2. Log in to provider-portal normally

3. Navigate to a tenant-specific page

4. Should be redirected to tenant-app with SSO ticket

5. Should be automatically logged in to tenant-app

### Step 4: Disable Emergency Access (Optional)

For maximum security, disable emergency access when not needed:

1. Go to Vercel dashboard → tenant-app project
2. Settings → Environment Variables
3. Set: `EMERGENCY_LOGIN_ENABLED=false`
4. Redeploy the app

**Note:** Only do this if you have another recovery method available!

## Prevention

### Regular Testing

1. Test emergency access monthly:
   - Verify credentials work
   - Verify IP allowlist is current
   - Verify rate limiting is appropriate

2. Test SSO flow weekly:
   - Provider → Tenant
   - Developer → Tenant
   - Check ticket expiry handling
   - Check nonce replay protection

### Monitoring

1. Set up alerts for:
   - SSO ticket endpoint failures
   - Emergency access usage
   - HMAC verification failures
   - Rate limit violations

2. Monitor logs for:
   - Unusual emergency access patterns
   - Failed authentication attempts
   - Ticket expiry issues

### Documentation

1. Keep emergency credentials in a secure password manager
2. Document IP addresses that need emergency access
3. Maintain list of on-call personnel with emergency access
4. Review and update this runbook quarterly

## Escalation

If emergency access fails:

1. Check Vercel deployment status
2. Check database connectivity
3. Check environment variables are set correctly
4. Contact Vercel support if infrastructure issue
5. Restore from backup if data corruption

## Post-Incident

After using emergency access:

1. Document the incident:
   - What caused the SSO outage?
   - How long was emergency access used?
   - What actions were performed?
   - Were there any security concerns?

2. Review audit logs:
   - Verify all emergency access was legitimate
   - Check for any suspicious activity
   - Document any anomalies

3. Update procedures:
   - What could prevent this in the future?
   - Are monitoring/alerts adequate?
   - Should emergency access policies change?

4. Rotate emergency credentials:
   - Generate new emergency passwords
   - Update bcrypt hashes
   - Notify authorized personnel

