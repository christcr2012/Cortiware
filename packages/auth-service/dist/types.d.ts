/**
 * Shared types for authentication service
 */
export type AccountType = 'provider' | 'developer' | 'tenant' | 'accountant' | 'vendor';
export type AuthError = 'missing' | 'invalid' | 'unsupported' | 'rate_limited' | 'totp_required' | 'account_locked' | 'account_inactive';
export interface AuthResult {
    success: boolean;
    accountType?: AccountType;
    userId?: string;
    requiresTOTP?: boolean;
    cookieName?: string;
    redirectPath?: string;
    error?: AuthError;
}
export interface AuthInput {
    email: string;
    password: string;
    totpCode?: string;
    recoveryCode?: string;
}
export interface ProviderAuthConfig {
    envEmail?: string;
    envPassword?: string;
    breakglassEmail?: string;
    breakglassPassword?: string;
}
export interface DeveloperAuthConfig {
    envEmail?: string;
    envPassword?: string;
    breakglassEmail?: string;
    breakglassPassword?: string;
    allowAny?: boolean;
}
export interface DatabaseUser {
    id: string;
    email: string;
    passwordHash: string | null;
    role: string;
    isActive: boolean;
    isLocked: boolean;
    lockedUntil: Date | null;
    totpEnabled: boolean;
    totpSecret: string | null;
    backupCodesHash: string | null;
    failedLoginAttempts: number;
}
export interface TicketPayload {
    sub: string;
    role: AccountType;
    aud: string;
    iat: number;
    exp: number;
    nonce: string;
}
export interface TicketResult {
    token?: string;
    exp?: number;
    error?: string;
}
export interface CookieOptions {
    name: string;
    value: string;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    path?: string;
}
//# sourceMappingURL=types.d.ts.map