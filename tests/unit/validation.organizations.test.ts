import { validateOrganizationUpsert } from '@/lib/validation/organizations';

export async function run() {
  const name = 'validation.organizations';
  let passed = 0, failed = 0, total = 0;
  function assert(cond: any, msg: string) {
    total++;
    if (cond) passed++; else { failed++; console.error(`[FAIL] ${name}: ${msg}`); }
  }

  // ok case
  assert(validateOrganizationUpsert({ name: 'Acme', domain: 'acme.com' }).ok === true, 'valid org should pass');

  // missing name
  assert(validateOrganizationUpsert({}).ok === false, 'missing name should fail');

  // domain must be string
  assert(validateOrganizationUpsert({ name: 'A', domain: 123 as any }).ok === false, 'domain number should fail');

  return { name, passed, failed, total };
}

