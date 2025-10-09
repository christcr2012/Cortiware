/**
 * Emergency Provider/Developer Access Endpoint (Tenant-App)
 * 
 * Provides fallback authentication when federation/SSO is down.
 * Allows Provider/Developer to access tenant systems directly.
 * 
 * Security:
 * - Gated by EMERGENCY_LOGIN_ENABLED flag
 * - Verifies bcrypt password hashes
 * - Optional IP allowlist
 * - Heavily rate limited
 * - All access logged with high visibility
 * 
 * Single-Tenant Mode:
 * - Sessions are scoped to current tenant only
 * - Cross-tenant navigation is blocked
 * - Banner displayed to indicate emergency mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { logEmergencyAccess, logLoginFailure } from '@/lib/audit-log';
import {
  authenticateEmergency,
  buildCookieHeader,
  verifyTOTPCode,
  type AuthInput,
} from '@cortiware/auth-service';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);

  // Check if emergency login is enabled
  if (process.env.EMERGENCY_LOGIN_ENABLED !== 'true') {
    console.warn('🚫 Emergency login attempt but EMERGENCY_LOGIN_ENABLED is not true');
    return NextResponse.redirect(new URL('/login?error=unavailable', url), 303);
  }

  // Get client info for rate limiting and audit logging
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // Check IP allowlist if configured
  const allowlist = process.env.EMERGENCY_IP_ALLOWLIST;
  if (allowlist) {
    const allowedIPs = allowlist.split(',').map(ip => ip.trim());
    if (!allowedIPs.includes(ipAddress)) {
      console.warn(`🚫 Emergency login attempt from non-allowlisted IP: ${ipAddress}`);
      await logLoginFailure('emergency-access', ipAddress, userAgent, 'IP not allowlisted');
      return NextResponse.redirect(new URL('/login?error=forbidden', url), 303);
    }
  }

  // Apply strict rate limiting
  const rateLimitResponse = await applyRateLimit(req, 'auth-emergency');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Parse body from form or JSON
  let email = '';
  let password = '';
  let role: 'provider' | 'developer' | '' = '';
  let totpCode = '';

  const ct = (req.headers.get('content-type') || '').toLowerCase();
  try {
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const form = await req.formData();
      email = String(form.get('email') ?? '').trim();
      password = String(form.get('password') ?? '').trim();
      role = String(form.get('role') ?? '').trim() as 'provider' | 'developer' | '';
      totpCode = String(form.get('totp') ?? '').trim();
    } else {
      const body = await req.json().catch(() => ({} as any));
      email = String(body.email ?? '').trim();
      password = String(body.password ?? '').trim();
      role = String(body.role ?? '').trim() as 'provider' | 'developer' | '';
      totpCode = String(body.totp ?? '').trim();
    }
  } catch {
    // fallthrough to error handling
  }

  // Basic validation
  if (!email || !password || !role) {
    await logLoginFailure('emergency-access', ipAddress, userAgent, 'Missing credentials');
    return NextResponse.redirect(new URL(`/login?error=missing`, url), 303);
  }

  if (role !== 'provider' && role !== 'developer') {
    await logLoginFailure('emergency-access', ipAddress, userAgent, 'Invalid role');
    return NextResponse.redirect(new URL(`/login?error=invalid`, url), 303);
  }

  // Get the password hash from environment
  const passwordHash = role === 'provider'
    ? process.env.PROVIDER_ADMIN_PASSWORD_HASH
    : process.env.DEVELOPER_ADMIN_PASSWORD_HASH;

  if (!passwordHash) {
    console.error(`${role.toUpperCase()}_ADMIN_PASSWORD_HASH not configured`);
    return NextResponse.redirect(new URL('/login?error=server_error', url), 303);
  }

  // Optional TOTP requirement if secret is configured
  const totpSecret = role === 'provider'
    ? process.env.PROVIDER_TOTP_SECRET
    : process.env.DEVELOPER_TOTP_SECRET;

  if (totpSecret) {
    if (!totpCode) {
      await logLoginFailure(`emergency-${role}`, ipAddress, userAgent, 'TOTP required');
      return NextResponse.redirect(new URL(`/emergency/${role}?error=totp_required`, url), 303);
    }
    const totpOk = verifyTOTPCode(totpCode, totpSecret);
    if (!totpOk) {
      await logLoginFailure(`emergency-${role}`, ipAddress, userAgent, 'Invalid TOTP');
      return NextResponse.redirect(new URL(`/emergency/${role}?error=totp_invalid`, url), 303);
    }
  }

  // Authenticate
  const authInput: AuthInput = { email, password };
  const result = await authenticateEmergency(authInput, role, passwordHash);

  if (!result.success) {
    console.log(`❌ Emergency ${role} login failed: ${email}`);
    await logLoginFailure(`emergency-${role}`, ipAddress, userAgent, 'Invalid credentials');
    return NextResponse.redirect(new URL(`/emergency/${role}?error=invalid`, url), 303);
  }

  // Success - log with high visibility and context
  console.warn(`🚨 EMERGENCY ${role.toUpperCase()} ACCESS: ${email} from ${ipAddress}`);
  await logEmergencyAccess(role, email, ipAddress, userAgent, {
    isDirectAccess: true,
    providerId: role === 'provider' ? email : undefined,
    developerId: role === 'developer' ? email : undefined,
  });
  resetRateLimit(ipAddress, 'auth-emergency');

  // Set cookies and redirect into emergency flow
  const res = NextResponse.redirect(new URL('/emergency/tenants', url), 303);
  const authCookie = buildCookieHeader({
    name: result.cookieName || `rs_${role}`,
    value: email,
    maxAge: 1800, // 30 minutes
    sameSite: 'Strict',
  });
  const emergencyFlag = buildCookieHeader({ name: 'rs_emergency', value: '1', maxAge: 1800, sameSite: 'Strict' });
  const emergencyRole = buildCookieHeader({ name: 'rs_emergency_role', value: role, maxAge: 1800, sameSite: 'Strict' });
  res.headers.append('Set-Cookie', authCookie);
  res.headers.append('Set-Cookie', emergencyFlag);
  res.headers.append('Set-Cookie', emergencyRole);

  return res;
}

