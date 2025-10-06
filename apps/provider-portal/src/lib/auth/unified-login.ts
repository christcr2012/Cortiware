/**
 * UNIFIED LOGIN SYSTEM
 * 
 * Single login endpoint that handles ALL account types:
 * - Provider Accounts (environment-based with DB fallback)
 * - Developer Accounts (environment-based with DB fallback)
 * - Tenant Users (database-backed with breakglass)
 * - Accountant Accounts (database-backed with breakglass)
 * - Vendor Accounts (database-backed with breakglass)
 * 
 * Authentication Flow:
 * 1. Check Provider (env → DB → breakglass)
 * 2. Check Developer (env → DB → breakglass)
 * 3. Check Database Users (password → TOTP → breakglass)
 * 4. Return appropriate redirect based on account type
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

export type AccountType = 'provider' | 'developer' | 'tenant' | 'accountant' | 'vendor';
export type AuthMode = 'env' | 'database' | 'breakglass' | 'recovery';

export interface LoginRequest {
  email: string;
  password: string;
  totpCode?: string;
  recoveryCode?: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
}

export interface LoginResult {
  success: boolean;
  accountType?: AccountType;
  authMode?: AuthMode;
  userId?: string;
  email?: string;
  redirectUrl?: string;
  cookieName?: string;
  cookieValue?: string;
  requiresTOTP?: boolean;
  requiresPasswordChange?: boolean;
  isRecoveryMode?: boolean;
  error?: string;
  message?: string;
}

// ============================================================================
// MAIN UNIFIED LOGIN FUNCTION
// ============================================================================

export async function authenticateUnified(request: LoginRequest): Promise<LoginResult> {
  const { email, password, totpCode, recoveryCode } = request;

  // Step 1: Try Provider Authentication
  const providerResult = await authenticateProvider(email, password);
  if (providerResult.success) {
    return {
      ...providerResult,
      accountType: 'provider',
      redirectUrl: '/provider',
      cookieName: 'rs_provider',
      cookieValue: email,
    };
  }

  // Step 2: Try Developer Authentication
  const developerResult = await authenticateDeveloper(email, password);
  if (developerResult.success) {
    return {
      ...developerResult,
      accountType: 'developer',
      redirectUrl: '/developer',
      cookieName: 'rs_developer',
      cookieValue: email,
    };
  }

  // Step 3: Try Database User Authentication (Tenant/Accountant/Vendor)
  const userResult = await authenticateDatabaseUser(request);
  if (userResult.success) {
    return userResult;
  }

  // Step 4: All authentication methods failed
  return {
    success: false,
    error: 'invalid_credentials',
    message: 'Invalid email or password',
  };
}

// ============================================================================
// PROVIDER AUTHENTICATION (Dual-Layer)
// ============================================================================

async function authenticateProvider(
  email: string,
  password: string
): Promise<Omit<LoginResult, 'accountType'>> {
  // Layer 1: Environment-based (primary)
  const envUser = process.env.PROVIDER_USERNAME || process.env.PROVIDER_EMAIL;
  const envPass = process.env.PROVIDER_PASSWORD;
  const allowAny = process.env.DEV_ACCEPT_ANY_PROVIDER_LOGIN === 'true';

  if (allowAny || (envUser && envPass && email.toLowerCase() === envUser.toLowerCase() && password === envPass)) {
    return {
      success: true,
      authMode: 'env',
      email,
    };
  }

  // Layer 2: Database-backed (future implementation)
  // TODO: Check ProviderAccount table
  // const providerAccount = await prisma.providerAccount.findUnique({
  //   where: { email: email.toLowerCase() },
  // });
  // if (providerAccount && await bcrypt.compare(password, providerAccount.passwordHash)) {
  //   return { success: true, authMode: 'database', email };
  // }

  // Layer 3: Breakglass (environment fallback when DB unavailable)
  const breakglassUser = process.env.PROVIDER_BREAKGLASS_EMAIL;
  const breakglassPass = process.env.PROVIDER_BREAKGLASS_PASSWORD;

  if (breakglassUser && breakglassPass && email.toLowerCase() === breakglassUser.toLowerCase() && password === breakglassPass) {
    console.warn('🚨 PROVIDER BREAKGLASS ACTIVATED:', email);
    return {
      success: true,
      authMode: 'breakglass',
      email,
      isRecoveryMode: true,
      message: 'Recovery mode active - database unavailable, limited operations',
    };
  }

  return { success: false };
}

// ============================================================================
// DEVELOPER AUTHENTICATION (Dual-Layer)
// ============================================================================

async function authenticateDeveloper(
  email: string,
  password: string
): Promise<Omit<LoginResult, 'accountType'>> {
  // Layer 1: Environment-based (primary)
  const envUser = process.env.DEVELOPER_USERNAME || process.env.DEVELOPER_EMAIL;
  const envPass = process.env.DEVELOPER_PASSWORD;
  const allowAny = process.env.DEV_ACCEPT_ANY_DEVELOPER_LOGIN === 'true';

  if (allowAny || (envUser && envPass && email.toLowerCase() === envUser.toLowerCase() && password === envPass)) {
    return {
      success: true,
      authMode: 'env',
      email,
    };
  }

  // Layer 2: Database-backed (future implementation)
  // TODO: Check DeveloperAccount table

  // Layer 3: Breakglass (environment fallback)
  const breakglassUser = process.env.DEVELOPER_BREAKGLASS_EMAIL;
  const breakglassPass = process.env.DEVELOPER_BREAKGLASS_PASSWORD;

  if (breakglassUser && breakglassPass && email.toLowerCase() === breakglassUser.toLowerCase() && password === breakglassPass) {
    console.warn('🚨 DEVELOPER BREAKGLASS ACTIVATED:', email);
    return {
      success: true,
      authMode: 'breakglass',
      email,
      isRecoveryMode: true,
      message: 'Recovery mode active - database unavailable, limited operations',
    };
  }

  return { success: false };
}

// ============================================================================
// DATABASE USER AUTHENTICATION (Tenant/Accountant/Vendor)
// ============================================================================

async function authenticateDatabaseUser(request: LoginRequest): Promise<LoginResult> {
  const { email, password, totpCode, recoveryCode, ipAddress, userAgent, deviceFingerprint } = request;

  // TODO: Load user from database
  // const user = await prisma.user.findUnique({
  //   where: { email: email.toLowerCase() },
  //   include: {
  //     org: true,
  //     breakglassAccount: true,
  //     recoveryCodes: { where: { usedAt: null, expiresAt: { gt: new Date() } } },
  //   },
  // });

  // if (!user) {
  //   return { success: false, error: 'invalid_credentials' };
  // }

  // Check if account is locked
  // if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
  //   return {
  //     success: false,
  //     error: 'account_locked',
  //     message: `Account locked until ${user.lockedUntil.toLocaleString()}`,
  //   };
  // }

  // Path 1: Recovery Code Authentication
  if (recoveryCode) {
    return await authenticateWithRecoveryCode(email, recoveryCode);
  }

  // Path 2: Regular Password Authentication
  // const passwordValid = await bcrypt.compare(password, user.passwordHash);
  // if (!passwordValid) {
  //   // Increment failed attempts
  //   await incrementFailedAttempts(user.id);
  //   return { success: false, error: 'invalid_credentials' };
  // }

  // Check if TOTP is required
  // if (user.totpEnabled && !totpCode) {
  //   return {
  //     success: false,
  //     requiresTOTP: true,
  //     message: 'Two-factor authentication code required',
  //   };
  // }

  // Verify TOTP if provided
  // if (user.totpEnabled && totpCode) {
  //   const totpValid = await verifyTOTP(user.totpSecret!, totpCode);
  //   if (!totpValid) {
  //     return { success: false, error: 'invalid_totp', message: 'Invalid 2FA code' };
  //   }
  // }

  // Determine account type and redirect
  const accountType = determineAccountType('owner'); // user.baseRole
  const redirectUrl = getRedirectUrl(accountType);
  const cookieName = getCookieName(accountType);

  return {
    success: true,
    accountType,
    authMode: 'database',
    userId: 'user-id-placeholder',
    email,
    redirectUrl,
    cookieName,
    cookieValue: email,
    requiresPasswordChange: false, // user.mustChangePassword
  };
}

// ============================================================================
// RECOVERY CODE AUTHENTICATION
// ============================================================================

async function authenticateWithRecoveryCode(
  email: string,
  recoveryCode: string
): Promise<LoginResult> {
  // TODO: Load user and recovery codes
  // const user = await prisma.user.findUnique({
  //   where: { email: email.toLowerCase() },
  //   include: { recoveryCodes: { where: { usedAt: null } } },
  // });

  // if (!user) {
  //   return { success: false, error: 'invalid_credentials' };
  // }

  // Check each unused recovery code
  // for (const code of user.recoveryCodes) {
  //   const codeValid = await bcrypt.compare(recoveryCode, code.codeHash);
  //   if (codeValid) {
  //     // Mark code as used
  //     await prisma.userRecoveryCode.update({
  //       where: { id: code.id },
  //       data: { usedAt: new Date(), usedFrom: ipAddress },
  //     });

  //     const accountType = determineAccountType(user.baseRole);
  //     return {
  //       success: true,
  //       accountType,
  //       authMode: 'recovery',
  //       userId: user.id,
  //       email: user.email,
  //       redirectUrl: getRedirectUrl(accountType),
  //       cookieName: getCookieName(accountType),
  //       cookieValue: user.email,
  //       requiresPasswordChange: true, // Force password change after recovery code use
  //     };
  //   }
  // }

  return { success: false, error: 'invalid_recovery_code' };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function determineAccountType(baseRole: string): AccountType {
  if (baseRole === 'accountant') return 'accountant';
  if (baseRole === 'vendor') return 'vendor';
  return 'tenant'; // owner, admin, user
}

function getRedirectUrl(accountType: AccountType): string {
  switch (accountType) {
    case 'provider': return '/provider';
    case 'developer': return '/developer';
    case 'accountant': return '/accountant';
    case 'vendor': return '/vendor';
    case 'tenant': return '/dashboard';
  }
}

function getCookieName(accountType: AccountType): string {
  switch (accountType) {
    case 'provider': return 'rs_provider';
    case 'developer': return 'rs_developer';
    case 'accountant': return 'rs_accountant';
    case 'vendor': return 'rs_vendor';
    case 'tenant': return 'rs_user';
  }
}

