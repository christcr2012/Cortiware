import { NextRequest, NextResponse } from 'next/server';

function clearAccountantCookies(url: URL) {
  const res = NextResponse.redirect(new URL('/accountant/login', url), 303);
  const expire = 'Thu, 01 Jan 1970 00:00:00 GMT';
  const common = 'Path=/; HttpOnly; SameSite=Lax';
  ['rs_accountant', 'accountant-session', 'ws_accountant'].forEach((name) => {
    res.headers.append('Set-Cookie', `${name}=; ${common}; Expires=${expire}; Max-Age=0`);
  });
  return res;
}

export async function POST(req: NextRequest) {
  return clearAccountantCookies(new URL(req.url));
}

export async function GET(req: NextRequest) {
  return clearAccountantCookies(new URL(req.url));
}

