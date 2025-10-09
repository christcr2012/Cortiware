// Opportunities service - handles CRUD operations for opportunities
import { prisma } from '@/lib/prisma';
import type { OpportunityCreateInput } from '@/lib/validation/opportunities';
import { logMonetizationChange } from './audit-log.service';
import crypto from 'crypto';

export const opportunityService = {
  /**
   * List opportunities for an organization with pagination and filters
   */
  async list(
    orgId: string,
    params: {
      q?: string;
      stage?: string;
      customerId?: string;
      cursor?: string;
      limit?: number;
    } = {}
  ) {
    const { q, stage, customerId, cursor, limit = 20 } = params;

    const where: any = { orgId };

    // Search by customer name (join)
    if (q) {
      where.customer = {
        name: { contains: q, mode: 'insensitive' },
      };
    }

    // Filter by stage
    if (stage) {
      where.stage = stage;
    }

    // Filter by customer
    if (customerId) {
      where.customerId = customerId;
    }

    // Cursor pagination
    const cursorClause = cursor ? { cursor: { id: cursor }, skip: 1 } : {};

    // Fetch limit + 1 to determine if there's a next page
    const items = await prisma.opportunity.findMany({
      where,
      ...cursorClause,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true },
        },
      },
    });

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return {
      items: results,
      nextCursor,
    };
  },

  /**
   * Create a new opportunity
   */
  async create(orgId: string, userId: string, input: OpportunityCreateInput) {
    const { customerId, valueType, estValue, stage, ownerId, sourceLeadId, classification } = input;

    // Verify customer exists and belongs to org
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, orgId },
    });

    if (!customer) {
      throw new Error('Customer not found or does not belong to organization');
    }

    // Generate publicId
    const publicId = generatePublicId();

    // Create opportunity
    const opportunity = await prisma.opportunity.create({
      data: {
        orgId,
        publicId,
        customerId,
        valueType: valueType || 'ONE_TIME',
        estValue: estValue || 0,
        stage: stage || 'PROSPECT',
        ownerId: ownerId || userId,
        sourceLeadId,
        classification: classification || {},
      },
      include: {
        customer: {
          select: { id: true, name: true },
        },
      },
    });

    // Audit log
    await logMonetizationChange({
      orgId,
      userId,
      action: 'opportunity.created',
      entityType: 'opportunity',
      entityId: opportunity.id,
      metadata: {
        publicId: opportunity.publicId,
        customerId: opportunity.customerId,
        estValue: opportunity.estValue,
      },
    });

    return opportunity;
  },
};

/**
 * Generate a public ID for opportunities
 */
function generatePublicId(): string {
  const rand = crypto.randomBytes(8).toString('hex');
  return `opp_${rand}`;
}

