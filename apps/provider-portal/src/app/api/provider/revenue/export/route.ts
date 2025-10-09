/**
 * Revenue Export API Endpoint
 * 
 * Exports revenue intelligence data to CSV format
 */

import { NextResponse } from 'next/server';
import { exportRevenueDataToCsv } from '@/services/provider/revenue.service';
import { compose, withProviderAuth, withAuditLog } from '@/lib/api/middleware';

async function getHandler() {
  try {
    const csvData = await exportRevenueDataToCsv();

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="revenue-intelligence-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Revenue export error:', error);
    return NextResponse.json(
      { error: 'Failed to export revenue data' },
      { status: 500 }
    );
  }
}

export const GET = compose(withProviderAuth(), withAuditLog())(getHandler);

