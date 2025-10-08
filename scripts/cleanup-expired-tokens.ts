/**
 * Cleanup Expired Refresh Tokens
 * 
 * Removes expired and revoked refresh tokens from the database
 * 
 * Usage:
 * - Run manually: npx tsx scripts/cleanup-expired-tokens.ts
 * - Run via cron: Add to crontab or use Vercel Cron Jobs
 * 
 * Recommended schedule: Daily at 2 AM
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupExpiredTokens() {
  console.log('🧹 Starting cleanup of expired refresh tokens...');

  try {
    // Delete expired tokens
    const expiredResult = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`✅ Deleted ${expiredResult.count} expired tokens`);

    // Delete revoked tokens older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revokedResult = await prisma.refreshToken.deleteMany({
      where: {
        revoked: true,
        revokedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    console.log(`✅ Deleted ${revokedResult.count} old revoked tokens`);

    const totalDeleted = expiredResult.count + revokedResult.count;
    console.log(`🎉 Cleanup complete! Total tokens deleted: ${totalDeleted}`);

    return totalDeleted;
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  cleanupExpiredTokens()
    .then((count) => {
      console.log(`✅ Cleanup successful: ${count} tokens removed`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
}

export { cleanupExpiredTokens };

