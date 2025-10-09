import { NextRequest } from 'next/server';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import { getAllBrandingConfigs, getBrandingStats } from '@/services/provider/branding.service';
import { createSuccessResponse, handleAsyncRoute } from '@/lib/utils/api-response.utils';

const getHandler = handleAsyncRoute(async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const statsOnly = searchParams.get('stats') === 'true';

  if (statsOnly) {
    const stats = await getBrandingStats();
    return createSuccessResponse(stats, 'Branding statistics retrieved successfully');
  }

  const configs = await getAllBrandingConfigs();
  return createSuccessResponse(configs, 'Branding configurations retrieved successfully');
});

export const GET = compose(withProviderAuth())(getHandler);

