/**
 * AI Usage Monitoring Service
 *
 * Aggregates AI usage and costs from AiMonthlySummary and AiUsageEvent
 * to provide infrastructure-level metrics:
 * - Total AI cost (USD)
 * - Credits usage percent (sum used / sum budget)
 */

import { PrismaClient, InfrastructureService, MetricType } from '@prisma/client';
import type { MetricData } from './types';

export class AiUsageMonitor {
  constructor(private prisma: PrismaClient) {}

  private budgetCentsToCredits(cents: number) {
    // Mirrors logic in aiMeter.ts: 1 credit = $0.05 => cents / 5
    return cents / 5;
  }

  async collectMetrics(): Promise<MetricData[]> {
    const now = new Date();

    const monthKey = now.toISOString().slice(0, 7);

    // Sum monthly cost across all orgs
    const monthly = await (this.prisma as any).aiMonthlySummary.aggregate({
      where: { monthKey },
      _sum: { costUsd: true, creditsUsed: true },
    });

    const orgs = await this.prisma.org.findMany({
      select: { aiMonthlyBudgetCents: true },
    });

    const totalBudgetCredits = orgs.reduce((acc, o: any) => acc + this.budgetCentsToCredits(o.aiMonthlyBudgetCents || 0), 0);
    const totalCreditsUsed = monthly._sum?.creditsUsed || 0;

    const costUsd = monthly._sum?.costUsd || 0;
    const usagePercent = totalBudgetCredits > 0 ? (totalCreditsUsed / totalBudgetCredits) * 100 : 0;

    const metrics: MetricData[] = [
      {
        service: InfrastructureService.AI_OPENAI,
        metric: MetricType.COST_USD,
        value: Number(costUsd.toFixed(4)),
        timestamp: now,
      },
      {
        service: InfrastructureService.AI_CREDITS,
        metric: MetricType.USAGE_PERCENT,
        value: Number(usagePercent.toFixed(2)),
        timestamp: now,
      },
    ];

    return metrics;
  }
}

