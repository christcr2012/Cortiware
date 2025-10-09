import { validateLeadCreate } from '@/lib/validation/leads';

export async function run() {
  const name = 'validation.leads';
  let passed = 0, failed = 0, total = 0;
  function assert(cond: any, msg: string) {
    total++;
    if (cond) passed++; else { failed++; console.error(`[FAIL] ${name}: ${msg}`); }
  }

  // ok case - company provided
  assert(validateLeadCreate({ company: 'Acme Corp' }).ok === true, 'valid lead with company should pass');

  // ok case - contactName provided
  assert(validateLeadCreate({ contactName: 'Alice' }).ok === true, 'valid lead with contactName should pass');

  // ok case - both provided
  assert(validateLeadCreate({ company: 'Acme', contactName: 'Alice' }).ok === true, 'valid lead with both should pass');

  // missing both company and contactName
  assert(validateLeadCreate({}).ok === false, 'missing company and contactName should fail');

  // email must be string
  assert(validateLeadCreate({ company: 'A', email: 1 as any }).ok === false, 'email number should fail');

  // email must have @
  assert(validateLeadCreate({ company: 'A', email: 'notanemail' }).ok === false, 'email without @ should fail');

  // phoneE164 must be string
  assert(validateLeadCreate({ company: 'A', phoneE164: 2 as any }).ok === false, 'phoneE164 number should fail');

  return { name, passed, failed, total };
}

