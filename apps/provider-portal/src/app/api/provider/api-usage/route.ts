import { NextRequest } from 'next/server';
import { getAllTenantsApiUsage } from '@/services/provider/api-usage.service';
import { createSuccessResponse, createErrorResponse, handleAsyncRoute } from '@/lib/utils/api-response.utils';

export const GET = handleAsyncRoute(async (req: NextRequest) => {
  const usage = await getAllTenantsApiUsage();
  return createSuccessResponse({ usage }, 'API usage data retrieved successfully');
});

