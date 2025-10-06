import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exportUsageCsv } from "@/services/owner/usage.service";
import { assertOwnerOr403 } from "@/lib/auth-owner";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const requestedOrgId = url.searchParams.get("orgId") || undefined;

  const jar = await cookies();
  const userIdent = jar.get("rs_user")?.value || jar.get("mv_user")?.value;
  const guard = await assertOwnerOr403(userIdent, requestedOrgId || undefined);
  if (!guard.ok) return NextResponse.json({ ok: false, error: guard.error }, { status: guard.status });

  const csv = await exportUsageCsv(guard.orgId!);
  return new Response(csv, { status: 200, headers: { "content-type": "text/csv; charset=utf-8" } });
}

