export type Invoice = {
  reconciliationId: string;
  orgId: string;
  total: number;
  currency: 'USD'|'EUR'|'GBP';
  period: { start: string; end: string };
};

export const INVOICES: Invoice[] = [
  { reconciliationId: 'rec_78ab12', orgId: 'org_123', total: 1200, currency: 'USD', period: { start: '2025-10-01', end: '2025-10-31' } },
  { reconciliationId: 'rec_12cd34', orgId: 'org_456', total: 450, currency: 'USD', period: { start: '2025-09-01', end: '2025-09-30' } },
];

