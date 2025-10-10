/**
 * Infrastructure Metrics Collection Cron Job
 *
 * Runs every 15 minutes to:
 * - Collect metrics from all infrastructure services
 * - Generate upgrade recommendations
 * - Check for alert conditions
 *
 * Secured with Bearer token authentication using CRON_SECRET
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client-provider';
import { InfrastructureMonitoringService } from '@/services/infrastructure';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }
    
    if (authHeader !== expectedAuth) {
      console.warn('Unauthorized cron job attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting infrastructure monitoring cycle...');

    // Initialize monitoring service
    const monitoring = new InfrastructureMonitoringService(prisma, {
      vercelToken: process.env.VERCEL_TOKEN,
      vercelTeamId: process.env.VERCEL_ORG_ID,
      vercelProjectIds: [
        process.env.VERCEL_PROJECT_ID_PROVIDER,
        process.env.VERCEL_PROJECT_ID_TENANT,
        process.env.VERCEL_PROJECT_ID_MARKETING_CORTIWARE,
        process.env.VERCEL_PROJECT_ID_MARKETING_ROBINSON,
      ].filter(Boolean) as string[],
      vercelKvUrl: process.env.KV_REST_API_URL || process.env.KV_URL,
      vercelKvToken: process.env.KV_REST_API_TOKEN || process.env.KV_TOKEN,
    });

    // Run full monitoring cycle
    const result = await monitoring.runMonitoringCycle();

    console.log('Monitoring cycle completed:', result);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metricsCollected: result.metricsCollected,
      recommendationsGenerated: result.recommendationsGenerated,
      alertsTriggered: result.alertsTriggered,
    });
  } catch (error) {
    console.error('Monitoring cycle failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Vercel cron jobs use GET requests
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max execution time

