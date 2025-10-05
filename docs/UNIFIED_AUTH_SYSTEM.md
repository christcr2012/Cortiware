# Unified Authentication System with Automated Breakglass Recovery

## 🎯 Overview

A comprehensive, fully automated authentication system that provides enterprise-grade security with consumer-friendly recovery for **all account types** in the Robinson Solutions platform.

---

## 📊 Account Types & Authentication Methods

### **Provider-Side Accounts (Cross-Client Access)**

#### 1. Provider Accounts
- **Purpose:** Platform administration, cross-client management
- **Authentication:** Dual-layer (Environment → Database → Breakglass)
- **Cookie:** `rs_provider`
- **Portal:** `/provider` (Green theme)
- **Future:** OIDC via Federation Portal

#### 2. Developer Accounts
- **Purpose:** Platform development, system configuration
- **Authentication:** Dual-layer (Environment → Database → Breakglass)
- **Cookie:** `rs_developer`
- **Portal:** `/developer` (Green theme)
- **Future:** OIDC via Federation Portal

### **Client-Side Accounts (Tenant-Specific)**

#### 3. Tenant Users (Owner, Admin, User)
- **Purpose:** Day-to-day business operations
- **Authentication:** Database + Three-layer recovery
- **Cookie:** `rs_user`
- **Portal:** `/dashboard` (Brand-configurable theme)
- **Recovery:** Automated breakglass with risk-based delays

#### 4. Accountant Accounts
- **Purpose:** Financial management, compliance
- **Authentication:** Database + Three-layer recovery
- **Cookie:** `rs_accountant`
- **Portal:** `/accountant` (Brand-configurable theme)
- **Recovery:** Automated breakglass with risk-based delays

#### 5. Vendor Accounts
- **Purpose:** External vendor access, limited scope
- **Authentication:** Database + Three-layer recovery
- **Cookie:** `rs_vendor`
- **Portal:** `/vendor` (Brand-configurable theme)
- **Recovery:** Automated breakglass with risk-based delays

---

## 🔐 Authentication Architecture

### **Unified Login Flow**

```
User visits /login → Enters email + password
                    ↓
┌───────────────────────────────────────────────────────────┐
│ STEP 1: Check Provider Accounts                          │
│ ├─ Environment variables (primary)                       │
│ ├─ Database (future)                                     │
│ └─ Breakglass env vars (emergency)                       │
│ → If match: Redirect to /provider                        │
└───────────────────────────────────────────────────────────┘
                    ↓ (no match)
┌───────────────────────────────────────────────────────────┐
│ STEP 2: Check Developer Accounts                         │
│ ├─ Environment variables (primary)                       │
│ ├─ Database (future)                                     │
│ └─ Breakglass env vars (emergency)                       │
│ → If match: Redirect to /developer                       │
└───────────────────────────────────────────────────────────┘
                    ↓ (no match)
┌───────────────────────────────────────────────────────────┐
│ STEP 3: Check Database Users (Tenant/Accountant/Vendor)  │
│ ├─ Password verification (bcrypt)                        │
│ ├─ TOTP verification (if enabled)                        │
│ ├─ Recovery code (if provided)                           │
│ └─ Breakglass (automated, risk-based)                    │
│ → If match: Redirect based on role                       │
│   - Owner/Admin/User → /dashboard                        │
│   - Accountant → /accountant                             │
│   - Vendor → /vendor                                     │
└───────────────────────────────────────────────────────────┘
                    ↓ (no match)
                Return error: Invalid credentials
```

---

## 🛡️ Three-Layer Recovery System (Client-Side Accounts)

### **Layer 1: Recovery Codes (Self-Service)**

**When Created:**
- 10 one-time codes generated during account creation
- Owner downloads and stores securely
- Valid for 1 year

**How to Use:**
1. Click "Can't access your account?" on login page
2. Select "Use recovery code"
3. Enter one of your 10 codes
4. Immediately set new password
5. Regenerate new recovery codes

**Security:**
- Codes are bcrypt hashed in database
- Each code can only be used once
- Marked with IP address when used
- Automatic expiration after 1 year

---

### **Layer 2: Email/SMS Verification (Standard)**

**How It Works:**
1. User requests password reset
2. System sends 6-digit code to email (and SMS if available)
3. Code valid for 15 minutes
4. User enters code and sets new password

**Security:**
- Rate limited: 5 attempts per hour
- Codes expire after 15 minutes
- New code invalidates previous codes
- IP address logged

---

### **Layer 3: Automated Breakglass (Emergency)**

**Fully Automated - No Human Intervention Required**

#### **Risk Assessment Engine**

Every recovery request is automatically scored (0-100):

| Risk Factor | Points | Description |
|-------------|--------|-------------|
| Unknown IP | +30 | IP address not seen before |
| Unknown Device | +30 | Device fingerprint not recognized |
| Multiple Failed Attempts | +20 | 3+ failed logins recently |
| Account Locked | +15 | Account is currently locked |
| Unusual Hours | +10 | Outside 6am-10pm local time |
| Long Absence | +10 | No login in 90+ days |

#### **Risk-Based Actions (Automated)**

| Risk Score | Risk Level | Delay | Verification Required |
|------------|------------|-------|----------------------|
| 0-30 | Low | **Instant** | Email code only |
| 31-60 | Medium | **15 minutes** | Email + SMS codes |
| 61-90 | High | **4 hours** | Email + SMS + Security Questions |
| 91-100 | Critical | **24 hours** | All methods + Extended verification |

