import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withRateLimit, withTenantAuth } from '@/lib/api/middleware';

const guardGet = compose(withRateLimit('api'), withTenantAuth());

export const GET = guardGet(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const orgId = req.headers.get('x-org-id');
  if (!orgId) {
    return jsonError(401, 'Unauthorized', 'Missing org context');
  }

  const { id } = await params;

  try {
    const opportunity = await prisma.opportunity.findFirst({
      where: {
        id,
        customer: {
          orgId,
        },
      },
      include: {
        customer: {
          select: {
            company: true,
            primaryName: true,
          },
        },
      },
    });

    if (!opportunity) {
      return jsonError(404, 'Not Found', 'Opportunity not found');
    }

    return jsonOk(opportunity);
  } catch (error: any) {
    console.error('Error fetching opportunity:', error);
    return jsonError(500, 'Internal Server Error', error.message);
  }
});

