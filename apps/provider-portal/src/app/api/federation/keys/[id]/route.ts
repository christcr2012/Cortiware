import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth, withRateLimit } from '@/lib/api/middleware';
import { withAudit } from '@/lib/api/audit-middleware';
import { prisma } from '@/lib/prisma';

const deleteHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    // Soft delete by setting disabledAt
    const key = await prisma.federationKey.update({
      where: { id },
      data: { disabledAt: new Date() },
      select: { id: true, keyId: true, tenantId: true },
    });

    return jsonOk({ success: true, key });
  } catch (error) {
    console.error('Error deleting federation key:', error);
    return jsonError(500, 'internal_error', 'Failed to delete key');
  }
};

export const DELETE = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(deleteHandler, {
    action: 'delete',
    entityType: 'federation_key',
    actorType: 'provider',
  })
);

