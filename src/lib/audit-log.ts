/**
 * Audit Logging System
 * 
 * Comprehensive audit trail for all authentication and security events.
 * Uses the UserLoginHistory table from Prisma schema.
 * 
 * Features:
 * - Login success/failure tracking
 * - IP address and user agent logging
 * - Device fingerprinting
 * - Security event classification
 * - Automatic cleanup of old logs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Event types for classification
export enum AuditEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE = 'PASSWORD_RESET_COMPLETE',
  TOTP_ENABLED = 'TOTP_ENABLED',
  TOTP_DISABLED = 'TOTP_DISABLED',
  TOTP_VERIFIED = 'TOTP_VERIFIED',
  TOTP_FAILED = 'TOTP_FAILED',
  RECOVERY_CODE_USED = 'RECOVERY_CODE_USED',
  BREAKGLASS_ACTIVATED = 'BREAKGLASS_ACTIVATED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// Severity levels
export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

interface AuditLogParams {
  userId?: string;
  email: string;
  eventType: AuditEventType;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an authentication event
 */
export async function logAuthEvent(params: AuditLogParams): Promise<void> {
  try {
    // Determine severity based on event type
    const severity = getSeverity(params.eventType, params.success);

    // If userId is provided, log to database
    if (params.userId) {
      await prisma.userLoginHistory.create({
        data: {
          userId: params.userId,
          success: params.success,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          deviceFingerprint: params.deviceFingerprint,
          failureReason: params.failureReason,
          metadata: params.metadata || {},
        },
      });
    }

    // Also log to console for immediate visibility
    const logLevel = severity === AuditSeverity.CRITICAL || severity === AuditSeverity.ERROR ? 'error' : 'log';
    console[logLevel]('[AUDIT]', {
      timestamp: new Date().toISOString(),
      eventType: params.eventType,
      severity,
      email: params.email,
      success: params.success,
      ipAddress: params.ipAddress,
      failureReason: params.failureReason,
    });
  } catch (error) {
    // Never let audit logging break the main flow
    console.error('[AUDIT] Failed to log event:', error);
  }
}

/**
 * Log a successful login
 */
export async function logLoginSuccess(
  userId: string,
  email: string,
  ipAddress: string,
  userAgent: string,
  method: string = 'password',
  deviceFingerprint?: string
): Promise<void> {
  await logAuthEvent({
    userId,
    email,
    eventType: AuditEventType.LOGIN_SUCCESS,
    success: true,
    method,
    ipAddress,
    userAgent,
    deviceFingerprint,
  });
}

/**
 * Log a failed login attempt
 */
export async function logLoginFailure(
  email: string,
  ipAddress: string,
  userAgent: string,
  reason: string,
  userId?: string
): Promise<void> {
  await logAuthEvent({
    userId,
    email,
    eventType: AuditEventType.LOGIN_FAILURE,
    success: false,
    ipAddress,
    userAgent,
    failureReason: reason,
  });
}

/**
 * Log a logout event
 */
export async function logLogout(
  userId: string,
  email: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await logAuthEvent({
    userId,
    email,
    eventType: AuditEventType.LOGOUT,
    success: true,
    ipAddress,
    userAgent,
  });
}

/**
 * Log a password change
 */
export async function logPasswordChange(
  userId: string,
  email: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await logAuthEvent({
    userId,
    email,
    eventType: AuditEventType.PASSWORD_CHANGE,
    success: true,
    ipAddress,
    userAgent,
  });
}

/**
 * Log TOTP verification
 */
export async function logTOTPVerification(
  userId: string,
  email: string,
  success: boolean,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await logAuthEvent({
    userId,
    email,
    eventType: success ? AuditEventType.TOTP_VERIFIED : AuditEventType.TOTP_FAILED,
    success,
    ipAddress,
    userAgent,
    failureReason: success ? undefined : 'Invalid TOTP code',
  });
}

/**
 * Log recovery code usage
 */
export async function logRecoveryCodeUsed(
  userId: string,
  email: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await logAuthEvent({
    userId,
    email,
    eventType: AuditEventType.RECOVERY_CODE_USED,
    success: true,
    ipAddress,
    userAgent,
  });
}

/**
 * Log breakglass activation
 */
export async function logBreakglassActivation(
  userId: string,
  email: string,
  ipAddress: string,
  userAgent: string,
  riskScore: number
): Promise<void> {
  await logAuthEvent({
    userId,
    email,
    eventType: AuditEventType.BREAKGLASS_ACTIVATED,
    success: true,
    ipAddress,
    userAgent,
    metadata: { riskScore },
  });
}

/**
 * Log rate limit exceeded
 */
export async function logRateLimitExceeded(
  email: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await logAuthEvent({
    email,
    eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
    success: false,
    ipAddress,
    userAgent,
    failureReason: 'Too many attempts',
  });
}

/**
 * Get recent login history for a user
 */
export async function getLoginHistory(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    return await prisma.userLoginHistory.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('[AUDIT] Failed to get login history:', error);
    return [];
  }
}

/**
 * Get failed login attempts for a user
 */
export async function getFailedLoginAttempts(
  userId: string,
  since: Date
): Promise<number> {
  try {
    return await prisma.userLoginHistory.count({
      where: {
        userId,
        success: false,
        timestamp: { gte: since },
      },
    });
  } catch (error) {
    console.error('[AUDIT] Failed to count failed attempts:', error);
    return 0;
  }
}

/**
 * Determine severity based on event type and success
 */
function getSeverity(eventType: AuditEventType, success: boolean): AuditSeverity {
  // Critical events
  if (eventType === AuditEventType.BREAKGLASS_ACTIVATED) {
    return AuditSeverity.CRITICAL;
  }

  if (eventType === AuditEventType.ACCOUNT_LOCKED) {
    return AuditSeverity.WARNING;
  }

  // Failed authentication attempts
  if (!success && (
    eventType === AuditEventType.LOGIN_FAILURE ||
    eventType === AuditEventType.TOTP_FAILED
  )) {
    return AuditSeverity.WARNING;
  }

  // Rate limiting
  if (eventType === AuditEventType.RATE_LIMIT_EXCEEDED) {
    return AuditSeverity.WARNING;
  }

  // Everything else is informational
  return AuditSeverity.INFO;
}

/**
 * Clean up old audit logs (run periodically)
 * Keeps logs for 90 days by default
 */
export async function cleanupOldAuditLogs(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.userLoginHistory.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
      },
    });

    console.log(`[AUDIT] Cleaned up ${result.count} old audit logs`);
    return result.count;
  } catch (error) {
    console.error('[AUDIT] Failed to cleanup old logs:', error);
    return 0;
  }
}

