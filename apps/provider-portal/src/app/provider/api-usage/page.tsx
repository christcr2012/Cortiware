import { getAllTenantsApiUsage, getGlobalApiMetrics, type ApiUsageMetrics } from '@/services/provider/api-usage.service';
import ApiUsageClient from './ApiUsageClient';

export const metadata = {
  title: 'API Usage & Rate Limits | Provider Portal',
};

type GlobalMetrics = {
  totalRequests: number;
  totalRequestsLast24h: number;
  avgErrorRate: number;
  avgResponseTime: number;
  topTenants: Array<{ tenantId: string; tenantName: string; requests: number }>;
  approachingLimits: Array<{ tenantId: string; tenantName: string; percentUsed: number; current: number; limit: number }>;
  totalTenants: number;
};

export default async function ApiUsagePage() {
  // Handle build-time gracefully (no DATABASE_URL available)
  let allUsage: ApiUsageMetrics[] = [];
  let globalMetrics: GlobalMetrics = {
    totalRequests: 0,
    totalRequestsLast24h: 0,
    avgErrorRate: 0,
    avgResponseTime: 0,
    topTenants: [],
    approachingLimits: [],
    totalTenants: 0
  };

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

