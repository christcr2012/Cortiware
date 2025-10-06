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

  const items = await prisma.invoice.findMany({
    where: { orgId: guard.orgId },
    orderBy: { issuedAt: "desc" as any },
    take: 25,
    select: { id: true, amount: true, status: true, issuedAt: true },
  });

  const invoices = items.map(i => ({
    id: i.id,
    status: i.status,
    issuedAt: i.issuedAt.toISOString(),
    amountCents: Math.round(parseFloat(i.amount.toString()) * 100),
  }));
  return NextResponse.json({ ok:true, invoices });
}

