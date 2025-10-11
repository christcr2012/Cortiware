import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client-provider';

/**
 * POST /api/provider/leads/quality-score
 * Score lead quality (1-10 scale)
 * 
 * Provider admin can score leads to track quality metrics
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
    const { leadId, qualityScore, qualityNotes } = body;

    // Validation
    if (!leadId || qualityScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: leadId, qualityScore' },
        { status: 400 }
      );
    }

    if (typeof qualityScore !== 'number' || qualityScore < 1 || qualityScore > 10) {
      return NextResponse.json(
        { error: 'qualityScore must be a number between 1 and 10' },
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

    // Update lead with quality score
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        qualityScore,
        qualityNotes: qualityNotes || null,
        qualityScoredAt: new Date(),
        qualityScoredBy: session.value,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        orgId: lead.orgId,
        actorUserId: session.value,
        entity: 'lead',
        entityId: leadId,
        field: 'qualityScore',
        oldValue: lead.qualityScore ?? Prisma.JsonNull,
        newValue: qualityScore,
        reason: qualityNotes || `Quality scored: ${qualityScore}/10`,
      },
    });

    return NextResponse.json({
      success: true,
      lead: {
        id: updatedLead.id,
        qualityScore: updatedLead.qualityScore,
        qualityScoredAt: updatedLead.qualityScoredAt,
      },
      message: 'Quality score saved successfully',
    });
  } catch (error) {
    console.error('Error in quality-score handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

