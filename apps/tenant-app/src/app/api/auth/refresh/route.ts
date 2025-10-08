/**
 * Refresh Token Endpoint
 *
 * Exchanges a valid refresh token for a new access token.
 *
 * Security:
 * - Verifies refresh token signature
 * - Checks token hasn't been revoked in database
 * - Issues new short-lived access token
 * - Optionally rotates refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  buildCookieHeader,
} from '@cortiware/auth-service';

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

    // Check if refresh token exists in database and hasn't been revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { sessionId },
    });

    if (!storedToken) {
      return NextResponse.json(
        { error: 'TokenNotFound', message: 'Refresh token not found' },
        { status: 401 }
      );
    }

    if (storedToken.revoked) {
      return NextResponse.json(
        { error: 'TokenRevoked', message: 'Refresh token has been revoked' },
        { status: 401 }
      );
    }

    if (storedToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'TokenExpired', message: 'Refresh token has expired' },
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
      // Revoke old refresh token
      await prisma.refreshToken.update({
        where: { sessionId },
        data: { revoked: true, revokedAt: new Date() },
      });

      // Generate new refresh token
      newRefreshToken = await generateRefreshToken(
        { userId, email, role, sessionId },
        secret
      );

      // Store new refresh token in database
      await prisma.refreshToken.create({
        data: {
          sessionId,
          userId,
          email,
          role,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });
    }

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

