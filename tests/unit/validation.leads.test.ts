import { validateLeadCreate } from '@/lib/validation/leads';

export async function run() {
  const name = 'validation.leads';
  let passed = 0, failed = 0, total = 0;
  function assert(cond: any, msg: string) {
    total++;
    if (cond) passed++; else { failed++; console.error(`[FAIL] ${name}: ${msg}`); }
  }

  // ok case
  assert(validateLeadCreate({ name: 'Alice' }).ok === true, 'valid lead should pass');

  // missing name
  assert(validateLeadCreate({}).ok === false, 'missing name should fail');

  // contact must be object
  assert(validateLeadCreate({ name: 'A', contact: 'x' as any }).ok === false, 'contact string should fail');

  // contact.email must be string
  assert(validateLeadCreate({ name: 'A', contact: { email: 1 as any } }).ok === false, 'contact.email number should fail');

  // contact.phone must be string
  assert(validateLeadCreate({ name: 'A', contact: { phone: 2 as any } }).ok === false, 'contact.phone number should fail');

  return { name, passed, failed, total };
}

