import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminRead } from '@/lib/federation/rbac-middleware';

/**
 * GET /api/admin/escalations
 * List all escalation tickets with optional status filter
 */
export const GET = withAdminRead(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get('status'); // UI uses 'status' param but DB uses 'state'

    const where = state && state !== 'all' ? { state } : {};

    const tickets = await prisma.escalationTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to 100 most recent
    });

    return NextResponse.json({
      success: true,
      items: tickets,
      total: tickets.length,
    });
  } catch (error) {
    console.error('Error fetching escalation tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch escalation tickets' },
      { status: 500 }
    );
  }
});

