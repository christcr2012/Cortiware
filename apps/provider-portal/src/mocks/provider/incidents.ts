export type Incident = {
  id: string;
  orgId: string;
  severity: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL';
  summary: string;
  createdAt: string;
};

export const INCIDENTS: Incident[] = [
  { id: 'esc_001', orgId: 'org_123', severity: 'HIGH', summary: 'OPS outage', createdAt: '2025-10-05T12:00:00Z' },
  { id: 'esc_002', orgId: 'org_456', severity: 'LOW', summary: 'Password reset loop', createdAt: '2025-10-05T12:30:00Z' },
];

