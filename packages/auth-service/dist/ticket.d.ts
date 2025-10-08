/**
 * SSO ticket utilities (HMAC-based JWT)
 *
 * Uses KV store for distributed nonce replay protection
 */
import type { TicketPayload, TicketResult, AccountType } from './types';
/**
 * Issue an auth ticket for cross-app SSO
 */
export declare function issueAuthTicket(sub: string, role: AccountType, aud: string, secret: string, expirySeconds?: number): Promise<TicketResult>;
/**
 * Verify an auth ticket
 * Returns the payload if valid, or error
 *
 * Uses KV store for distributed nonce replay protection
 */
export declare function verifyAuthTicket(token: string, secret: string, expectedAudience: string): Promise<{
    valid: boolean;
    payload?: TicketPayload;
    error?: string;
}>;
/**
 * Clean up expired nonces
 * No-op for KV store (handles expiry automatically via TTL)
 * Kept for backward compatibility
 */
export declare function cleanupExpiredNonces(): void;
//# sourceMappingURL=ticket.d.ts.map