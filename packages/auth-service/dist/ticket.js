/**
 * SSO ticket utilities (HMAC-based JWT)
 *
 * Uses KV store for distributed nonce replay protection
 */
import { SignJWT, jwtVerify } from 'jose';
import { storeNonce, checkNonce } from '@cortiware/kv';
/**
 * Generate a random nonce
 */
function generateNonce() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
/**
 * Issue an auth ticket for cross-app SSO
 */
export async function issueAuthTicket(sub, role, aud, secret, expirySeconds = 120) {
    try {
        const now = Math.floor(Date.now() / 1000);
        const exp = now + expirySeconds;
        const nonce = generateNonce();
        const payload = {
            sub,
            role,
            aud,
            iat: now,
            exp,
            nonce,
        };
        const secretKey = new TextEncoder().encode(secret);
        const token = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt(now)
            .setExpirationTime(exp)
            .setSubject(sub)
            .setAudience(aud)
            .sign(secretKey);
        return { token, exp };
    }
    catch (error) {
        console.error('Error issuing auth ticket:', error);
        return { error: 'Failed to issue ticket' };
    }
}
/**
 * Verify an auth ticket
 * Returns the payload if valid, or error
 *
 * Uses KV store for distributed nonce replay protection
 */
export async function verifyAuthTicket(token, secret, expectedAudience) {
    try {
        const secretKey = new TextEncoder().encode(secret);
        const { payload } = await jwtVerify(token, secretKey, {
            audience: expectedAudience,
        });
        const ticketPayload = payload;
        // Check nonce for replay protection using KV store
        const nonceExists = await checkNonce(ticketPayload.nonce);
        if (nonceExists) {
            return { valid: false, error: 'Nonce already used (replay detected)' };
        }
        // Store nonce with TTL matching ticket expiry (120 seconds)
        await storeNonce(ticketPayload.nonce, 120);
        return { valid: true, payload: ticketPayload };
    }
    catch (error) {
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
 * Clean up expired nonces
 * No-op for KV store (handles expiry automatically via TTL)
 * Kept for backward compatibility
 */
export function cleanupExpiredNonces() {
    // KV store handles expiry automatically via TTL
    // This function is kept for backward compatibility
}
