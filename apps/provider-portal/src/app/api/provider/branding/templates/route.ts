import { NextRequest, NextResponse } from 'next/server';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import { getBrandingTemplates, applyBrandingTemplate } from '@/services/provider/branding.service';

async function getHandler(req: NextRequest) {
  try {
    const templates = getBrandingTemplates();
    return NextResponse.json({ ok: true, data: templates });
  } catch (error) {
    console.error('Error fetching branding templates:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch branding templates' },
      { status: 500 }
    );
  }
}

async function postHandler(req: NextRequest) {
  try {
    const { orgId, templateId } = await req.json();
    
    if (!orgId || !templateId) {
      return NextResponse.json(
        { ok: false, error: 'orgId and templateId are required' },
        { status: 400 }
      );
    }

    const updated = await applyBrandingTemplate(orgId, templateId);
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error('Error applying branding template:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to apply branding template' },
      { status: 500 }
    );
  }
}

export const GET = compose(withProviderAuth())(getHandler);
export const POST = compose(withProviderAuth())(postHandler);

