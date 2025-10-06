import { run as runLeads } from './validation.leads.test';
import { run as runOpps } from './validation.opportunities.test';
import { run as runOrgs } from './validation.organizations.test';
import { run as runFedCfg } from './federation.config.test';
import { run as runAuthHelpers } from './middleware.auth.test';
import { run as runFedServices } from './federation.services.test';
import { run as runOwnerAuth } from './owner.auth.test';

async function main() {
  const results = [
    await runLeads(),
    await runOpps(),
    await runOrgs(),
    await runFedCfg(),
    await runAuthHelpers(),
    await runFedServices(),
    await runOwnerAuth(),
  ];
  const totals = results.reduce((acc, r) => ({
    passed: acc.passed + r.passed,
    failed: acc.failed + r.failed,
    total: acc.total + r.total,
  }), { passed: 0, failed: 0, total: 0 });

  for (const r of results) {
    console.log(`[RESULT] ${r.name}: ${r.passed}/${r.total} passed`);
  }
  console.log(`[SUMMARY] total: ${totals.passed}/${totals.total} passed`);

  if (totals.failed > 0) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });

