/**
 * Refresh Token Management
 * 
 * Implements short-lived access tokens + long-lived refresh tokens
 * for improved security.
 * 
 * Flow:
 * 1. User logs in → receives access token (15 min) + refresh token (7 days)
 * 2. Access token expires → client uses refresh token to get new access token
 * 3. Refresh token can be revoked for logout/security
 */

import { SignJWT, jwtVerify } from 'jose';

export interface RefreshTokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

/**
 * Generate a refresh token (long-lived, 7 days)
 */
export async function generateRefreshToken(
  payload: RefreshTokenPayload,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);

  const token = await new SignJWT({
    sub: payload.userId,
    email: payload.email,
    role: payload.role,
    sessionId: payload.sessionId,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days
    .sign(secretKey);

  return token;
}

/**
 * Generate an access token (short-lived, 15 minutes)
 */
export async function generateAccessToken(
  payload: AccessTokenPayload,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);

  const token = await new SignJWT({
    sub: payload.userId,
    email: payload.email,
    role: payload.role,
    sessionId: payload.sessionId,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m') // 15 minutes
    .sign(secretKey);

  return token;
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(
  token: string,
  secret: string
): Promise<{ valid: boolean; payload?: RefreshTokenPayload; error?: string }> {
  try {
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(secret);

    const { payload } = await jwtVerify(token, secretKey);

    // Verify it's a refresh token
    if (payload.type !== 'refresh') {
      return { valid: false, error: 'Invalid token type' };
    }

    return {
      valid: true,
      payload: {
        userId: payload.sub as string,
        email: payload.email as string,
        role: payload.role as string,
        sessionId: payload.sessionId as string,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    };
  }
}

/**
 * Verify an access token
 */
export async function verifyAccessToken(
  token: string,
  secret: string
): Promise<{ valid: boolean; payload?: AccessTokenPayload; error?: string }> {
  try {
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(secret);

    const { payload } = await jwtVerify(token, secretKey);

    // Verify it's an access token
    if (payload.type !== 'access') {
      return { valid: false, error: 'Invalid token type' };
    }

    return {
      valid: true,
      payload: {
        userId: payload.sub as string,
        email: payload.email as string,
        role: payload.role as string,
        sessionId: payload.sessionId as string,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    };
  }
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

