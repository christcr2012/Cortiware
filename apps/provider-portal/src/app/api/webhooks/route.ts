import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withFederationRead } from '@/lib/federation/rbac-middleware';

/**
 * GET /api/webhooks
 * List all webhook registrations
 */
export const GET = withFederationRead(async (req: NextRequest) => {
  try {
    const webhooks = await prisma.webhookRegistration.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      items: webhooks,
      total: webhooks.length,
    });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
});

