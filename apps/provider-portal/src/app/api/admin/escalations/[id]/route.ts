import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FEDERATION_PERMS, hasPermission, getUserRole, isProduction } from '@/lib/federation/rbac-middleware';

/**
 * PATCH /api/admin/escalations/[id]
 * Update escalation ticket status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // RBAC: Check admin write permission
  const role = await getUserRole(req);
  if (!role) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }
  if (!hasPermission(role, FEDERATION_PERMS.ADMIN_WRITE)) {
    return NextResponse.json(
      { error: 'Forbidden', message: `Role '${role}' does not have permission 'admin:write'` },
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
    const body = await req.json();
    const { status } = body; // UI sends 'status' but we map to 'state'

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate state - using actual DB values
    const validStates = ['received', 'sandbox_created', 'pr_opened', 'canary_requested', 'rolled_out', 'rolled_back'];
    // Map UI status to DB state
    const stateMap: Record<string, string> = {
      'open': 'received',
      'in_progress': 'sandbox_created',
      'resolved': 'rolled_out',
      'closed': 'rolled_back',
    };

    const state = stateMap[status] || status;

    if (!validStates.includes(state)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const ticket = await prisma.escalationTicket.update({
      where: { id: params.id },
      data: { state },
    });

    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Error updating escalation ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update escalation ticket' },
      { status: 500 }
    );
  }
}

