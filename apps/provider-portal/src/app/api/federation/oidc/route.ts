import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth, withRateLimit } from '@/lib/api/middleware';
import { withAudit } from '@/lib/api/audit-middleware';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.FED_HMAC_MASTER_KEY || 'default-key-change-in-production';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const getHandler = async (req: NextRequest) => {
  try {
    const config = await prisma.oIDCConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      return jsonOk({ config: null });
    }

    // Return config without decrypted secret
    const { clientSecret, ...safeConfig } = config;
    return jsonOk({ config: { ...safeConfig, clientSecret: '***' } });
  } catch (error) {
    console.error('Error fetching OIDC config:', error);
    return jsonError(500, 'internal_error', 'Failed to fetch OIDC config');
  }
};

const postHandler = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { enabled, issuerUrl, clientId, clientSecret, scopes } = body;

    if (!issuerUrl || !clientId || !clientSecret) {
      return jsonError(400, 'invalid_request', 'issuerUrl, clientId, and clientSecret are required');
    }

    // Encrypt client secret
    const encryptedSecret = encrypt(clientSecret);

    // Delete existing config (only one allowed)
    await prisma.oIDCConfig.deleteMany({});

    const config = await prisma.oIDCConfig.create({
      data: {
        enabled: enabled ?? false,
        issuerUrl,
        clientId,
        clientSecret: encryptedSecret,
        scopes: scopes || 'openid profile email',
      },
    });

    const { clientSecret: _, ...safeConfig } = config;
    return jsonOk({ config: { ...safeConfig, clientSecret: '***' } });
  } catch (error) {
    console.error('Error creating OIDC config:', error);
    return jsonError(500, 'internal_error', 'Failed to create OIDC config');
  }
};

const patchHandler = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { enabled, issuerUrl, clientId, clientSecret, scopes } = body;

    const existing = await prisma.oIDCConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!existing) {
      return jsonError(404, 'not_found', 'OIDC config not found');
    }

    const updateData: any = {};
    if (enabled !== undefined) updateData.enabled = enabled;
    if (issuerUrl) updateData.issuerUrl = issuerUrl;
    if (clientId) updateData.clientId = clientId;
    if (clientSecret) updateData.clientSecret = encrypt(clientSecret);
    if (scopes) updateData.scopes = scopes;

    const config = await prisma.oIDCConfig.update({
      where: { id: existing.id },
      data: updateData,
    });

    const { clientSecret: _, ...safeConfig } = config;
    return jsonOk({ config: { ...safeConfig, clientSecret: '***' } });
  } catch (error) {
    console.error('Error updating OIDC config:', error);
    return jsonError(500, 'internal_error', 'Failed to update OIDC config');
  }
};

export const GET = compose(withProviderAuth(), withRateLimit('api'))(getHandler);
export const POST = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(postHandler, {
    action: 'create',
    entityType: 'oidc_config',
    actorType: 'provider',
    redactFields: ['clientSecret'],
  })
);
export const PATCH = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(patchHandler, {
    action: 'update',
    entityType: 'oidc_config',
    actorType: 'provider',
    redactFields: ['clientSecret'],
  })
);

