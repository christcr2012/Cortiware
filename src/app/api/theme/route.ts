import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { scope, theme } = await req.json();
    if (!scope || !theme) return NextResponse.json({ error: 'invalid' }, { status: 400 });

    const cookieName = scope === 'admin' ? 'rs_admin_theme' : 'rs_client_theme';

    // Set cookie using Next.js cookies API for better compatibility
    const cookieStore = await cookies();
    cookieStore.set(cookieName, theme, {
      path: '/',
      maxAge: 31536000, // 1 year
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return NextResponse.json({ success: true, theme, scope }, { status: 200 });
  } catch (error) {
    console.error('Theme API error:', error);
    return NextResponse.json({ error: 'bad-json' }, { status: 400 });
  }
}

