// src/middleware/site-protection.ts
import { NextResponse, type NextRequest } from "next/server";

/**
 * Site Protection Middleware
 * 
 * Protects the entire site with a password during testing/development.
 * Enable by setting SITE_PROTECTION_ENABLED=true in environment variables.
 * 
 * Usage:
 * 1. Set SITE_PROTECTION_ENABLED=true in Vercel
 * 2. Set SITE_PROTECTION_PASSWORD=your-password in Vercel
 * 3. Visit any page, enter password
 * 4. Cookie is set for 24 hours
 * 5. To disable, set SITE_PROTECTION_ENABLED=false
 */

const PROTECTION_COOKIE_NAME = "site_access_granted";
const PROTECTION_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export function siteProtectionMiddleware(req: NextRequest) {
  // Check if site protection is enabled
  const isEnabled = process.env.SITE_PROTECTION_ENABLED === "true";
  
  if (!isEnabled) {
    return null; // Protection disabled, continue to next middleware
  }

  const { pathname } = req.nextUrl;

  // Always allow access to the unlock page and its API
  if (pathname === "/site-unlock" || pathname === "/api/site-unlock") {
    return null;
  }

  // Allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  ) {
    return null;
  }

  // Check if user has valid access cookie
  const accessCookie = req.cookies.get(PROTECTION_COOKIE_NAME);
  const expectedToken = process.env.SITE_PROTECTION_PASSWORD || "test123";
  
  if (accessCookie?.value === expectedToken) {
    return null; // Access granted, continue
  }

  // Redirect to unlock page
  const url = req.nextUrl.clone();
  url.pathname = "/site-unlock";
  url.searchParams.set("return", pathname);
  return NextResponse.redirect(url);
}

export function createAccessCookie(password: string) {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set(PROTECTION_COOKIE_NAME, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PROTECTION_COOKIE_MAX_AGE,
    path: "/",
  });
  
  return response;
}

