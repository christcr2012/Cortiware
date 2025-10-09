/**
 * API Usage & Rate Limit Management Service
 * 
 * Provides functionality for tracking API usage, managing rate limits,
 * and generating usage-based billing insights.
 */

import { prisma } from '@cortiware/db';

export interface ApiUsageMetrics {
  tenantId: string;
  tenantName: string;
  totalRequests: number;
  requestsLast24h: number;
  requestsLast7d: number;
  requestsLast30d: number;
  errorRate: number;
  avgResponseTime: number;
  topEndpoints: Array<{
    endpoint: string;
    count: number;
    avgResponseTime: number;
    errorRate: number;
  }>;
  rateLimitStatus: {
    limit: number;
    current: number;
    remaining: number;
    resetAt: Date;
  };
  usageByDay: Array<{
    date: string;
    requests: number;
    errors: number;
  }>;
}

export interface RateLimitConfig {
  tenantId: string;
  endpoint?: string; // If null, applies to all endpoints
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  enabled: boolean;
}

export interface UsageBillingPreview {
  tenantId: string;
  tenantName: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  includedRequests: number;
  actualRequests: number;
  overageRequests: number;
  pricePerRequest: number;
  overageCharge: number;
  projectedMonthlyRequests: number;
  projectedOverageCharge: number;
}

/**
 * Get API usage metrics for a tenant
 */
export async function getTenantApiUsage(tenantId: string): Promise<ApiUsageMetrics> {
  // In a real implementation, this would query from a time-series database
  // or API gateway logs (e.g., Kong, AWS API Gateway, Cloudflare)
  
  // For now, we'll generate mock data based on tenant activity
  const tenant = await prisma.customer.findUnique({
    where: { id: tenantId },
    select: { name: true, createdAt: true },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Mock data - in production, query from API gateway/logs
  const totalRequests = Math.floor(Math.random() * 100000) + 10000;
  const requestsLast24h = Math.floor(Math.random() * 5000) + 500;
  const requestsLast7d = Math.floor(Math.random() * 30000) + 3000;
  const requestsLast30d = Math.floor(Math.random() * 80000) + 8000;

  return {
    tenantId,
    tenantName: tenant.name,
    totalRequests,
    requestsLast24h,
    requestsLast7d,
    requestsLast30d,
    errorRate: Math.random() * 5, // 0-5%
    avgResponseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
    topEndpoints: [
      {
        endpoint: '/api/v2/leads',
        count: Math.floor(totalRequests * 0.3),
        avgResponseTime: 120,
        errorRate: 1.2,
      },
      {
        endpoint: '/api/v2/customers',
        count: Math.floor(totalRequests * 0.25),
        avgResponseTime: 95,
        errorRate: 0.8,
      },
      {
        endpoint: '/api/v2/invoices',
        count: Math.floor(totalRequests * 0.2),
        avgResponseTime: 150,
        errorRate: 2.1,
      },
      {
        endpoint: '/api/v2/analytics',
        count: Math.floor(totalRequests * 0.15),
        avgResponseTime: 300,
        errorRate: 0.5,
      },
      {
        endpoint: '/api/v2/auth',
        count: Math.floor(totalRequests * 0.1),
        avgResponseTime: 80,
        errorRate: 0.3,
      },
    ],
    rateLimitStatus: {
      limit: 10000,
      current: requestsLast24h,
      remaining: Math.max(0, 10000 - requestsLast24h),
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    usageByDay: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        requests: Math.floor(Math.random() * 3000) + 500,
        errors: Math.floor(Math.random() * 50),
      };
    }),
  };
}

/**
 * Get API usage for all tenants
 */
export async function getAllTenantsApiUsage(): Promise<ApiUsageMetrics[]> {
  const tenants = await prisma.customer.findMany({
    select: { id: true },
    take: 100,
  });

  const usagePromises = tenants.map(t => getTenantApiUsage(t.id));
  return Promise.all(usagePromises);
}

/**
 * Get rate limit configuration for a tenant
 */
export async function getRateLimitConfig(tenantId: string): Promise<RateLimitConfig[]> {
  const tenant = await prisma.customer.findUnique({
    where: { id: tenantId },
    select: { metadata: true },
  });

  if (!tenant?.metadata) {
    return getDefaultRateLimits(tenantId);
  }

  const metadata = tenant.metadata as any;
  return metadata.rateLimits || getDefaultRateLimits(tenantId);
}

