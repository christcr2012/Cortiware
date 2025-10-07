/**
 * Tenant-App Unified Login Endpoint
 *
 * Handles authentication for:
 * - Tenant users (OWNER, MANAGER, STAFF)
 * - Accountants
 * - Vendors
 * - Provider/Developer (emergency access with bcrypt hashes)
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { logLoginSuccess, logLoginFailure, logEmergencyAccess } from '@/lib/audit-log';
import { prisma } from '@/lib/prisma';
import {
  authenticateDatabaseUser,
  authenticateEmergency,
  buildCookieHeader,
  type AuthInput,
  type DatabaseUser,
} from '@cortiware/auth-service';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);

  try {
    // Get client info for rate limiting and audit logging
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, 'auth');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

  // Parse body from form or JSON
  let email = '';
  let password = '';
  let totpCode = '';
  let recoveryCode = '';

  const ct = (req.headers.get('content-type') || '').toLowerCase();
  try {
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const form = await req.formData();
      email = String(form.get('email') ?? '').trim();
      password = String(form.get('password') ?? '').trim();
      totpCode = String(form.get('totpCode') ?? '').trim();
      recoveryCode = String(form.get('recoveryCode') ?? '').trim();
    } else {
      const body = await req.json().catch(() => ({} as any));
      email = String(body.email ?? '').trim();
      password = String(body.password ?? '').trim();
      totpCode = String(body.totpCode ?? '').trim();
      recoveryCode = String(body.recoveryCode ?? '').trim();
    }
  } catch {
    // fallthrough to error handling
  }

  // Basic validation
  if (!email || !password) {
    await logLoginFailure(email || 'unknown', ipAddress, userAgent, 'Missing credentials');
    return NextResponse.redirect(new URL(`/login?error=missing`, url), 303);
  }

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

  // Database user authentication failed - try emergency access
  // Check if emergency login is enabled and we have the required hashes
  if (process.env.EMERGENCY_LOGIN_ENABLED === 'true') {
    const providerHash = process.env.PROVIDER_ADMIN_PASSWORD_HASH;
    const developerHash = process.env.DEVELOPER_ADMIN_PASSWORD_HASH;

    // Try provider emergency access
    if (providerHash) {
      const providerResult = await authenticateEmergency(authInput, 'provider', providerHash);
      if (providerResult.success) {
        console.warn(`🚨 EMERGENCY PROVIDER ACCESS: ${email} from ${ipAddress}`);
        await logEmergencyAccess('provider', email, ipAddress, userAgent, {
          isDirectAccess: true,
          providerId: email,
        });
        resetRateLimit(ipAddress, 'auth');
        const res = NextResponse.redirect(new URL('/dashboard', url), 303);
        const cookieHeader = buildCookieHeader({
          name: 'rs_provider',
          value: email,
        });
        res.headers.append('Set-Cookie', cookieHeader);
        return res;
      }
    }

    // Try developer emergency access
    if (developerHash) {
      const developerResult = await authenticateEmergency(authInput, 'developer', developerHash);
      if (developerResult.success) {
        console.warn(`🚨 EMERGENCY DEVELOPER ACCESS: ${email} from ${ipAddress}`);
        await logEmergencyAccess('developer', email, ipAddress, userAgent, {
          isDirectAccess: true,
          developerId: email,
        });
        resetRateLimit(ipAddress, 'auth');
        const res = NextResponse.redirect(new URL('/dashboard', url), 303);
        const cookieHeader = buildCookieHeader({
          name: 'rs_developer',
          value: email,
        });
        res.headers.append('Set-Cookie', cookieHeader);
        return res;
      }
    }
  }

  // All authentication methods failed
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
  } catch (error) {
    console.error('❌ Login endpoint error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.redirect(new URL(`/login?error=server_error`, url), 303);
  }
}

