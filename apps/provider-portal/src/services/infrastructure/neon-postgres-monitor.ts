/**
 * Neon Postgres Monitoring Service
 *
 * Monitors database usage metrics:
 * - Storage (GB)
 * - Active connections
 * - Query latency (ms)
 */

import { InfrastructureService, MetricType } from '@prisma/client';
import type { MetricData } from './types';
import { PrismaClient } from '@prisma/client';

export class NeonPostgresMonitor {
  constructor(private prisma: PrismaClient) {}

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
    ];

    return metrics;
  }

  static getPlanLimits(plan: 'hobby' | 'pro' | 'enterprise' = 'hobby') {
    // Rough defaults; adjust if Neon plan details change
    const plans = {
      hobby: { STORAGE_GB: 1, CONNECTIONS: 20 },
      pro: { STORAGE_GB: 10, CONNECTIONS: 100 },
      enterprise: { STORAGE_GB: 100, CONNECTIONS: 500 },
    } as const;
    return plans[plan];
  }
}

