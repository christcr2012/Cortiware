import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logEmergencyAccess } from '@/lib/audit-log';
import { buildCookieHeader } from '@cortiware/auth-service';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  const form = await req.formData().catch(() => null);
  const body = !form ? await req.json().catch(() => ({} as any)) : null;
  const tenantId = form ? String(form.get('tenantId') ?? '') : String(body?.tenantId ?? '');

  // Require emergency cookie
  const roleCookie = req.headers.get('cookie') || '';
  const isEmergency = /(?:^|;\s*)rs_emergency=1(?:;|$)/.test(roleCookie);
  const providerEmail = /(?:^|;\s*)rs_provider=([^;]+)/.exec(roleCookie)?.[1];
  const developerEmail = /(?:^|;\s*)rs_developer=([^;]+)/.exec(roleCookie)?.[1];

  if (!isEmergency || (!providerEmail && !developerEmail)) {
    return NextResponse.redirect(new URL('/emergency/provider?error=unauthorized', url), 303);
  }

  if (!tenantId) {
    return NextResponse.redirect(new URL('/emergency/tenants?error=missing', url), 303);
  }

  // Validate tenant exists
  const org = await prisma.org.findUnique({ where: { id: tenantId }, select: { id: true, name: true } });
  if (!org) {
    return NextResponse.redirect(new URL('/emergency/tenants?error=invalid', url), 303);
  }

  // Audit
  await logEmergencyAccess(providerEmail ? 'provider' : 'developer', decodeURIComponent(providerEmail || developerEmail || ''), ipAddress, userAgent, {
    isDirectAccess: true,
    tenantId: org.id,
  });

  // Set cookie and redirect to dashboard
  const res = NextResponse.redirect(new URL('/emergency/dashboard', url), 303);
  const tenantCookie = buildCookieHeader({ name: 'rs_active_tenant', value: org.id, maxAge: 1800, sameSite: 'Strict' });
  res.headers.append('Set-Cookie', tenantCookie);
  return res;
}

