import { getAllTenantsApiUsage, getGlobalApiMetrics } from '@/services/provider/api-usage.service';
import ApiUsageClient from './ApiUsageClient';

export const metadata = {
  title: 'API Usage & Rate Limits | Provider Portal',
};

export default async function ApiUsagePage() {
  const [allUsage, globalMetrics] = await Promise.all([
    getAllTenantsApiUsage(),
    getGlobalApiMetrics(),
  ]);

  return (
    <ApiUsageClient
      initialUsage={allUsage}
      globalMetrics={globalMetrics}
    />
  );
}

