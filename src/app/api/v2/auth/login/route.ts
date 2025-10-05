import { NextRequest, NextResponse } from 'next/server';

// Phase 1 placeholder route handler under /api/v2.
// The legacy Pages Router endpoint at /api/auth/login remains canonical for now.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body || {};

    return NextResponse.json(
      {
        ok: false,
        error: 'NotImplemented',
        message: 'App Router v2 auth/login not yet enabled. Use legacy /api/auth/login during migration.',
        echo: email ? { email } : undefined,
      },
      { status: 501 }
    );
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Internal' }, { status: 500 });
  }
}

