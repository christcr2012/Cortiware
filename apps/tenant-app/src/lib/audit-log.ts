/**
 * Audit logging for tenant-app
 * Phase 1: Console logging with context tagging
 * Phase 2: Database logging
 */

export interface AuditContext {
  providerId?: string;
  developerId?: string;
  tenantId?: string;
  isDirectAccess?: boolean;
}

export async function logLoginSuccess(
  userId: string,
  email: string,
  ipAddress: string,
  userAgent: string,
  method: string,
  context?: AuditContext
): Promise<void> {
  const contextStr = context ? ` [${formatContext(context)}]` : '';
  console.log(`✅ LOGIN SUCCESS: ${email} (${userId}) from ${ipAddress} via ${method}${contextStr}`);
  // TODO: Write to database in Phase 2
}

export async function logLoginFailure(
  email: string,
  ipAddress: string,
  userAgent: string,
  reason: string,
  context?: AuditContext
): Promise<void> {
  const contextStr = context ? ` [${formatContext(context)}]` : '';
  console.log(`❌ LOGIN FAILURE: ${email} from ${ipAddress} - ${reason}${contextStr}`);
  // TODO: Write to database in Phase 2
}

export async function logEmergencyAccess(
  role: 'provider' | 'developer',
  email: string,
  ipAddress: string,
  userAgent: string,
  context?: AuditContext
): Promise<void> {
  const contextStr = context ? ` [${formatContext(context)}]` : '';
  console.warn(`🚨 EMERGENCY ACCESS: ${role} ${email} from ${ipAddress}${contextStr}`);
  // TODO: Write to database in Phase 2
}

export async function logAction(
  action: string,
  userId: string,
  email: string,
  ipAddress: string,
  details: string,
  context?: AuditContext
): Promise<void> {
  const contextStr = context ? ` [${formatContext(context)}]` : '';
  console.log(`📝 ACTION: ${action} by ${email} (${userId}) from ${ipAddress} - ${details}${contextStr}`);
  // TODO: Write to database in Phase 2
}

function formatContext(context: AuditContext): string {
  const parts: string[] = [];

  if (context.isDirectAccess) {
    parts.push('DIRECT_ACCESS');
  }

  if (context.providerId) {
    parts.push(`provider:${context.providerId}`);
  }

  if (context.developerId) {
    parts.push(`developer:${context.developerId}`);
  }

  if (context.tenantId) {
    parts.push(`tenant:${context.tenantId}`);
  }

  return parts.join(', ');
}

