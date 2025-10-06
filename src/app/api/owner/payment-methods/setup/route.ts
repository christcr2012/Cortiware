import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assertOwnerOr403 } from "@/lib/auth-owner";
import { createSetupIntentForOrg } from "@/services/owner/billing.service";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>({}));
  const jar = await cookies();
  const userIdent = jar.get("rs_user")?.value || jar.get("mv_user")?.value;
  const guard = await assertOwnerOr403(userIdent, body?.orgId as string | undefined);
  if (!guard.ok) return NextResponse.json({ ok:false, error: guard.error }, { status: guard.status });

  try {
    const { client_secret } = await createSetupIntentForOrg(guard.orgId!);
    return NextResponse.json({ ok:true, client_secret });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: String(e?.message || e) }, { status: 500 });
  }
}

