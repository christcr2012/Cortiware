import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { logLoginSuccess, logLoginFailure, logRateLimitExceeded, logTOTPVerification } from '@/lib/audit-log';
import { verifyTOTPCode, verifyBackupCode } from '@/lib/totp';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * UNIFIED LOGIN SYSTEM
 *
 * Single login endpoint that handles ALL account types:
 * - Provider Accounts (environment-based with DB fallback)
 * - Developer Accounts (environment-based with DB fallback)
 * - Tenant Users (database-backed with breakglass)
 * - Accountant Accounts (database-backed with breakglass)
 * - Vendor Accounts (database-backed with breakglass)
 *
 * Authentication Flow:
 * 1. Apply rate limiting
 * 2. Check Provider (env → DB → breakglass)
 * 3. Check Developer (env → DB → breakglass)
 * 4. Check Database Users (password → TOTP → breakglass)
 * 5. Reset rate limit on successful login
 * 6. Return appropriate redirect based on account type
 */

export async function POST(req: NextRequest) {
  const url = new URL(req.url);

  // Get client info for rate limiting and audit logging
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, 'auth');
  if (rateLimitResponse) {
    // Log rate limit exceeded (we don't have email yet, will log after parsing)
    return rateLimitResponse;
  }

  // Parse body from form or JSON
  let email = '';
  let password = '';
  let totpCode = '';
  let recoveryCode = '';
  let next = '';

  const ct = (req.headers.get('content-type') || '').toLowerCase();
  try {
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const form = await req.formData();
      email = String(form.get('email') ?? '').trim();
      password = String(form.get('password') ?? '').trim();
      totpCode = String(form.get('totpCode') ?? '').trim();
      recoveryCode = String(form.get('recoveryCode') ?? '').trim();
      next = String(form.get('next') ?? '').trim();
    } else {
      const body = await req.json().catch(() => ({} as any));
      email = String(body.email ?? '').trim();
      password = String(body.password ?? '').trim();
      totpCode = String(body.totpCode ?? '').trim();
      recoveryCode = String(body.recoveryCode ?? '').trim();
      next = String(body.next ?? '').trim();
    }
  } catch {
    // fallthrough to error handling
  }

  // Basic validation
  if (!email || !password) {
    await logLoginFailure(email || 'unknown', ipAddress, userAgent, 'Missing credentials');
    return NextResponse.redirect(new URL(`/login?error=missing`, url), 303);
  }

  // ============================================================================
  // AUTHENTICATION ORDER (FIXED):
  // 1. Database Users FIRST (accountant, client users)
  // 2. Provider (environment-based) - FALLBACK
  // 3. Developer (environment-based) - FALLBACK
  // ============================================================================

  // ============================================================================
  // STEP 1: Check Database Users (Tenant/Accountant/Vendor) - PRIORITY
  // ============================================================================

  const userResult = await authenticateDatabaseUser(email, password, totpCode, recoveryCode);

  // Check if TOTP is required
  if (userResult.requiresTOTP) {
    console.log(`🔐 TOTP required for: ${email}`);
    return NextResponse.redirect(new URL(`/login?totp=required&email=${encodeURIComponent(email)}`, url), 303);
  }

  if (userResult.success) {
    console.log(`✅ User login: ${email} (${userResult.accountType})`);
    // Reset rate limit and log success
    resetRateLimit(ipAddress, 'auth');
    if (userResult.userId) {
      await logLoginSuccess(userResult.userId, email, ipAddress, userAgent, 'password');
    }
    const redirectUrl = userResult.redirectUrl || '/dashboard';
    const res = NextResponse.redirect(new URL(redirectUrl, url), 303);
    setCookie(res, userResult.cookieName || 'rs_user', email);
    return res;
  }

  // ============================================================================
  // STEP 2: Check Provider Authentication (FALLBACK)
  // ============================================================================

  const providerResult = await authenticateProvider(email, password);
  if (providerResult.success) {
    console.log(`✅ Provider login: ${email}`);
    // Reset rate limit and log success
    resetRateLimit(ipAddress, 'auth');
    await logLoginSuccess('provider-system', email, ipAddress, userAgent, 'environment');
    const res = NextResponse.redirect(new URL('/provider', url), 303);
    setCookie(res, 'rs_provider', email);
    return res;
  }

  // ============================================================================
  // STEP 3: Check Developer Authentication (FALLBACK)
  // ============================================================================

  const developerResult = await authenticateDeveloper(email, password);
  if (developerResult.success) {
    console.log(`✅ Developer login: ${email}`);
    // Reset rate limit and log success
    resetRateLimit(ipAddress, 'auth');
    await logLoginSuccess('developer-system', email, ipAddress, userAgent, 'environment');
    const res = NextResponse.redirect(new URL('/developer', url), 303);
    setCookie(res, 'rs_developer', email);
    return res;
  }

  // ============================================================================
  // STEP 4: All authentication methods failed
  // ============================================================================

  console.log(`❌ Login failed: ${email}`);
  await logLoginFailure(email, ipAddress, userAgent, 'Invalid credentials');
  return NextResponse.redirect(new URL(`/login?error=invalid`, url), 303);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function setCookie(res: NextResponse, name: string, value: string) {
  const base = `Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`; // 30 days
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.headers.append('Set-Cookie', `${name}=${encodeURIComponent(value)}; ${base}${secure}`);
}

