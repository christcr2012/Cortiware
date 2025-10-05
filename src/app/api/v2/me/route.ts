import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Minimal "me" endpoint under /api/v2 to avoid route conflicts during migration.
export async function GET(_req: NextRequest) {
  const jar = await cookies();
  const email = jar.get('rs_user')?.value || jar.get('mv_user')?.value || null;
  if (!email) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({ ok: true, me: { email } });
}

