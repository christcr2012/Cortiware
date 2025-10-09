import { NextRequest } from 'next/server';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import {
  getSecurityMetrics,
  getComplianceStatus,
  getDataRetentionPolicies,
  getEncryptionStatus,
  getVulnerabilityScans,
  getAccessControlReview,
} from '@/services/provider/compliance.service';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response.utils';

async function getHandler(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const type = searchParams.get('type');

    switch (type) {
      case 'metrics':
        const metrics = await getSecurityMetrics();
        return createSuccessResponse(metrics);

      case 'compliance':
        const compliance = await getComplianceStatus();
        return createSuccessResponse(compliance);

      case 'retention':
        const retention = await getDataRetentionPolicies();
        return createSuccessResponse(retention);

      case 'encryption':
        const encryption = await getEncryptionStatus();
        return createSuccessResponse(encryption);

      case 'vulnerabilities':
        const vulnerabilities = await getVulnerabilityScans();
        return createSuccessResponse(vulnerabilities);

      case 'access':
        const access = await getAccessControlReview();
        return createSuccessResponse(access);

      default:
        // Return all data
        const [
          metricsData,
          complianceData,
          retentionData,
          encryptionData,
          vulnerabilitiesData,
          accessData,
        ] = await Promise.all([
          getSecurityMetrics(),
          getComplianceStatus(),
          getDataRetentionPolicies(),
          getEncryptionStatus(),
          getVulnerabilityScans(),
          getAccessControlReview(),
        ]);

        return createSuccessResponse({
          metrics: metricsData,
          compliance: complianceData,
          retention: retentionData,
          encryption: encryptionData,
          vulnerabilities: vulnerabilitiesData,
          access: accessData,
        });
    }
  } catch (error: any) {
    console.error('[Compliance API Error]', error);
    return createErrorResponse(
      error.message || 'Failed to fetch compliance data',
      500
    );
  }
}

export const GET = compose(withProviderAuth())(getHandler);

