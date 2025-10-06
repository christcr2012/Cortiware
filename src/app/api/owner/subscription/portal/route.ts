import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { openCustomerPortal } from "@/services/owner/subscription.service";
import { assertOwnerOr403 } from "@/lib/auth-owner";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const requestedOrgId = body?.orgId as string | undefined;
  const returnUrl = (body?.returnUrl as string | undefined) ?? `${new URL(req.url).origin}/owner/subscription`;

  // Resolve current user and verify owner; derive orgId when not provided
  const jar = await cookies();
  const userIdent = jar.get("rs_user")?.value || jar.get("mv_user")?.value;
  const guard = await assertOwnerOr403(userIdent, requestedOrgId);
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.error }, { status: guard.status });
  const orgId = guard.orgId;

  try {
    // Ensure org exists (defensive)
    const org = await prisma.org.findUnique({ where: { id: orgId! }, select: { id: true } });
    if (!org) return NextResponse.json({ ok: false, error: "org_not_found" }, { status: 404 });

    const { url } = await openCustomerPortal(orgId!, returnUrl);
    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}

