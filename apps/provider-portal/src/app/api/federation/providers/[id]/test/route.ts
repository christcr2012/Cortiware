/**
 * Provider Connection Test API Endpoint
 * 
 * Tests connectivity to a provider integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compose, withProviderAuth, withAuditLog } from '@/lib/api/middleware';

async function postHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get provider details
    const provider = await prisma.providerIntegration.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        enabled: true,
      },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    if (!provider.enabled) {
      return NextResponse.json(
        { success: false, message: 'Provider is disabled' },
        { status: 400 }
      );
    }

    // Perform connection test based on provider type
    let testResult = { success: false, message: 'Test not implemented for this provider type' };

    try {
      if (provider.url) {
        // Simple HTTP connectivity test
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(provider.url, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok || response.status === 405) {
          // 405 Method Not Allowed is acceptable - means server is reachable
          testResult = {
            success: true,
            message: `Connection successful (HTTP ${response.status})`,
          };
        } else {
          testResult = {
            success: false,
            message: `Connection failed (HTTP ${response.status})`,
          };
        }
      } else {
        testResult = {
          success: false,
          message: 'No URL configured for this provider',
        };
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        testResult = {
          success: false,
          message: 'Connection timeout (5s)',
        };
      } else {
        testResult = {
          success: false,
          message: `Connection error: ${(error as Error).message}`,
        };
      }
    }

    // Update provider with test results
    await prisma.providerIntegration.update({
      where: { id },
      data: {
        healthStatus: testResult.success ? 'healthy' : 'down',
        lastHealthCheckAt: new Date(),
      },
    });

    return NextResponse.json(testResult);
  } catch (error) {
    console.error('Provider test error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = compose(withProviderAuth(), withAuditLog())(postHandler);

