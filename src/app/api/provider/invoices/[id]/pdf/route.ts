import { NextRequest } from "next/server";
import { exportInvoicePdfBuffer } from "@/services/provider/invoices.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const buf = await exportInvoicePdfBuffer(id);
  const bytes = new Uint8Array(buf);
  return new Response(bytes, {
    status: 200,
    headers: { "content-type": "application/pdf" },
  });
}

