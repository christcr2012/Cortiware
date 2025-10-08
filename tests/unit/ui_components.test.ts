// Smoke tests for UI components (no React rendering, just exports)
import { setFeatureFlag } from '../../packages/ui-components/src/FeatureToggle';

export async function run() {
  const name = 'ui.components';
  let passed = 0, failed = 0, total = 0;

  // Test: PaymentRequiredBanner exports
  total++;
  try {
    const { PaymentRequiredBanner } = await import('../../packages/ui-components/src/PaymentRequiredBanner');
    if (typeof PaymentRequiredBanner === 'function') {
      passed++;
    } else {
      throw new Error('PaymentRequiredBanner not exported as function');
    }
  } catch (e) {
    failed++;
    console.error('ui.components PaymentRequiredBanner export failed', e);
  }

  // Test: RateLimitBanner exports
  total++;
  try {
    const { RateLimitBanner } = await import('../../packages/ui-components/src/RateLimitBanner');
    if (typeof RateLimitBanner === 'function') {
      passed++;
    } else {
      throw new Error('RateLimitBanner not exported as function');
    }
  } catch (e) {
    failed++;
    console.error('ui.components RateLimitBanner export failed', e);
  }

  // Test: FeatureToggle exports and setFeatureFlag works
  total++;
  try {
    const { FeatureToggle, useFeatureFlag } = await import('../../packages/ui-components/src/FeatureToggle');
    if (typeof FeatureToggle === 'function' && typeof useFeatureFlag === 'function' && typeof setFeatureFlag === 'function') {
      // Test setFeatureFlag
      setFeatureFlag('test-flag', true);
      passed++;
    } else {
      throw new Error('FeatureToggle exports incomplete');
    }
  } catch (e) {
    failed++;
    console.error('ui.components FeatureToggle export failed', e);
  }

  // Test: index exports all components
  total++;
  try {
    const exports = await import('../../packages/ui-components/src/index');
    if (exports.PaymentRequiredBanner && exports.RateLimitBanner && exports.FeatureToggle && exports.useFeatureFlag) {
      passed++;
    } else {
      throw new Error('Index exports incomplete');
    }
  } catch (e) {
    failed++;
    console.error('ui.components index exports failed', e);
  }

  return { name, passed, failed, total };
}

