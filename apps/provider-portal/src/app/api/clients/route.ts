import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth } from '@/lib/api/middleware';

/**
 * GET /api/provider/clients
 * List all client organizations with pagination and filters
 */
const handler = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { users: { some: { email: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.org.count({ where });

    // Get paginated results
    const skip = (page - 1) * limit;
    const orgs = await prisma.org.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        },
        subscriptions: {
          select: {
            id: true,
            status: true,
            plan: true,
            priceCents: true,
            renewsAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    // Format response
    const items = orgs.map(org => {
      const subscription = org.subscriptions[0];
      return {
        id: org.id,
        name: org.name,
        userCount: org.users.length,
        subscription: subscription ? {
          plan: subscription.plan,
          status: subscription.status,
          price: `$${(subscription.priceCents / 100).toFixed(2)}/month`
        } : null,
        createdAt: org.createdAt.toISOString(),
        status: org.subscriptionStatus || 'active'
      };
    });

    return jsonOk({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error listing clients:', error);
    return jsonError(500, 'internal_error', 'Failed to list clients');
  }
};

export const GET = compose(withProviderAuth())(handler);

