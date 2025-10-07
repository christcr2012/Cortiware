/**
 * Cookie helper utilities
 */
import type { CookieOptions } from './types';
/**
 * Build a Set-Cookie header value
 */
export declare function buildCookieHeader(options: CookieOptions): string;
/**
 * Get cookie name for account type
 */
export declare function getCookieName(accountType: string): string;
/**
 * Get redirect path for account type
 */
export declare function getRedirectPath(accountType: string): string;
//# sourceMappingURL=cookie.d.ts.map