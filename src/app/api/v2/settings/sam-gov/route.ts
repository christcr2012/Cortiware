import { NextRequest, NextResponse } from 'next/server';
import { getOrgIdFromReq } from '@/lib/rbac';
import { saveTenantSamGovApiKey, getTenantSamGovApiKey } from '@/services/sam-gov.service';

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgIdFromReq(req as any);
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = await getTenantSamGovApiKey(orgId);
    
    return NextResponse.json({
      hasApiKey: !!apiKey,
      // Don't return the actual key for security
    });
  } catch (error: any) {
    console.error('Get SAM.gov settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgIdFromReq(req as any);
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    await saveTenantSamGovApiKey(orgId, apiKey);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save SAM.gov settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}

