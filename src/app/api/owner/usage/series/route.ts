import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assertOwnerOr403 } from "@/lib/auth-owner";
import { prisma } from "@/lib/prisma";

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const requestedOrgId = url.searchParams.get("orgId") || undefined;
  const days = Math.max(1, Math.min(90, parseInt(url.searchParams.get("days") || "30", 10)));

  const jar = await cookies();
  const userIdent = jar.get("rs_user")?.value || jar.get("mv_user")?.value;
  const guard = await assertOwnerOr403(userIdent, requestedOrgId || undefined);
  if (!guard.ok) return NextResponse.json({ ok:false, error: guard.error }, { status: guard.status });

  const end = startOfDay(new Date());
  const start = new Date(end); start.setDate(end.getDate() - (days - 1));

  const rows = await prisma.usageMeter.findMany({
    where: { orgId: guard.orgId, windowStart: { gte: start, lte: end } },
    select: { windowStart: true, quantity: true },
    orderBy: { windowStart: "asc" as any },
    take: 5000,
  });
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = startOfDay(r.windowStart).toISOString().slice(0,10);
    map.set(key, (map.get(key) || 0) + Number(r.quantity || 0));
  }
  // Build full series with zeros for missing days
  const series: Array<{ date: string; total: number }> = [];
  for (let i=0;i<days;i++){
    const d = new Date(start); d.setDate(start.getDate()+i);
    const key = d.toISOString().slice(0,10);
    series.push({ date: key, total: map.get(key) || 0 });
  }
  return NextResponse.json({ ok:true, series });
}

