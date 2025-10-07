import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton for the Cortiware monorepo
 *
 * Usage (in apps/packages):
 *   import { prisma } from '@cortiware/db';
 */

declare global {
  // eslint-disable-next-line no-var
  var __cortiware_prisma__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__cortiware_prisma__ ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__cortiware_prisma__ = prisma;
}

export type { Prisma } from '@prisma/client';

