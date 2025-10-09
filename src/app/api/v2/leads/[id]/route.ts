import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withRateLimit, withTenantAuth, withIdempotencyRequired } from '@/lib/api/middleware';
import { validateLeadUpdate } from '@/lib/validation/leads';

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

const guardPut = compose(withRateLimit('api'), withIdempotencyRequired(), withTenantAuth());

export const PUT = guardPut(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const orgId = req.headers.get('x-org-id');
  if (!orgId) {
    return jsonError(401, 'Unauthorized', 'Missing org context');
  }

  const { id } = await params;

  try {
    // Check if lead exists and belongs to org
    const existing = await prisma.lead.findFirst({
      where: { id, orgId },
    });

    if (!existing) {
      return jsonError(404, 'Not Found', 'Lead not found');
    }

    const body = await req.json();
    const validation = validateLeadUpdate(body);

    if (!validation.ok) {
      return jsonError(400, 'Validation Error', validation.message);
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: validation.data,
    });

    return jsonOk(updated);
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return jsonError(500, 'Internal Server Error', error.message);
  }
});

