// Organizations service - handles CRUD operations for Customer entities
// NOTE: "organizations" in the API refers to Customer entities (companies/clients)
import { prisma } from '@/lib/prisma';
import type { OrganizationCreateInput } from '@/lib/validation/organizations';
import { logMonetizationChange } from './audit-log.service';
import crypto from 'crypto';

export const organizationService = {
  /**
   * List customers (organizations) for an organization with pagination and search
   */
  async list(
    orgId: string,
    params: {
      q?: string;
      cursor?: string;
      limit?: number;
    } = {}
  ) {
    const { q, cursor, limit = 20 } = params;

    const where: any = { orgId };

    // Search by company or primaryName
    if (q) {
      where.OR = [
        { company: { contains: q, mode: 'insensitive' } },
        { primaryName: { contains: q, mode: 'insensitive' } },
        { primaryEmail: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Cursor pagination
    const cursorClause = cursor ? { cursor: { id: cursor }, skip: 1 } : {};

    // Fetch limit + 1 to determine if there's a next page
    const items = await prisma.customer.findMany({
      where,
      ...cursorClause,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
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
   * Create a new customer (organization)
   */
  async create(orgId: string, userId: string, input: OrganizationCreateInput) {
    const { company, primaryName, primaryEmail, primaryPhone, notes } = input;

    // Generate publicId
    const publicId = generatePublicId();

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        orgId,
        publicId,
        company,
        primaryName,
        primaryEmail: primaryEmail ? normalizeEmail(primaryEmail) : null,
        primaryPhone,
        notes,
      },
    });

    // Audit log
    await logMonetizationChange({
      orgId,
      userId,
      action: 'customer.created',
      entityType: 'customer',
      entityId: customer.id,
      metadata: {
        publicId: customer.publicId,
        company: customer.company,
        primaryEmail: customer.primaryEmail,
      },
    });

    return customer;
  },
};

/**
 * Generate a public ID for customers
 */
function generatePublicId(): string {
  const rand = crypto.randomBytes(8).toString('hex');
  return `cust_${rand}`;
}

/**
 * Normalize email to lowercase and trim
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

