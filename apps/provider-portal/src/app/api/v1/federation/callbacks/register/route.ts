import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, url, secret } = body;

    if (!orgId || !url || !secret) {
      return jsonError(400, 'missing_fields', 'Required fields: orgId, url, secret');
    }

    // Hash secret with SHA256
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');

    // Upsert webhook registration
    const registration = await prisma.webhookRegistration.upsert({
      where: { orgId },
      create: {
        orgId,
        url,
        secretHash,
        enabled: true,
      },
      update: {
        url,
        secretHash,
        enabled: true,
      },
    });

    return jsonOk({
      success: true,
      registrationId: registration.id,
    });
  } catch (error) {
    console.error('Error registering webhook:', error);
    return jsonError(500, 'internal_error', 'Failed to register webhook');
  }
}

