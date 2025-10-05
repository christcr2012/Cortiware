import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(req: NextRequest) {
  const url = new URL(req.url);

  // Parse body from form or JSON
  let email = '';
  let password = '';
  let totpCode = '';
  let recoveryCode = '';
  let next = '';

  const ct = (req.headers.get('content-type') || '').toLowerCase();
  try {
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const form = await req.formData();
      email = String(form.get('email') ?? '').trim();
      password = String(form.get('password') ?? '').trim();
      totpCode = String(form.get('totpCode') ?? '').trim();
      recoveryCode = String(form.get('recoveryCode') ?? '').trim();
      next = String(form.get('next') ?? '').trim();
    } else {
      const body = await req.json().catch(() => ({} as any));
      email = String(body.email ?? '').trim();
      password = String(body.password ?? '').trim();
      totpCode = String(body.totpCode ?? '').trim();
      recoveryCode = String(body.recoveryCode ?? '').trim();
      next = String(body.next ?? '').trim();
    }
  } catch {
    // fallthrough to error handling
  }

  // Basic validation
  if (!email || !password) {
    return NextResponse.redirect(new URL(`/login?error=missing`, url), 303);
  }

  // Get client info for audit logging
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // ============================================================================
  // STEP 1: Check Provider Authentication
  // ============================================================================

  const providerResult = await authenticateProvider(email, password);
  if (providerResult.success) {
    console.log(`✅ Provider login: ${email}`);
    const res = NextResponse.redirect(new URL('/provider', url), 303);
    setCookie(res, 'rs_provider', email);
    return res;
  }

  // ============================================================================
  // STEP 2: Check Developer Authentication
  // ============================================================================

  const developerResult = await authenticateDeveloper(email, password);
  if (developerResult.success) {
    console.log(`✅ Developer login: ${email}`);
    const res = NextResponse.redirect(new URL('/developer', url), 303);
    setCookie(res, 'rs_developer', email);
    return res;
  }

  // ============================================================================
  // STEP 3: Check Database Users (Tenant/Accountant/Vendor)
  // ============================================================================

  const userResult = await authenticateDatabaseUser(email, password, totpCode, recoveryCode);
  if (userResult.success) {
    console.log(`✅ User login: ${email} (${userResult.accountType})`);
    const redirectUrl = userResult.redirectUrl || '/dashboard';
    const res = NextResponse.redirect(new URL(redirectUrl, url), 303);
    setCookie(res, userResult.cookieName || 'rs_user', email);
    return res;
  }

  // ============================================================================
  // STEP 4: All authentication methods failed
  // ============================================================================

  console.log(`❌ Login failed: ${email}`);
  return NextResponse.redirect(new URL(`/login?error=invalid`, url), 303);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function setCookie(res: NextResponse, name: string, value: string) {
  const base = `Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`; // 30 days
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.headers.append('Set-Cookie', `${name}=${encodeURIComponent(value)}; ${base}${secure}`);
}

async function authenticateProvider(email: string, password: string): Promise<{ success: boolean }> {
  // Layer 1: Environment-based (primary)
  const envUser = process.env.PROVIDER_USERNAME || process.env.PROVIDER_EMAIL;
  const envPass = process.env.PROVIDER_PASSWORD;
  const allowAny = process.env.DEV_ACCEPT_ANY_PROVIDER_LOGIN === 'true';

  if (allowAny) {
    console.log(`🔓 DEV MODE: Provider login allowed (any credentials)`);
    return { success: true };
  }

  if (envUser && envPass && email.toLowerCase() === envUser.toLowerCase() && password === envPass) {
    return { success: true };
  }

  // Layer 2: Database-backed (future implementation)
  // TODO: Check ProviderAccount table

  // Layer 3: Breakglass (environment fallback)
  const breakglassUser = process.env.PROVIDER_BREAKGLASS_EMAIL;
  const breakglassPass = process.env.PROVIDER_BREAKGLASS_PASSWORD;

  if (breakglassUser && breakglassPass && email.toLowerCase() === breakglassUser.toLowerCase() && password === breakglassPass) {
    console.warn('🚨 PROVIDER BREAKGLASS ACTIVATED:', email);
    return { success: true };
  }

  return { success: false };
}

