# Secure Deployment Guide

## 🔒 Security-First Deployment Practices

This guide outlines the security practices and procedures for deploying Cortiware applications safely and securely.

---

## Table of Contents

1. [Core Security Principles](#core-security-principles)
2. [Secret Management](#secret-management)
3. [Environment Setup](#environment-setup)
4. [Deployment Checklist](#deployment-checklist)
5. [Secret Rotation](#secret-rotation)
6. [Incident Response](#incident-response)
7. [Monitoring & Auditing](#monitoring--auditing)

---

## Core Security Principles

### ❌ NEVER Do This

1. **Never commit secrets to Git**
   - No API keys, passwords, tokens, or credentials
   - No hardcoded secrets in code or scripts
   - No secrets in documentation (use placeholders)

2. **Never share secrets insecurely**
   - No secrets in Slack, email, or chat
   - No secrets in screenshots or screen recordings
   - No secrets in issue trackers or wikis

3. **Never reuse secrets across environments**
   - Development, staging, and production must have different secrets
   - Each environment should have unique credentials

### ✅ ALWAYS Do This

1. **Use environment variables**
   - Store secrets in environment variables
   - Use `.env.local` for local development (gitignored)
   - Use Vercel dashboard or CLI for production

2. **Use strong, unique secrets**
   - Generate cryptographically secure random values
   - Use minimum 32 bytes (64 hex characters) for secrets
   - Use bcrypt with cost factor 12+ for password hashes

3. **Rotate secrets regularly**
   - Rotate all secrets every 90 days
   - Rotate immediately if compromise suspected
   - Document rotation in audit logs

---

## Secret Management

### Generating Secrets

Use these commands to generate secure secrets:

#### Random Hex String (64 characters)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Bcrypt Password Hash
```bash
node -e "const bcrypt = require('bcryptjs'); const pwd = require('crypto').randomBytes(16).toString('hex'); console.log('Password:', pwd); console.log('Hash:', bcrypt.hashSync(pwd, 12));"
```

#### UUID
```bash
node -e "console.log(require('crypto').randomUUID())"
```

### Storing Secrets

#### Local Development
1. Copy `.env.example` to `.env.local`
2. Fill in real values in `.env.local`
3. Never commit `.env.local` (it's gitignored)

#### Production (Vercel)

**Option 1: Vercel Dashboard**
1. Go to https://vercel.com/[team]/[project]/settings/environment-variables
2. Add each variable with appropriate environment (Production/Preview/Development)
3. Redeploy to apply changes

**Option 2: Vercel CLI**
```bash
# Login to Vercel
vercel login

# Add environment variable
cd apps/[app-name]
echo "your-secret-value" | vercel env add SECRET_NAME production

# List environment variables
vercel env ls
```

### Required Secrets

#### Both Apps (provider-portal & tenant-app)
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_TICKET_HMAC_SECRET` - HMAC secret for SSO tickets (must match)

#### Tenant App Only
- `TENANT_COOKIE_SECRET` - Cookie encryption secret
- `PROVIDER_ADMIN_PASSWORD_HASH` - Emergency Provider access (bcrypt)
- `DEVELOPER_ADMIN_PASSWORD_HASH` - Emergency Developer access (bcrypt)
- `KV_URL` - Redis/KV connection string
- `KV_REST_API_URL` - Vercel KV REST API URL
- `KV_REST_API_TOKEN` - Vercel KV REST API token
- `KV_REST_API_READ_ONLY_TOKEN` - Vercel KV read-only token

#### Optional (Both Apps)
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `RESEND_API_KEY` - Email service API key
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key

---

## Environment Setup

### Development Environment

1. **Clone repository**
   ```bash
   git clone https://github.com/christcr2012/Cortiware.git
   cd Cortiware
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Setup database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

### Production Environment

1. **Verify all secrets are set in Vercel**
   - Check environment variables in Vercel dashboard
   - Ensure Production, Preview, and Development are configured
   - Verify secrets match between provider-portal and tenant-app

2. **Deploy to Vercel**
   ```bash
   # Automatic deployment via GitHub integration
   git push origin main
   
   # Or manual deployment
   vercel --prod
   ```

3. **Verify deployment**
   - Check deployment logs in Vercel dashboard
   - Test application functionality
   - Verify SSO flow works
   - Check audit logs for errors

---

## Deployment Checklist

### Pre-Deployment

- [ ] All secrets generated and stored securely
- [ ] Environment variables set in Vercel
- [ ] Database migrations tested
- [ ] All tests passing (`npm test`)
- [ ] TypeScript checks passing (`npm run typecheck`)
- [ ] Linting passing (`npm run lint`)
- [ ] Build successful (`npm run build`)
- [ ] No secrets in Git history
- [ ] `.gitignore` updated
- [ ] Documentation updated

### Deployment

- [ ] Deploy to staging first
- [ ] Test all critical flows in staging
- [ ] Verify database migrations
- [ ] Check error logs
- [ ] Test SSO authentication
- [ ] Test emergency access (if enabled)
- [ ] Deploy to production
- [ ] Monitor deployment logs

### Post-Deployment

- [ ] Verify applications are accessible
- [ ] Test login flows
- [ ] Check audit logs
- [ ] Monitor error rates
- [ ] Verify database connections
- [ ] Test critical user journeys
- [ ] Document deployment in changelog

---

## Secret Rotation

### When to Rotate

- **Scheduled**: Every 90 days (recommended)
- **Immediate**: If compromise suspected
- **Immediate**: If employee with access leaves
- **Immediate**: If secret exposed in logs/code

### Rotation Process

1. **Generate new secrets**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update in Vercel**
   - Remove old secret
   - Add new secret
   - Apply to all environments

3. **Redeploy applications**
   - Trigger redeployment in Vercel
   - Monitor deployment logs
   - Verify applications work

4. **Document rotation**
   - Update password manager
   - Log rotation in audit trail
   - Update emergency access documentation

5. **Verify old secrets are invalid**
   - Test that old secrets no longer work
   - Check for any failed authentication attempts

---

## Incident Response

### If Secrets Are Exposed

1. **Immediate Actions** (within 1 hour)
   - Generate new secrets
   - Update all environment variables
   - Redeploy applications
   - Revoke exposed credentials

2. **Investigation** (within 24 hours)
   - Review Git history
   - Check deployment logs
   - Review audit logs
   - Identify scope of exposure

3. **Remediation** (within 48 hours)
   - Remove secrets from Git history (if committed)
   - Update security documentation
   - Implement additional safeguards
   - Conduct security review

4. **Documentation**
   - Create incident report
   - Document timeline
   - Document lessons learned
   - Update security procedures

### Incident Response Template

See `docs/security/INCIDENT_RESPONSE_2025-10-08.md` for a real example.

---

## Monitoring & Auditing

### What to Monitor

1. **Failed Authentication Attempts**
   - Track failed login attempts
   - Alert on unusual patterns
   - Monitor for brute force attacks

2. **Audit Logs**
   - Review daily for suspicious activity
   - Monitor emergency access usage
   - Track secret rotation events

3. **Deployment Logs**
   - Monitor for deployment failures
   - Check for configuration errors
   - Verify environment variables loaded

4. **Error Logs**
   - Monitor for authentication errors
   - Check for database connection issues
   - Track API failures

### Audit Log Review

**Daily:**
- Check for failed authentication attempts
- Review emergency access usage
- Monitor for unusual activity patterns

**Weekly:**
- Review all audit logs
- Check deployment history
- Verify secret rotation schedule

**Monthly:**
- Conduct security review
- Update security documentation
- Review and update access controls
- Plan secret rotation

---

## Security Tools

### Pre-commit Hooks

Automatically scan for secrets before commit:
```bash
# Installed automatically with npm install
# Runs on every git commit
```

### CI/CD Security Scanning

GitHub Actions runs security scans on every push:
- Secret detection (Gitleaks)
- Dependency vulnerability scanning
- Code quality checks

### Manual Security Scan

Run manual security scan:
```bash
# Check for secrets in staged files
node scripts/check-secrets.js

# Run Gitleaks on entire repository
gitleaks detect --config .gitleaks.toml

# Run npm audit
npm audit
```

---

## Best Practices Summary

1. ✅ **Never commit secrets** - Use environment variables
2. ✅ **Use strong secrets** - 32+ bytes, cryptographically random
3. ✅ **Rotate regularly** - Every 90 days minimum
4. ✅ **Monitor continuously** - Check logs daily
5. ✅ **Document everything** - Maintain audit trail
6. ✅ **Test thoroughly** - Verify before deploying
7. ✅ **Respond quickly** - Act immediately on incidents
8. ✅ **Learn and improve** - Update procedures after incidents

---

## Additional Resources

- [Incident Response Documentation](./INCIDENT_RESPONSE_2025-10-08.md)
- [Secret Rotation Guide](./SECRET_ROTATION_COMPLETE.md)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Last Updated:** October 8, 2025  
**Version:** 1.0  
**Maintained By:** Security Team

