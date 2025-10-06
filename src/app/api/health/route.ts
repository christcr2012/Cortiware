import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for uptime monitoring
 * Returns 200 if all systems operational, 503 if any critical system is down
 */
export async function GET() {
  const checks: Record<string, { status: 'healthy' | 'unhealthy'; message?: string }> = {};

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'healthy' };
  } catch (error) {
    checks.database = { status: 'unhealthy', message: String(error) };
  }

  // Check Redis/KV (if configured)
  if (process.env.REDIS_URL || process.env.KV_REST_API_URL) {
    try {
      // TODO: Add Redis ping when Redis is configured
      // await redis.ping();
      checks.cache = { status: 'healthy' };
    } catch (error) {
      checks.cache = { status: 'unhealthy', message: String(error) };
    }
  }

  // Check Stripe (if configured)
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const { isStripeConfigured } = await import('@/services/provider/stripe.service');
      checks.stripe = { status: isStripeConfigured() ? 'healthy' : 'unhealthy', message: isStripeConfigured() ? undefined : 'Not configured' };
    } catch (error) {
      checks.stripe = { status: 'unhealthy', message: String(error) };
    }
  }

  // Overall health status
  const allHealthy = Object.values(checks).every(c => c.status === 'healthy');
  const status = allHealthy ? 'healthy' : 'degraded';
  const httpStatus = allHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      checks,
    },
    { status: httpStatus }
  );
}