#### **Automated Recovery Flow**

```
User requests recovery
        ↓
Risk assessment (automated)
        ↓
Send verification codes (email/SMS)
        ↓
User enters code
        ↓
┌─────────────────────────────────────┐
│ Low Risk (0-30)                     │
│ → Instant password reset            │
└─────────────────────────────────────┘
        OR
┌─────────────────────────────────────┐
│ Medium Risk (31-60)                 │
│ → Wait 15 minutes                   │
│ → Verify email + SMS codes          │
│ → Reset password                    │
└─────────────────────────────────────┘
        OR
┌─────────────────────────────────────┐
│ High Risk (61-90)                   │
│ → Wait 4 hours                      │
│ → Verify email + SMS codes          │
│ → Answer security questions         │
│ → Reset password                    │
└─────────────────────────────────────┘
        OR
┌─────────────────────────────────────┐
│ Critical Risk (91-100)              │
│ → Wait 24 hours                     │
│ → Verify all methods                │
│ → Extended verification             │
│ → Reset password                    │
└─────────────────────────────────────┘
        ↓
Notify all org admins (automated)
        ↓
Log to audit trail (automated)
        ↓
User logs in with new password
        ↓
Force 2FA setup (if not enabled)
```

---

## 🔒 Security Features

### **Password Security**
- Bcrypt hashing (cost factor: 12)
- Minimum 8 characters
- Complexity requirements enforced
- Password history (prevent reuse of last 5)
- Automatic expiration (90 days for sensitive roles)

### **Two-Factor Authentication (TOTP)**
- Authenticator app support (Google Authenticator, Authy, etc.)
- Backup codes (10 one-time codes)
- Optional SMS fallback
- Required for Owner and Admin roles

### **Device Fingerprinting**
- Browser fingerprint (User-Agent, Screen, Canvas, etc.)
- IP address tracking
- Trust scoring (0-100)
- Automatic trust after 3 successful logins

### **Rate Limiting**
- Login attempts: 5 per 15 minutes per IP
- Recovery code attempts: 5 per hour
- Verification code attempts: 5 per hour
- Automatic account lockout after 10 failed attempts

### **Audit Logging**
- Every login attempt logged (success and failure)
- Breakglass activations logged with full context
- Risk scores and factors recorded
- Admin notifications sent automatically
- Compliance-ready audit trail

---

## 🚀 Implementation Status

### ✅ **Completed**
- Unified login architecture designed
- Risk assessment engine designed
- Database schema defined
- Automated breakglass logic designed
- Documentation created

### 🔄 **In Progress**
- Database schema implementation
- Unified login API route
- Recovery request flow
- Email/SMS verification
- Admin notification system

### 📋 **Planned**
- TOTP setup flow
- Security questions setup
- Device fingerprinting
- Admin dashboard for breakglass monitoring
- Federation/OIDC integration

---

## 📚 Environment Variables

### **Provider/Developer (Environment-Based)**
```bash
# Primary authentication
PROVIDER_USERNAME=admin@example.com
PROVIDER_PASSWORD=secure-password-here
DEVELOPER_USERNAME=dev@example.com
DEVELOPER_PASSWORD=secure-password-here

# Breakglass fallback (emergency only)
PROVIDER_BREAKGLASS_EMAIL=breakglass-provider@example.com
PROVIDER_BREAKGLASS_PASSWORD=emergency-password-here
DEVELOPER_BREAKGLASS_EMAIL=breakglass-dev@example.com
DEVELOPER_BREAKGLASS_PASSWORD=emergency-password-here

# Dev escape hatch (testing only - NEVER in production!)
DEV_ACCEPT_ANY_PROVIDER_LOGIN=false
DEV_ACCEPT_ANY_DEVELOPER_LOGIN=false
```

### **Encryption (Breakglass Credentials)**
```bash
# Master encryption key for breakglass account encryption
BREAKGLASS_MASTER_KEY=generate-with-openssl-rand-hex-32
```

### **Notifications**
```bash
# Email service (SendGrid, AWS SES, etc.)
EMAIL_SERVICE_API_KEY=your-api-key
EMAIL_FROM=noreply@robinsonsolutions.com

# SMS service (Twilio, AWS SNS, etc.)
SMS_SERVICE_API_KEY=your-api-key
SMS_FROM=+1234567890
```

---

## 🎯 Benefits

### **For Users**
✅ Single login page - no confusion about which URL to use
✅ Automated recovery - no waiting for support tickets
✅ Risk-based delays - balance security and convenience
✅ Multiple recovery options - never permanently locked out

### **For Administrators**
✅ Comprehensive audit trail - full visibility
✅ Automated notifications - stay informed
✅ No manual intervention - system handles recovery
✅ Consistent security - same standards for all accounts

### **For the Platform**
✅ Scalable - works for 1 tenant or 10,000 tenants
✅ Secure - enterprise-grade authentication
✅ Resilient - multiple fallback mechanisms
✅ Future-proof - ready for Federation/OIDC

---

## 📞 Next Steps

1. **Review and approve** this architecture
2. **Implement database schema** (merge into main schema.prisma)
3. **Build unified login API** route
4. **Implement recovery flows**
5. **Add email/SMS services**
6. **Test thoroughly** with all account types
7. **Deploy to production**

---

**Questions? Feedback? Ready to implement?** 🚀

