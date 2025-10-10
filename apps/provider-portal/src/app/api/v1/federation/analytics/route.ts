import { NextRequest } from 'next/server';
import { jsonOk } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { withFederationRead } from '@/lib/federation/rbac-middleware';

export const dynamic = 'force-dynamic';

export const GET = withFederationRead(async (req: NextRequest) => {
  try {
    // Aggregate invoice metrics
    const invoiceStats = await prisma.federationInvoice.aggregate({
      _count: { id: true },
      _sum: { amountCents: true },
    });

    // Aggregate escalation metrics
    const escalationStats = await prisma.escalationTicket.aggregate({
      _count: { id: true },
    });

    return jsonOk({
      invoices: {
        count: invoiceStats._count.id || 0,
        totalAmountCents: invoiceStats._sum.amountCents || 0,
      },
      escalations: {
        count: escalationStats._count.id || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return jsonOk({
      invoices: { count: 0, totalAmountCents: 0 },
      escalations: { count: 0 },
    });
  }
});

