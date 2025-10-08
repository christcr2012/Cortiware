/**
 * Neon Postgres Monitoring Service
 *
 * Monitors database usage metrics:
 * - Storage (GB)
 * - Active connections
 * - Query latency (ms)
 * - Estimated monthly cost (USD): storage + compute-hours (if Neon API configured)
 */

import { InfrastructureService, MetricType } from '@prisma/client';
import type { MetricData } from './types';
import { PrismaClient } from '@prisma/client';
import { NeonApiClient } from './neon-api-client';

export class NeonPostgresMonitor {
  private neonApi: NeonApiClient;

  constructor(private prisma: PrismaClient) {
    this.neonApi = new NeonApiClient();
  }

  async collectMetrics(): Promise<MetricData[]> {
    const now = new Date();

    // Storage in bytes
    const [{ bytes }]: Array<{ bytes: number }> = await this.prisma.$queryRawUnsafe(
      'SELECT pg_database_size(current_database()) AS bytes;'
    );

    // Active connections
    const [{ connections }]: Array<{ connections: number }> = await this.prisma.$queryRawUnsafe(
      "SELECT count(*)::int AS connections FROM pg_stat_activity WHERE datname = current_database();"
    );

    // Latency: round trip for a trivial query
    const t0 = Date.now();
    await this.prisma.$queryRawUnsafe('SELECT 1');
    const latencyMs = Date.now() - t0;

    const storageGB = bytes / (1024 ** 3);

    // Launch plan storage price: $0.35 / GB-month
    const storageCost = storageGB * 0.35;

    // Compute-hours cost (env-gated via Neon API)
    let computeCost = 0;
    let computeHours = 0;
    const computeUsage = await this.neonApi.getComputeUsage();
    if (computeUsage) {
      computeCost = computeUsage.estimatedCostUsd;
      computeHours = computeUsage.computeHours;
    }

    const totalCost = storageCost + computeCost;

    const metrics: MetricData[] = [
      {
        service: InfrastructureService.VERCEL_POSTGRES,
        metric: MetricType.STORAGE_GB,
        value: Number(storageGB.toFixed(4)),
        timestamp: now,
      },
      {
        service: InfrastructureService.VERCEL_POSTGRES,
        metric: MetricType.CONNECTIONS,
        value: connections,
        timestamp: now,
      },
      {
        service: InfrastructureService.VERCEL_POSTGRES,
        metric: MetricType.LATENCY_MS,
        value: latencyMs,
        timestamp: now,
      },
      {
        service: InfrastructureService.VERCEL_POSTGRES,
        metric: MetricType.COST_USD,
        value: Number(totalCost.toFixed(4)),
        timestamp: now,
        metadata: {
          plan: 'launch',
          unit: 'USD/month',
          storage_cost: Number(storageCost.toFixed(4)),
          compute_cost: Number(computeCost.toFixed(4)),
          compute_hours: Number(computeHours.toFixed(4)),
          neon_api_configured: this.neonApi.isConfigured(),
        },
      },
    ];

    return metrics;
  }
}

