import { Router } from 'express';
import { withTenant, query as db } from '../lib/db.js';
import { ensureCredits } from '../lib/wallet.js';
import { costFor, classifyTier } from '../../../packages/pricing/pricing-calculator.ts';

export function importRouter(){
  const r = Router();

  r.post('/import', async (req:any, res:any) => {
    const action = req.body?.action;
    if (!action) return res.status(400).json({ error:'missing action' });
    const tenant_id = (req.tenant_id || req.headers['x-tenant-id']);
    if (!tenant_id) return res.status(401).json({ error:'tenant required' });

    if (action==='analyze'){
      const tokensIn = 12000, tokensOut = 2000;
      const costs = costFor({ tokensIn, tokensOut, model:'gpt-4o-mini', infraCents: 2 });
      const [pricing] = await db('SELECT light_cents, standard_cents, complex_cents FROM provider_import_pricing WHERE id=1');
      const tier = classifyTier(tokensIn);
      const retail = tier==='light'? pricing.light_cents : tier==='standard'? pricing.standard_cents : pricing.complex_cents;

      const guard = await ensureCredits(String(tenant_id), 'ai.import_assistant', retail);
      if (!guard.ok) return res.status(402).json(guard.error);

      // create run
      const rows = await withTenant(String(tenant_id), async (q)=>{
        const ins = await q(`INSERT INTO imp_runs(tenant_id, entity_type, file_bucket, file_key, status,
                         est_tokens_in, est_tokens_out, est_ai_cents, est_infra_cents, est_retail_cents)
                         VALUES ($1,$2,$3,$4,'analyzed',$5,$6,$7,$8,$9) RETURNING id`, 
          [tenant_id, req.body.entityType||'unknown', req.body.file?.bucket||'uploads', req.body.file?.key||'unknown.csv',
           tokensIn, tokensOut, costs.ai_cents, costs.infra_cents, retail]);
        return ins.rows;
      });

      const runId = rows[0].id;
      // suggestions placeholder saved
      await withTenant(String(tenant_id), async (q)=>{
        await q(`INSERT INTO imp_suggestions(run_id, mappings_jsonb, transforms_jsonb, validations_jsonb, dedupe_jsonb, model, tokens_in, tokens_out, confidence_overall)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
                 [runId, JSON.stringify([{source:'Cust Name',target:'primary_name',confidence:0.93,why:'semantic synonym'}]),
                        JSON.stringify([{target:'email',rules:['lowercase','trim']}]),
                        JSON.stringify([{target:'phone',rules:['normalizePhone']}]),
                        JSON.stringify({}), 'gpt-4o-mini', tokensIn, tokensOut, 0.9]);
      });

      return res.json({ ok:true, importRunId: runId, suggestions: { mappings:[{ source:'Cust Name', target:'primary_name', confidence:0.93, why:'semantic synonym'}], transforms:[{ target:'email', rules:['lowercase','trim']}], validations:[{ target:'phone', rules:['normalizePhone']}] }, estimate_cents: costs.total_cents, retail_price_cents: retail, tier });
    }

    if (action==='map'){
      const runId = req.body.importRunId; if (!runId) return res.status(400).json({ error:'importRunId required' });
      await withTenant(String(tenant_id), async (q)=>{
        await q(`INSERT INTO imp_overrides(run_id, mappings_jsonb, transforms_jsonb, validations_jsonb, dedupe_jsonb, approved_at)
                 VALUES ($1,$2,$3,$4,$5, now()) 
                 ON CONFLICT (run_id) DO UPDATE SET mappings_jsonb=EXCLUDED.mappings_jsonb, transforms_jsonb=EXCLUDED.transforms_jsonb, validations_jsonb=EXCLUDED.validations_jsonb, dedupe_jsonb=EXCLUDED.dedupe_jsonb, approved_at=now()`,
                [runId, JSON.stringify(req.body.mappings||[]), JSON.stringify(req.body.transforms||[]), JSON.stringify(req.body.validations||[]), JSON.stringify(req.body.dedupe||{})]);
        await q(`UPDATE imp_runs SET status='mapped' WHERE id=$1`, [runId]);
      });
      return res.json({ ok:true, importRunId: runId });
    }

    if (action==='execute'){
      const runId = req.body.importRunId; if (!runId) return res.status(400).json({ error:'importRunId required' });
      // TODO: stream parse real file; here record a result row
      await withTenant(String(tenant_id), async (q)=>{
        await q(`INSERT INTO imp_results(run_id, inserted_count, updated_count, failed_count, errors_jsonb)
                 VALUES ($1,120,5,3,'[]'::jsonb)
                 ON CONFLICT (run_id) DO UPDATE SET inserted_count=120, updated_count=5, failed_count=3`,
                [runId]);
        await q(`INSERT INTO imp_costs(run_id, breakdown_jsonb) VALUES ($1, $2::jsonb)
                 ON CONFLICT (run_id) DO UPDATE SET breakdown_jsonb=EXCLUDED.breakdown_jsonb`,
                [runId, JSON.stringify({"ai_cents":7,"infra_cents":6})]);
        await q(`UPDATE imp_runs SET status='completed', finished_at=now(), cost_cents=est_retail_cents WHERE id=$1`, [runId]);
      });
      return res.json({ ok:true, importRunId: runId, result: { inserted: 120, updated: 5, failed: 3 } });
    }

    if (action==='status'){
      const runId = req.body.importRunId; if (!runId) return res.status(400).json({ error:'importRunId required' });
      const rows = await withTenant(String(tenant_id), async (q)=> (await q(`SELECT * FROM imp_runs WHERE id=$1`, [runId])).rows );
      if (!rows?.length) return res.sendStatus(404);
      return res.json(rows[0]);
    }

    if (action==='cancel'){
      const runId = req.body.importRunId; if (!runId) return res.status(400).json({ error:'importRunId required' });
      await withTenant(String(tenant_id), async (q)=>{ await q(`UPDATE imp_runs SET status='canceled' WHERE id=$1`, [runId]); });
      return res.json({ ok:true });
    }

    return res.status(400).json({ error:'unsupported action' });
  });

  return r;
}