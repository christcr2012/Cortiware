// Placeholder pack for fencing vertical
import type { VerticalPack, EstimateResult } from '../index';

export const pack: VerticalPack = {
  key: 'fencing',
  getForm: (formKey: string, orgId: string) => ({
    title: 'Fencing Installation',
    type: 'object',
    properties: {
      fenceType: {
        type: 'string',
        title: 'Fence Type',
        enum: ['wood', 'vinyl', 'chain-link', 'wrought-iron'],
      },
      linearFeet: {
        type: 'number',
        title: 'Linear Feet',
        minimum: 0,
      },
      height: {
        type: 'number',
        title: 'Height (feet)',
        enum: [4, 6, 8],
      },
    },
    required: ['fenceType', 'linearFeet', 'height'],
  }),
  getPriceBook: (orgId: string) => [
    { sku: 'FENCE-WOOD-6', description: 'Wood Fence 6ft', unit: 1, price: 25 },
    { sku: 'FENCE-VINYL-6', description: 'Vinyl Fence 6ft', unit: 1, price: 35 },
  ],
  estimate: (inputs: Record<string, any>): EstimateResult => {
    const feet = inputs.linearFeet || 0;
    const rate = inputs.fenceType === 'vinyl' ? 35 : 25;
    const total = feet * rate;
    return {
      total,
      lines: [{ sku: 'FENCE-' + (inputs.fenceType || 'WOOD').toUpperCase(), qty: feet, unit: rate, total }],
      warnings: [],
    };
  },
};

