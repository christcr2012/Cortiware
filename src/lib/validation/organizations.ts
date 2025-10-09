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

export type OrganizationUpdateInput = Partial<OrganizationCreateInput>;

export function validateOrganizationUpdate(input: any): { ok: true; data: OrganizationUpdateInput } | { ok: false; message: string } {
  if (typeof input !== 'object' || input == null) {
    return { ok: false, message: 'Body must be an object' };
  }

  const data: OrganizationUpdateInput = {};

  if (input.company !== undefined) {
    if (typeof input.company !== 'string') {
      return { ok: false, message: 'company must be a string' };
    }
    data.company = input.company;
  }

  if (input.primaryName !== undefined) {
    if (typeof input.primaryName !== 'string') {
      return { ok: false, message: 'primaryName must be a string' };
    }
    data.primaryName = input.primaryName;
  }

  if (input.primaryEmail !== undefined) {
    if (typeof input.primaryEmail !== 'string') {
      return { ok: false, message: 'primaryEmail must be a string' };
    }
    if (input.primaryEmail.length > 0 && !input.primaryEmail.includes('@')) {
      return { ok: false, message: 'primaryEmail must be a valid email address' };
    }
    data.primaryEmail = input.primaryEmail;
  }

  if (input.primaryPhone !== undefined) {
    if (typeof input.primaryPhone !== 'string') {
      return { ok: false, message: 'primaryPhone must be a string' };
    }
    data.primaryPhone = input.primaryPhone;
  }

  if (input.notes !== undefined) {
    data.notes = input.notes;
  }

  return { ok: true, data };
}

