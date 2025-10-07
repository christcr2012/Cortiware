/**
 * Authentication Context Helpers
 * 
 * Detects and manages authentication context:
 * - Normal mode: User authenticated via SSO or direct login
 * - Direct Access mode: Provider/Developer authenticated via emergency endpoint
 */

import { cookies } from 'next/headers';

export type AuthMode = 'normal' | 'direct-access';
export type AuthRole = 'provider' | 'developer' | 'tenant' | 'accountant' | 'vendor' | null;

export interface AuthContext {
  mode: AuthMode;
  role: AuthRole;
  email: string | null;
  isAuthenticated: boolean;
  isDirectAccess: boolean;
}

/**
 * Get current authentication context from cookies
 */
export async function getAuthContext(): Promise<AuthContext> {
  const cookieStore = await cookies();
  
  // Check for provider/developer cookies (direct access mode)
  const providerCookie = cookieStore.get('rs_provider');
  const developerCookie = cookieStore.get('rs_developer');
  
  if (providerCookie) {
    return {
      mode: 'direct-access',
      role: 'provider',
      email: providerCookie.value,
      isAuthenticated: true,
      isDirectAccess: true,
    };
  }
  
  if (developerCookie) {
    return {
      mode: 'direct-access',
      role: 'developer',
      email: developerCookie.value,
      isAuthenticated: true,
      isDirectAccess: true,
    };
  }
  
  // Check for normal user cookies
  const userCookie = cookieStore.get('rs_user');
  const accountantCookie = cookieStore.get('rs_accountant');
  const vendorCookie = cookieStore.get('rs_vendor');
  
  if (userCookie) {
    return {
      mode: 'normal',
      role: 'tenant',
      email: userCookie.value,
      isAuthenticated: true,
      isDirectAccess: false,
    };
  }
  
  if (accountantCookie) {
    return {
      mode: 'normal',
      role: 'accountant',
      email: accountantCookie.value,
      isAuthenticated: true,
      isDirectAccess: false,
    };
  }
  
  if (vendorCookie) {
    return {
      mode: 'normal',
      role: 'vendor',
      email: vendorCookie.value,
      isAuthenticated: true,
      isDirectAccess: false,
    };
  }
  
  // Not authenticated
  return {
    mode: 'normal',
    role: null,
    email: null,
    isAuthenticated: false,
    isDirectAccess: false,
  };
}

/**
 * Check if current user is in direct access mode
 */
export async function isDirectAccessMode(): Promise<boolean> {
  const context = await getAuthContext();
  return context.isDirectAccess;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(): Promise<AuthContext> {
  const context = await getAuthContext();
  
  if (!context.isAuthenticated) {
    throw new Error('Authentication required');
  }
  
  return context;
}

/**
 * Require specific role - throw error if not authorized
 */
export async function requireRole(allowedRoles: AuthRole[]): Promise<AuthContext> {
  const context = await requireAuth();
  
  if (!allowedRoles.includes(context.role)) {
    throw new Error('Insufficient permissions');
  }
  
  return context;
}

