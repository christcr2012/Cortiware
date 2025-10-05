// E2E smoke tests using Node fetch against a running dev server.
// Requires: `next dev -p 5000` in another terminal with FED_ENABLED=true
// Control expected behavior with environment variables:
//   BASE_URL (default http://localhost:5000)
//   E2E_EXPECT_FED_ENABLED ("true" or "false"): if set, assert 404 when false; assert 401/200 when true

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const EXP_FED = (process.env.E2E_EXPECT_FED_ENABLED || '').toLowerCase();

function expect(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function get(path: string, cookie?: string) {
  const res = await fetch(BASE_URL + path, { headers: cookie ? { Cookie: cookie } : {} });
  return res;
}

export async function run() {
  const name = 'e2e.federation.smoke';
  let passed = 0, failed = 0, total = 0;
  async function step(fn: () => Promise<void>, label: string) {
    total++;
    try { await fn(); passed++; console.log(`[PASS] ${label}`); } catch (e) { failed++; console.error(`[FAIL] ${label}:`, (e as Error).message); }
  }

  await step(async () => {
    const res = await get('/api/fed/providers/tenants');
    if (EXP_FED === 'false') expect(res.status === 404, `expected 404 when FED disabled, got ${res.status}`);
    if (EXP_FED === 'true') expect(res.status === 401, `expected 401 without cookie when FED enabled, got ${res.status}`);
  }, 'providers/tenants without cookie');

  await step(async () => {
    const res = await get('/api/fed/providers/tenants', 'rs_provider=dev-provider');
    if (EXP_FED === 'false') {
      expect(res.status === 404, `expected 404 when FED disabled, got ${res.status}`);
    }
    if (EXP_FED === 'true') {
      expect(res.status === 200, `expected 200 with provider cookie when FED enabled, got ${res.status}`);
      const json = await res.json();
      expect(json.ok === true, 'response envelope should have ok:true');
      expect(Array.isArray(json.data?.items), 'response should have data.items array');
      expect(typeof json.data?.nextCursor === 'string' || json.data?.nextCursor === null, 'response should have data.nextCursor');
    }
  }, 'providers/tenants with provider cookie');

  await step(async () => {
    const res = await get('/api/fed/developers/diagnostics');
    if (EXP_FED === 'false') expect(res.status === 404, `expected 404 when FED disabled, got ${res.status}`);
    if (EXP_FED === 'true') expect(res.status === 401, `expected 401 without cookie when FED enabled, got ${res.status}`);
  }, 'developers/diagnostics without cookie');

  await step(async () => {
    const res = await get('/api/fed/developers/diagnostics', 'rs_developer=dev-developer');
    if (EXP_FED === 'false') {
      expect(res.status === 404, `expected 404 when FED disabled, got ${res.status}`);
    }
    if (EXP_FED === 'true') {
      expect(res.status === 200, `expected 200 with developer cookie when FED enabled, got ${res.status}`);
      const json = await res.json();
      expect(json.ok === true, 'response envelope should have ok:true');
      expect(typeof json.data?.service === 'string', 'response should have data.service');
      expect(typeof json.data?.version === 'string', 'response should have data.version');
      expect(typeof json.data?.time === 'string', 'response should have data.time');
      expect(typeof json.data?.features === 'object', 'response should have data.features');
    }
  }, 'developers/diagnostics with developer cookie');

  console.log(`[E2E SUMMARY] ${name}: ${passed}/${total} steps passed`);
  if (failed > 0) process.exit(1);
}

