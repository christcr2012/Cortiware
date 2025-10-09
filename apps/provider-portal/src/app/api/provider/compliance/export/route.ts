import { NextRequest, NextResponse } from 'next/server';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import { exportComplianceReport } from '@/services/provider/compliance.service';

async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { startDate, endDate, frameworks } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { ok: false, error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const report = await exportComplianceReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      frameworks,
    });

    return NextResponse.json({ ok: true, data: report });
  } catch (error) {
    console.error('Error exporting compliance report:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to export compliance report' },
      { status: 500 }
    );
  }
}

export const POST = compose(withProviderAuth())(postHandler);

