/**
 * @cortiware/auth-service
 * Shared authentication utilities for Cortiware monorepo
 */
export type { AccountType, AuthError, AuthResult, AuthInput, ProviderAuthConfig, DeveloperAuthConfig, DatabaseUser, TicketPayload, TicketResult, CookieOptions, } from './types';
export { authenticateProvider, authenticateDeveloper, authenticateDatabaseUser, authenticateEmergency, } from './authenticate';
export { verifyTOTPCode, verifyBackupCode, generateTOTPSecret, generateBackupCodes, } from './totp';
export { buildCookieHeader, getCookieName, getRedirectPath, } from './cookie';
export { issueAuthTicket, verifyAuthTicket, cleanupExpiredNonces, } from './ticket';
//# sourceMappingURL=index.d.ts.map