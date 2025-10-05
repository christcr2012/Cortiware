# Unified Authentication System - Implementation Plan

## 🎯 Executive Summary

**What:** Unified authentication system with automated breakglass recovery for ALL client-side accounts

**Why:** 
- Single login page (better UX)
- Automated recovery (no human intervention)
- Consistent security (all accounts protected equally)
- Future-proof (ready for Federation/OIDC)

**Who Gets It:**
- ✅ Tenant Users (Owner, Admin, User)
- ✅ Accountant Accounts
- ✅ Vendor Accounts
- ✅ Provider Accounts (dual-layer)
- ✅ Developer Accounts (dual-layer)

---

## 🏗️ Architecture Overview

### **Single Login Page (`/login`)**

```
One URL for everyone → Auto-detects account type → Redirects appropriately
```

### **Authentication Layers**

```
┌─────────────────────────────────────────────────────────────┐
│ PROVIDER/DEVELOPER (System-Level)                           │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: Environment Variables (primary)                    │
│ Layer 2: Database (future)                                  │
│ Layer 3: Breakglass Env Vars (emergency - DB down)          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TENANT/ACCOUNTANT/VENDOR (Client-Level)                     │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: Recovery Codes (self-service)                      │
│ Layer 2: Email/SMS Verification (standard)                  │
│ Layer 3: Automated Breakglass (risk-based, no human)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 Automated Breakglass (No Human Intervention)

### **How It Works**

1. **User requests recovery** → System assesses risk automatically
2. **Risk score calculated** → 0-100 based on IP, device, history, etc.
3. **Delay applied automatically** → 0 min (low risk) to 24 hours (critical risk)
4. **Verification codes sent** → Email + SMS (automated)
5. **User waits (if needed)** → Timer counts down automatically
6. **User verifies identity** → Enters codes
7. **Password reset granted** → Automated, no approval needed
8. **Admins notified** → Automatic email notification
9. **Audit logged** → Full trail recorded automatically

### **Risk-Based Delays**

| Risk Score | Delay | Why |
|------------|-------|-----|
| 0-30 (Low) | **Instant** | Known IP + Known Device = Trusted |
| 31-60 (Medium) | **15 min** | New IP OR New Device = Verify identity |
| 61-90 (High) | **4 hours** | New IP + New Device = Extra caution |
| 91-100 (Critical) | **24 hours** | Suspicious patterns = Maximum security |

**Key Point:** The system handles everything. No support tickets, no manual approvals, no waiting for humans.

---

## 📊 Database Schema Changes

### **New Tables to Add**

1. **UserRecoveryCode** - Self-service recovery codes
2. **UserSecurityQuestion** - Optional additional verification
3. **UserBreakglassAccount** - Encrypted emergency credentials
4. **UserDeviceFingerprint** - Device trust tracking
5. **UserLoginHistory** - Comprehensive audit trail
6. **BreakglassActivationLog** - Breakglass usage tracking
7. **RecoveryRequest** - Pending recovery requests

### **Modified Tables**

- **User** - Add security fields (failedAttempts, isLocked, totpSecret, etc.)

---

## 🚀 Implementation Phases

### **Phase 1: Foundation (Week 1)**

**Goal:** Get basic unified login working

**Tasks:**
1. ✅ Merge new schema into `prisma/schema.prisma`
2. ✅ Run migration: `npx prisma migrate dev --name unified-auth`
3. ✅ Create unified login API route: `src/app/api/auth/login/route.ts`
4. ✅ Update login page to use unified endpoint
5. ✅ Test with Provider, Developer, and Tenant accounts

**Deliverable:** Single login page that works for all account types

---

### **Phase 2: Recovery Codes (Week 2)**

**Goal:** Self-service recovery

**Tasks:**
1. ✅ Generate recovery codes on account creation
2. ✅ Create download page for recovery codes
3. ✅ Implement recovery code verification
4. ✅ Add "Use recovery code" option to login page
5. ✅ Test recovery code flow

**Deliverable:** Users can recover accounts with saved codes

---

### **Phase 3: Email/SMS Verification (Week 3)**

**Goal:** Standard password reset

**Tasks:**
1. ✅ Integrate email service (SendGrid/AWS SES)
2. ✅ Integrate SMS service (Twilio/AWS SNS)
3. ✅ Create password reset request flow
4. ✅ Create verification code entry page
5. ✅ Implement rate limiting
6. ✅ Test email/SMS delivery

**Deliverable:** Standard "forgot password" flow works

---

### **Phase 4: Automated Breakglass (Week 4)**

**Goal:** Fully automated emergency recovery

**Tasks:**
1. ✅ Implement risk assessment engine
2. ✅ Create recovery request system
3. ✅ Implement delay timers
4. ✅ Add device fingerprinting
5. ✅ Create admin notification system
6. ✅ Build audit logging
7. ✅ Test all risk levels

**Deliverable:** Automated breakglass recovery works end-to-end

---

### **Phase 5: Security Enhancements (Week 5)**

**Goal:** Enterprise-grade security

**Tasks:**
1. ✅ Implement TOTP (2FA) setup flow
2. ✅ Add security questions (optional)
3. ✅ Implement device trust scoring
4. ✅ Add password complexity requirements
5. ✅ Implement password history
6. ✅ Add account lockout after failed attempts
7. ✅ Test security features

**Deliverable:** Full security suite operational

---

### **Phase 6: Admin Dashboard (Week 6)**

**Goal:** Visibility and control

**Tasks:**
1. ✅ Create breakglass monitoring dashboard
2. ✅ Add audit log viewer
3. ✅ Implement risk score analytics
4. ✅ Add user security status page
5. ✅ Create security alerts system
6. ✅ Test admin features

**Deliverable:** Admins can monitor and manage security

---

## 🔧 Technical Details

### **Files to Create**

```
src/lib/auth/
├── unified-login.ts              ✅ Created
├── automated-breakglass.ts       ✅ Created
├── risk-assessment.ts            📝 To create
├── recovery-codes.ts             📝 To create
├── device-fingerprint.ts         📝 To create
├── totp.ts                       📝 To create
└── notifications.ts              📝 To create

