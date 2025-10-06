import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assertOwnerOr403 } from "@/lib/auth-owner";
import { getTenantSubscription } from "@/services/owner/subscription.service";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const requestedOrgId = url.searchParams.get("orgId") || undefined;
  const jar = await cookies();
  const userIdent = jar.get("rs_user")?.value || jar.get("mv_user")?.value;
  const guard = await assertOwnerOr403(userIdent, requestedOrgId || undefined);
  if (!guard.ok) return NextResponse.json({ ok:false, error: guard.error }, { status: guard.status });
  const sub = await getTenantSubscription(guard.orgId);
  return NextResponse.json({ ok:true, subscription: sub });
}

