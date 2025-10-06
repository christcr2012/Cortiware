import { NextRequest } from "next/server";
import { exportInvoiceHtml } from "@/services/provider/invoices.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const p = await ctx.params;
  const html = await exportInvoiceHtml(p.id);
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

