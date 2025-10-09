import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cortiware/db';
import { compose, withProviderAuth, withAuditLog } from '@/lib/api/middleware';

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentIds, status } = body;

    if (!incidentIds || !Array.isArray(incidentIds) || incidentIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid incident IDs' },
        { status: 400 }
      );
    }

    if (!status || !['OPEN', 'ACK', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update all incidents
    const updateData: any = { status };
    
    // Set timestamps based on status
    if (status === 'ACK' && !updateData.acknowledgedAt) {
      updateData.acknowledgedAt = new Date();
    } else if (status === 'RESOLVED' && !updateData.resolvedAt) {
      updateData.resolvedAt = new Date();
    } else if (status === 'CLOSED' && !updateData.closedAt) {
      updateData.closedAt = new Date();
    }

    const result = await prisma.incident.updateMany({
      where: {
        id: {
          in: incidentIds,
        },
      },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      data: {
        updated: result.count,
      },
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update incidents' },
      { status: 500 }
    );
  }
}

export const POST = compose(
  withProviderAuth()
)(handler);

