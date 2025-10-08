import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateProvider,
  authenticateDeveloper,
  buildCookieHeader,
  type AuthInput,
  type ProviderAuthConfig,
  type DeveloperAuthConfig,
} from '@cortiware/auth-service';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const contentType = req.headers.get('content-type') || '';

  // Parse form data or JSON
  let email = '';
  let password = '';
  let totpCode = '';

  try {
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      email = (formData.get('email') as string || '').trim();
      password = (formData.get('password') as string || '').trim();
      totpCode = (formData.get('totpCode') as string || '').trim();
    } else {
      const body = await req.json().catch(() => ({}));
      email = (body.email || '').trim();
      password = (body.password || '').trim();
      totpCode = (body.totpCode || '').trim();
    }
  } catch (err) {
    return NextResponse.redirect(new URL('/login?error=invalid', url), 303);
  }

  if (!email || !password) {
    return NextResponse.redirect(new URL('/login?error=missing', url), 303);
  }

  const authInput: AuthInput = {
    email,
    password,
    totpCode: totpCode || undefined,
  };

  // Provider config from environment
  const providerConfig: ProviderAuthConfig = {
    envEmail: process.env.PROVIDER_EMAIL || '',
    envPassword: process.env.PROVIDER_PASSWORD || '',
    breakglassEmail: process.env.PROVIDER_BREAKGLASS_EMAIL,
    breakglassPassword: process.env.PROVIDER_BREAKGLASS_PASSWORD,
  };

  // Developer config from environment
  const developerConfig: DeveloperAuthConfig = {
    envEmail: process.env.DEVELOPER_EMAIL || '',
    envPassword: process.env.DEVELOPER_PASSWORD || '',
    breakglassEmail: process.env.DEVELOPER_BREAKGLASS_EMAIL,
    breakglassPassword: process.env.DEVELOPER_BREAKGLASS_PASSWORD,
  };

  // Try provider authentication
  const providerResult = await authenticateProvider(authInput, providerConfig);
  if (providerResult.success) {
    console.log(`✅ Provider login: ${email}`);
    const res = NextResponse.redirect(new URL('/provider', url), 303);
    const cookieHeader = buildCookieHeader({
      name: 'rs_provider',
      value: email,
    });
    res.headers.append('Set-Cookie', cookieHeader);
    return res;
  }

  // Try developer authentication
  const developerResult = await authenticateDeveloper(authInput, developerConfig);
  if (developerResult.success) {
    console.log(`✅ Developer login: ${email}`);
    const res = NextResponse.redirect(new URL('/provider', url), 303);
    const cookieHeader = buildCookieHeader({
      name: 'rs_developer',
      value: email,
    });
    res.headers.append('Set-Cookie', cookieHeader);
    return res;
  }

  // Check if TOTP is required
  if (providerResult.requiresTOTP || developerResult.requiresTOTP) {
    return NextResponse.redirect(new URL('/login?totp=required', url), 303);
  }

  // Authentication failed
  console.log(`❌ Login failed: ${email}`);
  return NextResponse.redirect(new URL('/login?error=invalid', url), 303);
}

