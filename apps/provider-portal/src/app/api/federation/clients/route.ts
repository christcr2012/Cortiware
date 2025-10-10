import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth, withRateLimit } from '@/lib/api/middleware';
import { withAudit } from '@/lib/api/audit-middleware';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const getHandler = async (req: NextRequest) => {
  try {
    const { searchParams } = req.nextUrl;
    const planType = searchParams.get('planType');

    const where: any = {};
    if (planType) where.planType = planType;

    const clients = await prisma.federatedClient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orgId: true,
        name: true,
        contactEmail: true,
        planType: true,
        apiKeyId: true,
        webhookEndpoint: true,
        lastSeen: true,
        monthlyRevenue: true,
        convertedLeads: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return jsonOk({ clients });
  } catch (error) {
    console.error('Error listing federated clients:', error);
    return jsonError(500, 'internal_error', 'Failed to list clients');
  }
};

const postHandler = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { orgId, name, contactEmail, planType = 'free' } = body;

    if (!orgId || !name || !contactEmail) {
      return jsonError(400, 'invalid_request', 'orgId, name, and contactEmail are required');
    }

    // Check if client already exists
    const existing = await prisma.federatedClient.findUnique({
      where: { orgId },
    });

    if (existing) {
      return jsonError(409, 'conflict', 'Client with this orgId already exists');
    }

    // Generate API key ID
    const apiKeyId = `fck_${crypto.randomBytes(16).toString('hex')}`;

    // Create client
    const client = await prisma.federatedClient.create({
      data: {
        orgId,
        name,
        contactEmail,
        planType,
        apiKeyId,
      },
      select: {
        id: true,
        orgId: true,
        name: true,
        contactEmail: true,
        planType: true,
        apiKeyId: true,
        createdAt: true,
      },
    });

    return jsonOk({ client });
  } catch (error) {
    console.error('Error creating federated client:', error);
    return jsonError(500, 'internal_error', 'Failed to create client');
  }
};

export const GET = compose(withProviderAuth(), withRateLimit('api'))(getHandler);
export const POST = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(postHandler, {
    action: 'create',
    entityType: 'federated_client',
    actorType: 'provider',
    redactFields: ['apiKeyHash'],
  })
);

