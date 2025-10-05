// Minimal API client helpers for v2 endpoints (tenant audience)
// NOTE: These are simple wrappers; Sonnet can enhance with types, error mapping, and SWR/React Query integration.

export async function getLeads(params?: { q?: string; status?: string; cursor?: string; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.status) qs.set('status', params.status);
  if (params?.cursor) qs.set('cursor', params.cursor);
  if (params?.limit) qs.set('limit', String(params.limit));
  const res = await fetch(`/api/v2/leads${qs.toString() ? `?${qs}` : ''}`, { cache: 'no-store' });
  return res.json();
}

export async function createLead(input: { name: string; contact?: { email?: string; phone?: string }; source?: string; notes?: string }) {
  const res = await fetch('/api/v2/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function getOrganizations() {
  const res = await fetch('/api/v2/organizations', { cache: 'no-store' });
  return res.json();
}

export async function getOpportunities(params?: { stage?: string; cursor?: string; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.stage) qs.set('stage', params.stage);
  if (params?.cursor) qs.set('cursor', params.cursor);
  if (params?.limit) qs.set('limit', String(params.limit));
  const res = await fetch(`/api/v2/opportunities${qs.toString() ? `?${qs}` : ''}`, { cache: 'no-store' });
  return res.json();
}

export async function createOpportunity(input: { leadId?: string; stage: string; amount: number; title?: string }) {
  const res = await fetch('/api/v2/opportunities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify(input),
  });
  return res.json();
}