src/app/api/auth/
├── login/route.ts                📝 Update (use unified-login)
├── recovery/request/route.ts     📝 Create
├── recovery/verify/route.ts      📝 Create
├── recovery/complete/route.ts    📝 Create
└── recovery-codes/generate/route.ts 📝 Create

src/app/(auth)/
├── login/page.tsx                📝 Update (unified)
├── recovery/page.tsx             📝 Create
├── recovery/verify/page.tsx      📝 Create
└── recovery-codes/page.tsx       📝 Create

prisma/
└── schema.prisma                 📝 Merge schema-auth-unified.prisma
```

### **Environment Variables Needed**

```bash
# Encryption
BREAKGLASS_MASTER_KEY=<generate-with-openssl>

# Email Service
EMAIL_SERVICE_API_KEY=<your-key>
EMAIL_FROM=noreply@robinsonsolutions.com

# SMS Service (optional)
SMS_SERVICE_API_KEY=<your-key>
SMS_FROM=+1234567890

# Provider/Developer Auth
PROVIDER_USERNAME=admin@example.com
PROVIDER_PASSWORD=<secure-password>
DEVELOPER_USERNAME=dev@example.com
DEVELOPER_PASSWORD=<secure-password>

# Breakglass Fallback
PROVIDER_BREAKGLASS_EMAIL=breakglass-provider@example.com
PROVIDER_BREAKGLASS_PASSWORD=<emergency-password>
DEVELOPER_BREAKGLASS_EMAIL=breakglass-dev@example.com
DEVELOPER_BREAKGLASS_PASSWORD=<emergency-password>
```

---

## ✅ Testing Checklist

### **Unified Login**
- [ ] Provider login works
- [ ] Developer login works
- [ ] Tenant user login works
- [ ] Accountant login works
- [ ] Vendor login works
- [ ] Redirects to correct portal
- [ ] Sets correct cookie

### **Recovery Codes**
- [ ] Codes generated on account creation
- [ ] Codes can be downloaded
- [ ] Codes work for login
- [ ] Codes marked as used
- [ ] Codes expire after 1 year
- [ ] New codes can be regenerated

### **Email/SMS Verification**
- [ ] Verification codes sent
- [ ] Codes expire after 15 minutes
- [ ] Rate limiting works
- [ ] Invalid codes rejected
- [ ] Password reset works

### **Automated Breakglass**
- [ ] Risk assessment calculates correctly
- [ ] Low risk = instant recovery
- [ ] Medium risk = 15 min delay
- [ ] High risk = 4 hour delay
- [ ] Critical risk = 24 hour delay
- [ ] Admins notified automatically
- [ ] Audit log records everything

### **Security Features**
- [ ] TOTP setup works
- [ ] TOTP verification works
- [ ] Security questions work
- [ ] Device fingerprinting works
- [ ] Account lockout works
- [ ] Password complexity enforced
- [ ] Password history enforced

---

## 🎯 Success Criteria

### **User Experience**
✅ Single login page for all users
✅ Recovery takes < 5 minutes (low risk)
✅ No support tickets needed
✅ Clear error messages
✅ Mobile-friendly

### **Security**
✅ No accounts can be permanently locked out
✅ High-risk attempts delayed appropriately
✅ All actions logged to audit trail
✅ Admins notified of suspicious activity
✅ Compliant with security best practices

### **Operations**
✅ Zero manual intervention required
✅ Automated notifications work
✅ Audit logs comprehensive
✅ Monitoring dashboard functional
✅ Scales to thousands of users

---

## 📞 Next Steps

**Ready to implement?**

1. **Review this plan** - Any questions or changes?
2. **Approve architecture** - Does this meet your needs?
3. **Start Phase 1** - Merge schema and create unified login
4. **Iterate through phases** - One week per phase
5. **Test thoroughly** - All scenarios covered
6. **Deploy to production** - Gradual rollout

**Estimated Timeline:** 6 weeks to full implementation

**Want me to start building?** 🚀

