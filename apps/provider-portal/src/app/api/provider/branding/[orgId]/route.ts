import { NextRequest } from 'next/server';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import { getBrandingConfig, updateBrandingConfig } from '@/services/provider/branding.service';
import { createSuccessResponse, handleAsyncRoute, parseRequestBody } from '@/lib/utils/api-response.utils';

const getHandler = handleAsyncRoute(async (req: NextRequest, context: { params: Promise<{ orgId: string }> }) => {
  const { orgId } = await context.params;
  const config = await getBrandingConfig(orgId);
  return createSuccessResponse(config, 'Branding configuration retrieved successfully');
});

const patchHandler = handleAsyncRoute(async (req: NextRequest, context: { params: Promise<{ orgId: string }> }) => {
  const { orgId } = await context.params;
  const brandConfig = await parseRequestBody(req);

  const updated = await updateBrandingConfig(orgId, brandConfig);
  return createSuccessResponse(updated, 'Branding configuration updated successfully');
});

export const GET = compose(withProviderAuth())(getHandler);
export const PATCH = compose(withProviderAuth())(patchHandler);

