import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth, withRateLimit } from '@/lib/api/middleware';
import { prisma } from '@/lib/prisma';

const getHandler = async (req: NextRequest) => {
  try {
    const { searchParams } = req.nextUrl;
    const state = searchParams.get('state');
    const severity = searchParams.get('severity');
    const orgId = searchParams.get('orgId');

    const where: any = {};
    if (state) where.state = state;
    if (severity) where.severity = severity;
    if (orgId) where.orgId = orgId;

    const escalations = await prisma.escalationTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        escalationId: true,
        tenantId: true,
        orgId: true,
        type: true,
        severity: true,
        description: true,
        state: true,
        createdAt: true,
      },
    });

    return jsonOk({ escalations });
  } catch (error) {
    console.error('Error listing escalation tickets:', error);
    return jsonError(500, 'internal_error', 'Failed to list escalations');
  }
};

export const GET = compose(withProviderAuth(), withRateLimit('api'))(getHandler);

