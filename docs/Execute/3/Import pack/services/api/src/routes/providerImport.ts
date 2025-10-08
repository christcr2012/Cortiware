import { Router } from 'express';
import { query as db } from '../lib/db.js';

export function providerImportRouter(){
  const r = Router();

  r.get('/provider/import/metrics', async (_,res)=>{
    const rows = await db('SELECT to_char(day, 'YYYY-MM-DD') AS day, imports, ai_cents, infra_cents, billed_cents FROM provider_import_metrics ORDER BY day DESC LIMIT 90');
    res.json(rows);
  });

  r.get('/provider/import/pricing', async (_,res)=>{
    const [p] = await db('SELECT light_cents, standard_cents, complex_cents FROM provider_import_pricing WHERE id=1');
    res.json(p);
  });

  r.post('/provider/import/pricing', async (req,res)=>{
    const { light_cents, standard_cents, complex_cents } = req.body||{};
    const [p] = await db(`UPDATE provider_import_pricing SET
                            light_cents = COALESCE($1, light_cents),
                            standard_cents = COALESCE($2, standard_cents),
                            complex_cents = COALESCE($3, complex_cents),
                            updated_at = now()
                          WHERE id=1
                          RETURNING light_cents, standard_cents, complex_cents`, 
                          [light_cents, standard_cents, complex_cents]);
    res.json({ ok:true, pricing:p });
  });

  return r;
}