/**
 * Provider Statistics Service
 * 
 * Fetches real-time statistics for the Provider portal dashboard.
 * Aggregates data across all client organizations.
 */

import { prisma } from '@/lib/prisma';

export interface ProviderStats {
  totalClients: number;
  activeUsers: number;
  totalLeads: number;
  totalRevenue: number;
  systemHealth: number;
  apiStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
}

export interface RecentActivity {
  id: string;
  type: 'user_signup' | 'lead_created' | 'invoice_paid' | 'system_event';
  message: string;
  timestamp: Date;
  orgId?: string;
  orgName?: string;
}

/**
 * Get provider dashboard statistics
 */
export async function getProviderStats(): Promise<ProviderStats> {
  try {
    // Count total client organizations
    const totalClients = await prisma.org.count({
      where: {
        // Exclude system/test orgs if needed
        name: {
          not: {
            startsWith: 'test-',
          },
        },
      },
    });

    // Count active users (users who logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await prisma.user.count({
      where: {
        lastSuccessfulLogin: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Count total leads across all orgs
    const totalLeads = await prisma.lead.count();

    // Calculate total revenue from paid invoices
    const revenueResult = await prisma.invoice.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'paid',
      },
    });

    // Convert Decimal to number (amount is in dollars, not cents)
    const totalRevenue = revenueResult._sum.amount
      ? Number(revenueResult._sum.amount) * 100 // Convert to cents for consistency
      : 0;

    // System health calculation (simplified)
    // In production, this would check various system metrics
    const systemHealth = 100;

    // API status (simplified)
    // In production, this would check actual API health endpoints
    const apiStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE' = 'ONLINE';

    return {
      totalClients,
      activeUsers,
      totalLeads,
      totalRevenue,
      systemHealth,
      apiStatus,
    };
  } catch (error) {
    console.error('[ProviderStats] Error fetching stats:', error);
    // Return safe defaults on error
    return {
      totalClients: 0,
      activeUsers: 0,
      totalLeads: 0,
      totalRevenue: 0,
      systemHealth: 0,
      apiStatus: 'OFFLINE',
    };
  }
}

/**
 * Get recent activity across all organizations
 */
export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
  try {
    const activities: RecentActivity[] = [];

    // Get recent user signups
    const recentUsers = await prisma.user.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        org: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    for (const user of recentUsers) {
      activities.push({
        id: `user-${user.id}`,
        type: 'user_signup',
        message: `New user signed up: ${user.email}`,
        timestamp: user.createdAt,
        orgId: user.orgId,
        orgName: user.org.name,
      });
    }

    // Get recent leads
    const recentLeads = await prisma.lead.findMany({
      take: 3,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        org: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    for (const lead of recentLeads) {
      activities.push({
        id: `lead-${lead.id}`,
        type: 'lead_created',
        message: `New lead: ${lead.company || lead.email}`,
        timestamp: lead.createdAt,
        orgId: lead.orgId,
        orgName: lead.org.name,
      });
    }

    // Get recent paid invoices
    const recentInvoices = await prisma.invoice.findMany({
      take: 3,
      orderBy: {
        issuedAt: 'desc',
      },
      where: {
        status: 'paid',
      },
      include: {
        org: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    for (const invoice of recentInvoices) {
      activities.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice_paid',
        message: `Invoice paid: $${Number(invoice.amount).toFixed(2)}`,
        timestamp: invoice.issuedAt,
        orgId: invoice.orgId,
        orgName: invoice.org.name,
      });
    }

    // Sort by timestamp descending and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('[ProviderStats] Error fetching recent activity:', error);
    return [];
  }
}

/**
 * Get system health metrics
 */
export async function getSystemHealth(): Promise<{
  database: 'healthy' | 'degraded' | 'down';
  api: 'healthy' | 'degraded' | 'down';
  cache: 'healthy' | 'degraded' | 'down';
}> {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    const database = 'healthy';

    // API health (simplified - in production would check actual endpoints)
    const api = 'healthy';

    // Cache health (simplified - in production would check Redis/KV)
    const cache = 'healthy';

    return { database, api, cache };
  } catch (error) {
    console.error('[ProviderStats] Error checking system health:', error);
    return {
      database: 'down',
      api: 'down',
      cache: 'down',
    };
  }
}

/**
 * Get client growth metrics (for analytics)
 */
export async function getClientGrowth(days: number = 30): Promise<Array<{ date: string; count: number }>> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orgs = await prisma.org.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const growthMap = new Map<string, number>();
    for (const org of orgs) {
      const dateKey = org.createdAt.toISOString().split('T')[0];
      growthMap.set(dateKey, (growthMap.get(dateKey) || 0) + 1);
    }

    // Convert to array
    return Array.from(growthMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  } catch (error) {
    console.error('[ProviderStats] Error fetching client growth:', error);
    return [];
  }
}

