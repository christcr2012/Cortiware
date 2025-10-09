import { NextRequest } from 'next/server';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import { getBrandingTemplates, applyBrandingTemplate } from '@/services/provider/branding.service';
import { createSuccessResponse, handleAsyncRoute, parseRequestBody, validateRequiredFields } from '@/lib/utils/api-response.utils';

const getHandler = handleAsyncRoute(async (req: NextRequest) => {
  const templates = getBrandingTemplates();
  return createSuccessResponse(templates, 'Branding templates retrieved successfully');
});

const postHandler = handleAsyncRoute(async (req: NextRequest) => {
  const body = await parseRequestBody(req);
  validateRequiredFields(body, ['orgId', 'templateId']);

  const { orgId, templateId } = body;
  const updated = await applyBrandingTemplate(orgId, templateId);

  return createSuccessResponse(updated, 'Branding template applied successfully');
});

export const GET = compose(withProviderAuth())(getHandler);
export const POST = compose(withProviderAuth())(postHandler);

