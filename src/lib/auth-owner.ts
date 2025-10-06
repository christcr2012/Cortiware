import { prisma } from "@/lib/prisma";

// Returns true if the user is the Owner of the given org.
export async function isOwner(userId: string, orgId: string): Promise<boolean> {
  if (!userId || !orgId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, orgId: true, role: true } });
  if (!user) return false;
  return user.orgId === orgId && user.role === 'OWNER';
}

// Helper to guard API routes. Accepts user identifier (id or email) and optional orgId.
// On success returns { ok: true, userId, orgId } with derived orgId when omitted.
export async function assertOwnerOr403(userIdent: string | undefined, orgId?: string) {
  if (!userIdent) return { ok: false, status: 401, error: 'unauthorized' } as const;
  const user = await prisma.user.findFirst({
    where: { OR: [{ id: userIdent }, { email: userIdent }] },
    select: { id: true, orgId: true, role: true },
  });
  if (!user) return { ok: false, status: 401, error: 'unauthorized' } as const;
  const effectiveOrgId = orgId ?? user.orgId;
  if (user.role !== 'OWNER') return { ok: false, status: 403, error: 'forbidden' } as const;
  if (orgId && user.orgId !== orgId) return { ok: false, status: 403, error: 'forbidden' } as const;
  return { ok: true as const, userId: user.id, orgId: effectiveOrgId };
}

