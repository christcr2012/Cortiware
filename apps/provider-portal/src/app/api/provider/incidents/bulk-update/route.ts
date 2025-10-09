import { NextRequest } from 'next/server';
import { prisma } from '@cortiware/db';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import { createSuccessResponse, createValidationError, handleAsyncRoute, parseRequestBody } from '@/lib/utils/api-response.utils';
import { safeQuery } from '@/lib/utils/query.utils';

const handler = handleAsyncRoute(async (req: NextRequest) => {
  const body = await parseRequestBody(req);
  const { incidentIds, status } = body;

  if (!incidentIds || !Array.isArray(incidentIds) || incidentIds.length === 0) {
    return createValidationError('Invalid incident IDs');
  }

  if (!status || !['OPEN', 'ACK', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
    return createValidationError('Invalid status');
  }

  // Update all incidents
  const updateData: any = { status };

  // Set timestamps based on status
  if (status === 'ACK' && !updateData.acknowledgedAt) {
    updateData.acknowledgedAt = new Date();
  } else if (status === 'RESOLVED' && !updateData.resolvedAt) {
    updateData.resolvedAt = new Date();
  } else if (status === 'CLOSED' && !updateData.closedAt) {
    updateData.closedAt = new Date();
  }

  const result = await safeQuery(
    () => prisma.incident.updateMany({
      where: {
        id: {
          in: incidentIds,
        },
      },
      data: updateData,
    }),
    { count: 0 },
    'Failed to bulk update incidents'
  );

  return createSuccessResponse({
    updated: result.count,
  }, `Successfully updated ${result.count} incident(s)`);
});

export const POST = compose(
  withProviderAuth()
)(handler);

