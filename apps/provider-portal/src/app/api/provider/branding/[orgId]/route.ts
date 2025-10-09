import { NextRequest, NextResponse } from 'next/server';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import { getBrandingConfig, updateBrandingConfig } from '@/services/provider/branding.service';

async function getHandler(req: NextRequest, context: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await context.params;
    const config = await getBrandingConfig(orgId);
    return NextResponse.json({ ok: true, data: config });
  } catch (error) {
    console.error('Error fetching branding config:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch branding configuration' },
      { status: 500 }
    );
  }
}

async function patchHandler(req: NextRequest, context: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await context.params;
    const brandConfig = await req.json();
    
    const updated = await updateBrandingConfig(orgId, brandConfig);
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error('Error updating branding config:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update branding configuration' },
      { status: 500 }
    );
  }
}

export const GET = compose(withProviderAuth())(getHandler);
export const PATCH = compose(withProviderAuth())(patchHandler);

