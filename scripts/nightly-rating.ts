#!/usr/bin/env tsx
/**
 * Nightly Rating Job
 * 
 * Processes unrated UsageMeter records and generates invoice line items.
 * Should be run nightly via cron or scheduled task.
 * 
 * Usage:
 *   npx tsx scripts/nightly-rating.ts
 *   npx tsx scripts/nightly-rating.ts --dry-run
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RatingConfig {
  meter: string;
  pricePerUnit: number; // In cents
  description: string;
}

// Rating configuration - in production, this would come from database or config
const RATING_CONFIG: RatingConfig[] = [
  { meter: 'api_calls', pricePerUnit: 1, description: 'API Calls' },
  { meter: 'storage_gb', pricePerUnit: 10, description: 'Storage (GB)' },
  { meter: 'emails_sent', pricePerUnit: 5, description: 'Emails Sent' },
  { meter: 'sms_sent', pricePerUnit: 15, description: 'SMS Sent' },
];

async function rateUsageMeter(meterId: string, config: RatingConfig, dryRun: boolean): Promise<number> {
  const meter = await prisma.usageMeter.findUnique({
    where: { id: meterId },
    include: { org: { select: { id: true, name: true } } },
  });

  if (!meter) {
    console.error(`[Rating] Meter ${meterId} not found`);
    return 0;
  }

  const amountCents = meter.quantity * config.pricePerUnit;

  console.log(
    `[Rating] ${meter.org.name} (${meter.orgId}): ${meter.quantity} ${config.meter} × $${config.pricePerUnit / 100} = $${amountCents / 100}`
  );

  if (dryRun) {
    console.log('[Rating] DRY RUN - No changes made');
    return amountCents;
  }

  // In production, this would create an invoice line item
  // For now, we just log the rating
  // TODO: Create invoice line item or add to pending invoice

  return amountCents;
}

async function processNightlyRating(dryRun: boolean = false) {
  console.log('[Rating] Starting nightly rating job...');
  console.log(`[Rating] Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);

  // Get all unrated meters
  const meters = await prisma.usageMeter.findMany({
    where: {
      // In production, add: rated: false
      // For now, process all meters from last 24 hours
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`[Rating] Found ${meters.length} meters to rate`);

  let totalRated = 0;
  let totalAmountCents = 0;

  for (const meter of meters) {
    const config = RATING_CONFIG.find((c) => c.meter === meter.meter);
    if (!config) {
      console.warn(`[Rating] No config for meter type: ${meter.meter}`);
      continue;
    }

    try {
      const amountCents = await rateUsageMeter(meter.id, config, dryRun);
      totalRated++;
      totalAmountCents += amountCents;
    } catch (error: any) {
      console.error(`[Rating] Error rating meter ${meter.id}:`, error.message);
    }
  }

  console.log(`[Rating] Completed: ${totalRated} meters rated, total: $${totalAmountCents / 100}`);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  try {
    await processNightlyRating(dryRun);
    console.log('[Rating] Job completed successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('[Rating] Job failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

