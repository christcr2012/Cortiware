import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  getSecurityMetrics,
  getComplianceStatus,
  getDataRetentionPolicies,
  getEncryptionStatus,
  getVulnerabilityScans,
  getAccessControlReview,
} from '@/services/provider/compliance.service';
import ComplianceClient from './ComplianceClient';

export default async function CompliancePage() {
  const cookieStore = await cookies();

  // Verify provider authentication
  if (
    !cookieStore.get('rs_provider') &&
    !cookieStore.get('provider-session') &&
    !cookieStore.get('ws_provider')
  ) {
    redirect('/login');
  }

  // Fetch all compliance data
  const [metrics, compliance, retention, encryption, vulnerabilities, access] =
    await Promise.all([
      getSecurityMetrics(),
      getComplianceStatus(),
      getDataRetentionPolicies(),
      getEncryptionStatus(),
      getVulnerabilityScans(),
      getAccessControlReview(),
    ]);

  return (
    <ComplianceClient
      initialMetrics={metrics}
      initialCompliance={compliance}
      initialRetention={retention}
      initialEncryption={encryption}
      initialVulnerabilities={vulnerabilities}
      initialAccess={access}
    />
  );
}

