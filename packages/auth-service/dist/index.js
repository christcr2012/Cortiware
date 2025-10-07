/**
 * @cortiware/auth-service
 * Shared authentication utilities for Cortiware monorepo
 */
// Export authentication functions
export { authenticateProvider, authenticateDeveloper, authenticateDatabaseUser, authenticateEmergency, } from './authenticate';
// Export TOTP utilities
export { verifyTOTPCode, verifyBackupCode, generateTOTPSecret, generateBackupCodes, } from './totp';
// Export cookie utilities
export { buildCookieHeader, getCookieName, getRedirectPath, } from './cookie';
// Export ticket utilities
export { issueAuthTicket, verifyAuthTicket, cleanupExpiredNonces, } from './ticket';
