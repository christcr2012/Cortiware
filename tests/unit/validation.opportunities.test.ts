import { validateOpportunityCreate } from '@/lib/validation/opportunities';

export async function run() {
  const name = 'validation.opportunities';
  let passed = 0, failed = 0, total = 0;
  function assert(cond: any, msg: string) {
    total++;
    if (cond) passed++; else { failed++; console.error(`[FAIL] ${name}: ${msg}`); }
  }

  // ok case
  assert(validateOpportunityCreate({ name: 'Deal A', stage: 'prospect', amount: 1000, closeDate: '2025-01-01' }).ok === true, 'valid opp should pass');

  // missing name
  assert(validateOpportunityCreate({}).ok === false, 'missing name should fail');

  // invalid stage
  assert(validateOpportunityCreate({ name: 'x', stage: 'foo' as any }).ok === false, 'invalid stage should fail');

  // negative amount
  assert(validateOpportunityCreate({ name: 'x', amount: -1 }).ok === false, 'negative amount should fail');

  // invalid date
  assert(validateOpportunityCreate({ name: 'x', closeDate: 'not-a-date' }).ok === false, 'invalid closeDate should fail');

  return { name, passed, failed, total };
}

