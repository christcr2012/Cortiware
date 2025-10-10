import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth, withRateLimit } from '@/lib/api/middleware';
import { withAudit } from '@/lib/api/audit-middleware';
import { prisma } from '@/lib/prisma';

const getHandler = async (req: NextRequest) => {
  try {
    const { searchParams } = req.nextUrl;
    const type = searchParams.get('type');
    const enabled = searchParams.get('enabled');

    const where: any = {};
    if (type) where.type = type;
    if (enabled !== null) where.enabled = enabled === 'true';

    const providers = await prisma.providerIntegration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return jsonOk({ providers });
  } catch (error) {
    console.error('Error listing provider integrations:', error);
    return jsonError(500, 'internal_error', 'Failed to list provider integrations');
  }
};

const postHandler = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { name, type, config, enabled } = body;

    if (!name || !type) {
      return jsonError(400, 'invalid_request', 'name and type are required');
    }

    if (!['oidc', 'saml', 'api_key'].includes(type)) {
      return jsonError(400, 'invalid_request', 'type must be one of: oidc, saml, api_key');
    }

    const provider = await prisma.providerIntegration.create({
      data: {
        name,
        type,
        config: config || {},
        enabled: enabled ?? true,
      },
    });

    return jsonOk({ provider });
  } catch (error) {
    console.error('Error creating provider integration:', error);
    return jsonError(500, 'internal_error', 'Failed to create provider integration');
  }
};

export const GET = compose(withProviderAuth(), withRateLimit('api'))(getHandler);
export const POST = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(postHandler, {
    action: 'create',
    entityType: 'provider_integration',
    actorType: 'provider',
  })
);

