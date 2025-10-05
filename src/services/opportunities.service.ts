// Service-layer contract for Opportunities
// Decouples App Router handlers from Prisma specifics.
// TODO(sonnet): Implement using Prisma with org scoping and pagination.

import type { OpportunityCreateInput } from '@/lib/validation/opportunities';

export type Opportunity = { id: string };

export interface OpportunityService {
  list(orgId: string, params: { q?: string; stage?: string; cursor?: string; limit?: number }): Promise<{ items: Opportunity[]; nextCursor: string | null }>;
  create(orgId: string, userId: string, input: OpportunityCreateInput): Promise<{ id: string }>;
}

export const opportunityService: OpportunityService = {
  async list(_orgId, _params) {
    // TODO(sonnet): Prisma query with org scoping, filtering by stage, cursor pagination
    throw new Error('Not implemented');
  },
  async create(_orgId, _userId, _input) {
    // TODO(sonnet): Prisma create with validation already performed at route layer
    throw new Error('Not implemented');
  },
};

