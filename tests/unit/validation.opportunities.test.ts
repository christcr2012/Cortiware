import { validateOpportunityCreate } from '@/lib/validation/opportunities';

export async function run() {
  const name = 'validation.opportunities';
  let passed = 0, failed = 0, total = 0;
  function assert(cond: any, msg: string) {
    total++;
    if (cond) passed++; else { failed++; console.error(`[FAIL] ${name}: ${msg}`); }
  }

  // ok case - customerId is required
  assert(validateOpportunityCreate({ customerId: 'cust_123', estValue: 1000 }).ok === true, 'valid opp should pass');

  // missing customerId
  assert(validateOpportunityCreate({}).ok === false, 'missing customerId should fail');

  // negative estValue
  assert(validateOpportunityCreate({ customerId: 'cust_123', estValue: -1 }).ok === false, 'negative estValue should fail');

  return { name, passed, failed, total };
}

