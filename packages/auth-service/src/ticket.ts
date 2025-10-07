/**
 * SSO ticket utilities (HMAC-based JWT)
 */

import { SignJWT, jwtVerify } from 'jose';
import type { TicketPayload, TicketResult, AccountType } from './types';

/**
 * Generate a random nonce
 */
function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Issue an auth ticket for cross-app SSO
 */
export async function issueAuthTicket(
  sub: string,
  role: AccountType,
  aud: string,
  secret: string,
  expirySeconds: number = 120
): Promise<TicketResult> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + expirySeconds;
    const nonce = generateNonce();

    const payload: TicketPayload = {
      sub,
      role,
      aud,
      iat: now,
      exp,
      nonce,
    };

    const secretKey = new TextEncoder().encode(secret);

    const token = await new SignJWT(payload as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .setSubject(sub)
      .setAudience(aud)
      .sign(secretKey);

    return { token, exp };
  } catch (error) {
    console.error('Error issuing auth ticket:', error);
    return { error: 'Failed to issue ticket' };
  }
}

/**
 * Verify an auth ticket
 * Returns the payload if valid, or error
 */
export async function verifyAuthTicket(
  token: string,
  secret: string,
  expectedAudience: string,
  nonceStore?: Set<string> | Map<string, number>
): Promise<{ valid: boolean; payload?: TicketPayload; error?: string }> {
  try {
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey, {
      audience: expectedAudience,
    });

    const ticketPayload = payload as unknown as TicketPayload;

    // Check nonce for replay protection
    if (nonceStore) {
      if (nonceStore instanceof Set) {
        if (nonceStore.has(ticketPayload.nonce)) {
          return { valid: false, error: 'Nonce already used (replay detected)' };
        }
        nonceStore.add(ticketPayload.nonce);
      } else if (nonceStore instanceof Map) {
        if (nonceStore.has(ticketPayload.nonce)) {
          return { valid: false, error: 'Nonce already used (replay detected)' };
        }
        // Store with expiry timestamp (5 minutes from now)
        nonceStore.set(ticketPayload.nonce, Date.now() + 300000);
      }
    }

    return { valid: true, payload: ticketPayload };
  } catch (error: any) {
    console.error('Error verifying auth ticket:', error);
    if (error.code === 'ERR_JWT_EXPIRED') {
      return { valid: false, error: 'Ticket expired' };
    }
    if (error.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
      return { valid: false, error: 'Invalid audience' };
    }
    return { valid: false, error: 'Invalid ticket' };
  }
}

/**
 * Clean up expired nonces from a Map-based nonce store
 */
export function cleanupExpiredNonces(nonceStore: Map<string, number>): void {
  const now = Date.now();
  for (const [nonce, expiry] of nonceStore.entries()) {
    if (expiry < now) {
      nonceStore.delete(nonce);
    }
  }
}

