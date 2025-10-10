import { PrismaClient, Role } from '@prisma/client-provider';

const prisma = new PrismaClient();

/**
 * Returns true if an OWNER already exists for the org.
 */
export async function ownerExists(orgId: string): Promise<boolean> {
  const count = await prisma.user.count({ where: { orgId, role: 'OWNER' as any } });
  return count > 0;
}

/**
 * Ensure only a single OWNER per org. Throws if another owner exists.
 */
export async function assertSingleOwner(orgId: string): Promise<void> {
  if (await ownerExists(orgId)) {
    throw new Error('Each tenant may have only one Owner account.');
  }
}

/**
 * Creates an Owner for the org if one does not exist.
 * This function is idempotent.
 */
export async function createOwnerIfMissing(params: { orgId: string; email: string; name?: string; passwordHash?: string }) {
  const { orgId, email, name, passwordHash } = params;
  const existing = await prisma.user.findFirst({ where: { orgId, role: 'OWNER' as any } });
  if (existing) return existing;
  return prisma.user.create({ data: { orgId, email, name, role: 'OWNER' as any, passwordHash, isActive: true } });
}

