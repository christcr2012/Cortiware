import { NextRequest, NextResponse } from 'next/server';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import {
  getSecurityMetrics,
  getComplianceStatus,
  getDataRetentionPolicies,
  getEncryptionStatus,
  getVulnerabilityScans,
  getAccessControlReview,
} from '@/services/provider/compliance.service';

async function getHandler(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const type = searchParams.get('type');

    switch (type) {
      case 'metrics':
        const metrics = await getSecurityMetrics();
        return NextResponse.json({ ok: true, data: metrics });

      case 'compliance':
        const compliance = await getComplianceStatus();
        return NextResponse.json({ ok: true, data: compliance });

      case 'retention':
        const retention = await getDataRetentionPolicies();
        return NextResponse.json({ ok: true, data: retention });

      case 'encryption':
        const encryption = await getEncryptionStatus();
        return NextResponse.json({ ok: true, data: encryption });

      case 'vulnerabilities':
        const vulnerabilities = await getVulnerabilityScans();
        return NextResponse.json({ ok: true, data: vulnerabilities });

      case 'access':
        const access = await getAccessControlReview();
        return NextResponse.json({ ok: true, data: access });

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

        return NextResponse.json({
          ok: true,
          data: {
            metrics: metricsData,
            compliance: complianceData,
            retention: retentionData,
            encryption: encryptionData,
            vulnerabilities: vulnerabilitiesData,
            access: accessData,
          },
        });
    }
  } catch (error) {
    console.error('Error fetching compliance data:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch compliance data' },
      { status: 500 }
    );
  }
}

export const GET = compose(withProviderAuth())(getHandler);

