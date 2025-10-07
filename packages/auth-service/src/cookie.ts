/**
 * Cookie helper utilities
 */

import type { CookieOptions } from './types';

/**
 * Build a Set-Cookie header value
 */
export function buildCookieHeader(options: CookieOptions): string {
  const {
    name,
    value,
    maxAge = 2592000, // 30 days default
    secure = process.env.NODE_ENV === 'production',
    httpOnly = true,
    sameSite = 'Lax',
    path = '/',
  } = options;

  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    `Max-Age=${maxAge}`,
    `SameSite=${sameSite}`,
  ];

  if (httpOnly) {
    parts.push('HttpOnly');
  }

  if (secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

/**
 * Get cookie name for account type
 */
export function getCookieName(accountType: string): string {
  switch (accountType) {
    case 'provider':
      return 'rs_provider';
    case 'developer':
      return 'rs_developer';
    case 'accountant':
      return 'rs_accountant';
    case 'vendor':
      return 'rs_vendor';
    case 'tenant':
    default:
      return 'rs_user';
  }
}

/**
 * Get redirect path for account type
 */
export function getRedirectPath(accountType: string): string {
  switch (accountType) {
    case 'provider':
      return '/provider';
    case 'developer':
      return '/developer';
    case 'accountant':
      return '/accountant';
    case 'vendor':
      return '/vendor';
    case 'tenant':
    default:
      return '/dashboard';
  }
}

