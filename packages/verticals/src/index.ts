export type EstimateResult = {
  total: number;
  lines: Array<{ sku: string; qty: number; unit?: number; total?: number }>;
  warnings: string[];
};

export type VerticalPack = {
  key: string;
  getForm(formKey: string, orgId: string): any;
  getPriceBook(orgId: string): any[];
  estimate(inputs: Record<string, any>): EstimateResult;
};

// Minimal placeholder pack factory for registry completeness
function placeholderPack(key: string): VerticalPack {
  return {
    key,
    getForm: () => ({ title: key, type: 'object', properties: {} }),
    getPriceBook: () => [],
    estimate: () => ({ total: 0, lines: [], warnings: ['placeholder'] }),
  };
}

// Port-a-john pack
export { pack as portAJohnPack } from './packs/port-a-john';

// Registry exposing Phase-1 verticals (index must remain stable)
export const verticalsRegistry: Record<string, VerticalPack> = {
  'cleaning': placeholderPack('cleaning'),
  'appliance-rental': placeholderPack('appliance-rental'),
  'concrete-leveling': placeholderPack('concrete-leveling'),
  'fencing': placeholderPack('fencing'),
  'roll-off': placeholderPack('roll-off'),
  'port-a-john': ((): VerticalPack => {
    // lazy require to avoid circular type issues in tools/editors
    const { pack } = require('./packs/port-a-john');
    return pack as VerticalPack;
  })(),
};

export default verticalsRegistry;