/**
 * Update rate limit configuration for a tenant
 */
export async function updateRateLimitConfig(
  tenantId: string,
  config: Omit<RateLimitConfig, 'tenantId'>
): Promise<void> {
  const tenant = await prisma.customer.findUnique({
    where: { id: tenantId },
    select: { metadata: true },
  });

  const metadata = (tenant?.metadata as any) || {};
  const rateLimits = metadata.rateLimits || getDefaultRateLimits(tenantId);

  // Update or add the config
  const existingIndex = rateLimits.findIndex(
    (rl: RateLimitConfig) => rl.endpoint === config.endpoint
  );

  if (existingIndex >= 0) {
    rateLimits[existingIndex] = { ...config, tenantId };
  } else {
    rateLimits.push({ ...config, tenantId });
  }

  metadata.rateLimits = rateLimits;

  await prisma.customer.update({
    where: { id: tenantId },
    data: { metadata },
  });
}

/**
 * Get usage-based billing preview
 */
export async function getUsageBillingPreview(tenantId: string): Promise<UsageBillingPreview> {
  const tenant = await prisma.customer.findUnique({
    where: { id: tenantId },
    select: { name: true, createdAt: true },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const usage = await getTenantApiUsage(tenantId);

  // Billing period: current month
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Pricing tiers (example)
  const includedRequests = 50000; // Free tier
  const pricePerRequest = 0.0001; // $0.0001 per request over limit

  const actualRequests = usage.requestsLast30d;
  const overageRequests = Math.max(0, actualRequests - includedRequests);
  const overageCharge = overageRequests * pricePerRequest;

  // Project to end of month
  const daysInMonth = periodEnd.getDate();
  const daysPassed = now.getDate();
  const projectionMultiplier = daysInMonth / daysPassed;
  const projectedMonthlyRequests = Math.floor(actualRequests * projectionMultiplier);
  const projectedOverageRequests = Math.max(0, projectedMonthlyRequests - includedRequests);
  const projectedOverageCharge = projectedOverageRequests * pricePerRequest;

  return {
    tenantId,
    tenantName: tenant.name,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    includedRequests,
    actualRequests,
    overageRequests,
    pricePerRequest,
    overageCharge,
    projectedMonthlyRequests,
    projectedOverageCharge,
  };
}

/**
 * Get default rate limits for a tenant
 */
function getDefaultRateLimits(tenantId: string): RateLimitConfig[] {
  return [
    {
      tenantId,
      endpoint: undefined, // Global limit
      requestsPerMinute: 100,
      requestsPerHour: 5000,
      requestsPerDay: 100000,
      burstLimit: 200,
      enabled: true,
    },
  ];
}

/**
 * Get API performance metrics across all tenants
 */
export async function getGlobalApiMetrics() {
  const allUsage = await getAllTenantsApiUsage();

  const totalRequests = allUsage.reduce((sum, u) => sum + u.totalRequests, 0);
  const totalRequestsLast24h = allUsage.reduce((sum, u) => sum + u.requestsLast24h, 0);
  const avgErrorRate = allUsage.reduce((sum, u) => sum + u.errorRate, 0) / allUsage.length;
  const avgResponseTime = allUsage.reduce((sum, u) => sum + u.avgResponseTime, 0) / allUsage.length;

  // Top tenants by usage
  const topTenants = allUsage
    .sort((a, b) => b.requestsLast30d - a.requestsLast30d)
    .slice(0, 10)
    .map(u => ({
      tenantId: u.tenantId,
      tenantName: u.tenantName,
      requests: u.requestsLast30d,
    }));

  // Tenants approaching limits
  const approachingLimits = allUsage
    .filter(u => {
      const percentUsed = (u.rateLimitStatus.current / u.rateLimitStatus.limit) * 100;
      return percentUsed >= 80;
    })
    .map(u => ({
      tenantId: u.tenantId,
      tenantName: u.tenantName,
      percentUsed: (u.rateLimitStatus.current / u.rateLimitStatus.limit) * 100,
      current: u.rateLimitStatus.current,
      limit: u.rateLimitStatus.limit,
    }));

  return {
    totalRequests,
    totalRequestsLast24h,
    avgErrorRate,
    avgResponseTime,
    topTenants,
    approachingLimits,
    totalTenants: allUsage.length,
  };
}

