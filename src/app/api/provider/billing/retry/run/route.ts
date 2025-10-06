import { NextRequest, NextResponse } from "next/server";
import { runDunningCycle } from "@/services/provider/dunning.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const limit = typeof body.limit === 'number' ? Math.max(1, Math.min(50, body.limit)) : 10;
  const summary = await runDunningCycle(limit);
  return NextResponse.json({ ok: true, summary });
}

