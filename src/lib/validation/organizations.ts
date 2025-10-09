// Validation for organizations (Customer entities) - aligned with Prisma Customer model
// NOTE: "organizations" in the API refers to Customer entities (companies/clients)

export type OrganizationCreateInput = {
  company?: string;
  primaryName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  notes?: string;
};

export function validateOrganizationCreate(input: any): { ok: true } | { ok: false; message: string } {
  if (typeof input !== 'object' || input == null) {
    return { ok: false, message: 'Body must be an object' };
  }

  const { company, primaryName, primaryEmail } = input as OrganizationCreateInput;

  // At least one of company or primaryName is required
  if ((!company || typeof company !== 'string' || company.trim().length < 1) &&
      (!primaryName || typeof primaryName !== 'string' || primaryName.trim().length < 1)) {
    return { ok: false, message: 'Either company or primaryName is required' };
  }

  // Email validation if provided
  if (primaryEmail != null) {
    if (typeof primaryEmail !== 'string' || !primaryEmail.includes('@')) {
      return { ok: false, message: 'primaryEmail must be a valid email' };
    }
  }

  return { ok: true };
}

