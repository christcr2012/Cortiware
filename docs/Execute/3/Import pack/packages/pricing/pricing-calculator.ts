import modelPricing from './model_pricing.json' assert { type: 'json' };
export type ModelKey='gpt-4o-mini'|'gpt-4o';
export type Est={tokensIn:number;tokensOut:number;model:ModelKey;infraCents?:number};
export function costFor(est:Est){
  const p=(modelPricing as any).openai[est.model];
  const ai=Math.ceil(est.tokensIn*p.input_per_million_cents/1_000_000)+Math.ceil(est.tokensOut*p.output_per_million_cents/1_000_000);
  const infra=Math.ceil(est.infraCents??2);
  return { ai_cents:ai, infra_cents:infra, total_cents:ai+infra };
}
export function classifyTier(tokensIn:number){ return tokensIn<=8000?'light':(tokensIn<=25000?'standard':'complex'); }
