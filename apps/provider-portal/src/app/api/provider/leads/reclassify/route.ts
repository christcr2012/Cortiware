import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client-provider';

/**
 * POST /api/provider/leads/reclassify
 * Reclassify a lead (employee referral, duplicate, invalid, etc.)
 * 
 * Provider admin can reclassify leads to exclude them from billing
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
    const { leadId, classificationType, reason } = body;

    // Validation
    if (!leadId || !classificationType) {
      return NextResponse.json(
        { error: 'Missing required fields: leadId, classificationType' },
        { status: 400 }
      );
    }

    const validTypes = ['employee_referral', 'duplicate', 'invalid_contact', 'out_of_service_area', 'spam'];
    if (!validTypes.includes(classificationType)) {
      return NextResponse.json(
        { error: `Invalid classificationType. Must be one of: ${validTypes.join(', ')}` },
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

    // Convert to enum format
    const enumType = classificationType.toUpperCase() as any;

    // Update lead with classification
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        classificationType: enumType,
        classificationReason: reason || null,
        classifiedAt: new Date(),
        classifiedBy: session.value,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        orgId: lead.orgId,
        actorUserId: session.value,
        entity: 'lead',
        entityId: leadId,
        field: 'classificationType',
        oldValue: lead.classificationType ?? Prisma.JsonNull,
        newValue: enumType,
        reason: reason || `Reclassified as ${classificationType.replace('_', ' ')}`,
      },
    });

    // TODO: Send webhook to tenant app
    // await sendWebhook(lead.orgId, 'lead.reclassified', {
    //   leadId,
    //   classificationType: enumType,
    //   reason,
    // });

    return NextResponse.json({
      success: true,
      lead: {
        id: updatedLead.id,
        classificationType: updatedLead.classificationType,
        classifiedAt: updatedLead.classifiedAt,
      },
      message: 'Lead reclassified successfully',
    });
  } catch (error) {
    console.error('Error in reclassify handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

