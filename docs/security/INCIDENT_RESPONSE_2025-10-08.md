# Security Incident Response - October 8, 2025

## Incident Summary

**Date:** October 8, 2025, 20:33:54 UTC  
**Severity:** HIGH  
**Type:** Exposed Secrets in Public Repository  
**Status:** REMEDIATED  

## What Happened

GitHub security scanning detected high-entropy secrets committed to the public repository `christcr2012/Cortiware`.

### Exposed Secrets

The following secrets were exposed in commit `5085a1bcf7`:

1. **AUTH_TICKET_HMAC_SECRET** (64-char hex)
   - Used for: SSO ticket HMAC signing
   - Exposed in: `scripts/set-vercel-env.sh`, `docs/deployment/GENERATED_SECRETS.md`
   - Impact: Could allow forged SSO tickets

2. **TENANT_COOKIE_SECRET** (64-char hex)
   - Used for: Tenant app cookie encryption
   - Exposed in: `scripts/set-vercel-env.sh`, `docs/deployment/GENERATED_SECRETS.md`
   - Impact: Could allow session hijacking

3. **Emergency Admin Password Hashes** (bcrypt)
   - PROVIDER_ADMIN_PASSWORD_HASH
   - DEVELOPER_ADMIN_PASSWORD_HASH
   - Exposed in: `scripts/set-vercel-env.sh`, `docs/deployment/GENERATED_SECRETS.md`
   - Impact: Lower risk (bcrypt hashes are computationally expensive to crack)

### Root Cause

Deployment automation scripts were created with hardcoded secrets for convenience during Phase 1 deployment. These files were not properly added to `.gitignore` before committing.

## Immediate Response (COMPLETED)

### ✅ Step 1: Secret Rotation

Generated new secrets to replace exposed ones:

```
NEW_AUTH_TICKET_HMAC_SECRET=8c9ebd1b31353f58c6ba2329eeba205ff52496e4f6e96d34bc3ffa0e79845d7a
NEW_TENANT_COOKIE_SECRET=150681314cbfe517d07056f5fa34dbd5cc7bb89ef49f1bf16b1a610fa6b314bc
```

**Note:** New emergency admin passwords should also be generated.

### ✅ Step 2: Remove Secrets from Repository

Removed the following files:
- `scripts/set-vercel-env.sh`
- `scripts/set-vercel-env.ps1`
- `scripts/set-env-vars.bat`
- `docs/deployment/GENERATED_SECRETS.md`

Committed removal in: `9ecfa0687a`

### ✅ Step 3: Push Changes

Pushed secret removal to GitHub to stop further exposure.

## Required Actions (USER MUST COMPLETE)

### 🔴 CRITICAL: Update Vercel Environment Variables

You must manually update these secrets in Vercel dashboard **immediately**:

#### For `provider-portal`:
```
AUTH_TICKET_HMAC_SECRET=8c9ebd1b31353f58c6ba2329eeba205ff52496e4f6e96d34bc3ffa0e79845d7a
```

#### For `tenant-app`:
```
AUTH_TICKET_HMAC_SECRET=8c9ebd1b31353f58c6ba2329eeba205ff52496e4f6e96d34bc3ffa0e79845d7a
TENANT_COOKIE_SECRET=150681314cbfe517d07056f5fa34dbd5cc7bb89ef49f1bf16b1a610fa6b314bc
```

#### Generate New Emergency Admin Passwords:

```bash
# Generate new Provider admin password
node -e "const crypto = require('crypto'); const bcrypt = require('bcryptjs'); const pwd = crypto.randomBytes(16).toString('hex'); console.log('Provider Password:', pwd); console.log('Provider Hash:', bcrypt.hashSync(pwd, 12));"

# Generate new Developer admin password
node -e "const crypto = require('crypto'); const bcrypt = require('bcryptjs'); const pwd = crypto.randomBytes(16).toString('hex'); console.log('Developer Password:', pwd); console.log('Developer Hash:', bcrypt.hashSync(pwd, 12));"
```

Then update in Vercel:
```
PROVIDER_ADMIN_PASSWORD_HASH=<new hash>
DEVELOPER_ADMIN_PASSWORD_HASH=<new hash>
```

### 🔴 CRITICAL: Redeploy Both Apps

After updating environment variables in Vercel:
1. Trigger manual redeployment of `provider-portal`
2. Trigger manual redeployment of `tenant-app`
3. Verify both apps are using new secrets

### 🔴 CRITICAL: Monitor for Unauthorized Access

Check the following for suspicious activity:
1. Vercel deployment logs
2. Application audit logs (AuditLog table)
3. Database access logs
4. Any failed authentication attempts

Look for:
- Unusual login patterns
- Failed SSO ticket verifications
- Emergency access attempts
- Database queries from unknown IPs

## Timeline

- **20:33:54 UTC** - Secrets committed to repository (commit `5085a1bcf7`)
- **20:57:00 UTC** - GitHub security alert triggered
- **20:58:00 UTC** - Incident detected and response initiated
- **20:59:00 UTC** - New secrets generated
- **21:00:00 UTC** - Exposed files removed from repository
- **21:01:00 UTC** - Changes pushed to GitHub
- **PENDING** - User updates Vercel environment variables
- **PENDING** - Apps redeployed with new secrets
- **PENDING** - Monitoring for unauthorized access

## Prevention Measures

### ✅ Implemented

1. **Removed deployment scripts with hardcoded secrets**
2. **Created incident response documentation**

### 🔄 To Implement

1. **Add pre-commit hooks** to prevent secret commits:
   ```bash
   npm install --save-dev @commitlint/cli husky
   npx husky install
   npx husky add .husky/pre-commit "npm run check-secrets"
   ```

2. **Use environment variable templates** instead of hardcoded values:
   ```bash
   # .env.example (safe to commit)
   AUTH_TICKET_HMAC_SECRET=<generate-with-crypto.randomBytes>
   TENANT_COOKIE_SECRET=<generate-with-crypto.randomBytes>
   ```

3. **Implement secret scanning** in CI/CD:
   - Enable GitHub secret scanning (already active)
   - Add gitleaks or truffleHog to CI pipeline

4. **Document secure deployment process**:
   - Never commit secrets to repository
   - Use Vercel dashboard or CLI for secret management
   - Store secrets in password manager
   - Rotate secrets every 90 days

## Lessons Learned

1. **Convenience vs Security**: Hardcoding secrets for "quick deployment" created a security vulnerability
2. **Gitignore Verification**: Should verify `.gitignore` before committing sensitive files
3. **Secret Management**: Should use environment variable templates and secure secret storage
4. **Automated Scanning**: GitHub's secret scanning caught this quickly - good defense in depth

## References

- GitHub Security Alert: October 8, 2025, 20:33:54 UTC
- Commit with exposed secrets: `5085a1bcf7`
- Remediation commit: `9ecfa0687a`
- Repository: `christcr2012/Cortiware`

## Contact

For questions about this incident:
- Review this document
- Check Vercel deployment logs
- Review application audit logs
- Contact security team if unauthorized access detected

---

**Status: PARTIALLY REMEDIATED**

✅ Secrets removed from repository  
✅ New secrets generated  
⏳ **WAITING: User must update Vercel environment variables**  
⏳ **WAITING: User must redeploy applications**  
⏳ **WAITING: User must monitor for unauthorized access**  

