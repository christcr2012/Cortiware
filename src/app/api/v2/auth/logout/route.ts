import { NextRequest, NextResponse } from 'next/server';

// Clears tenant cookies (rs_user and legacy names) during the migration window.
export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ ok: true });

  const expire = 'Thu, 01 Jan 1970 00:00:00 GMT';
  const common = 'Path=/; HttpOnly; SameSite=Lax';

  const cookies = [
    'rs_user',
    'mv_user',
    'ws_user',
  ];

  cookies.forEach((name) => {
    res.headers.append(
      'Set-Cookie',
      `${name}=; ${common}; Expires=${expire}; Max-Age=0`
    );
  });

  return res;
}

