/**
 * Revenue Export API Endpoint
 *
 * Exports revenue intelligence data to CSV format
 */

import { NextResponse } from 'next/server';
import { exportRevenueDataToCsv } from '@/services/provider/revenue.service';
import { compose, withProviderAuth, withAuditLog } from '@/lib/api/middleware';
import { handleAsyncRoute } from '@/lib/utils/api-response.utils';

const getHandler = handleAsyncRoute(async () => {
  const csvData = await exportRevenueDataToCsv();

  return new NextResponse(csvData, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="revenue-intelligence-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
});

export const GET = compose(withProviderAuth(), withAuditLog())(getHandler);

