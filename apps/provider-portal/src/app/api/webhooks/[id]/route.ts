import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FEDERATION_PERMS, hasPermission, getUserRole, isProduction } from '@/lib/federation/rbac-middleware';

/**
 * PATCH /api/webhooks/[id]
 * Update webhook registration (e.g., toggle active status)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // RBAC: Check federation write permission
  const role = await getUserRole(req);
  if (!role) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }
  if (!hasPermission(role, FEDERATION_PERMS.FEDERATION_WRITE)) {
    return NextResponse.json(
      { error: 'Forbidden', message: `Role '${role}' does not have permission 'federation:write'` },
      { status: 403 }
    );
  }

  // Production write restriction: Block developer/ai_dev roles
  if (isProduction() && ['developer', 'ai_dev'].includes(role.toLowerCase())) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Developer and AI-dev roles cannot perform write operations in production.' },
      { status: 403 }
    );
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

    const webhook = await prisma.webhookRegistration.update({
      where: { id },
      data: { enabled: isActive }, // DB field is 'enabled', UI uses 'isActive'
    });

    return NextResponse.json({
      success: true,
      webhook,
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update webhook' },
      { status: 500 }
    );
  }
}

