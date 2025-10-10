/**
 * RBAC Middleware for Federation Routes
 * Enforces role-based access control for federation, monetization, and admin endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Federation-specific permissions
 */
export const FEDERATION_PERMS = {
  // Federation permissions
  FEDERATION_READ: 'federation:read',
  FEDERATION_WRITE: 'federation:write',
  FEDERATION_ADMIN: 'federation:admin',
  
  // Monetization permissions
  MONETIZATION_READ: 'monetization:read',
  MONETIZATION_WRITE: 'monetization:write',
  
  // Admin permissions
  ADMIN_READ: 'admin:read',
  ADMIN_WRITE: 'admin:write',
} as const;

export type FederationPermCode = typeof FEDERATION_PERMS[keyof typeof FEDERATION_PERMS];

/**
 * Role definitions with their permissions
 */
const ROLE_PERMISSIONS: Record<string, Set<string>> = {
  'provider_admin': new Set([
    FEDERATION_PERMS.FEDERATION_READ,
    FEDERATION_PERMS.FEDERATION_WRITE,
    FEDERATION_PERMS.FEDERATION_ADMIN,
    FEDERATION_PERMS.MONETIZATION_READ,
    FEDERATION_PERMS.MONETIZATION_WRITE,
    FEDERATION_PERMS.ADMIN_READ,
    FEDERATION_PERMS.ADMIN_WRITE,
  ]),
  'provider_analyst': new Set([
    FEDERATION_PERMS.FEDERATION_READ,
    FEDERATION_PERMS.MONETIZATION_READ,
    FEDERATION_PERMS.ADMIN_READ,
  ]),
  'developer': new Set([
    FEDERATION_PERMS.FEDERATION_READ,
    FEDERATION_PERMS.MONETIZATION_READ,
    FEDERATION_PERMS.ADMIN_READ,
  ]),
  'ai_dev': new Set([
    FEDERATION_PERMS.FEDERATION_READ,
    FEDERATION_PERMS.MONETIZATION_READ,
    FEDERATION_PERMS.ADMIN_READ,
  ]),
};

/**
 * Get user role from request headers or session
 */
export async function getUserRole(req: NextRequest): Promise<string | null> {
  // Check for role in federation headers (set by auth middleware)
  const roleHeader = req.headers.get('x-federation-role');
  if (roleHeader) {
    return roleHeader.toLowerCase();
  }

  // Check for actor in federation headers
  const actorHeader = req.headers.get('x-federation-actor');
  if (actorHeader) {
    // Look up user role from database
    const user = await prisma.user.findFirst({
      where: { email: actorHeader },
      select: { role: true },
    });
    return user?.role?.toLowerCase() || null;
  }

  return null;
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string, permission: FederationPermCode): boolean {
  const rolePerms = ROLE_PERMISSIONS[role.toLowerCase()];
  if (!rolePerms) return false;
  return rolePerms.has(permission);
}

/**
 * Middleware wrapper that enforces RBAC for federation routes
 *
 * @param requiredPermission - The permission required to access the route
 * @param handler - The route handler function
 * @returns Wrapped handler with RBAC enforcement
 */
export function withFederationRBAC<T = any>(
  requiredPermission: FederationPermCode,
  handler: (req: NextRequest, context: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: T): Promise<NextResponse> => {
    // Get user role
    const role = await getUserRole(req);

    if (!role) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if role has required permission
    if (!hasPermission(role, requiredPermission)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: `Role '${role}' does not have permission '${requiredPermission}'`
        },
        { status: 403 }
      );
    }

    // Permission granted - call handler
    return handler(req, context);
  };
}

/**
 * Middleware wrapper for read-only routes
 * Allows provider_admin, provider_analyst, developer, and ai_dev
 */
export function withFederationRead(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withFederationRBAC(FEDERATION_PERMS.FEDERATION_READ, handler);
}

/**
 * Middleware wrapper for write routes
 * Only allows provider_admin
 */
export function withFederationWrite(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withFederationRBAC(FEDERATION_PERMS.FEDERATION_WRITE, handler);
}

/**
 * Middleware wrapper for admin routes
 * Only allows provider_admin
 */
export function withFederationAdmin(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withFederationRBAC(FEDERATION_PERMS.FEDERATION_ADMIN, handler);
}

/**
 * Middleware wrapper for monetization read routes
 */
export function withMonetizationRead(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withFederationRBAC(FEDERATION_PERMS.MONETIZATION_READ, handler);
}

/**
 * Middleware wrapper for monetization write routes
 * Only allows provider_admin
 */
export function withMonetizationWrite(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withFederationRBAC(FEDERATION_PERMS.MONETIZATION_WRITE, handler);
}

/**
 * Middleware wrapper for admin read routes
 */
export function withAdminRead(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withFederationRBAC(FEDERATION_PERMS.ADMIN_READ, handler);
}

/**
 * Middleware wrapper for admin write routes
 * Only allows provider_admin
 */
export function withAdminWrite(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withFederationRBAC(FEDERATION_PERMS.ADMIN_WRITE, handler);
}

/**
 * Helper to check if current environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Enforce production write restrictions for developer/ai_dev roles
 * In production, developer and ai_dev roles cannot perform write operations
 * without an approval workflow
 */
export function withProductionWriteRestriction<T = any>(
  handler: (req: NextRequest, context: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: T): Promise<NextResponse> => {
    const role = await getUserRole(req);

    // In production, block write operations for developer/ai_dev roles
    if (isProduction() && role && ['developer', 'ai_dev'].includes(role.toLowerCase())) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Developer and AI-dev roles cannot perform write operations in production. An approval workflow is required.'
        },
        { status: 403 }
      );
    }

    return handler(req, context);
  };
}

