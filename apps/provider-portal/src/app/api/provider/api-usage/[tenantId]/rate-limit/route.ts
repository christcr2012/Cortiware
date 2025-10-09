import { NextRequest, NextResponse } from 'next/server';
import { updateRateLimitConfig } from '@/services/provider/api-usage.service';

export async function PUT(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const body = await req.json();
    const { requestsPerMinute, requestsPerHour, requestsPerDay, burstLimit } = body;

    await updateRateLimitConfig(params.tenantId, {
      requestsPerMinute,
      requestsPerHour,
      requestsPerDay,
      burstLimit,
      enabled: true,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update rate limit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update rate limit' },
      { status: 500 }
    );
  }
}

