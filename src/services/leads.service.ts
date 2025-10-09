// Service-layer implementation for Leads
// Handles org scoping, pagination, deduplication, and audit logging

import { prisma } from '@/lib/prisma';
import { logMonetizationChange } from './audit-log.service';
import type { LeadCreateInput } from '@/lib/validation/leads';
import type { Lead as PrismaLead, LeadStatus, LeadSource } from '@prisma/client';
import crypto from 'node:crypto';

export type Lead = PrismaLead;

export interface LeadService {
  list(orgId: string, params: { q?: string; status?: string; sourceType?: string; cursor?: string; limit?: number }): Promise<{ items: Lead[]; nextCursor: string | null }>;
  create(orgId: string, userId: string, input: LeadCreateInput): Promise<{ id: string; publicId: string }>;
}

/**
 * Generate identity hash for deduplication
 * Uses email or phone (whichever is provided) to create a stable hash
 */
function generateIdentityHash(email?: string, phone?: string, company?: string, contactName?: string): string {
  const normalize = (s?: string) => (s ?? '').trim().toLowerCase();
  const key = [
    normalize(email),
    normalize(phone),
    normalize(company),
    normalize(contactName)
  ].filter(Boolean).join('|');

  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 24);
}

/**
 * Normalize email to lowercase and trim
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Generate a public ID for external references
 */
function generatePublicId(prefix: string): string {
  // Use crypto.randomBytes for better randomness than Math.random
  const randomPart = crypto.randomBytes(8).toString('hex');
  return `${prefix}_${randomPart}`;
}

export const leadService: LeadService = {
  async list(orgId: string, params: { q?: string; status?: string; sourceType?: string; cursor?: string; limit?: number }) {
    const { q, status, sourceType, cursor, limit = 20 } = params;

    // Build where clause with org scoping
    const where: any = { orgId };

    // Add search filter (searches company, contactName, email)
    if (q) {
      where.OR = [
        { company: { contains: q, mode: 'insensitive' } },
        { contactName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Add status filter
    if (status) {
      where.status = status as LeadStatus;
    }

    // Add sourceType filter
    if (sourceType) {
      where.sourceType = sourceType as LeadSource;
    }

    // Fetch with cursor pagination
    const items = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Fetch one extra to determine if there's a next page
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    // Determine next cursor
    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return { items: results, nextCursor };
  },

  async create(orgId: string, userId: string, input: LeadCreateInput) {
    const { email, phoneE164, company, contactName, ...rest } = input;

    // Generate identity hash for deduplication
    const identityHash = generateIdentityHash(email, phoneE164, company, contactName);

    // Check for existing lead with same identity
    const existing = await prisma.lead.findFirst({
      where: { orgId, identityHash },
    });

    if (existing) {
      // Return existing lead (idempotent behavior)
      return { id: existing.id, publicId: existing.publicId };
    }

    // Create new lead
    const lead = await prisma.lead.create({
      data: {
        orgId,
        publicId: generatePublicId('lead'),
        identityHash,
        email: email ? normalizeEmail(email) : null,
        phoneE164,
        company,
        contactName,
        status: 'NEW',
        sourceType: input.sourceType || 'MANUAL',
        systemGenerated: false,
        ...rest,
      },
    });

    // Audit log (using existing audit service pattern)
    await logMonetizationChange({
      entity: 'lead',
      orgId,
      actorUserId: userId,
      id: lead.id,
      action: 'create',
      newValue: { publicId: lead.publicId, company: lead.company, email: lead.email },
    });

    return { id: lead.id, publicId: lead.publicId };
  },
};

