// Placeholder pack for roll-off dumpster rental vertical
import type { VerticalPack, EstimateResult } from '../index';

export const pack: VerticalPack = {
  key: 'roll-off',
  getForm: (formKey: string, orgId: string) => ({
    title: 'Roll-Off Dumpster Rental',
    type: 'object',
    properties: {
      size: {
        type: 'number',
        title: 'Dumpster Size (cubic yards)',
        enum: [10, 20, 30, 40],
      },
      rentalDays: {
        type: 'number',
        title: 'Rental Days',
        minimum: 1,
      },
    },
    required: ['size', 'rentalDays'],
  }),
  getPriceBook: (orgId: string) => [
    { sku: 'ROLLOFF-20', description: '20 Yard Dumpster', unit: 1, price: 350 },
    { sku: 'ROLLOFF-30', description: '30 Yard Dumpster', unit: 1, price: 450 },
  ],
  estimate: (inputs: Record<string, any>): EstimateResult => {
    const size = inputs.size || 20;
    const days = inputs.rentalDays || 7;
    const baseRate = size * 15;
    const total = baseRate + (days > 7 ? (days - 7) * 25 : 0);
    return {
      total,
      lines: [{ sku: 'ROLLOFF-' + size, qty: 1, unit: baseRate, total }],
      warnings: days > 7 ? [`Additional ${days - 7} days @ $25/day`] : [],
    };
  },
};

