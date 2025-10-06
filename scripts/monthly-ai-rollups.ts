#!/usr/bin/env tsx
/**
 * Monthly AI Rollups Job
 * 
 * Aggregates AiUsageEvent records into AiMonthlySummary for consistency and performance.
 * Should be run monthly (first day of month) via cron or scheduled task.
 * 
 * Usage:
 *   npx tsx scripts/monthly-ai-rollups.ts
 *   npx tsx scripts/monthly-ai-rollups.ts --dry-run
 *   npx tsx scripts/monthly-ai-rollups.ts --month=2025-01
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface MonthlyRollup {
  orgId: string;
  monthKey: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: Prisma.Decimal;
  creditsUsed: number;
  callCount: number;
}

function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getMonthRange(monthKey: string): { start: Date; end: Date } {
  const [year, month] = monthKey.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

async function aggregateMonthlyUsage(monthKey: string): Promise<MonthlyRollup[]> {
  const { start, end } = getMonthRange(monthKey);

  console.log(`[AI Rollups] Aggregating usage for ${monthKey} (${start.toISOString()} to ${end.toISOString()})`);

  // Get all AI usage events for the month
  const events = await prisma.aiUsageEvent.findMany({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
    select: {
      orgId: true,
      tokensIn: true,
      tokensOut: true,
      costUsd: true,
      creditsUsed: true,
    },
  });

  console.log(`[AI Rollups] Found ${events.length} events for ${monthKey}`);

  // Group by orgId
  const rollups = new Map<string, MonthlyRollup>();

  for (const event of events) {
    const existing = rollups.get(event.orgId) || {
      orgId: event.orgId,
      monthKey,
      tokensIn: 0,
      tokensOut: 0,
      costUsd: new Prisma.Decimal(0),
      creditsUsed: 0,
      callCount: 0,
    };

    existing.tokensIn += event.tokensIn;
    existing.tokensOut += event.tokensOut;
    existing.costUsd = existing.costUsd.plus(event.costUsd);
    existing.creditsUsed += event.creditsUsed;
    existing.callCount += 1;

    rollups.set(event.orgId, existing);
  }

  return Array.from(rollups.values());
}

async function upsertMonthlySummary(rollup: MonthlyRollup, dryRun: boolean): Promise<void> {
  const org = await prisma.org.findUnique({
    where: { id: rollup.orgId },
    select: { id: true, name: true },
  });

  if (!org) {
    console.error(`[AI Rollups] Org ${rollup.orgId} not found`);
    return;
  }

  console.log(
    `[AI Rollups] ${org.name}: ${rollup.callCount} calls, ${rollup.tokensIn + rollup.tokensOut} tokens, $${rollup.costUsd.toString()}, ${rollup.creditsUsed} credits`
  );

  if (dryRun) {
    console.log('[AI Rollups] DRY RUN - No changes made');
    return;
  }

  // Upsert monthly summary
  await prisma.aiMonthlySummary.upsert({
    where: {
      orgId_monthKey: {
        orgId: rollup.orgId,
        monthKey: rollup.monthKey,
      },
    },
    create: {
      orgId: rollup.orgId,
      monthKey: rollup.monthKey,
      tokensIn: rollup.tokensIn,
      tokensOut: rollup.tokensOut,
      costUsd: rollup.costUsd,
      creditsUsed: rollup.creditsUsed,
      callCount: rollup.callCount,
    },
    update: {
      tokensIn: rollup.tokensIn,
      tokensOut: rollup.tokensOut,
      costUsd: rollup.costUsd,
      creditsUsed: rollup.creditsUsed,
      callCount: rollup.callCount,
    },
  });
}

async function processMonthlyRollups(monthKey: string, dryRun: boolean = false) {
  console.log('[AI Rollups] Starting monthly AI rollups job...');
  console.log(`[AI Rollups] Month: ${monthKey}`);
  console.log(`[AI Rollups] Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);

  const rollups = await aggregateMonthlyUsage(monthKey);
  console.log(`[AI Rollups] Generated ${rollups.length} rollups`);

  let processed = 0;

  for (const rollup of rollups) {
    try {
      await upsertMonthlySummary(rollup, dryRun);
      processed++;
    } catch (error: any) {
      console.error(`[AI Rollups] Error processing rollup for org ${rollup.orgId}:`, error.message);
    }
  }

  console.log(`[AI Rollups] Completed: ${processed} rollups processed`);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  
  // Get month from args or default to previous month
  const monthArg = process.argv.find((arg) => arg.startsWith('--month='));
  let monthKey: string;

  if (monthArg) {
    monthKey = monthArg.split('=')[1];
  } else {
    // Default to previous month
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    monthKey = getMonthKey(prevMonth);
  }

  try {
    await processMonthlyRollups(monthKey, dryRun);
    console.log('[AI Rollups] Job completed successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('[AI Rollups] Job failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

