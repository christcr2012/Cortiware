import { isFederationEnabled, extractProviderToken, extractDeveloperToken } from '@/lib/api/middleware';

export async function run() {
  const name = 'middleware.auth.helpers';
  let passed = 0, failed = 0, total = 0;
  function assert(cond: any, msg: string) { total++; if (cond) passed++; else { failed++; console.error(`[FAIL] ${name}: ${msg}`); } }

  // Default flags
  assert(isFederationEnabled() === false, 'federation disabled by default');

  // Provider token extraction
  const p1 = extractProviderToken((k) => k === 'rs_provider' ? 'X' : undefined);
  assert(p1 === 'X', 'rs_provider extracted');
  const p2 = extractProviderToken((k) => k === 'provider-session' ? 'Y' : undefined);
  assert(p2 === 'Y', 'provider-session extracted');
  const p3 = extractProviderToken((k) => k === 'ws_provider' ? 'Z' : undefined);
  assert(p3 === 'Z', 'ws_provider extracted');

  // Developer token extraction
  const d1 = extractDeveloperToken((k) => k === 'rs_developer' ? 'A' : undefined);
  assert(d1 === 'A', 'rs_developer extracted');
  const d2 = extractDeveloperToken((k) => k === 'developer-session' ? 'B' : undefined);
  assert(d2 === 'B', 'developer-session extracted');
  const d3 = extractDeveloperToken((k) => k === 'ws_developer' ? 'C' : undefined);
  assert(d3 === 'C', 'ws_developer extracted');

  return { name, passed, failed, total };
}

