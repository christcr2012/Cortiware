import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/admin/escalations/[id]
 * Update escalation ticket status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

