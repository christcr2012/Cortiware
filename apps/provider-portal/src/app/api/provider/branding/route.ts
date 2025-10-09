import { NextRequest, NextResponse } from 'next/server';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import { getAllBrandingConfigs, getBrandingStats } from '@/services/provider/branding.service';

async function getHandler(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const statsOnly = searchParams.get('stats') === 'true';

    if (statsOnly) {
      const stats = await getBrandingStats();
      return NextResponse.json({ ok: true, data: stats });
    }

    const configs = await getAllBrandingConfigs();
    return NextResponse.json({ ok: true, data: configs });
  } catch (error) {
    console.error('Error fetching branding configs:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch branding configurations' },
      { status: 500 }
    );
  }
}

export const GET = compose(withProviderAuth())(getHandler);

