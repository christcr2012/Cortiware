import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { issueAuthTicket } from '@cortiware/auth-service';

/**
 * SSO Ticket Issuer
 * 
 * Issues short-lived JWT tickets for cross-app authentication
 * Requires valid provider or developer session
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  
  // Check for provider or developer session
  const providerEmail = cookieStore.get('rs_provider')?.value;
  const developerEmail = cookieStore.get('rs_developer')?.value;
  
  if (!providerEmail && !developerEmail) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No valid session' },
      { status: 401 }
    );
  }

  const email = providerEmail || developerEmail;
  const role = providerEmail ? 'provider' : 'developer';

  // Get HMAC secret from environment
  const hmacSecret = process.env.AUTH_TICKET_HMAC_SECRET;
  if (!hmacSecret) {
    console.error('AUTH_TICKET_HMAC_SECRET not configured');
    return NextResponse.json(
      { error: 'ServerError', message: 'SSO not configured' },
      { status: 500 }
    );
  }

  try {
    // Issue ticket with 120 second expiry
    const ticket = await issueAuthTicket(
      {
        email: email!,
        role,
        audience: 'tenant-app',
      },
      hmacSecret
    );

    return NextResponse.json({
      token: ticket,
      expiresIn: 120,
    });
  } catch (error) {
    console.error('Failed to issue ticket:', error);
    return NextResponse.json(
      { error: 'ServerError', message: 'Failed to issue ticket' },
      { status: 500 }
    );
  }
}

