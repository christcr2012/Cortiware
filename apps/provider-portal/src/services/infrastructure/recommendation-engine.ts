/**
 * Upgrade Recommendation Engine
 * 
 * Analyzes usage trends and generates AI-powered upgrade recommendations
 * with ROI analysis and cost-benefit justification.
 */

import { PrismaClient, InfrastructureService, MetricType, RecommendationPriority } from '@prisma/client';
import type { UsageTrend, UpgradeRecommendationInput } from './types';

export class RecommendationEngine {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Analyze usage trends and generate recommendations
   */
  async generateRecommendations(): Promise<UpgradeRecommendationInput[]> {
    const recommendations: UpgradeRecommendationInput[] = [];

    // Get all service limits
    const limits = await this.prisma.infrastructureLimit.findMany();

    for (const limit of limits) {
      // Get usage trend for this service/metric
      const trend = await this.calculateUsageTrend(limit.service, limit.metric);
      
      if (!trend) continue;

      // Check if we should recommend an upgrade
      const recommendation = this.evaluateUpgrade(limit, trend);
      
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  /**
   * Calculate usage trend for a service/metric
   */
  private async calculateUsageTrend(
    service: InfrastructureService,
    metric: MetricType
  ): Promise<UsageTrend | null> {
    // Get metrics from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const metrics = await this.prisma.infrastructureMetric.findMany({
      where: {
        service,
        metric,
        timestamp: { gte: thirtyDaysAgo },
      },
      orderBy: { timestamp: 'asc' },
    });

    if (metrics.length < 2) return null;

    // Calculate average growth rate
    const firstValue = metrics[0].value;
    const lastValue = metrics[metrics.length - 1].value;
    const daysDiff = (metrics[metrics.length - 1].timestamp.getTime() - metrics[0].timestamp.getTime()) / (1000 * 60 * 60 * 24);
    
    const averageGrowthRate = daysDiff > 0 ? (lastValue - firstValue) / daysDiff : 0;

    // Get current limit
    const limit = await this.prisma.infrastructureLimit.findFirst({
      where: { service, metric },
    });

    if (!limit) return null;

    // Calculate days to limit
    let daysToLimit: number | null = null;
    if (averageGrowthRate > 0 && lastValue < limit.limitValue) {
      daysToLimit = Math.ceil((limit.limitValue - lastValue) / averageGrowthRate);
    }

    const usagePercent = (lastValue / limit.limitValue) * 100;

    return {
      service,
      metric,
      currentValue: lastValue,
      averageGrowthRate,
      daysToLimit,
      usagePercent,
    };
  }

  /**
   * Evaluate if an upgrade should be recommended
   */
  private evaluateUpgrade(
    limit: { service: InfrastructureService; metric: MetricType; currentPlan: string; limitValue: number; warningPercent: number; criticalPercent: number },
    trend: UsageTrend
  ): UpgradeRecommendationInput | null {
    // Don't recommend if usage is low
    if (trend.usagePercent < limit.warningPercent) {
      return null;
    }

    // Determine priority
    let priority: RecommendationPriority;
    if (trend.usagePercent >= limit.criticalPercent) {
      priority = RecommendationPriority.CRITICAL;
    } else if (trend.daysToLimit !== null && trend.daysToLimit <= 7) {
      priority = RecommendationPriority.HIGH;
    } else if (trend.daysToLimit !== null && trend.daysToLimit <= 30) {
      priority = RecommendationPriority.MEDIUM;
    } else {
      priority = RecommendationPriority.LOW;
    }

    // Get recommended plan
    const recommendedPlan = this.getRecommendedPlan(limit.service, limit.currentPlan);
    
    if (!recommendedPlan) return null;

    // Calculate costs
    const costs = this.calculateCosts(limit.service, limit.currentPlan, recommendedPlan, trend.currentValue);

    // Generate reason and benefits
    const { reason, benefits, risks } = this.generateRecommendationText(
      limit.service,
      limit.metric,
      trend,
      limit.currentPlan,
      recommendedPlan
    );

    return {
      service: limit.service,
      currentPlan: limit.currentPlan,
      recommendedPlan,
      priority,
      currentUsage: trend.currentValue,
      limitValue: limit.limitValue,
      usagePercent: trend.usagePercent,
      daysToLimit: trend.daysToLimit || undefined,
      ...costs,
      reason,
      benefits,
      risks,
    };
  }

