import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withRateLimit, withTenantAuth, withIdempotencyRequired } from '@/lib/api/middleware';
import { validateOrganizationUpdate } from '@/lib/validation/organizations';

const guardGet = compose(withRateLimit('api'), withTenantAuth());

export const GET = guardGet(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const orgId = req.headers.get('x-org-id');
  if (!orgId) {
    return jsonError(401, 'Unauthorized', 'Missing org context');
  }

  const { id } = await params;

  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id,
        orgId,
      },
    });

    if (!customer) {
      return jsonError(404, 'Not Found', 'Organization not found');
    }

    return jsonOk(customer);
  } catch (error: any) {
    console.error('Error fetching organization:', error);
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
    // Check if organization exists and belongs to org
    const existing = await prisma.customer.findFirst({
      where: { id, orgId },
    });

    if (!existing) {
      return jsonError(404, 'Not Found', 'Organization not found');
    }

    const body = await req.json();
    const validation = validateOrganizationUpdate(body);

    if (!validation.ok) {
      return jsonError(400, 'Validation Error', validation.message);
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: validation.data,
    });

    return jsonOk(updated);
  } catch (error: any) {
    console.error('Error updating organization:', error);
    return jsonError(500, 'Internal Server Error', error.message);
  }
});

