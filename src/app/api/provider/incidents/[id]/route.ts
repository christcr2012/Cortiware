import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import { withAudit } from '@/lib/api/audit-middleware';
import { prisma } from '@/lib/prisma';

const getHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        org: {
          select: { id: true, name: true },
        },
      },
    });

    if (!incident) {
      return jsonError(404, 'not_found', 'Incident not found');
    }

    return jsonOk({ incident });
  } catch (error) {
    console.error('Error fetching incident:', error);
    return jsonError(500, 'internal_error', 'Failed to fetch incident');
  }
};

const patchHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, assigneeUserId, acknowledgedAt, resolvedAt, closedAt } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assigneeUserId !== undefined) updateData.assigneeUserId = assigneeUserId;
    if (acknowledgedAt !== undefined) updateData.acknowledgedAt = acknowledgedAt ? new Date(acknowledgedAt) : null;
    if (resolvedAt !== undefined) updateData.resolvedAt = resolvedAt ? new Date(resolvedAt) : null;
    if (closedAt !== undefined) updateData.closedAt = closedAt ? new Date(closedAt) : null;

    const incident = await prisma.incident.update({
      where: { id },
      data: updateData,
      include: {
        org: {
          select: { id: true, name: true },
        },
      },
    });

    return jsonOk({ incident });
  } catch (error) {
    console.error('Error updating incident:', error);
    return jsonError(500, 'internal_error', 'Failed to update incident');
  }
};

const deleteHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    await prisma.incident.delete({
      where: { id },
    });

    return jsonOk({ success: true });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return jsonError(500, 'internal_error', 'Failed to delete incident');
  }
};

export const GET = compose(withProviderAuth())(getHandler);
export const PATCH = compose(withProviderAuth())(
  withAudit(patchHandler, {
    action: 'update',
    entityType: 'incident',
    actorType: 'provider',
  })
);
export const DELETE = compose(withProviderAuth())(
  withAudit(deleteHandler, {
    action: 'delete',
    entityType: 'incident',
    actorType: 'provider',
  })
);

