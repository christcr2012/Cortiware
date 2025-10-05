// Validation stubs for opportunities (no external deps)
// TODO(sonnet): Replace with Zod/Valibot schemas and stronger normalization

export type OpportunityCreateInput = {
  name?: string;
  stage?: 'prospect' | 'qualified' | 'proposal' | 'won' | 'lost';
  amount?: number; // currency minor units or float per schema decision
  closeDate?: string; // ISO 8601 date (YYYY-MM-DD) or datetime
  notes?: string;
};

export function validateOpportunityCreate(input: any): { ok: true } | { ok: false; message: string } {
  if (typeof input !== 'object' || input == null) return { ok: false, message: 'Body must be an object' };
  const { name, stage, amount, closeDate } = input as OpportunityCreateInput;

  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return { ok: false, message: 'name is required' };
  }

  if (stage && !['prospect','qualified','proposal','won','lost'].includes(stage)) {
    return { ok: false, message: 'stage must be one of prospect|qualified|proposal|won|lost' };
  }

  if (amount != null && (typeof amount !== 'number' || !isFinite(amount) || amount < 0)) {
    return { ok: false, message: 'amount must be a non-negative number' };
  }

  if (closeDate != null) {
    if (typeof closeDate !== 'string') return { ok: false, message: 'closeDate must be a string (ISO date)' };
    const t = Date.parse(closeDate);
    if (Number.isNaN(t)) return { ok: false, message: 'closeDate must be a valid ISO date' };
  }

  return { ok: true };
}

