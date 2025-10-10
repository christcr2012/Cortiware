import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth, withRateLimit } from '@/lib/api/middleware';
import { withAudit } from '@/lib/api/audit-middleware';
import { prisma } from '@/lib/prisma';

const getHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    const escalation = await prisma.escalationTicket.findUnique({
      where: { id },
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

    if (!escalation) {
      return jsonError(404, 'not_found', 'Escalation not found');
    }

    return jsonOk({ escalation });
  } catch (error) {
    console.error('Error fetching escalation ticket:', error);
    return jsonError(500, 'internal_error', 'Failed to fetch escalation');
  }
};

const patchHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { state } = body;

    const updateData: any = {};
    if (state !== undefined) updateData.state = state;

    const escalation = await prisma.escalationTicket.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        escalationId: true,
        state: true,
      },
    });

    return jsonOk({ escalation });
  } catch (error) {
    console.error('Error updating escalation ticket:', error);
    return jsonError(500, 'internal_error', 'Failed to update escalation');
  }
};

export const GET = compose(withProviderAuth(), withRateLimit('api'))(getHandler);
export const PATCH = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(patchHandler, {
    action: 'update',
    entityType: 'escalation_ticket',
    actorType: 'provider',
  })
);

