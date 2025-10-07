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
export declare function generateRefreshToken(payload: RefreshTokenPayload, secret: string): Promise<string>;
/**
 * Generate an access token (short-lived, 15 minutes)
 */
export declare function generateAccessToken(payload: AccessTokenPayload, secret: string): Promise<string>;
/**
 * Verify a refresh token
 */
export declare function verifyRefreshToken(token: string, secret: string): Promise<{
    valid: boolean;
    payload?: RefreshTokenPayload;
    error?: string;
}>;
/**
 * Verify an access token
 */
export declare function verifyAccessToken(token: string, secret: string): Promise<{
    valid: boolean;
    payload?: AccessTokenPayload;
    error?: string;
}>;
/**
 * Generate a unique session ID
 */
export declare function generateSessionId(): string;
//# sourceMappingURL=refresh-token.d.ts.map