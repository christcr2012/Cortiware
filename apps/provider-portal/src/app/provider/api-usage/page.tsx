import { getAllTenantsApiUsage, getGlobalApiMetrics } from '@/services/provider/api-usage.service';
import ApiUsageClient from './ApiUsageClient';

export const metadata = {
  title: 'API Usage & Rate Limits | Provider Portal',
};

export default async function ApiUsagePage() {
  // Handle build-time gracefully (no DATABASE_URL available)
  let allUsage: any[] = [];
  let globalMetrics = { totalRequests: 0, totalTenants: 0, avgRequestsPerTenant: 0 };

  try {
    [allUsage, globalMetrics] = await Promise.all([
      getAllTenantsApiUsage(),
      getGlobalApiMetrics(),
    ]);
  } catch (error) {
    console.log('API Usage page: Database not available during build, using empty data');
  }

  return (
    <ApiUsageClient
      initialUsage={allUsage}
      globalMetrics={globalMetrics}
    />
  );
}

