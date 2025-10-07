/**
 * Core authentication functions
 */

import bcrypt from 'bcryptjs';
import { verifyTOTPCode, verifyBackupCode } from './totp';
import { getCookieName, getRedirectPath } from './cookie';
import type {
  AuthResult,
  AuthInput,
  ProviderAuthConfig,
  DeveloperAuthConfig,
  DatabaseUser,
} from './types';

/**
 * Authenticate a Provider account (environment-based)
 */
export async function authenticateProvider(
  input: AuthInput,
  config: ProviderAuthConfig
): Promise<AuthResult> {
  const { email, password } = input;
  const emailLower = email.toLowerCase();

  // Layer 1: Environment-based (primary)
  const envEmail = config.envEmail?.toLowerCase();
  const envPassword = config.envPassword;

  if (envEmail && envPassword && emailLower === envEmail && password === envPassword) {
    return {
      success: true,
      accountType: 'provider',
      cookieName: 'rs_provider',
      redirectPath: '/provider',
    };
  }

  // Layer 2: Breakglass (environment fallback)
  const breakglassEmail = config.breakglassEmail?.toLowerCase();
  const breakglassPassword = config.breakglassPassword;

  if (breakglassEmail && breakglassPassword && emailLower === breakglassEmail && password === breakglassPassword) {
    console.warn('🚨 PROVIDER BREAKGLASS ACTIVATED:', email);
    return {
      success: true,
      accountType: 'provider',
      cookieName: 'rs_provider',
      redirectPath: '/provider',
    };
  }

  return { success: false, error: 'invalid' };
}

/**
 * Authenticate a Developer account (environment-based)
 */
export async function authenticateDeveloper(
  input: AuthInput,
  config: DeveloperAuthConfig
): Promise<AuthResult> {
  const { email, password } = input;
  const emailLower = email.toLowerCase();

  // Layer 1: Dev mode (allow any)
  if (config.allowAny) {
    console.log(`🔓 DEV MODE: Developer login allowed (any credentials)`);
    return {
      success: true,
      accountType: 'developer',
      cookieName: 'rs_developer',
      redirectPath: '/developer',
    };
  }

  // Layer 2: Environment-based (primary)
  const envEmail = config.envEmail?.toLowerCase();
  const envPassword = config.envPassword;

  if (envEmail && envPassword && emailLower === envEmail && password === envPassword) {
    return {
      success: true,
      accountType: 'developer',
      cookieName: 'rs_developer',
      redirectPath: '/developer',
    };
  }

  // Layer 3: Breakglass (environment fallback)
  const breakglassEmail = config.breakglassEmail?.toLowerCase();
  const breakglassPassword = config.breakglassPassword;

  if (breakglassEmail && breakglassPassword && emailLower === breakglassEmail && password === breakglassPassword) {
    console.warn('🚨 DEVELOPER BREAKGLASS ACTIVATED:', email);
    return {
      success: true,
      accountType: 'developer',
      cookieName: 'rs_developer',
      redirectPath: '/developer',
    };
  }

  return { success: false, error: 'invalid' };
}

/**
 * Authenticate a database user (tenant, accountant, vendor)
 * Requires a user object from the database
 */
export async function authenticateDatabaseUser(
  input: AuthInput,
  user: DatabaseUser | null,
  devModeConfig?: {
    allowAnyTenant?: boolean;
    allowAnyAccountant?: boolean;
    allowAnyVendor?: boolean;
  }
): Promise<AuthResult> {
  const { email, password, totpCode, recoveryCode } = input;

  // If user doesn't exist, return false
  if (!user) {
    return { success: false, error: 'invalid' };
  }

  // If user has PROVIDER or DEVELOPER role, skip database authentication
  if (user.role === 'PROVIDER' || user.role === 'DEVELOPER') {
    return { success: false, error: 'unsupported' };
  }

  // Detect account type from role or email pattern
  const emailLower = email.toLowerCase();
  let accountType: 'tenant' | 'accountant' | 'vendor' = 'tenant';

  if (user.role === 'ACCOUNTANT' || emailLower.includes('accountant')) {
    accountType = 'accountant';
  } else if (user.role === 'VENDOR' || emailLower.includes('vendor')) {
    accountType = 'vendor';
  }

  // Dev mode escape hatches
  if (devModeConfig) {
    if (accountType === 'accountant' && devModeConfig.allowAnyAccountant) {
      console.log(`🔓 DEV MODE: Accountant login allowed (any credentials)`);
      return {
        success: true,
        accountType,
        userId: user.id,
        cookieName: getCookieName(accountType),
        redirectPath: getRedirectPath(accountType),
      };
    }
    if (accountType === 'vendor' && devModeConfig.allowAnyVendor) {
      console.log(`🔓 DEV MODE: Vendor login allowed (any credentials)`);
      return {
        success: true,
        accountType,
        userId: user.id,
        cookieName: getCookieName(accountType),
        redirectPath: getRedirectPath(accountType),
      };
    }
    if (accountType === 'tenant' && devModeConfig.allowAnyTenant) {
      console.log(`🔓 DEV MODE: Tenant login allowed (any credentials)`);
      return {
        success: true,
        accountType,
        userId: user.id,
        cookieName: getCookieName(accountType),
        redirectPath: getRedirectPath(accountType),
      };
    }
  }

  // Check if account is locked
  if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
    return { success: false, error: 'account_locked' };
  }

  // Check if account is inactive
  if (!user.isActive) {
    return { success: false, error: 'account_inactive' };
  }

  // Verify password
  const passwordValid = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!passwordValid) {
    return { success: false, error: 'invalid' };
  }

  // Check if TOTP is enabled
  if (user.totpEnabled && user.totpSecret) {
    // If TOTP is enabled but no code provided, return special response
    if (!totpCode && !recoveryCode) {
      return { success: false, requiresTOTP: true };
    }

    // Try TOTP code first
    if (totpCode) {
      const totpValid = verifyTOTPCode(totpCode, user.totpSecret);
      if (!totpValid) {
        return { success: false, error: 'invalid' };
      }
    }
    // Try backup code if provided
    else if (recoveryCode && user.backupCodesHash) {
      const backupResult = await verifyBackupCode(recoveryCode, user.backupCodesHash);
      if (!backupResult.valid) {
        return { success: false, error: 'invalid' };
      }
      // Caller should update backup codes in database with backupResult.updatedJson
    } else {
      return { success: false, error: 'invalid' };
    }
  }

  return {
    success: true,
    accountType,
    userId: user.id,
    cookieName: getCookieName(accountType),
    redirectPath: getRedirectPath(accountType),
  };
}

/**
 * Emergency authentication for Provider/Developer using bcrypt hashes
 * Used in tenant-app when federation is down
 */
export async function authenticateEmergency(
  input: AuthInput,
  role: 'provider' | 'developer',
  passwordHash: string
): Promise<AuthResult> {
  const { password } = input;

  const passwordValid = await bcrypt.compare(password, passwordHash);
  if (!passwordValid) {
    return { success: false, error: 'invalid' };
  }

  return {
    success: true,
    accountType: role,
    cookieName: getCookieName(role),
    redirectPath: getRedirectPath(role),
  };
}

