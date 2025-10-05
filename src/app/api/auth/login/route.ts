import { NextRequest, NextResponse } from 'next/server';

// App Router canonical tenant login
// Validates credentials against env in production; optional dev escape hatch
// Env:
// - TENANT_LOGIN_EMAIL, TENANT_LOGIN_PASSWORD (both must match to allow)
// - DEV_ACCEPT_ANY_TENANT_LOGIN=true (dev only)
export async function POST(req: NextRequest) {
  const url = new URL(req.url);

  // Parse body from form or JSON
  let email = '';
  let password = '';
  let next = '';
  const ct = (req.headers.get('content-type') || '').toLowerCase();
  try {
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const form = await req.formData();
      email = String(form.get('email') ?? '').trim();
      password = String(form.get('password') ?? '').trim();
      next = String(form.get('next') ?? '').trim();
    } else {
      const body = await req.json().catch(() => ({} as any));
      email = String(body.email ?? '').trim();
      password = String(body.password ?? '').trim();
      next = String(body.next ?? '').trim();
    }
  } catch {
    // fallthrough to error handling
  }

  const nextPath = next && next.startsWith('/') ? next : '/dashboard';

  // Basic validation
  if (!email || !password) {
    return NextResponse.redirect(new URL(`/login?error=missing&next=${encodeURIComponent(nextPath)}`, url), 303);
  }

  const allowAny = process.env.DEV_ACCEPT_ANY_TENANT_LOGIN === 'true';
  const envEmail = process.env.TENANT_LOGIN_EMAIL;
  const envPassword = process.env.TENANT_LOGIN_PASSWORD;

  const ok = allowAny || (!!envEmail && !!envPassword && email === envEmail && password === envPassword);
  if (!ok) {
    const reason = envEmail && envPassword ? 'invalid' : 'server';
    return NextResponse.redirect(new URL(`/login?error=${reason}&next=${encodeURIComponent(nextPath)}`, url), 303);
  }

  // Issue cookie (rs_user); HttpOnly + Lax; Secure only in production
  const res = NextResponse.redirect(new URL(nextPath, url), 303);
  const base = `Path=/; HttpOnly; SameSite=Lax`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.headers.append('Set-Cookie', `rs_user=${encodeURIComponent(email)}; ${base}${secure}`);

  return res;
}

