// Federation Provider Services (Prisma-backed)
// Provides cross-tenant read access for provider portal

import { prisma } from '@/lib/prisma';

export type TenantSummary = {
  id: string;
  name: string;
  createdAt: string;
  userCount?: number;
  status?: string;
};

export interface ProviderFederationService {
  listTenants(params: { cursor?: string; limit?: number }): Promise<{ items: TenantSummary[]; nextCursor: string | null }>;
  getTenant(id: string): Promise<TenantSummary | null>;
}

export const providerFederationService: ProviderFederationService = {
  async listTenants(params) {
    const limit = Math.min(params.limit || 10, 100);
    const cursor = params.cursor;

    // Query orgs with cursor pagination
    const orgs = await prisma.org.findMany({
      where: cursor ? { createdAt: { lt: new Date(cursor) } } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Fetch one extra to determine if there's a next page
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: { users: true },
        },
      },
    });

    const hasMore = orgs.length > limit;
    const items = orgs.slice(0, limit);
    const nextCursor = hasMore ? items[items.length - 1].createdAt.toISOString() : null;

    return {
      items: items.map((org) => ({
        id: org.id,
        name: org.name,
        createdAt: org.createdAt.toISOString(),
        userCount: org._count.users,
      })),
      nextCursor,
    };
  },

  async getTenant(id) {
    const org = await prisma.org.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: { users: true },
        },
      },
    });

    if (!org) return null;

    return {
      id: org.id,
      name: org.name,
      createdAt: org.createdAt.toISOString(),
      userCount: org._count.users,
    };
  },
};

