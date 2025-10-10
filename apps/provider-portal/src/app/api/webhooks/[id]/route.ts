import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/webhooks/[id]
 * Update webhook registration (e.g., toggle active status)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { isActive } = body;

    const webhook = await prisma.webhookRegistration.update({
      where: { id },
      data: { enabled: isActive }, // DB field is 'enabled', UI uses 'isActive'
    });

    return NextResponse.json({
      success: true,
      webhook,
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update webhook' },
      { status: 500 }
    );
  }
}

