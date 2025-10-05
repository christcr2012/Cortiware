// Validation stubs for leads (no external deps)
// TODO(sonnet): Replace with Zod/Valibot schemas and stronger normalization

export type LeadCreateInput = {
  name?: string;
  contact?: { email?: string; phone?: string };
  source?: string;
  notes?: string;
};

export function validateLeadCreate(input: any): { ok: true } | { ok: false; message: string } {
  if (typeof input !== 'object' || input == null) return { ok: false, message: 'Body must be an object' };
  const { name, contact } = input as LeadCreateInput;
  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return { ok: false, message: 'name is required' };
  }
  if (contact && typeof contact !== 'object') return { ok: false, message: 'contact must be an object' };
  if (contact?.email && typeof contact.email !== 'string') return { ok: false, message: 'contact.email must be a string' };
  if (contact?.phone && typeof contact.phone !== 'string') return { ok: false, message: 'contact.phone must be a string' };
  return { ok: true };
}

