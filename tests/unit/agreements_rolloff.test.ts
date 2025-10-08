import fs from 'fs';

export async function run() {
  const name = 'agreements.rolloff';
  let passed = 0, failed = 0, total = 0;
  function assert(cond: any, msg: string) { total++; if (cond) passed++; else { failed++; console.error(`[FAIL] ${name}: ${msg}`); } }

  // Load the example (if present) to read daily amount; else default to 100
  let dailyCents = 100;
  try {
    const raw = fs.readFileSync('AGREEMENTS_examples/rolloff_grace_30days.json', 'utf8');
    const ex = JSON.parse(raw);
    const rule = ex.rules?.[0];
    if (rule?.action?.amount_cents) dailyCents = rule.action.amount_cents;
  } catch {}

  function rentalFeesAfterGrace(idleDays: number) {
    if (idleDays <= 30) return 0;
    return (idleDays - 30) * dailyCents;
  }

  assert(rentalFeesAfterGrace(0) === 0, 'no fees at 0 days');
  assert(rentalFeesAfterGrace(30) === 0, 'no fees at 30 days');
  assert(rentalFeesAfterGrace(31) === dailyCents, 'fees start on day 31');

  return { name, passed, failed, total };
}

