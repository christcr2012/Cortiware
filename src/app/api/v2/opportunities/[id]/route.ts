import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withRateLimit, withTenantAuth, withIdempotencyRequired } from '@/lib/api/middleware';
import { validateOpportunityUpdate } from '@/lib/validation/opportunities';

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

const guardPut = compose(withRateLimit('api'), withIdempotencyRequired(), withTenantAuth());

export const PUT = guardPut(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const orgId = req.headers.get('x-org-id');
  if (!orgId) {
    return jsonError(401, 'Unauthorized', 'Missing org context');
  }

  const { id } = await params;

  try {
    // Check if opportunity exists and belongs to org
    const existing = await prisma.opportunity.findFirst({
      where: {
        id,
        customer: {
          orgId,
        },
      },
    });

    if (!existing) {
      return jsonError(404, 'Not Found', 'Opportunity not found');
    }

    const body = await req.json();
    const validation = validateOpportunityUpdate(body);

    if (!validation.ok) {
      return jsonError(400, 'Validation Error', validation.message);
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: validation.data,
      include: {
        customer: {
          select: {
            company: true,
            primaryName: true,
          },
        },
      },
    });

    return jsonOk(updated);
  } catch (error: any) {
    console.error('Error updating opportunity:', error);
    return jsonError(500, 'Internal Server Error', error.message);
  }
});

