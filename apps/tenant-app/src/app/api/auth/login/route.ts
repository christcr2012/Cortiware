/**
 * Tenant-App Unified Login Endpoint
 * 
 * Handles authentication for:
 * - Tenant users (OWNER, MANAGER, STAFF)
 * - Accountants
 * - Vendors
 * 
 * Does NOT handle Provider/Developer (use emergency endpoint for that)
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { logLoginSuccess, logLoginFailure } from '@/lib/audit-log';
import { prisma } from '@/lib/prisma';
import {
  authenticateDatabaseUser,
  buildCookieHeader,
  type AuthInput,
  type DatabaseUser,
} from '@cortiware/auth-service';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);

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

  // Authentication failed
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

