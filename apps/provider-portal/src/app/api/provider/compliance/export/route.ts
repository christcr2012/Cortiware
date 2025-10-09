import { NextRequest } from 'next/server';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import { exportComplianceReport } from '@/services/provider/compliance.service';
import { createSuccessResponse, handleAsyncRoute, parseRequestBody, validateRequiredFields } from '@/lib/utils/api-response.utils';

const postHandler = handleAsyncRoute(async (req: NextRequest) => {
  const body = await parseRequestBody(req);
  validateRequiredFields(body, ['startDate', 'endDate']);

  const { startDate, endDate, frameworks } = body;

  const report = await exportComplianceReport({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    frameworks,
  });

  return createSuccessResponse(report, 'Compliance report exported successfully');
});

export const POST = compose(withProviderAuth())(postHandler);

