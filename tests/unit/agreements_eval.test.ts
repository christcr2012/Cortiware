import { evaluateRule, evaluateAgreement, type AgreementRule, type AgreementEvent } from '../../packages/agreements/src/index';

export async function run() {
  const name = 'agreements.eval';
  let passed = 0, failed = 0, total = 0;

  // Test: flat_fee rule matches when value > threshold
  total++;
  try {
    const rule: AgreementRule = {
      name: 'Daily rental after grace',
      when: { event: 'rolloff.idle_days', filters: { gt: 30 } },
      action: { type: 'flat_fee', amount_cents: 100 },
      settlement: { mode: 'invoice', memo: 'Daily rental' },
    };
    const event: AgreementEvent = { event: 'rolloff.idle_days', value: 35 };
    const line = evaluateRule(rule, event);
    
    if (line && line.total_cents === 100 && line.qty === 1) {
      passed++;
    } else {
      throw new Error('Expected flat_fee charge of 100 cents');
    }
  } catch (e) {
    failed++;
    console.error('agreements.eval flat_fee match failed', e);
  }

  // Test: rule does not match when value <= threshold
  total++;
  try {
    const rule: AgreementRule = {
      name: 'Daily rental after grace',
      when: { event: 'rolloff.idle_days', filters: { gt: 30 } },
      action: { type: 'flat_fee', amount_cents: 100 },
      settlement: { mode: 'invoice' },
    };
    const event: AgreementEvent = { event: 'rolloff.idle_days', value: 20 };
    const line = evaluateRule(rule, event);
    
    if (line === null) {
      passed++;
    } else {
      throw new Error('Expected no charge for value <= threshold');
    }
  } catch (e) {
    failed++;
    console.error('agreements.eval no match failed', e);
  }

  // Test: per_unit rule calculates correctly
  total++;
  try {
    const rule: AgreementRule = {
      name: 'Per day charge',
      when: { event: 'rental.days', filters: { gte: 1 } },
      action: { type: 'per_unit', unit_cents: 50 },
      settlement: { mode: 'invoice' },
    };
    const event: AgreementEvent = { event: 'rental.days', value: 5 };
    const line = evaluateRule(rule, event);
    
    if (line && line.total_cents === 250 && line.qty === 5 && line.unit_cents === 50) {
      passed++;
    } else {
      throw new Error('Expected per_unit charge of 5 * 50 = 250 cents');
    }
  } catch (e) {
    failed++;
    console.error('agreements.eval per_unit failed', e);
  }

  // Test: evaluateAgreement with multiple rules
  total++;
  try {
    const rules: AgreementRule[] = [
      {
        name: 'Grace period fee',
        when: { event: 'rolloff.idle_days', filters: { gt: 30 } },
        action: { type: 'flat_fee', amount_cents: 100 },
        settlement: { mode: 'invoice' },
      },
      {
        name: 'Extended idle fee',
        when: { event: 'rolloff.idle_days', filters: { gt: 60 } },
        action: { type: 'flat_fee', amount_cents: 200 },
        settlement: { mode: 'invoice' },
      },
    ];
    const event: AgreementEvent = { event: 'rolloff.idle_days', value: 65 };
    const result = evaluateAgreement('test-org', rules, event);
    
    // Both rules should match (65 > 30 and 65 > 60)
    if (result.lines.length === 2 && result.total_cents === 300) {
      passed++;
    } else {
      throw new Error(`Expected 2 lines totaling 300 cents, got ${result.lines.length} lines totaling ${result.total_cents}`);
    }
  } catch (e) {
    failed++;
    console.error('agreements.eval multiple rules failed', e);
  }

  // Test: percentage action type
  total++;
  try {
    const rule: AgreementRule = {
      name: 'Late fee',
      when: { event: 'invoice.overdue_days', filters: { gte: 15 } },
      action: { type: 'percentage', percentage: 10 },
      settlement: { mode: 'invoice' },
    };
    const event: AgreementEvent = {
      event: 'invoice.overdue_days',
      value: 20,
      metadata: { base_cents: 1000 },
    };
    const line = evaluateRule(rule, event);
    
    if (line && line.total_cents === 100) {
      passed++;
    } else {
      throw new Error('Expected 10% of 1000 = 100 cents');
    }
  } catch (e) {
    failed++;
    console.error('agreements.eval percentage failed', e);
  }

  return { name, passed, failed, total };
}

