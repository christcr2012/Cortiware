import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assertOwnerOr403 } from "@/lib/auth-owner";
import { changePlanCheckout } from "@/services/owner/subscription.service";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { priceId, successUrl, cancelUrl, orgId: requestedOrgId } = body || {} as any;
  if (!priceId) return NextResponse.json({ ok:false, error: "priceId_required" }, { status: 400 });

  const jar = await cookies();
  const userIdent = jar.get("rs_user")?.value || jar.get("mv_user")?.value;
  const guard = await assertOwnerOr403(userIdent, requestedOrgId);
  if (!guard.ok) return NextResponse.json({ ok:false, error: guard.error }, { status: guard.status });

  try {
    const origin = new URL(req.url).origin;
    const { url } = await changePlanCheckout(
      guard.orgId!,
      priceId,
      successUrl || `${origin}/owner/subscription?status=changed`,
      cancelUrl || `${origin}/owner/subscription`
    );
    return NextResponse.json({ ok:true, url });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: String(e?.message || e) }, { status: 500 });
  }
}

