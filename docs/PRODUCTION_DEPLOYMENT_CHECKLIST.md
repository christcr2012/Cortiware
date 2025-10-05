# Production Deployment Checklist

## 🚨 CRITICAL: Complete This Checklist Before Going Live

This checklist ensures your authentication system is secure and production-ready.

---

## ✅ Pre-Deployment Checklist

### **1. Disable ALL Dev Escape Hatches** 🔒

**Location:** Vercel → Settings → Environment Variables

**MUST SET TO FALSE:**
```bash
DEV_ACCEPT_ANY_PROVIDER_LOGIN=false
DEV_ACCEPT_ANY_DEVELOPER_LOGIN=false
DEV_ACCEPT_ANY_TENANT_LOGIN=false
DEV_ACCEPT_ANY_ACCOUNTANT_LOGIN=false
DEV_ACCEPT_ANY_VENDOR_LOGIN=false
```

**⚠️ WARNING:** If these are `true` in production, ANYONE can log in with ANY password!

**How to Check:**
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Search for `DEV_ACCEPT_ANY`
5. Verify ALL are set to `false` or deleted

---

### **2. Set Secure Provider/Developer Credentials** 🔑

**Location:** Vercel → Settings → Environment Variables

**REQUIRED:**
```bash
# Provider Account
PROVIDER_USERNAME=your-real-email@company.com
PROVIDER_PASSWORD=<STRONG-PASSWORD-HERE>

# Developer Account
DEVELOPER_USERNAME=your-dev-email@company.com
DEVELOPER_PASSWORD=<STRONG-PASSWORD-HERE>
```

**Password Requirements:**
- ✅ Minimum 16 characters
- ✅ Mix of uppercase, lowercase, numbers, symbols
- ✅ NOT the same as any other password
- ✅ NOT stored anywhere else (use password manager)

**How to Generate Strong Password:**
```bash
# On Mac/Linux
openssl rand -base64 24

# On Windows (PowerShell)
[System.Convert]::ToBase64String((1..24 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

### **3. Set Breakglass Emergency Credentials** 🚨

**Location:** Vercel → Settings → Environment Variables

**REQUIRED (Emergency Access Only):**
```bash
# Provider Breakglass (use ONLY if database is down)
PROVIDER_BREAKGLASS_EMAIL=emergency-provider@company.com
PROVIDER_BREAKGLASS_PASSWORD=<DIFFERENT-STRONG-PASSWORD>

# Developer Breakglass (use ONLY if database is down)
DEVELOPER_BREAKGLASS_EMAIL=emergency-dev@company.com
DEVELOPER_BREAKGLASS_PASSWORD=<DIFFERENT-STRONG-PASSWORD>
```

**⚠️ IMPORTANT:**
- These should be DIFFERENT from your regular credentials
- Store these in a secure location (password manager, safe, etc.)
- Only use if database is completely unavailable
- Change immediately after emergency use

---

### **4. Set Encryption Keys** 🔐

**Location:** Vercel → Settings → Environment Variables

**REQUIRED:**
```bash
# Master encryption key for breakglass account encryption
BREAKGLASS_MASTER_KEY=<GENERATE-WITH-OPENSSL>
```

**How to Generate:**
```bash
# On Mac/Linux
openssl rand -hex 32

# On Windows (PowerShell)
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

**⚠️ CRITICAL:**
- This key encrypts all breakglass account credentials
- If lost, breakglass accounts cannot be decrypted
- Store securely (password manager, AWS Secrets Manager, etc.)
- NEVER commit to Git

---

### **5. Configure Email Service** 📧

**Location:** Vercel → Settings → Environment Variables

**REQUIRED (for password resets):**
```bash
# Email Service (SendGrid, AWS SES, Resend, etc.)
EMAIL_SERVICE_API_KEY=<YOUR-API-KEY>
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Robinson Solutions
```

