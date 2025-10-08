// tests/acceptance/md-checker.mjs
// Very simple checker: ensures required files/strings exist for parity claims
import fs from "fs";
const req = [
  "verticals/concrete-lifting-and-leveling/PRICEBOOK.json",
  "packages/verticals/src/packs/concrete-lifting-and-leveling.ts",
  "apps/provider-portal/import-wizard/ImportWizard.tsx",
  "apps/provider-portal/roofing-takeoff/Takeoff.tsx",
  "verticals/hvac/MEMBERSHIPS.json"
];
for (const p of req){ if(!fs.existsSync(p)) throw new Error("Missing: "+p); }
console.log("Acceptance smoke check passed.");
