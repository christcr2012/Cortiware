/**
 * Prisma Client for tenant-app
 *
 * Phase 1: References provider-portal's Prisma schema
 * Phase 2: Will migrate to shared packages/db
 *
 * Note: Prisma client is generated from ../provider-portal/prisma/schema.prisma
 * during build via: prisma generate --schema=../provider-portal/prisma/schema.prisma
 */

import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Prisma client is generated from provider-portal's schema
export const prisma = global.prisma || new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

