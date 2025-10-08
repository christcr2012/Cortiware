/**
 * Infrastructure Monitoring Service
 * 
 * Main orchestrator for infrastructure monitoring and cost optimization.
 * Collects metrics, analyzes trends, and generates upgrade recommendations.
 */

import { PrismaClient } from '@prisma/client';
import { VercelKVMonitor } from './vercel-kv-monitor';
import { VercelPlatformMonitor } from './vercel-platform-monitor';
import { NeonPostgresMonitor } from './neon-postgres-monitor';
import { AiUsageMonitor } from './ai-usage-monitor';
import { RecommendationEngine } from './recommendation-engine';
import type { MonitoringConfig, MetricData } from './types';
import { DEFAULT_CONFIG } from './types';

export class InfrastructureMonitoringService {
  private prisma: PrismaClient;
  private config: MonitoringConfig;
  private kvMonitor?: VercelKVMonitor;
  private platformMonitor?: VercelPlatformMonitor;
  private dbMonitor?: NeonPostgresMonitor;
  private aiMonitor?: AiUsageMonitor;
  private recommendationEngine: RecommendationEngine;

  constructor(prisma: PrismaClient, config?: Partial<MonitoringConfig>) {
    this.prisma = prisma;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.recommendationEngine = new RecommendationEngine(prisma);

    // Initialize monitors if credentials are available
    try {
      this.kvMonitor = new VercelKVMonitor(
        this.config.vercelKvUrl,
        this.config.vercelKvToken
      );
    } catch (error) {
      console.warn('Vercel KV monitor not initialized:', error);
    }

    try {
      this.platformMonitor = new VercelPlatformMonitor(
        this.config.vercelToken,
        this.config.vercelTeamId,
        this.config.vercelProjectIds
      );
    } catch (error) {
      console.warn('Vercel platform monitor not initialized:', error);
    }

    // Always available: DB and AI monitors (use Prisma + internal data)
    this.dbMonitor = new NeonPostgresMonitor(this.prisma);
    this.aiMonitor = new AiUsageMonitor(this.prisma);
  }

  /**
   * Collect all infrastructure metrics
   */
  async collectAllMetrics(): Promise<MetricData[]> {
    const allMetrics: MetricData[] = [];

    // Collect KV metrics
    if (this.kvMonitor) {
      try {
        const kvMetrics = await this.kvMonitor.collectMetrics();
        allMetrics.push(...kvMetrics);
      } catch (error) {
        console.error('Failed to collect KV metrics:', error);
      }
    }

    // Collect platform metrics
    if (this.platformMonitor) {
      try {
        const platformMetrics = await this.platformMonitor.collectMetrics();
        allMetrics.push(...platformMetrics);
      } catch (error) {
        console.error('Failed to collect platform metrics:', error);
      }
    }

    // Collect DB metrics
    if (this.dbMonitor) {
      try {
        const dbMetrics = await this.dbMonitor.collectMetrics();
        allMetrics.push(...dbMetrics);
      } catch (error) {
        console.error('Failed to collect DB metrics:', error);
      }
    }

    // Collect AI usage metrics
    if (this.aiMonitor) {
      try {
        const aiMetrics = await this.aiMonitor.collectMetrics();
        allMetrics.push(...aiMetrics);
      } catch (error) {
        console.error('Failed to collect AI metrics:', error);
      }
    }

    return allMetrics;
  }

  /**
   * Save metrics to database
   */
  async saveMetrics(metrics: MetricData[]): Promise<void> {
    for (const metric of metrics) {
      await this.prisma.infrastructureMetric.create({
        data: {
          service: metric.service,
          metric: metric.metric,
          value: metric.value,
          timestamp: metric.timestamp || new Date(),
          // Cast to JSON input to satisfy Prisma type
          metadata: (metric.metadata as any) ?? undefined,
        },
      });
    }
  }

  /**
   * Run full monitoring cycle
   * - Collect metrics
   * - Save to database
   * - Generate recommendations
   * - Check for alerts
   */
  async runMonitoringCycle(): Promise<{
    metricsCollected: number;
    recommendationsGenerated: number;
    alertsTriggered: number;
  }> {
    console.log('Starting infrastructure monitoring cycle...');

    // Collect and save metrics
    const metrics = await this.collectAllMetrics();
    await this.saveMetrics(metrics);
    console.log(`Collected ${metrics.length} metrics`);

    // Generate recommendations
    const recommendations = await this.recommendationEngine.generateRecommendations();
    await this.recommendationEngine.saveRecommendations(recommendations);
    console.log(`Generated ${recommendations.length} recommendations`);

    // Check for alerts
    const alerts = await this.checkAlerts();
    console.log(`Triggered ${alerts.length} alerts`);

    return {
      metricsCollected: metrics.length,
      recommendationsGenerated: recommendations.length,
      alertsTriggered: alerts.length,
    };
  }

