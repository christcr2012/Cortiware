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
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        orgId,
      },
    });

    if (!lead) {
      return jsonError(404, 'Not Found', 'Lead not found');
    }

    return jsonOk(lead);
  } catch (error: any) {
    console.error('Error fetching lead:', error);
    return jsonError(500, 'Internal Server Error', error.message);
  }
});