async function authenticateProvider(email: string, password: string): Promise<{ success: boolean }> {
  // Layer 1: Environment-based (primary) - NO DEV MODE for Provider
  const envUser = process.env.PROVIDER_USERNAME || process.env.PROVIDER_EMAIL;
  const envPass = process.env.PROVIDER_PASSWORD;

  if (envUser && envPass && email.toLowerCase() === envUser.toLowerCase() && password === envPass) {
    console.log(`✅ Provider environment auth: ${email}`);
    return { success: true };
  }

  // Layer 2: Database-backed (future implementation)
  // TODO: Check ProviderAccount table

  // Layer 3: Breakglass (environment fallback)
  const breakglassUser = process.env.PROVIDER_BREAKGLASS_EMAIL;
  const breakglassPass = process.env.PROVIDER_BREAKGLASS_PASSWORD;

  if (breakglassUser && breakglassPass && email.toLowerCase() === breakglassUser.toLowerCase() && password === breakglassPass) {
    console.warn('🚨 PROVIDER BREAKGLASS ACTIVATED:', email);
    return { success: true };
  }

  return { success: false };
}

async function authenticateDeveloper(email: string, password: string): Promise<{ success: boolean }> {
  // Layer 1: Environment-based (primary)
  const envUser = process.env.DEVELOPER_USERNAME || process.env.DEVELOPER_EMAIL;
  const envPass = process.env.DEVELOPER_PASSWORD;
  const allowAny = process.env.DEV_ACCEPT_ANY_DEVELOPER_LOGIN === 'true';

  if (allowAny) {
    console.log(`🔓 DEV MODE: Developer login allowed (any credentials)`);
    return { success: true };
  }

  if (envUser && envPass && email.toLowerCase() === envUser.toLowerCase() && password === envPass) {
    return { success: true };
  }

  // Layer 2: Database-backed (future implementation)
  // TODO: Check DeveloperAccount table

  // Layer 3: Breakglass (environment fallback)
  const breakglassUser = process.env.DEVELOPER_BREAKGLASS_EMAIL;
  const breakglassPass = process.env.DEVELOPER_BREAKGLASS_PASSWORD;

  if (breakglassUser && breakglassPass && email.toLowerCase() === breakglassUser.toLowerCase() && password === breakglassPass) {
    console.warn('🚨 DEVELOPER BREAKGLASS ACTIVATED:', email);
    return { success: true };
  }

  return { success: false };
}

