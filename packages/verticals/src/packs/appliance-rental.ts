// Placeholder pack for appliance rental vertical
import type { VerticalPack, EstimateResult } from '../index';

export const pack: VerticalPack = {
  key: 'appliance-rental',
  getForm: (formKey: string, orgId: string) => ({
    title: 'Appliance Rental',
    type: 'object',
    properties: {
      applianceType: {
        type: 'string',
        title: 'Appliance Type',
        enum: ['refrigerator', 'washer', 'dryer', 'dishwasher', 'stove'],
      },
      rentalDays: {
        type: 'number',
        title: 'Rental Days',
        minimum: 1,
      },
    },
    required: ['applianceType', 'rentalDays'],
  }),
  getPriceBook: (orgId: string) => [
    { sku: 'RENT-FRIDGE', description: 'Refrigerator Rental', unit: 1, price: 50 },
    { sku: 'RENT-WASHER', description: 'Washer Rental', unit: 1, price: 40 },
  ],
  estimate: (inputs: Record<string, any>): EstimateResult => {
    const days = inputs.rentalDays || 1;
    const dailyRate = 50;
    const total = days * dailyRate;
    return {
      total,
      lines: [{ sku: 'RENT-' + (inputs.applianceType || 'FRIDGE').toUpperCase(), qty: days, unit: dailyRate, total }],
      warnings: [],
    };
  },
};

