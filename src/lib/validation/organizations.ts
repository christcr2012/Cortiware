// Validation stubs for organizations (no external deps)
// NOTE: Current API exposes only GET for organizations; this is future-facing.
// TODO(sonnet): Replace with Zod/Valibot schemas if/when write endpoints are added.

export type OrganizationUpsertInput = {
  name?: string;
  domain?: string;
};

export function validateOrganizationUpsert(input: any): { ok: true } | { ok: false; message: string } {
  if (typeof input !== 'object' || input == null) return { ok: false, message: 'Body must be an object' };
  const { name, domain } = input as OrganizationUpsertInput;
  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return { ok: false, message: 'name is required' };
  }
  if (domain != null && typeof domain !== 'string') {
    return { ok: false, message: 'domain must be a string' };
  }
  return { ok: true };
}

