import { validateOrganizationCreate } from '@/lib/validation/organizations';

export async function run() {
  const name = 'validation.organizations';
  let passed = 0, failed = 0, total = 0;
  function assert(cond: any, msg: string) {
    total++;
    if (cond) passed++; else { failed++; console.error(`[FAIL] ${name}: ${msg}`); }
  }

  // ok case - company provided
  assert(validateOrganizationCreate({ company: 'Acme Corp' }).ok === true, 'valid org with company should pass');

  // ok case - primaryName provided
  assert(validateOrganizationCreate({ primaryName: 'John Doe' }).ok === true, 'valid org with primaryName should pass');

  // missing both company and primaryName
  assert(validateOrganizationCreate({}).ok === false, 'missing company and primaryName should fail');

  // primaryEmail must be valid
  assert(validateOrganizationCreate({ company: 'A', primaryEmail: 'notanemail' }).ok === false, 'invalid email should fail');

  return { name, passed, failed, total };
}