**Recommended Services:**
- **SendGrid** - Easy setup, generous free tier
- **AWS SES** - Cheap, reliable, requires verification
- **Resend** - Modern, developer-friendly
- **Postmark** - High deliverability

**How to Test:**
```bash
# Send test email from Vercel deployment
curl -X POST https://your-app.vercel.app/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@test.com"}'
```

---

### **6. Configure SMS Service (Optional)** 📱

**Location:** Vercel → Settings → Environment Variables

**OPTIONAL (for SMS verification):**
```bash
# SMS Service (Twilio, AWS SNS, etc.)
SMS_SERVICE_API_KEY=<YOUR-API-KEY>
SMS_FROM=+1234567890
```

**Note:** SMS is optional but recommended for high-security accounts.

---

### **7. Set Database Connection** 🗄️

**Location:** Vercel → Settings → Environment Variables

**REQUIRED:**
```bash
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

**⚠️ IMPORTANT:**
- Must include `?sslmode=require` for production
- Use connection pooling (Neon, Supabase, PlanetScale, etc.)
- Test connection before deploying

**How to Test:**
```bash
# From your local machine
npx prisma db pull --schema=./prisma/schema.prisma
```

---

### **8. Run Database Migrations** 🔄

**BEFORE deploying to production:**

```bash
# 1. Pull latest code
git pull origin main

# 2. Review migration
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma

# 3. Create migration
npx prisma migrate dev --name unified-auth-system

