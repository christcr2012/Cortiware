// Service-layer contract for Leads
// Decouples App Router handlers from Prisma specifics.
// TODO(sonnet): Implement using Prisma with org scoping, pagination, dedupe, idempotency.

import type { LeadCreateInput } from '@/lib/validation/leads';

export type Lead = { id: string };

export interface LeadService {
  list(orgId: string, params: { q?: string; status?: string; cursor?: string; limit?: number }): Promise<{ items: Lead[]; nextCursor: string | null }>;
  create(orgId: string, userId: string, input: LeadCreateInput): Promise<{ id: string }>;
}

export const leadService: LeadService = {
  async list(_orgId, _params) {
    // TODO(sonnet): Prisma query with org scoping, search, and cursor pagination
    throw new Error('Not implemented');
  },
  async create(_orgId, _userId, _input) {
    // TODO(sonnet): Prisma create with dedupe by (orgId, email/phone) and idempotency handling
    throw new Error('Not implemented');
  },
};

