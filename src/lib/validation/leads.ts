// Validation for leads - aligned with Prisma Lead model
// Maps to: company, contactName, email, phoneE164, sourceType, notes, etc.

import type { LeadSource } from '@prisma/client';

export type LeadCreateInput = {
  company?: string;
  contactName?: string;
  email?: string;
  phoneE164?: string;
  website?: string;
  sourceType?: LeadSource;
  sourceDetail?: string;
  notes?: string;
  city?: string;
  state?: string;
  zip?: string;
  postalCode?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
};

export function validateLeadCreate(input: any): { ok: true } | { ok: false; message: string } {
  if (typeof input !== 'object' || input == null) {
    return { ok: false, message: 'Body must be an object' };
  }

  const { company, contactName, email, phoneE164 } = input as LeadCreateInput;

  // At least one of company or contactName is required
  if ((!company || typeof company !== 'string' || company.trim().length < 1) &&
      (!contactName || typeof contactName !== 'string' || contactName.trim().length < 1)) {
    return { ok: false, message: 'Either company or contactName is required' };
  }

  // Validate email format if provided
  if (email && typeof email !== 'string') {
    return { ok: false, message: 'email must be a string' };
  }
  if (email && email.length > 0 && !email.includes('@')) {
    return { ok: false, message: 'email must be a valid email address' };
  }

  // Validate phone if provided
  if (phoneE164 && typeof phoneE164 !== 'string') {
    return { ok: false, message: 'phoneE164 must be a string' };
  }

  return { ok: true };
}

export type LeadUpdateInput = Partial<LeadCreateInput>;

export function validateLeadUpdate(input: any): { ok: true; data: LeadUpdateInput } | { ok: false; message: string } {
  if (typeof input !== 'object' || input == null) {
    return { ok: false, message: 'Body must be an object' };
  }

  const data: LeadUpdateInput = {};

  // All fields are optional for updates
  if (input.company !== undefined) {
    if (typeof input.company !== 'string') {
      return { ok: false, message: 'company must be a string' };
    }
    data.company = input.company;
  }

  if (input.contactName !== undefined) {
    if (typeof input.contactName !== 'string') {
      return { ok: false, message: 'contactName must be a string' };
    }
    data.contactName = input.contactName;
  }

  if (input.email !== undefined) {
    if (typeof input.email !== 'string') {
      return { ok: false, message: 'email must be a string' };
    }
    if (input.email.length > 0 && !input.email.includes('@')) {
      return { ok: false, message: 'email must be a valid email address' };
    }
    data.email = input.email;
  }

  if (input.phoneE164 !== undefined) {
    if (typeof input.phoneE164 !== 'string') {
      return { ok: false, message: 'phoneE164 must be a string' };
    }
    data.phoneE164 = input.phoneE164;
  }

  if (input.notes !== undefined) {
    data.notes = input.notes;
  }

  if (input.sourceType !== undefined) {
    data.sourceType = input.sourceType;
  }

  if (input.sourceDetail !== undefined) {
    data.sourceDetail = input.sourceDetail;
  }

  return { ok: true, data };
}

