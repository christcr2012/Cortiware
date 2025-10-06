import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assertOwnerOr403 } from "@/lib/auth-owner";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const requestedOrgId = url.searchParams.get("orgId") || undefined;
  const jar = await cookies();
  const userIdent = jar.get("rs_user")?.value || jar.get("mv_user")?.value;
  const guard = await assertOwnerOr403(userIdent, requestedOrgId || undefined);
  if (!guard.ok) return NextResponse.json({ ok:false, error: guard.error }, { status: guard.status });

  const items = await prisma.payment.findMany({
    where: { orgId: guard.orgId },
    orderBy: { receivedAt: "desc" as any },
    take: 50,
    select: { id: true, invoiceId: true, amount: true, status: true, method: true, receivedAt: true },
  });
  const payments = items.map(p => ({
    id: p.id,
    invoiceId: p.invoiceId,
    status: p.status,
    method: p.method,
    receivedAt: p.receivedAt?.toISOString() ?? null,
    amountCents: Math.round(parseFloat(p.amount.toString()) * 100),
  }));
  return NextResponse.json({ ok:true, payments });
}

