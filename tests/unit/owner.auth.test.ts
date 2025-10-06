export async function run() {
  const results = { name: 'owner.auth', passed: 0, failed: 0, total: 0 };
  try {
    const mod = await import('../../src/lib/auth-owner');
    // @ts-ignore
    const res = await mod.assertOwnerOr403(undefined, undefined);
    if (res && (res as any).ok === false && (res as any).status === 401) {
      results.passed += 1;
    } else {
      results.failed += 1;
    }
  } catch (e) {
    results.failed += 1;
  } finally {
    results.total += 1;
  }
  return results;
}

