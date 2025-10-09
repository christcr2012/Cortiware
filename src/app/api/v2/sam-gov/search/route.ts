import { NextRequest, NextResponse } from 'next/server';
import { getOrgIdFromReq } from '@/lib/rbac';
import { getTenantSamGovApiKey, searchSamGovOpportunities } from '@/services/sam-gov.service';

export async function POST(req: NextRequest) {
  try {
    // Get org ID from session
    const orgId = await getOrgIdFromReq(req as any);
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant's SAM.gov API key
    const apiKey = await getTenantSamGovApiKey(orgId);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'SAM.gov API key not configured. Please add your API key in settings.' },
        { status: 400 }
      );
    }

    // Parse search parameters
    const body = await req.json();
    const {
      keywords,
      naicsCodes,
      pscCodes,
      postedFrom,
      postedTo,
      state,
      city,
      zipCode,
      radius,
      setAsideTypes,
      limit,
    } = body;

    // Search SAM.gov
    const result = await searchSamGovOpportunities(apiKey, {
      keywords,
      naicsCodes,
      pscCodes,
      postedFrom,
      postedTo,
      state,
      city,
      zipCode,
      radius,
      setAsideTypes,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('SAM.gov search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}

