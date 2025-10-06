#!/usr/bin/env tsx
/**
 * Dunning Retries Job
 * 
 * Retries failed payments and sends dunning notifications.
 * Should be run daily via cron or scheduled task.
 * 
 * Usage:
 *   npx tsx scripts/dunning-retries.ts
 *   npx tsx scripts/dunning-retries.ts --dry-run
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RETRY_DELAYS = [1, 3, 7, 14]; // Days after failure to retry

async function findFailedPayments() {
  // Find invoices with no successful payments (unpaid)
  // In production, Payment model should have a status field
  // For now, find invoices from last 30 days with no payments
  const now = new Date();
  const unpaidInvoices = await prisma.invoice.findMany({
    where: {
      issuedAt: {
        gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      payments: {
        none: {},
      },
    },
    include: {
      org: {
        select: { id: true, name: true },
      },
    },
    orderBy: { issuedAt: 'asc' },
  });

  return unpaidInvoices;
}

async function retryPayment(invoiceId: string, dryRun: boolean): Promise<boolean> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      org: { select: { id: true, name: true } },
    },
  });

  if (!invoice) {
    console.error(`[Dunning] Invoice ${invoiceId} not found`);
    return false;
  }

  console.log(
    `[Dunning] Retrying payment for invoice ${invoice.id} for ${invoice.org.name}`
  );

  if (dryRun) {
    console.log('[Dunning] DRY RUN - No retry attempted');
    return false;
  }

  // In production, this would:
  // 1. Call payment processor API to retry charge
  // 2. Create Payment record if successful
  // 3. Send notification to customer
  // 4. Update retry count and last retry timestamp

  // For now, just log
  console.log('[Dunning] TODO: Implement payment retry logic');

  return false;
}

async function sendDunningNotification(orgId: string, invoiceId: string, attemptNumber: number, dryRun: boolean) {
  const org = await prisma.org.findUnique({
    where: { id: orgId },
    select: { id: true, name: true },
  });

  if (!org) {
    console.error(`[Dunning] Org ${orgId} not found`);
    return;
  }

  console.log(`[Dunning] Sending notification to ${org.name} (attempt ${attemptNumber})`);

  if (dryRun) {
    console.log('[Dunning] DRY RUN - No notification sent');
    return;
  }

  // In production, this would:
  // 1. Send email to org owner(s)
  // 2. Create in-app notification
  // 3. Log to Activity feed
  // 4. Escalate if final attempt
  
  console.log('[Dunning] TODO: Implement dunning notification logic');
}

async function processDunningRetries(dryRun: boolean = false) {
  console.log('[Dunning] Starting dunning retries job...');
  console.log(`[Dunning] Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);

  const unpaidInvoices = await findFailedPayments();
  console.log(`[Dunning] Found ${unpaidInvoices.length} unpaid invoices`);

  let retriesAttempted = 0;
  let notificationsSent = 0;

  for (const invoice of unpaidInvoices) {
    try {
      // Calculate days since invoice issuance
      const daysSinceIssuance = Math.floor(
        (Date.now() - invoice.issuedAt.getTime()) / (24 * 60 * 60 * 1000)
      );

      // Check if we should retry today
      const shouldRetry = RETRY_DELAYS.includes(daysSinceIssuance);

      if (shouldRetry) {
        const attemptNumber = RETRY_DELAYS.indexOf(daysSinceIssuance) + 1;

        // Attempt retry
        const success = await retryPayment(invoice.id, dryRun);
        retriesAttempted++;

        if (!success) {
          // Send dunning notification
          await sendDunningNotification(invoice.orgId, invoice.id, attemptNumber, dryRun);
          notificationsSent++;
        }
      }
    } catch (error: any) {
      console.error(`[Dunning] Error processing invoice ${invoice.id}:`, error.message);
    }
  }

  console.log(`[Dunning] Completed: ${retriesAttempted} retries attempted, ${notificationsSent} notifications sent`);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  try {
    await processDunningRetries(dryRun);
    console.log('[Dunning] Job completed successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('[Dunning] Job failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

