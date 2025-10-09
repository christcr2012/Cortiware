import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth, withAudit } from '@/lib/api/middleware';

const patchHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, type, config, enabled } = body;

    // Validate input
    if (!name && !type && config === undefined && enabled === undefined) {
      return jsonError(400, 'invalid_request', 'At least one field is required');
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (config !== undefined) updateData.config = config;
    if (enabled !== undefined) updateData.enabled = enabled;

    // Update provider integration
    const provider = await prisma.providerIntegration.update({
      where: { id },
      data: updateData,
    });

    return jsonOk({
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.type,
        config: provider.config,
        enabled: provider.enabled,
        createdAt: provider.createdAt.toISOString(),
        updatedAt: provider.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating provider:', error);
    return jsonError(500, 'internal_error', 'Failed to update provider');
  }
};

const deleteHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    // Delete provider integration
    await prisma.providerIntegration.delete({
      where: { id },
    });

    return jsonOk({ success: true });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return jsonError(500, 'internal_error', 'Failed to delete provider');
  }
};

export const PATCH = compose(withProviderAuth())(
  withAudit(patchHandler, {
    action: 'update',
    entityType: 'provider_integration',
    actorType: 'provider',
  })
);

export const DELETE = compose(withProviderAuth())(
  withAudit(deleteHandler, {
    action: 'delete',
    entityType: 'provider_integration',
    actorType: 'provider',
  })
);

