import { NextRequest, NextResponse } from 'next/server';
import { getAllTenantsApiUsage } from '@/services/provider/api-usage.service';

export async function GET(req: NextRequest) {
  try {
    const usage = await getAllTenantsApiUsage();
    return NextResponse.json({ usage });
  } catch (error: any) {
    console.error('Get API usage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get API usage' },
      { status: 500 }
    );
  }
}

