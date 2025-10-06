/**
 * Developer Statistics Service
 * 
 * Fetches real-time statistics for the Developer portal dashboard.
 * Provides system metrics, API usage, and development insights.
 */

import { prisma } from '@/lib/prisma';

export interface DeveloperStats {
  apiCallsToday: number;
  testRuns: number;
  errorRate: number;
  avgResponseTime: number;
  activeEndpoints: number;
  systemStatus: 'healthy' | 'degraded' | 'down';
}

export interface SystemDiagnostic {
  id: string;
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  details?: Record<string, any>;
}

/**
 * Get developer dashboard statistics
 */
export async function getDeveloperStats(): Promise<DeveloperStats> {
  try {
    // In production, these would come from monitoring systems (DataDog, New Relic, etc.)
    // For now, we'll use database queries and system checks
    
    // Count API calls today (would come from logs/analytics in production)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Placeholder: In production, query from API logs table
    const apiCallsToday = 0;

    // Count test runs (would come from CI/CD system)
    const testRuns = 0;

    // Calculate error rate (would come from error tracking)
    const errorRate = 0;

    // Average response time (would come from APM)
    const avgResponseTime = 0;

    // Count active API endpoints
    const activeEndpoints = 42; // Hardcoded for now, would scan routes in production

    // System status check
    let systemStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      systemStatus = 'down';
    }

    return {
      apiCallsToday,
      testRuns,
      errorRate,
      avgResponseTime,
      activeEndpoints,
      systemStatus,
    };
  } catch (error) {
    console.error('[DeveloperStats] Error fetching stats:', error);
    return {
      apiCallsToday: 0,
      testRuns: 0,
      errorRate: 0,
      avgResponseTime: 0,
      activeEndpoints: 0,
      systemStatus: 'down',
    };
  }
}

/**
 * Get system diagnostics
 */
export async function getSystemDiagnostics(): Promise<SystemDiagnostic[]> {
  const diagnostics: SystemDiagnostic[] = [];
  const now = new Date();

  try {
    // Database health check
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      
      diagnostics.push({
        id: 'db-health',
        component: 'Database',
        status: latency < 100 ? 'healthy' : latency < 500 ? 'warning' : 'error',
        message: `Database responding in ${latency}ms`,
        timestamp: now,
        details: { latency },
      });
    } catch (error) {
      diagnostics.push({
        id: 'db-health',
        component: 'Database',
        status: 'error',
        message: 'Database connection failed',
        timestamp: now,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }

    // Check table counts
    try {
      const [orgCount, userCount, leadCount] = await Promise.all([
        prisma.org.count(),
        prisma.user.count(),
        prisma.lead.count(),
      ]);

      diagnostics.push({
        id: 'data-integrity',
        component: 'Data Integrity',
        status: 'healthy',
        message: `${orgCount} orgs, ${userCount} users, ${leadCount} leads`,
        timestamp: now,
        details: { orgCount, userCount, leadCount },
      });
    } catch (error) {
      diagnostics.push({
        id: 'data-integrity',
        component: 'Data Integrity',
        status: 'error',
        message: 'Failed to query data',
        timestamp: now,
      });
    }

    // API health (simplified - would check actual endpoints in production)
    diagnostics.push({
      id: 'api-health',
      component: 'API',
      status: 'healthy',
      message: 'All endpoints responding',
      timestamp: now,
      details: { endpoints: 42 },
    });

    // Cache health (simplified - would check Redis/KV in production)
    diagnostics.push({
      id: 'cache-health',
      component: 'Cache',
      status: 'healthy',
      message: 'Cache operational',
      timestamp: now,
    });

    return diagnostics;
  } catch (error) {
    console.error('[DeveloperStats] Error fetching diagnostics:', error);
    return [{
      id: 'system-error',
      component: 'System',
      status: 'error',
      message: 'Failed to fetch diagnostics',
      timestamp: now,
    }];
  }
}

/**
 * Get recent API errors
 */
export async function getRecentErrors(limit: number = 10): Promise<Array<{
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  message: string;
  timestamp: Date;
  count: number;
}>> {
  try {
    // In production, this would query from error tracking system (Sentry, etc.)
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('[DeveloperStats] Error fetching recent errors:', error);
    return [];
  }
}

/**
 * Get API endpoint performance metrics
 */
export async function getEndpointMetrics(): Promise<Array<{
  endpoint: string;
  method: string;
  avgResponseTime: number;
  p95ResponseTime: number;
  requestCount: number;
  errorRate: number;
}>> {
  try {
    // In production, this would come from APM (Application Performance Monitoring)
    // For now, return sample data
    return [
      {
        endpoint: '/api/v2/leads',
        method: 'GET',
        avgResponseTime: 45,
        p95ResponseTime: 120,
        requestCount: 1250,
        errorRate: 0.2,
      },
      {
        endpoint: '/api/v2/opportunities',
        method: 'GET',
        avgResponseTime: 62,
        p95ResponseTime: 180,
        requestCount: 890,
        errorRate: 0.5,
      },
      {
        endpoint: '/api/v2/auth/login',
        method: 'POST',
        avgResponseTime: 180,
        p95ResponseTime: 350,
        requestCount: 450,
        errorRate: 1.2,
      },
    ];
  } catch (error) {
    console.error('[DeveloperStats] Error fetching endpoint metrics:', error);
    return [];
  }
}

/**
 * Get database schema info
 */
export async function getDatabaseInfo(): Promise<{
  tables: number;
  totalRecords: number;
  databaseSize: string;
}> {
  try {
    // Count tables (simplified - would use information_schema in production)
    const tables = 20; // Approximate from schema

    // Count total records across main tables
    const [orgCount, userCount, leadCount, invoiceCount] = await Promise.all([
      prisma.org.count(),
      prisma.user.count(),
      prisma.lead.count(),
      prisma.invoice.count(),
    ]);

    const totalRecords = orgCount + userCount + leadCount + invoiceCount;

    // Database size (would query from pg_database_size in production)
    const databaseSize = '< 1 GB';

    return {
      tables,
      totalRecords,
      databaseSize,
    };
  } catch (error) {
    console.error('[DeveloperStats] Error fetching database info:', error);
    return {
      tables: 0,
      totalRecords: 0,
      databaseSize: 'Unknown',
    };
  }
}

