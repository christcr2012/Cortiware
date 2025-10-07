/**
 * Tenant-App Middleware
 * 
 * Handles:
 * - Authentication checks
 * - Route guards for single-tenant context
 * - Redirect unauthenticated users to login
 * - Block cross-tenant navigation in direct access mode
 */

import { NextRequest, NextResponse } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/emergency',
];

// Routes that are restricted in direct access mode
const CROSS_TENANT_ROUTES = [
  '/tenants', // List of all tenants
  '/switch-tenant', // Tenant switcher
  '/admin/tenants', // Tenant management
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // Check authentication
  const providerCookie = request.cookies.get('rs_provider');
  const developerCookie = request.cookies.get('rs_developer');
  const userCookie = request.cookies.get('rs_user');
  const accountantCookie = request.cookies.get('rs_accountant');
  const vendorCookie = request.cookies.get('rs_vendor');

  const isAuthenticated = !!(
    providerCookie ||
    developerCookie ||
    userCookie ||
    accountantCookie ||
    vendorCookie
  );

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Check for direct access mode
  const isDirectAccess = !!(providerCookie || developerCookie);

  // Block cross-tenant routes in direct access mode
  if (isDirectAccess && CROSS_TENANT_ROUTES.some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = '/403';
    url.searchParams.set('reason', 'cross-tenant-restricted');
    return NextResponse.redirect(url);
  }

  // Add auth context headers for downstream use
  const response = NextResponse.next();
  
  if (isDirectAccess) {
    response.headers.set('X-Auth-Mode', 'direct-access');
    response.headers.set('X-Auth-Role', providerCookie ? 'provider' : 'developer');
  } else {
    response.headers.set('X-Auth-Mode', 'normal');
    if (userCookie) response.headers.set('X-Auth-Role', 'tenant');
    if (accountantCookie) response.headers.set('X-Auth-Role', 'accountant');
    if (vendorCookie) response.headers.set('X-Auth-Role', 'vendor');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

