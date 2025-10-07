/**
 * Refresh Token Endpoint
 * 
 * Exchanges a valid refresh token for a new access token.
 * 
 * Security:
 * - Verifies refresh token signature
 * - Checks session is still valid in KV store
 * - Issues new short-lived access token
 * - Optionally rotates refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  buildCookieHeader,
} from '@cortiware/auth-service';
import { getSession, refreshSession } from '@cortiware/kv';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Get refresh token from cookie or body
    let refreshToken = cookieStore.get('rs_refresh_token')?.value;
    
    if (!refreshToken) {
      const body = await req.json().catch(() => ({}));
      refreshToken = body.refreshToken;
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'MissingToken', message: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Get secret from environment
    const secret = process.env.AUTH_TOKEN_SECRET || process.env.AUTH_TICKET_HMAC_SECRET;
    if (!secret) {
      console.error('AUTH_TOKEN_SECRET not configured');
      return NextResponse.json(
        { error: 'ServerError', message: 'Token service not configured' },
        { status: 500 }
      );
    }

    // Verify refresh token
    const result = await verifyRefreshToken(refreshToken, secret);
    
    if (!result.valid || !result.payload) {
      return NextResponse.json(
        { error: 'InvalidToken', message: result.error || 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const { userId, email, role, sessionId } = result.payload;

    // Check if session is still valid in KV
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'SessionExpired', message: 'Session no longer valid' },
        { status: 401 }
      );
    }

    // Generate new access token
    const accessToken = await generateAccessToken(
      { userId, email, role, sessionId },
      secret
    );

    // Optionally rotate refresh token (recommended for security)
    const rotateRefreshToken = process.env.ROTATE_REFRESH_TOKENS === 'true';
    let newRefreshToken = refreshToken;
    
    if (rotateRefreshToken) {
      newRefreshToken = await generateRefreshToken(
        { userId, email, role, sessionId },
        secret
      );
    }

    // Extend session TTL
    await refreshSession(sessionId, 7 * 24 * 60 * 60); // 7 days

    // Set cookies
    const res = NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900, // 15 minutes
    });

    // Set access token cookie (short-lived)
    const accessCookieHeader = buildCookieHeader({
      name: 'rs_access_token',
      value: accessToken,
      maxAge: 900, // 15 minutes
    });
    res.headers.append('Set-Cookie', accessCookieHeader);

    // Set refresh token cookie (long-lived) if rotated
    if (rotateRefreshToken) {
      const refreshCookieHeader = buildCookieHeader({
        name: 'rs_refresh_token',
        value: newRefreshToken,
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
      res.headers.append('Set-Cookie', refreshCookieHeader);
    }

    console.log(`✅ Token refreshed for user: ${email}`);
    return res;

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    return NextResponse.json(
      { error: 'ServerError', message: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}

