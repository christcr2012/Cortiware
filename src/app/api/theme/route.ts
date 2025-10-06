import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { scope, theme } = await req.json();
    if (!scope || !theme) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    const name = scope === 'admin' ? 'rs_admin_theme' : 'rs_client_theme';
    const res = new NextResponse(null, { status: 204 });
    const base = `Path=/; SameSite=Lax; Max-Age=31536000`;
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.headers.append('Set-Cookie', `${name}=${encodeURIComponent(theme)}; ${base}${secure}`);
    return res;
  } catch {
    return NextResponse.json({ error: 'bad-json' }, { status: 400 });
  }
}

