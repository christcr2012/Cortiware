/**
 * SSO Callback Endpoint (Tenant-App)
 * 
 * Verifies auth tickets from provider-portal and establishes sessions.
 * 
 * Security:
 * - Verifies HMAC signature
 * - Checks audience binding
 * - Validates expiry
 * - Prevents replay attacks via nonce store
 * - Rate limited
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/rate-limit';
import { logLoginSuccess } from '@/lib/audit-log';
import {
  verifyAuthTicket,
  buildCookieHeader,
  getCookieName,
  getRedirectPath,
} from '@cortiware/auth-service';

// In-memory nonce store (Phase 1)
// Phase 2: Replace with Redis/KV
const nonceStore = new Map<string, number>();

// Cleanup expired nonces every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [nonce, expiry] of nonceStore.entries()) {
    if (expiry < now) {
      nonceStore.delete(nonce);
    }
  }
}, 5 * 60 * 1000);

export async function POST(req: NextRequest) {
  const url = new URL(req.url);

  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, 'auth-ticket');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Get client info for audit logging
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // Parse request body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.redirect(new URL('/login?error=invalid_ticket', url), 303);
  }

  const { token } = body;

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_ticket', url), 303);
  }

  // Get the HMAC secret from environment
  const secret = process.env.AUTH_TICKET_HMAC_SECRET;
  if (!secret) {
    console.error('AUTH_TICKET_HMAC_SECRET not configured');
    return NextResponse.redirect(new URL('/login?error=server_error', url), 303);
  }

  // Verify the ticket
  const expectedAudience = process.env.NEXT_PUBLIC_APP_URL || 'tenant-app';
  const result = await verifyAuthTicket(token, secret, expectedAudience, nonceStore);

  if (!result.valid || !result.payload) {
    console.error('Invalid auth ticket:', result.error);
    return NextResponse.redirect(new URL('/login?error=invalid_ticket', url), 303);
  }

  const { sub: email, role } = result.payload;

  // Log successful SSO login
  await logLoginSuccess(email, email, ipAddress, userAgent, 'sso-ticket');

  // Set cookie and redirect
  const cookieName = getCookieName(role);
  const redirectPath = getRedirectPath(role);

  const res = NextResponse.redirect(new URL(redirectPath, url), 303);
  const cookieHeader = buildCookieHeader({
    name: cookieName,
    value: email,
  });
  res.headers.append('Set-Cookie', cookieHeader);

  console.log(`✅ SSO login: ${email} (${role}) via ticket`);
  return res;
}

