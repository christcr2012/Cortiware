import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth, withRateLimit } from '@/lib/api/middleware';
import { withAudit } from '@/lib/api/audit-middleware';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const getHandler = async (req: NextRequest) => {
  try {
    const keys = await prisma.federationKey.findMany({
      where: { disabledAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orgId: true,
        keyId: true,
        createdAt: true,
      },
    });

    return jsonOk({ keys });
  } catch (error) {
    console.error('Error listing federation keys:', error);
    return jsonError(500, 'internal_error', 'Failed to list keys');
  }
};

const postHandler = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { orgId } = body;

    if (!orgId) {
      return jsonError(400, 'invalid_request', 'orgId is required');
    }

    // Generate key pair
    const keyId = `fed_${crypto.randomBytes(16).toString('hex')}`;
    const secret = crypto.randomBytes(32).toString('hex');
    const secretHash = await bcrypt.hash(secret, 10);

    const key = await prisma.federationKey.create({
      data: {
        orgId,
        keyId,
        secretHash,
      },
      select: {
        id: true,
        orgId: true,
        keyId: true,
        createdAt: true,
      },
    });

    // Return secret only once (never stored plaintext)
    return jsonOk({ key: { ...key, secret } });
  } catch (error) {
    console.error('Error creating federation key:', error);
    return jsonError(500, 'internal_error', 'Failed to create key');
  }
};

export const GET = compose(withProviderAuth(), withRateLimit('api'))(getHandler);
export const POST = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(postHandler, {
    action: 'create',
    entityType: 'federation_key',
    actorType: 'provider',
    redactFields: ['secret', 'secretHash'],
  })
);

