import { NextRequest, NextResponse } from 'next/server';

// Developer login (environment-based)
// Env: DEVELOPER_USERNAME, DEVELOPER_PASSWORD
// Optional dev escape hatch: DEV_ACCEPT_ANY_DEVELOPER_LOGIN=true
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const ct = (req.headers.get('content-type') || '').toLowerCase();

  let username = '';
  let password = '';
  try {
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const form = await req.formData();
      username = String(form.get('username') ?? '').trim();
      password = String(form.get('password') ?? '').trim();
    } else {
      const body = await req.json().catch(() => ({} as any));
      username = String(body.username ?? '').trim();
      password = String(body.password ?? '').trim();
    }
  } catch {}

  if (!username || !password) {
    return NextResponse.redirect(new URL('/developer/login?error=missing', url), 303);
  }

  const allowAny = process.env.DEV_ACCEPT_ANY_DEVELOPER_LOGIN === 'true';
  const envUser = process.env.DEVELOPER_USERNAME;
  const envPass = process.env.DEVELOPER_PASSWORD;
  const ok = allowAny || (!!envUser && !!envPass && username === envUser && password === envPass);
  if (!ok) {
    const reason = envUser && envPass ? 'invalid' : 'server';
    return NextResponse.redirect(new URL(`/developer/login?error=${reason}`, url), 303);
  }

  const res = NextResponse.redirect(new URL('/developer', url), 303);
  const base = `Path=/; HttpOnly; SameSite=Lax`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.headers.append('Set-Cookie', `rs_developer=${encodeURIComponent(username)}; ${base}${secure}`);
  return res;
}

