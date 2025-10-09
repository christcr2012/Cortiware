import { NextRequest, NextResponse } from 'next/server';
import { getOrgIdFromReq } from '@/lib/rbac';
import { importOpportunityAsLead } from '@/services/sam-gov.service';

export async function POST(req: NextRequest) {
  try {
    // Get org ID and user ID from session
    const orgId = await getOrgIdFromReq(req as any);
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, use a placeholder user ID (in production, get from session)
    const userId = 'system';

    // Parse opportunities to import
    const body = await req.json();
    const { opportunities } = body;

    if (!Array.isArray(opportunities) || opportunities.length === 0) {
      return NextResponse.json(
        { error: 'No opportunities provided' },
        { status: 400 }
      );
    }

    // Import each opportunity as a lead
    const results = [];
    for (const opp of opportunities) {
      try {
        const lead = await importOpportunityAsLead(orgId, userId, opp);
        results.push({ success: true, noticeId: opp.noticeId, leadId: lead.id });
      } catch (error: any) {
        results.push({ success: false, noticeId: opp.noticeId, error: error.message });
      }
    }

    const imported = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      imported,
      failed,
      results,
    });
  } catch (error: any) {
    console.error('SAM.gov import error:', error);
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}

