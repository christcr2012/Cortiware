import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const invoiceId: string | undefined = body?.invoiceId;
  if (!invoiceId) return NextResponse.json({ ok: false, error: "Missing invoiceId" }, { status: 400 });

  // Log an intent; actual retry will be executed by a background job or manual trigger once a payment method is on file
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { id: true, orgId: true, status: true } });
  if (!invoice) return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });

  await prisma.activity.create({
    data: {
      orgId: invoice.orgId,
      actorType: "provider",
      entityType: "invoice",
      entityId: invoice.id,
      action: "payment.retry.requested",
      meta: { requestedAt: new Date().toISOString() },
    },
  });

  return NextResponse.json({ ok: true });
}

