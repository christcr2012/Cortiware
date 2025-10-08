import { withTenant } from './db.js';
export async function ensureCredits(tenant_id: string, feature:string, estimateCents:number){
  return await withTenant(tenant_id, async (q)=>{
    const rows = await q('SELECT available_cents FROM tenant_wallets WHERE tenant_id = current_setting('app.tenant_id')::uuid');
    const avail = rows?.[0]?.available_cents ?? 0;
    if (avail < estimateCents){
      return { ok:false, error:{ error:'PAYMENT_REQUIRED', feature, required_prepay_cents: estimateCents - avail, enable_path:`/provider/wallet/prepay?feature=${feature}&amount_cents=${estimateCents}` } };
    }
    return { ok:true };
  });
}
