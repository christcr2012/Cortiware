/**
 * SSO ticket utilities (HMAC-based JWT)
 */
import type { TicketPayload, TicketResult, AccountType } from './types';
/**
 * Issue an auth ticket for cross-app SSO
 */
export declare function issueAuthTicket(sub: string, role: AccountType, aud: string, secret: string, expirySeconds?: number): Promise<TicketResult>;
/**
 * Verify an auth ticket
 * Returns the payload if valid, or error
 */
export declare function verifyAuthTicket(token: string, secret: string, expectedAudience: string, nonceStore?: Set<string> | Map<string, number>): Promise<{
    valid: boolean;
    payload?: TicketPayload;
    error?: string;
}>;
/**
 * Clean up expired nonces from a Map-based nonce store
 */
export declare function cleanupExpiredNonces(nonceStore: Map<string, number>): void;
//# sourceMappingURL=ticket.d.ts.map