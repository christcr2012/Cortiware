/**
 * Prisma Client for tenant-app
 *
 * Uses tenant-specific Prisma client generated to @prisma/client-tenant
 * Schema: prisma/schema.prisma (root level)
 */

import { PrismaClient } from '@prisma/client-tenant';

declare global {
  var prisma: PrismaClient | undefined;
}

// Prisma client is generated from root schema (prisma/schema.prisma)
export const prisma = global.prisma || new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

