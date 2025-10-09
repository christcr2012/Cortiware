import { NextRequest, NextResponse } from 'next/server';
import { listAuditEvents } from '@/services/provider/audit.service';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import { handleAsyncRoute, createErrorResponse } from '@/lib/utils/api-response.utils';

const getHandler = handleAsyncRoute(async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const entity = searchParams.get('entity') || undefined;
  const orgId = searchParams.get('orgId') || undefined;
  const action = searchParams.get('action') || undefined;
  const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
  const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

  // Fetch all audit events matching the filters (up to 1000)
  const { items } = await listAuditEvents({
    entity,
    orgId,
    startDate,
    endDate,
    limit: 1000,
  });

  // Generate CSV
  const headers = ['Timestamp', 'Organization', 'Entity', 'Field', 'Old Value', 'New Value', 'Reason'];
  const rows = items.map(item => [
    item.createdAt,
    item.orgName || '',
    item.entity,
    item.field || '',
    item.oldValue ? JSON.stringify(item.oldValue) : '',
    item.newValue ? JSON.stringify(item.newValue) : '',
    item.reason || '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
});

export const GET = compose(withProviderAuth())(getHandler);

