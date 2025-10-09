// Validation for opportunities - aligned with Prisma Opportunity model
import type { ValueType } from '@prisma/client';

export type OpportunityCreateInput = {
  customerId: string; // Required - link to Customer
  valueType?: ValueType;
  estValue?: number; // Decimal as number
  stage?: string;
  ownerId?: string;
  sourceLeadId?: string;
  classification?: Record<string, any>;
};

export function validateOpportunityCreate(input: any): { ok: true } | { ok: false; message: string } {
  if (typeof input !== 'object' || input == null) {
    return { ok: false, message: 'Body must be an object' };
  }

  const { customerId, estValue } = input as OpportunityCreateInput;

  // customerId is required
  if (!customerId || typeof customerId !== 'string' || customerId.trim().length < 1) {
    return { ok: false, message: 'customerId is required' };
  }

  // estValue must be non-negative if provided
  if (estValue != null && (typeof estValue !== 'number' || !isFinite(estValue) || estValue < 0)) {
    return { ok: false, message: 'estValue must be a non-negative number' };
  }

  return { ok: true };
}

export type OpportunityUpdateInput = Partial<Omit<OpportunityCreateInput, 'customerId'>>;

export function validateOpportunityUpdate(input: any): { ok: true; data: OpportunityUpdateInput } | { ok: false; message: string } {
  if (typeof input !== 'object' || input == null) {
    return { ok: false, message: 'Body must be an object' };
  }

  const data: OpportunityUpdateInput = {};

  if (input.estValue !== undefined) {
    if (typeof input.estValue !== 'number' || input.estValue < 0) {
      return { ok: false, message: 'estValue must be a non-negative number' };
    }
    data.estValue = input.estValue;
  }

  if (input.valueType !== undefined) {
    data.valueType = input.valueType;
  }

  if (input.stage !== undefined) {
    data.stage = input.stage;
  }

  if (input.notes !== undefined) {
    data.notes = input.notes;
  }

  return { ok: true, data };
}

