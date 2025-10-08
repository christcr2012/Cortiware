// Placeholder pack for cleaning vertical
import type { VerticalPack, EstimateResult } from '../index';

export const pack: VerticalPack = {
  key: 'cleaning',
  getForm: (formKey: string, orgId: string) => ({
    title: 'Cleaning Service',
    type: 'object',
    properties: {
      serviceType: {
        type: 'string',
        title: 'Service Type',
        enum: ['residential', 'commercial', 'deep-clean', 'move-out'],
      },
      squareFeet: {
        type: 'number',
        title: 'Square Feet',
        minimum: 0,
      },
    },
    required: ['serviceType', 'squareFeet'],
  }),
  getPriceBook: (orgId: string) => [
    { sku: 'CLEAN-RES', description: 'Residential Cleaning', unit: 100, price: 50 },
    { sku: 'CLEAN-COM', description: 'Commercial Cleaning', unit: 100, price: 75 },
  ],
  estimate: (inputs: Record<string, any>): EstimateResult => {
    const sqft = inputs.squareFeet || 0;
    const rate = inputs.serviceType === 'commercial' ? 0.75 : 0.50;
    const total = sqft * rate;
    return {
      total,
      lines: [{ sku: 'CLEAN-' + (inputs.serviceType || 'RES').toUpperCase(), qty: sqft, unit: rate, total }],
      warnings: [],
    };
  },
};

