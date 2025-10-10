/**
 * Provider Leads Service
 * Cross-tenant (provider) queries for leads with filters & pagination.
 */
import { prisma } from '@/lib/prisma';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'DISQUALIFIED';

export interface LeadSummary {
  total: number;
  converted: number;
  newToday: number;
  byStatus: Record<LeadStatus, number>;
}

export interface LeadListParams {
  q?: string;
  status?: LeadStatus | 'ALL';
  orgId?: string;
  sourceType?: string;
  cursor?: string;
  limit?: number;
}

export async function getLeadSummary(): Promise<LeadSummary> {
  try {
    const [total, converted, newToday, byStatusArr] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { convertedAt: { not: null } } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfToday() } } }),
      prisma.lead.groupBy({
        by: ['status'],
        _count: { status: true },
      })
    ]);

    const byStatus = {
      NEW: 0, CONTACTED: 0, QUALIFIED: 0, CONVERTED: 0, DISQUALIFIED: 0,
    } as Record<LeadStatus, number>;
    for (const row of byStatusArr as Array<{ status: LeadStatus; _count: { status: number } }>) {
      byStatus[row.status] = row._count.status;
    }

    return { total, converted, newToday, byStatus };
  } catch (error) {
    console.error('Error in getLeadSummary:', error);
    // Return empty summary on error
    return {
      total: 0,
      converted: 0,
      newToday: 0,
      byStatus: { NEW: 0, CONTACTED: 0, QUALIFIED: 0, CONVERTED: 0, DISQUALIFIED: 0 }
    };
  }
}

export async function listLeads(params: LeadListParams) {
  try {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const where: any = {};

    if (params.status && params.status !== 'ALL') where.status = params.status;
    if (params.orgId) where.orgId = params.orgId;
    if (params.sourceType) where.sourceType = params.sourceType as any;
    if (params.q) {
      where.OR = [
        { email: { contains: params.q, mode: 'insensitive' } },
        { company: { contains: params.q, mode: 'insensitive' } },
        { contactName: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      cursor: params.cursor ? { id: params.cursor } : undefined,
      select: {
        id: true,
        createdAt: true,
        status: true,
        company: true,
        contactName: true,
        email: true,
        orgId: true,
        sourceType: true,
        convertedAt: true,
        // New management fields
        disputeStatus: true,
        disputeReason: true,
        disputeResolvedAt: true,
        classificationType: true,
        classificationReason: true,
        classifiedAt: true,
        qualityScore: true,
        qualityNotes: true,
        qualityScoredAt: true,
        org: { select: { id: true, name: true } },
      },
    });

    let nextCursor: string | null = null;
    if (leads.length > limit) {
      const next = leads.pop();
      nextCursor = next?.id ?? null;
    }

    return {
      items: leads.map(l => ({
        id: l.id,
        createdAt: l.createdAt,
        status: l.status as LeadStatus,
        company: l.company ?? '',
        contactName: l.contactName ?? '',
        email: l.email ?? '',
        orgId: l.orgId,
        orgName: l.org?.name ?? '',
        sourceType: String(l.sourceType),
        convertedAt: l.convertedAt ?? undefined,
      })),
      nextCursor,
    };
  } catch (error) {
    console.error('Error in listLeads:', error);
    return { items: [], nextCursor: null };
  }
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

