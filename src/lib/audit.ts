import type { NextApiRequest } from 'next';

export type AuditInput = {
  action: string;
  target?: string;
  targetId?: string;
  category?: string;
  details?: Record<string, any>;
};

/**
 * Minimal audit sink shim used by legacy Pages APIs during migration.
 * Replace with database-backed audit pipeline later.
 */
export async function auditAction(_req: NextApiRequest, input: AuditInput): Promise<void> {
  try {
    // eslint-disable-next-line no-console
    console.log('[audit]', input);
  } catch {}
}

