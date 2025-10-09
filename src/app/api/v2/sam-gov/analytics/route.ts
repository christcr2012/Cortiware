import { NextRequest, NextResponse } from 'next/server';
import { getOrgIdFromReq } from '@/lib/rbac';
import { getSamGovAnalytics } from '@/services/sam-gov.service';

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgIdFromReq(req as any);
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analytics = await getSamGovAnalytics(orgId);
    
    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Get SAM.gov analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get analytics' },
      { status: 500 }
    );
  }
}

