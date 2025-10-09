import { NextRequest } from 'next/server';
import { updateRateLimitConfig } from '@/services/provider/api-usage.service';
import { createSuccessResponse, handleAsyncRoute, parseRequestBody, validateRequiredFields } from '@/lib/utils/api-response.utils';

export const PUT = handleAsyncRoute(async (
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) => {
  const { tenantId } = await params;
  const body = await parseRequestBody(req);

  validateRequiredFields(body, ['requestsPerMinute', 'requestsPerHour', 'requestsPerDay', 'burstLimit']);

  const { requestsPerMinute, requestsPerHour, requestsPerDay, burstLimit } = body;

  await updateRateLimitConfig(tenantId, {
    requestsPerMinute,
    requestsPerHour,
    requestsPerDay,
    burstLimit,
    enabled: true,
  });

  return createSuccessResponse({ success: true }, 'Rate limit configuration updated successfully');
});

