import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/provider/leads/dispute
 * Handle individual lead dispute resolution
 * 
 * Provider admin can approve or reject client disputes about leads
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const jar = await cookies();
    const session = jar.get('rs_provider') || jar.get('provider-session') || jar.get('ws_provider');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { leadId, resolution, disputeReason, notes } = body;

    // Validation
    if (!leadId || !resolution) {
      return NextResponse.json(
        { error: 'Missing required fields: leadId, resolution' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(resolution)) {
      return NextResponse.json(
        { error: 'Invalid resolution. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Find the lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { org: { select: { id: true, name: true } } },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Update lead with dispute resolution
    const disputeStatus = resolution === 'approve' ? 'APPROVED' : 'REJECTED';
    
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        disputeStatus: disputeStatus as any,
        disputeReason: disputeReason || null,
        disputeResolvedAt: new Date(),
        disputeResolvedBy: session.value, // Store session ID as resolver
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        orgId: lead.orgId,
        actorUserId: session.value,
        entity: 'lead',
        entityId: leadId,
        field: 'disputeStatus',
        oldValue: lead.disputeStatus || 'NONE',
        newValue: disputeStatus,
        reason: notes || `Dispute ${resolution}d: ${disputeReason || 'No reason provided'}`,
      },
    });

    // TODO: Send webhook to tenant app
    // await sendWebhook(lead.orgId, 'lead.dispute.resolved', {
    //   leadId,
    //   resolution: disputeStatus,
    //   reason: disputeReason,
    // });

    return NextResponse.json({
      success: true,
      lead: {
        id: updatedLead.id,
        disputeStatus: updatedLead.disputeStatus,
        disputeResolvedAt: updatedLead.disputeResolvedAt,
      },
      message: `Dispute ${resolution}d successfully`,
    });
  } catch (error) {
    console.error('Error in dispute handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

