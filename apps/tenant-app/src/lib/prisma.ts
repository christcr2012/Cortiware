/**
 * Prisma Client for tenant-app
 * 
 * Phase 1: References provider-portal's Prisma schema
 * Phase 2: Will migrate to shared packages/db
 */

import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

