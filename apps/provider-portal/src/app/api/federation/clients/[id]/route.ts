import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth, withRateLimit } from '@/lib/api/middleware';
import { withAudit } from '@/lib/api/audit-middleware';
import { prisma } from '@/lib/prisma';

const getHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    const client = await prisma.federatedClient.findUnique({
      where: { id },
      select: {
        id: true,
        orgId: true,
        name: true,
        contactEmail: true,
        planType: true,
        apiKeyId: true,
        webhookEndpoint: true,
        lastSeen: true,
        monthlyRevenue: true,
        convertedLeads: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!client) {
      return jsonError(404, 'not_found', 'Client not found');
    }

    return jsonOk({ client });
  } catch (error) {
    console.error('Error fetching federated client:', error);
    return jsonError(500, 'internal_error', 'Failed to fetch client');
  }
};

const patchHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, contactEmail, planType, webhookEndpoint } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (planType !== undefined) updateData.planType = planType;
    if (webhookEndpoint !== undefined) updateData.webhookEndpoint = webhookEndpoint;

    const client = await prisma.federatedClient.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        orgId: true,
        name: true,
        contactEmail: true,
        planType: true,
        webhookEndpoint: true,
        updatedAt: true,
      },
    });

    return jsonOk({ client });
  } catch (error) {
    console.error('Error updating federated client:', error);
    return jsonError(500, 'internal_error', 'Failed to update client');
  }
};

const deleteHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    // Hard delete (or you could add a 'deleted' field to schema for soft delete)
    const client = await prisma.federatedClient.delete({
      where: { id },
      select: { id: true, orgId: true, name: true },
    });

    return jsonOk({ success: true, client });
  } catch (error) {
    console.error('Error deleting federated client:', error);
    return jsonError(500, 'internal_error', 'Failed to delete client');
  }
};

export const GET = compose(withProviderAuth(), withRateLimit('api'))(getHandler);
export const PATCH = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(patchHandler, {
    action: 'update',
    entityType: 'federated_client',
    actorType: 'provider',
  })
);
export const DELETE = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(deleteHandler, {
    action: 'delete',
    entityType: 'federated_client',
    actorType: 'provider',
  })
);