  /**
   * Check for alert conditions
   */
  private async checkAlerts(): Promise<Array<{ service: string; metric: string; usagePercent: number }>> {
    const alerts: Array<{ service: string; metric: string; usagePercent: number }> = [];

    // Get all limits
    const limits = await this.prisma.infrastructureLimit.findMany();

    for (const limit of limits) {
      // Get latest metric value
      const latestMetric = await this.prisma.infrastructureMetric.findFirst({
        where: {
          service: limit.service,
          metric: limit.metric,
        },
        orderBy: { timestamp: 'desc' },
      });

      if (!latestMetric) continue;

      const usagePercent = (latestMetric.value / limit.limitValue) * 100;

      // Check if we've crossed warning or critical thresholds
      if (usagePercent >= limit.warningPercent) {
        alerts.push({
          service: limit.service,
          metric: limit.metric,
          usagePercent,
        });

        // TODO: Send actual alerts (email, Slack, etc.)
        console.warn(
          `⚠️ Alert: ${limit.service} ${limit.metric} at ${usagePercent.toFixed(1)}% (threshold: ${limit.warningPercent}%)`
        );
      }
    }

    return alerts;
  }

  /**
   * Initialize default service limits
   */
  async initializeDefaultLimits(): Promise<void> {
    const defaultLimits = [
      // Vercel KV (Free tier)
      {
        service: 'VERCEL_KV',
        metric: 'STORAGE_MB',
        currentPlan: 'free',
        limitValue: 30,
      },
      {
        service: 'VERCEL_KV',
        metric: 'COMMANDS_PER_DAY',
        currentPlan: 'free',
        limitValue: 10000,
      },
      // Neon Postgres (Launch plan) — usage-based, no hard caps.
      // Alert on monthly COST_USD rather than storage/connections caps.
      {
        service: 'VERCEL_POSTGRES',
        metric: 'COST_USD',
        currentPlan: 'budget',
        limitValue: 10, // default alert budget; adjust per org as needed
      },
      // Vercel Build (Pro tier)
      {
        service: 'VERCEL_BUILD',
        metric: 'BUILD_MINUTES',
        currentPlan: 'pro',
        limitValue: 6000, // 100 GB-hours = ~6000 minutes at 1GB
      },
      // Vercel Functions (Pro tier)
      {
        service: 'VERCEL_FUNCTIONS',
        metric: 'INVOCATIONS',
        currentPlan: 'pro',
        limitValue: 1000000,
      },
      // Vercel Bandwidth (Pro tier)
      {
        service: 'VERCEL_BANDWIDTH',
        metric: 'BANDWIDTH_GB',
        currentPlan: 'pro',
        limitValue: 1000,
      },
      // AI Credits monthly usage (percent of budget)
      {
        service: 'AI_CREDITS',
        metric: 'USAGE_PERCENT',
        currentPlan: 'global',
        limitValue: 100, // Hard cap at 100%
      },
      // AI cost soft cap (USD per month)
      {
        service: 'AI_OPENAI',
        metric: 'COST_USD',
        currentPlan: 'budget',
        limitValue: 50, // Provider monthly soft cap used for alerts
      },
    ];

    for (const limit of defaultLimits) {
      await this.prisma.infrastructureLimit.upsert({
        where: {
          service_metric_currentPlan: {
            service: limit.service as any,
            metric: limit.metric as any,
            currentPlan: limit.currentPlan,
          },
        },
        create: {
          service: limit.service as any,
          metric: limit.metric as any,
          currentPlan: limit.currentPlan,
          limitValue: limit.limitValue,
          warningPercent: this.config.defaultWarningPercent || 75,
          criticalPercent: this.config.defaultCriticalPercent || 90,
        },
        update: {
          limitValue: limit.limitValue,
        },
      });
    }

    console.log('Initialized default service limits');
  }

  /**
   * Get current usage summary
   */
  async getUsageSummary(): Promise<Record<string, { current: number; limit: number; percent: number }>> {
    const summary: Record<string, { current: number; limit: number; percent: number }> = {};

    const limits = await this.prisma.infrastructureLimit.findMany();

    for (const limit of limits) {
      const latestMetric = await this.prisma.infrastructureMetric.findFirst({
        where: {
          service: limit.service,
          metric: limit.metric,
        },
        orderBy: { timestamp: 'desc' },
      });

      if (latestMetric) {
        const key = `${limit.service}_${limit.metric}`;
        summary[key] = {
          current: latestMetric.value,
          limit: limit.limitValue,
          percent: (latestMetric.value / limit.limitValue) * 100,
        };
      }
    }

    return summary;
  }
}

// Export all types and classes
export * from './types';
export { VercelKVMonitor } from './vercel-kv-monitor';
export { VercelPlatformMonitor } from './vercel-platform-monitor';
export { NeonPostgresMonitor } from './neon-postgres-monitor';
export { AiUsageMonitor } from './ai-usage-monitor';
export { RecommendationEngine } from './recommendation-engine';

