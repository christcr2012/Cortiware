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