async function authenticateDatabaseUser(
  email: string,
  password: string,
  totpCode: string,
  recoveryCode: string
): Promise<{
  success: boolean;
  accountType?: string;
  redirectUrl?: string;
  cookieName?: string;
  userId?: string;
  requiresTOTP?: boolean;
}> {

  // FIRST: Check if user exists in database
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // If user doesn't exist in database, return false immediately
  // This prevents dev mode from accepting non-database emails
  if (!user) {
    return { success: false };
  }

  // If user has PROVIDER or DEVELOPER role, skip database authentication
  // These roles use environment-based authentication, not database
  if (user.role === 'PROVIDER' || user.role === 'DEVELOPER') {
    return { success: false };
  }

  // Dev escape hatches for different account types (only for users that exist in database)
  const allowAnyTenant = process.env.DEV_ACCEPT_ANY_TENANT_LOGIN === 'true';
  const allowAnyAccountant = process.env.DEV_ACCEPT_ANY_ACCOUNTANT_LOGIN === 'true';
  const allowAnyVendor = process.env.DEV_ACCEPT_ANY_VENDOR_LOGIN === 'true';

  // Detect account type from email pattern
  const emailLower = email.toLowerCase();
  let accountType = 'tenant';
  let redirectUrl = '/dashboard';
  let cookieName = 'rs_user';

  if (emailLower.includes('accountant')) {
    accountType = 'accountant';
    redirectUrl = '/accountant';
    cookieName = 'rs_accountant';

    if (allowAnyAccountant) {
      console.log(`🔓 DEV MODE: Accountant login allowed (any credentials)`);
      return { success: true, accountType, redirectUrl, cookieName, userId: user.id };
    }
  } else if (emailLower.includes('vendor')) {
    accountType = 'vendor';
    redirectUrl = '/vendor';
    cookieName = 'rs_vendor';

    if (allowAnyVendor) {
      console.log(`🔓 DEV MODE: Vendor login allowed (any credentials)`);
      return { success: true, accountType, redirectUrl, cookieName, userId: user.id };
    }
  } else {
    // Tenant user (owner, admin, user)
    if (allowAnyTenant) {
      console.log(`🔓 DEV MODE: Tenant login allowed (any credentials)`);
      return { success: true, accountType, redirectUrl, cookieName, userId: user.id };
    }
  }

  // Check environment-based test credentials
  const envEmail = process.env.TENANT_LOGIN_EMAIL;
  const envPassword = process.env.TENANT_LOGIN_PASSWORD;

  if (envEmail && envPassword && email === envEmail && password === envPassword) {
    return { success: true, accountType, redirectUrl, cookieName, userId: user.id };
  }

  // Database authentication with password verification

  // Check if account is locked
  if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
    return { success: false };
  }

  // Check if account is inactive
  if (!user.isActive) {
    return { success: false };
  }

  // Verify password
  const passwordValid = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!passwordValid) {
    // Increment failed attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: { increment: 1 },
        lastFailedLogin: new Date(),
      },
    });
    return { success: false };
  }

  // Check if TOTP is enabled
  if (user.totpEnabled && user.totpSecret) {
    // If TOTP is enabled but no code provided, return special response
    if (!totpCode && !recoveryCode) {
      return { success: false, requiresTOTP: true } as any;
    }

    // Try TOTP code first
    if (totpCode) {
      const totpValid = verifyTOTPCode(totpCode, user.totpSecret);
      if (!totpValid) {
        return { success: false };
      }
    }
    // Try backup code if provided
    else if (recoveryCode && user.backupCodesHash) {
      const backupResult = await verifyBackupCode(recoveryCode, user.backupCodesHash);
      if (!backupResult.valid) {
        return { success: false };
      }
      // Update backup codes in database
      if (backupResult.updatedJson) {
        await prisma.user.update({
          where: { id: user.id },
          data: { backupCodesHash: backupResult.updatedJson },
        });
      }
    }
    else {
      return { success: false };
    }
  }

  // Reset failed attempts on successful login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lastSuccessfulLogin: new Date(),
    },
  });

  // Determine redirect based on role
  if (user.role === 'ACCOUNTANT') {
    accountType = 'accountant';
    redirectUrl = '/accountant';
    cookieName = 'rs_accountant';
  } else if (user.role === 'VENDOR') {
    accountType = 'vendor';
    redirectUrl = '/vendor';
    cookieName = 'rs_vendor';
  } else {
    // OWNER, MANAGER, STAFF
    accountType = 'tenant';
    redirectUrl = '/dashboard';
    cookieName = 'rs_user';
  }

  return { success: true, accountType, redirectUrl, cookieName, userId: user.id };

  // return { success: true, accountType, redirectUrl, cookieName };

  return { success: false };
}

