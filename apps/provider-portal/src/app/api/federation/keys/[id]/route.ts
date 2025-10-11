import { NextRequest, NextResponse } from 'next/server';
import { withProviderAuth, type ProviderSession } from '@/lib/api/withProviderAuth';
import { PERMISSIONS } from '@/lib/rbac/roles';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/federation/keys/[id]
 * Disable a federation key (soft delete)
 */
export const DELETE = withProviderAuth(
  async (
    request: NextRequest,
    { params, session }: { params?: { id: string }; session: ProviderSession }
  ) => {
    try {
      // Handle params properly for Next.js 15
      const resolvedParams = params ? await Promise.resolve(params) : { id: '' };
      const { id } = resolvedParams;

      // Soft delete by setting disabledAt
      const key = await prisma.federationKey.update({
        where: { id },
        data: { disabledAt: new Date() },
        select: { id: true, keyId: true, orgId: true },
      });

      // Audit log
      await prisma.auditEvent.create({
        data: {
          action: 'federation_key_deleted',
          entityType: 'federation_key',
          entityId: key.id,
          actorType: 'provider',
          actorId: session.email,
          orgId: key.orgId,
          metadata: {
            keyId: key.keyId,
          },
        },
      });

      return NextResponse.json({ success: true, key });
    } catch (error) {
      console.error('Error deleting federation key:', error);
      return NextResponse.json(
        { error: 'Failed to delete key' },
        { status: 500 }
      );
    }
  },
  { requiredPermission: PERMISSIONS.FEDERATION_KEYS_DELETE }
);

