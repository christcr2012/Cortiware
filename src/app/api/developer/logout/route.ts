import { NextRequest, NextResponse } from 'next/server';

function clearDeveloperCookies(url: URL) {
  const res = NextResponse.redirect(new URL('/developer/login', url), 303);
  const expire = 'Thu, 01 Jan 1970 00:00:00 GMT';
  const common = 'Path=/; HttpOnly; SameSite=Lax';
  ['rs_developer', 'developer-session', 'ws_developer'].forEach((name) => {
    res.headers.append('Set-Cookie', `${name}=; ${common}; Expires=${expire}; Max-Age=0`);
  });
  return res;
}

export async function POST(req: NextRequest) {
  return clearDeveloperCookies(new URL(req.url));
}

export async function GET(req: NextRequest) {
  return clearDeveloperCookies(new URL(req.url));
}

