import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth } from '@/lib/api/middleware';

const handler = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30'; // days

    const daysAgo = parseInt(range);
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Revenue trends (mock data - would calculate from subscriptions)
    const revenueTrends = Array.from({ length: daysAgo }, (_, i) => ({
      date: new Date(Date.now() - (daysAgo - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mrr: 5000 + Math.random() * 1000,
      arr: 60000 + Math.random() * 12000
    }));

    // User growth
    const userGrowth = Array.from({ length: daysAgo }, (_, i) => ({
      date: new Date(Date.now() - (daysAgo - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      newUsers: Math.floor(Math.random() * 20),
      activeUsers: 100 + Math.floor(Math.random() * 50)
    }));

    // Conversion funnel
    const totalInvites = await prisma.onboardingInvite.count();
    const acceptedInvites = await prisma.onboardingInvite.count({
      where: { usedAt: { not: null } }
    });
    const totalOrgs = await prisma.org.count();
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'active' }
    });

    const conversionFunnel = [
      { stage: 'Invites Sent', count: totalInvites },
      { stage: 'Invites Accepted', count: acceptedInvites },
      { stage: 'Orgs Created', count: totalOrgs },
      { stage: 'Active Subscriptions', count: activeSubscriptions }
    ];

    // Top clients by revenue (mock)
    const topClients = await prisma.org.findMany({
      take: 10,
      include: {
        subscriptions: {
          where: { status: 'active' },
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const topClientsByRevenue = topClients.map(org => ({
      name: org.name,
      revenue: org.subscriptions[0]?.priceCents || 0
    })).sort((a, b) => b.revenue - a.revenue);

    // Top features by usage (mock)
    const topFeatures = [
      { feature: 'Lead Management', usage: 1250 },
      { feature: 'AI Assistant', usage: 980 },
      { feature: 'Reporting', usage: 750 },
      { feature: 'Invoicing', usage: 620 },
      { feature: 'Analytics', usage: 450 }
    ];

    return jsonOk({
      revenueTrends,
      userGrowth,
      conversionFunnel,
      topClientsByRevenue,
      topFeatures
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return jsonError(500, 'internal_error', 'Failed to fetch analytics');
  }
};

export const GET = compose(withProviderAuth())(handler);

