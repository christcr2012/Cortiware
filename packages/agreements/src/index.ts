// packages/agreements - Rule evaluation engine for agreement-based billing

export type AgreementRule = {
  name: string;
  when: {
    event: string;
    filters: Record<string, any>; // e.g., { gt: 30 }
  };
  action: {
    type: 'flat_fee' | 'per_unit' | 'percentage';
    amount_cents?: number;
    unit_cents?: number;
    percentage?: number;
  };
  settlement: {
    mode: 'invoice' | 'wallet';
    memo?: string;
  };
};

export type AgreementEvent = {
  event: string;
  value: number;
  metadata?: Record<string, any>;
};

export type ChargeLine = {
  sku: string;
  qty: number;
  unit_cents?: number;
  total_cents?: number;
  memo?: string;
};

export type ChargesResult = {
  orgId: string;
  lines: ChargeLine[];
  total_cents: number;
};

/**
 * Evaluate a single rule against an event
 * Returns charge line if rule matches, null otherwise
 */
export function evaluateRule(rule: AgreementRule, event: AgreementEvent): ChargeLine | null {
  // Check if event matches
  if (rule.when.event !== event.event) return null;

  // Apply filters
  const filters = rule.when.filters;
  let matches = true;

  if (filters.gt !== undefined && !(event.value > filters.gt)) matches = false;
  if (filters.gte !== undefined && !(event.value >= filters.gte)) matches = false;
  if (filters.lt !== undefined && !(event.value < filters.lt)) matches = false;
  if (filters.lte !== undefined && !(event.value <= filters.lte)) matches = false;
  if (filters.eq !== undefined && !(event.value === filters.eq)) matches = false;

  if (!matches) return null;

  // Calculate charge
  const action = rule.action;
  let total_cents = 0;
  let qty = 1;
  let unit_cents = 0;

  if (action.type === 'flat_fee') {
    total_cents = action.amount_cents || 0;
    unit_cents = total_cents;
  } else if (action.type === 'per_unit') {
    qty = event.value;
    unit_cents = action.unit_cents || 0;
    total_cents = qty * unit_cents;
  } else if (action.type === 'percentage') {
    const base = event.metadata?.base_cents || 0;
    total_cents = Math.floor((base * (action.percentage || 0)) / 100);
    unit_cents = total_cents;
  }

  return {
    sku: `AGREEMENT_${rule.name.replace(/\s+/g, '_').toUpperCase()}`,
    qty,
    unit_cents,
    total_cents,
    memo: rule.settlement.memo,
  };
}

/**
 * Evaluate all rules against an event and produce charges
 */
export function evaluateAgreement(
  orgId: string,
  rules: AgreementRule[],
  event: AgreementEvent
): ChargesResult {
  const lines: ChargeLine[] = [];

  for (const rule of rules) {
    const line = evaluateRule(rule, event);
    if (line) lines.push(line);
  }

  const total_cents = lines.reduce((sum, line) => sum + (line.total_cents || 0), 0);

  return { orgId, lines, total_cents };
}

