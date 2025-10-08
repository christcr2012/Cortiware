/**
 * Infrastructure Monitoring Types
 * 
 * Shared types for infrastructure monitoring services
 */

import type { 
  InfrastructureService, 
  MetricType, 
  RecommendationPriority,
  RecommendationStatus 
} from '@prisma/client';

export interface MetricData {
  service: InfrastructureService;
  metric: MetricType;
  value: number;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
}

export interface ServiceLimit {
  service: InfrastructureService;
  metric: MetricType;
  currentPlan: string;
  limitValue: number;
  warningPercent?: number;
  criticalPercent?: number;
}

export interface UsageTrend {
  service: InfrastructureService;
  metric: MetricType;
  currentValue: number;
  averageGrowthRate: number; // Per day
  daysToLimit: number | null;
  usagePercent: number;
}

export interface UpgradeRecommendationInput {
  service: InfrastructureService;
  currentPlan: string;
  recommendedPlan: string;
  priority: RecommendationPriority;
  currentUsage: number;
  limitValue: number;
  usagePercent: number;
  daysToLimit?: number;
  currentCost?: number;
  projectedCost?: number;
  upgradeCost?: number;
  revenueImpact?: number;
  profitImpact?: number;
  roi?: number;
  reason: string;
  benefits?: string[];
  risks?: string[];
}

export interface MonitoringConfig {
  // Vercel KV
  vercelKvUrl?: string;
  vercelKvToken?: string;
  
  // Vercel Platform
  vercelToken?: string;
  vercelTeamId?: string;
  vercelProjectIds?: string[];
  
  // Database
  databaseUrl?: string;
  
  // Collection intervals (minutes)
  kvCollectionInterval?: number;
  platformCollectionInterval?: number;
  dbCollectionInterval?: number;
  
  // Alert thresholds
  defaultWarningPercent?: number;
  defaultCriticalPercent?: number;
}

export const DEFAULT_CONFIG: MonitoringConfig = {
  kvCollectionInterval: 15,
  platformCollectionInterval: 60,
  dbCollectionInterval: 30,
  defaultWarningPercent: 75,
  defaultCriticalPercent: 90,
};

