import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { logLoginSuccess, logLoginFailure, logRateLimitExceeded, logTOTPVerification } from '@/lib/audit-log';
import { PrismaClient } from '@prisma/client';
import {
  authenticateProvider,
  authenticateDeveloper,
  authenticateDatabaseUser,
  buildCookieHeader,
  type AuthInput,
  type ProviderAuthConfig,
  type DeveloperAuthConfig,
  type DatabaseUser,
} from '@cortiware/auth-service';

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

  // Fetch user from database
  const dbUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  const authInput: AuthInput = { email, password, totpCode, recoveryCode };

  const userResult = await authenticateDatabaseUser(
    authInput,
    dbUser as DatabaseUser | null,
    {
      allowAnyTenant: process.env.DEV_ACCEPT_ANY_TENANT_LOGIN === 'true',
      allowAnyAccountant: process.env.DEV_ACCEPT_ANY_ACCOUNTANT_LOGIN === 'true',
      allowAnyVendor: process.env.DEV_ACCEPT_ANY_VENDOR_LOGIN === 'true',
    }
  );

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

      // Update user login stats in database
      await prisma.user.update({
        where: { id: userResult.userId },
        data: {
          failedLoginAttempts: 0,
          lastSuccessfulLogin: new Date(),
        },
      });
    }
    const redirectUrl = userResult.redirectPath || '/dashboard';
    const res = NextResponse.redirect(new URL(redirectUrl, url), 303);
    const cookieHeader = buildCookieHeader({
      name: userResult.cookieName || 'rs_user',
      value: email,
    });
    res.headers.append('Set-Cookie', cookieHeader);
    return res;
  }

  // ============================================================================
  // STEP 2: Check Provider Authentication (FALLBACK)
  // ============================================================================

  const providerConfig: ProviderAuthConfig = {
    envEmail: process.env.PROVIDER_USERNAME || process.env.PROVIDER_EMAIL,
    envPassword: process.env.PROVIDER_PASSWORD,
    breakglassEmail: process.env.PROVIDER_BREAKGLASS_EMAIL,
    breakglassPassword: process.env.PROVIDER_BREAKGLASS_PASSWORD,
  };

  const providerResult = await authenticateProvider(authInput, providerConfig);
  if (providerResult.success) {
    console.log(`✅ Provider login: ${email}`);
    // Reset rate limit and log success
    resetRateLimit(ipAddress, 'auth');
    await logLoginSuccess('provider-system', email, ipAddress, userAgent, 'environment');
    const res = NextResponse.redirect(new URL('/provider', url), 303);
    const cookieHeader = buildCookieHeader({
      name: 'rs_provider',
      value: email,
    });
    res.headers.append('Set-Cookie', cookieHeader);
    return res;
  }

  // ============================================================================
  // STEP 3: Check Developer Authentication (FALLBACK)
  // ============================================================================

  const developerConfig: DeveloperAuthConfig = {
    envEmail: process.env.DEVELOPER_USERNAME || process.env.DEVELOPER_EMAIL,
    envPassword: process.env.DEVELOPER_PASSWORD,
    breakglassEmail: process.env.DEVELOPER_BREAKGLASS_EMAIL,
    breakglassPassword: process.env.DEVELOPER_BREAKGLASS_PASSWORD,
    allowAny: process.env.DEV_ACCEPT_ANY_DEVELOPER_LOGIN === 'true',
  };

  const developerResult = await authenticateDeveloper(authInput, developerConfig);
  if (developerResult.success) {
    console.log(`✅ Developer login: ${email}`);
    // Reset rate limit and log success
    resetRateLimit(ipAddress, 'auth');
    await logLoginSuccess('developer-system', email, ipAddress, userAgent, 'environment');
    const res = NextResponse.redirect(new URL('/developer', url), 303);
    const cookieHeader = buildCookieHeader({
      name: 'rs_developer',
      value: email,
    });
    res.headers.append('Set-Cookie', cookieHeader);
    return res;
  }

  // ============================================================================
  // STEP 4: All authentication methods failed
  // ============================================================================

  console.log(`❌ Login failed: ${email}`);
  await logLoginFailure(email, ipAddress, userAgent, 'Invalid credentials');

  // Increment failed attempts if user exists
  if (dbUser) {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        failedLoginAttempts: { increment: 1 },
        lastFailedLogin: new Date(),
      },
    });
  }

  return NextResponse.redirect(new URL(`/login?error=invalid`, url), 303);
}