  /**
   * Get recommended plan for a service
   */
  private getRecommendedPlan(service: InfrastructureService, currentPlan: string): string | null {
    const planHierarchy: Record<string, string[]> = {
      [InfrastructureService.VERCEL_KV]: ['free', 'pro', 'enterprise'],
      [InfrastructureService.VERCEL_POSTGRES]: ['hobby', 'pro', 'enterprise'],
      [InfrastructureService.VERCEL_BUILD]: ['hobby', 'pro', 'enterprise'],
      [InfrastructureService.VERCEL_FUNCTIONS]: ['hobby', 'pro', 'enterprise'],
      [InfrastructureService.VERCEL_BANDWIDTH]: ['hobby', 'pro', 'enterprise'],
    };

    const plans = planHierarchy[service];
    if (!plans) return null;

    const currentIndex = plans.indexOf(currentPlan);
    if (currentIndex === -1 || currentIndex === plans.length - 1) return null;

    return plans[currentIndex + 1];
  }

  /**
   * Calculate costs for upgrade
   */
  private calculateCosts(
    service: InfrastructureService,
    currentPlan: string,
    recommendedPlan: string,
    currentUsage: number
  ): {
    currentCost?: number;
    projectedCost?: number;
    upgradeCost?: number;
    revenueImpact?: number;
    profitImpact?: number;
    roi?: number;
  } {
    // Simplified cost calculation
    // In production, this would use actual pricing data
    
    const planCosts: Record<string, number> = {
      free: 0,
      hobby: 20,
      pro: 20,
      enterprise: 500,
    };

    const currentCost = planCosts[currentPlan] || 0;
    const upgradeCost = planCosts[recommendedPlan] || 0;

    // Estimate projected cost if we hit limits (service degradation)
    const projectedCost = currentCost + 100; // Assume $100 in overage fees

    // Estimate revenue impact (avoiding downtime)
    const revenueImpact = 1000; // Assume $1000 in prevented revenue loss

    // Calculate profit impact
    const profitImpact = revenueImpact - (upgradeCost - currentCost);

    // Calculate ROI
    const roi = profitImpact / (upgradeCost - currentCost) * 100;

    return {
      currentCost,
      projectedCost,
      upgradeCost,
      revenueImpact,
      profitImpact,
      roi,
    };
  }

  /**
   * Generate recommendation text
   */
  private generateRecommendationText(
    service: InfrastructureService,
    metric: MetricType,
    trend: UsageTrend,
    currentPlan: string,
    recommendedPlan: string
  ): {
    reason: string;
    benefits: string[];
    risks: string[];
  } {
    const serviceName = service.replace(/_/g, ' ').toLowerCase();
    const metricName = metric.replace(/_/g, ' ').toLowerCase();

    let reason = `Your ${serviceName} ${metricName} is at ${trend.usagePercent.toFixed(1)}% of the ${currentPlan} plan limit. `;
    
    if (trend.daysToLimit !== null && trend.daysToLimit > 0) {
      reason += `At current growth rate, you'll reach the limit in approximately ${trend.daysToLimit} days. `;
    } else if (trend.usagePercent >= 90) {
      reason += `You're approaching the limit and may experience service degradation. `;
    }

    reason += `Upgrading to the ${recommendedPlan} plan will provide additional capacity and prevent service interruptions.`;

    const benefits = [
      `Increased ${metricName} capacity`,
      'Avoid service degradation and downtime',
      'Support business growth without interruption',
      'Better performance and reliability',
    ];

    const risks = [
      'Service may become unavailable if limit is reached',
      'Potential revenue loss from downtime',
      'Customer experience degradation',
      'Emergency upgrade may be more expensive',
    ];

    return { reason, benefits, risks };
  }

  /**
   * Save recommendations to database
   */
  async saveRecommendations(recommendations: UpgradeRecommendationInput[]): Promise<void> {
    for (const rec of recommendations) {
      await this.prisma.upgradeRecommendation.create({
        data: {
          service: rec.service,
          currentPlan: rec.currentPlan,
          recommendedPlan: rec.recommendedPlan,
          priority: rec.priority,
          currentUsage: rec.currentUsage,
          limitValue: rec.limitValue,
          usagePercent: rec.usagePercent,
          daysToLimit: rec.daysToLimit,
          currentCost: rec.currentCost,
          projectedCost: rec.projectedCost,
          upgradeCost: rec.upgradeCost,
          revenueImpact: rec.revenueImpact,
          profitImpact: rec.profitImpact,
          roi: rec.roi,
          reason: rec.reason,
          benefits: rec.benefits,
          risks: rec.risks,
        },
      });
    }
  }
}