async function authenticateDeveloper(email: string, password: string): Promise<{ success: boolean }> {
  // Layer 1: Environment-based (primary)
  const envUser = process.env.DEVELOPER_USERNAME || process.env.DEVELOPER_EMAIL;
  const envPass = process.env.DEVELOPER_PASSWORD;
  const allowAny = process.env.DEV_ACCEPT_ANY_DEVELOPER_LOGIN === 'true';

  if (allowAny) {
    console.log(`🔓 DEV MODE: Developer login allowed (any credentials)`);
    return { success: true };
  }

  if (envUser && envPass && email.toLowerCase() === envUser.toLowerCase() && password === envPass) {
    return { success: true };
  }

  // Layer 2: Database-backed (future implementation)
  // TODO: Check DeveloperAccount table

  // Layer 3: Breakglass (environment fallback)
  const breakglassUser = process.env.DEVELOPER_BREAKGLASS_EMAIL;
  const breakglassPass = process.env.DEVELOPER_BREAKGLASS_PASSWORD;

  if (breakglassUser && breakglassPass && email.toLowerCase() === breakglassUser.toLowerCase() && password === breakglassPass) {
    console.warn('🚨 DEVELOPER BREAKGLASS ACTIVATED:', email);
    return { success: true };
  }

  return { success: false };
}

async function authenticateDatabaseUser(
  email: string,
  password: string,
  totpCode: string,
  recoveryCode: string
): Promise<{ success: boolean; accountType?: string; redirectUrl?: string; cookieName?: string }> {

  // Dev escape hatches for different account types
  const allowAnyTenant = process.env.DEV_ACCEPT_ANY_TENANT_LOGIN === 'true';
  const allowAnyAccountant = process.env.DEV_ACCEPT_ANY_ACCOUNTANT_LOGIN === 'true';
  const allowAnyVendor = process.env.DEV_ACCEPT_ANY_VENDOR_LOGIN === 'true';

  // Detect account type from email pattern
  const emailLower = email.toLowerCase();
  let accountType = 'tenant';
  let redirectUrl = '/dashboard';
  let cookieName = 'rs_user';

  if (emailLower.includes('accountant')) {
    accountType = 'accountant';
    redirectUrl = '/accountant';
    cookieName = 'rs_accountant';

    if (allowAnyAccountant) {
      console.log(`🔓 DEV MODE: Accountant login allowed (any credentials)`);
      return { success: true, accountType, redirectUrl, cookieName };
    }
  } else if (emailLower.includes('vendor')) {
    accountType = 'vendor';
    redirectUrl = '/vendor';
    cookieName = 'rs_vendor';

    if (allowAnyVendor) {
      console.log(`🔓 DEV MODE: Vendor login allowed (any credentials)`);
      return { success: true, accountType, redirectUrl, cookieName };
    }
  } else {
    // Tenant user (owner, admin, user)
    if (allowAnyTenant) {
      console.log(`🔓 DEV MODE: Tenant login allowed (any credentials)`);
      return { success: true, accountType, redirectUrl, cookieName };
    }
  }

  // Check environment-based test credentials
  const envEmail = process.env.TENANT_LOGIN_EMAIL;
  const envPassword = process.env.TENANT_LOGIN_PASSWORD;

  if (envEmail && envPassword && email === envEmail && password === envPassword) {
    return { success: true, accountType, redirectUrl, cookieName };
  }

  // TODO: Database authentication
  // const user = await prisma.user.findUnique({
  //   where: { email: email.toLowerCase() },
  //   include: {
  //     org: true,
  //     breakglassAccount: true,
  //     recoveryCodes: { where: { usedAt: null, expiresAt: { gt: new Date() } } },
  //   },
  // });

  // if (!user) {
  //   return { success: false };
  // }

  // Check if account is locked
  // if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
  //   return { success: false };
  // }

  // Path 1: Recovery Code Authentication
  // if (recoveryCode) {
  //   return await authenticateWithRecoveryCode(user, recoveryCode);
  // }

  // Path 2: Regular Password Authentication
  // const passwordValid = await bcrypt.compare(password, user.passwordHash);
  // if (!passwordValid) {
  //   await incrementFailedAttempts(user.id);
  //   return { success: false };
  // }

  // Check if TOTP is required
  // if (user.totpEnabled && !totpCode) {
  //   return { success: false, requiresTOTP: true };
  // }

  // Verify TOTP if provided
  // if (user.totpEnabled && totpCode) {
  //   const totpValid = await verifyTOTP(user.totpSecret!, totpCode);
  //   if (!totpValid) {
  //     return { success: false };
  //   }
  // }

  // Determine account type from user.role
  // accountType = determineAccountType(user.role);
  // redirectUrl = getRedirectUrl(accountType);
  // cookieName = getCookieName(accountType);

  // return { success: true, accountType, redirectUrl, cookieName };

  return { success: false };
}

