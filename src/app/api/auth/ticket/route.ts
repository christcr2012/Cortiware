/**
 * SSO Ticket Issuer Endpoint
 * 
 * Issues short-lived HMAC-signed tickets for cross-app SSO.
 * Used by provider-portal to hand off authenticated sessions to tenant-app.
 * 
 * Security:
 * - Requires valid provider or developer session
 * - Tickets expire in 120 seconds
 * - Audience-bound to target app
 * - Includes nonce for replay protection
 * - Rate limited
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/rate-limit';
import { issueAuthTicket, type AccountType } from '@cortiware/auth-service';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, 'auth-ticket');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Check authentication - must be provider or developer
  const cookieStore = await cookies();
  const providerCookie = cookieStore.get('rs_provider');
  const developerCookie = cookieStore.get('rs_developer');

  if (!providerCookie && !developerCookie) {
    return NextResponse.json(
      { error: 'Unauthorized - must be authenticated as provider or developer' },
      { status: 401 }
    );
  }

  // Parse request body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const { aud, email, role } = body;

  // Validate required fields
  if (!aud || !email || !role) {
    return NextResponse.json(
      { error: 'Missing required fields: aud, email, role' },
      { status: 400 }
    );
  }

  // Validate role
  const validRoles: AccountType[] = ['provider', 'developer', 'tenant', 'accountant', 'vendor'];
  if (!validRoles.includes(role)) {
    return NextResponse.json(
      { error: 'Invalid role' },
      { status: 400 }
    );
  }

  // Get the HMAC secret from environment
  const secret = process.env.AUTH_TICKET_HMAC_SECRET;
  if (!secret) {
    console.error('AUTH_TICKET_HMAC_SECRET not configured');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Issue the ticket
  const result = await issueAuthTicket(email, role, aud, secret, 120);

  if (result.error) {
    console.error('Failed to issue auth ticket:', result.error);
    return NextResponse.json(
      { error: 'Failed to issue ticket' },
      { status: 500 }
    );
  }

  // Return the ticket
  return NextResponse.json({
    token: result.token,
    exp: result.exp,
  });
}