# 4. Deploy migration to production database
npx prisma migrate deploy
```

**⚠️ CRITICAL:**
- Always backup database before migrations
- Test migrations on staging first
- Review migration SQL before applying

---

### **9. Security Headers** 🛡️

**Location:** `vercel.json`

**Verify these are set:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

### **10. Rate Limiting Configuration** ⏱️

**Location:** Vercel → Settings → Environment Variables

**OPTIONAL (recommended):**
```bash
# Rate limit presets
RATE_LIMIT_API_PER_MINUTE=60
RATE_LIMIT_AUTH_PER_MINUTE=20
RATE_LIMIT_RECOVERY_PER_HOUR=5
```

---

## 🧪 Pre-Launch Testing

### **Test 1: Provider Login**
```bash
1. Go to https://your-app.vercel.app/provider/login
2. Try with WRONG credentials → Should fail ✅
3. Try with CORRECT credentials → Should work ✅
4. Verify redirects to /provider ✅
```

### **Test 2: Developer Login**
```bash
1. Go to https://your-app.vercel.app/developer/login
2. Try with WRONG credentials → Should fail ✅
3. Try with CORRECT credentials → Should work ✅
4. Verify redirects to /developer ✅
```

### **Test 3: Tenant User Login**
```bash
1. Create a test user in production database
2. Go to https://your-app.vercel.app/login
3. Log in with test user credentials ✅
4. Verify redirects to /dashboard ✅
```

### **Test 4: Password Reset Flow**
```bash
1. Go to https://your-app.vercel.app/login
2. Click "Forgot password?"
3. Enter email
4. Check email for verification code ✅
5. Enter code and reset password ✅
6. Log in with new password ✅
```

### **Test 5: Recovery Codes**
```bash
1. Log in as test user
2. Generate recovery codes
3. Download codes
4. Log out
5. Use recovery code to log in ✅
6. Verify code is marked as used ✅
```

### **Test 6: Automated Breakglass**
```bash
1. Request password reset from unknown IP
2. Verify delay is applied based on risk ✅
3. Verify email notification sent ✅
4. Complete recovery after delay ✅
5. Verify audit log entry created ✅
```

---

## 🔍 Post-Deployment Monitoring

### **Day 1: Monitor Closely**

**Check every hour:**
- [ ] Login success rate
- [ ] Failed login attempts
- [ ] Recovery requests
- [ ] Breakglass activations
- [ ] Error logs

**Where to Check:**
- Vercel Dashboard → Logs
- Database → Audit tables
- Email service → Delivery logs

### **Week 1: Daily Checks**

**Check daily:**
- [ ] Authentication errors
- [ ] Unusual login patterns
- [ ] Recovery request volume
- [ ] Email delivery rate

### **Ongoing: Weekly Reviews**

**Check weekly:**
- [ ] Security audit logs
- [ ] Failed authentication trends
- [ ] Recovery code usage
- [ ] Breakglass activations (should be rare!)

---

## 🚨 Emergency Procedures

### **If Database Goes Down**

1. **Provider/Developer can still access via breakglass:**
   ```
   Email: emergency-provider@company.com
   Password: <BREAKGLASS-PASSWORD>
   ```

2. **System will show "Recovery Mode" warning**

3. **Limited operations available**

4. **Fix database ASAP**

5. **Change breakglass passwords after recovery**

### **If Someone Gets Locked Out**

1. **Check audit logs:**
   ```sql
   SELECT * FROM UserLoginHistory 
   WHERE userId = 'user-id' 
   ORDER BY timestamp DESC 
   LIMIT 10;
   ```

2. **Verify recovery request:**
   ```sql
   SELECT * FROM RecoveryRequest 
   WHERE userId = 'user-id' 
   ORDER BY createdAt DESC 
   LIMIT 1;
   ```

3. **If legitimate, wait for automated delay to expire**

4. **If emergency, manually reset in database:**
   ```sql
   UPDATE User 
   SET isLocked = false, 
       failedLoginAttempts = 0,
       mustChangePassword = true
   WHERE id = 'user-id';
   ```

### **If Breakglass is Compromised**

1. **Immediately change breakglass passwords in Vercel**

2. **Review audit logs for unauthorized access:**
   ```sql
   SELECT * FROM BreakglassActivationLog 
   WHERE timestamp > NOW() - INTERVAL '7 days'
   ORDER BY timestamp DESC;
   ```

3. **Notify all admins**

4. **Force password reset for all affected accounts**

---

## 📋 Final Checklist (Before Launch)

### **Environment Variables**
- [ ] `DEV_ACCEPT_ANY_*_LOGIN` all set to `false`
- [ ] `PROVIDER_USERNAME` and `PROVIDER_PASSWORD` set
- [ ] `DEVELOPER_USERNAME` and `DEVELOPER_PASSWORD` set
- [ ] `PROVIDER_BREAKGLASS_*` credentials set
- [ ] `DEVELOPER_BREAKGLASS_*` credentials set
- [ ] `BREAKGLASS_MASTER_KEY` generated and set
- [ ] `DATABASE_URL` set with `?sslmode=require`
- [ ] `EMAIL_SERVICE_API_KEY` set
- [ ] `EMAIL_FROM` set

### **Database**
- [ ] Migrations applied to production
- [ ] Database backup created
- [ ] Connection tested

### **Testing**
- [ ] Provider login tested
- [ ] Developer login tested
- [ ] Tenant login tested
- [ ] Password reset tested
- [ ] Recovery codes tested
- [ ] Breakglass tested

### **Security**
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Audit logging verified
- [ ] Email notifications working

### **Documentation**
- [ ] Credentials stored in password manager
- [ ] Emergency procedures documented
- [ ] Team trained on recovery procedures

---

## ✅ Launch!

Once all items are checked:

1. **Deploy to production:**
   ```bash
   git push origin main
   ```

2. **Verify deployment:**
   - Check Vercel deployment status
   - Test login flows
   - Monitor logs

3. **Announce to team:**
   - New authentication system live
   - Share documentation links
   - Provide support contact

4. **Monitor closely for 24 hours**

---

## 📞 Support

**If issues arise:**
1. Check Vercel logs
2. Check database audit logs
3. Review this checklist
4. Contact development team

**Emergency Contact:**
- Provider breakglass credentials in password manager
- Database backup available
- Rollback plan ready

---

**🎉 Congratulations! Your production authentication system is secure and ready!**

