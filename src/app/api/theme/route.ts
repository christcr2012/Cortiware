import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminTheme = cookieStore.get('rs_admin_theme')?.value;
    const clientTheme = cookieStore.get('rs_client_theme')?.value;

    return NextResponse.json({
      admin: adminTheme || null,
      client: clientTheme || null,
      current: adminTheme || clientTheme || 'futuristic-green',
    });
  } catch (error) {
    console.error('Theme GET error:', error);
    return NextResponse.json({ error: 'server-error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { scope, theme } = await req.json();
    console.log('[Theme API] POST request:', { scope, theme });

    if (!scope || !theme) {
      console.error('[Theme API] Invalid request - missing scope or theme');
      return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }

    const cookieName = scope === 'admin' ? 'rs_admin_theme' : 'rs_client_theme';
    console.log('[Theme API] Setting cookie:', cookieName, '=', theme);

    // Set cookie using Next.js cookies API for better compatibility
    const cookieStore = await cookies();
    cookieStore.set(cookieName, theme, {
      path: '/',
      maxAge: 31536000, // 1 year
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    // Verify cookie was set
    const verifyValue = cookieStore.get(cookieName)?.value;
    console.log('[Theme API] Cookie verification:', cookieName, '=', verifyValue);

    return NextResponse.json({
      success: true,
      theme,
      scope,
      cookieName,
      verified: verifyValue === theme,
    }, { status: 200 });
  } catch (error) {
    console.error('[Theme API] POST error:', error);
    return NextResponse.json({ error: 'bad-json' }, { status: 400 });
  }
}

