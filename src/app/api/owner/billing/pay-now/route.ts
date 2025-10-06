import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assertOwnerOr403 } from "@/lib/auth-owner";
import { createPayNowCheckoutSession } from "@/services/owner/billing.service";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>({}));
  const invoiceId = body?.invoiceId as string | undefined;
  const successUrl = (body?.successUrl as string | undefined) ?? `${new URL(req.url).origin}/owner/billing`;
  const cancelUrl = (body?.cancelUrl as string | undefined) ?? `${new URL(req.url).origin}/owner/billing`;

  const jar = await cookies();
  const userIdent = jar.get("rs_user")?.value || jar.get("mv_user")?.value;
  const guard = await assertOwnerOr403(userIdent, body?.orgId as string | undefined);
  if (!guard.ok) return NextResponse.json({ ok:false, error: guard.error }, { status: guard.status });
  if (!invoiceId) return NextResponse.json({ ok:false, error: 'invoiceId_required' }, { status: 400 });

  try {
    const { url } = await createPayNowCheckoutSession(guard.orgId!, invoiceId, successUrl, cancelUrl);
    return NextResponse.json({ ok:true, url });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: String(e?.message || e) }, { status: 500 });
  }
}

