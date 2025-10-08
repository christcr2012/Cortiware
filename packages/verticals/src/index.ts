// packages/verticals/src/index.ts (v3.9 registry)
export type EstimateResult = {
  total: number;
  lines: Array<{ sku: string; qty: number; unit?: number; total?: number }>;
  warnings: string[];
};

export interface VerticalPack {
  key: string;
  getForm(formKey: string, orgId: string): any;
  getPriceBook(orgId: string): any; // Can be array or object with skus
  estimate(inputs: Record<string, any>): EstimateResult;
}

// Import all packs
import * as cleaning from './packs/cleaning';
import * as appliance from './packs/appliance-rental';
import * as fencing from './packs/fencing';
import * as rolloff from './packs/rolloff';
import * as portajohn from './packs/port-a-john';
import * as concreteLL from './packs/concrete-lifting-and-leveling';
// Phase-2 + Generics
import * as roofing from './packs/roofing';
import * as hvac from './packs/hvac';
import * as landscaping from './packs/landscaping';
import * as plumbing from './packs/plumbing';
import * as electrical from './packs/electrical';
import * as painting from './packs/painting';
import * as pressureWashing from './packs/pressure-washing';
import * as pestControl from './packs/pest-control';
import * as snowRemoval from './packs/snow-removal';
import * as autoDetail from './packs/auto-detail';
import * as genericService from './packs/generic-service';
import * as genericRental from './packs/generic-rental';
import * as genericProject from './packs/generic-project';

// Registry exposing all verticals
export const verticalsRegistry: Record<string, VerticalPack> = {
  'cleaning': cleaning.pack,
  'appliance-rental': appliance.pack,
  'fencing': fencing.pack,
  'roll-off': rolloff.pack,
  'port-a-john': portajohn.pack,
  'concrete-lifting-and-leveling': concreteLL.pack,
  'roofing': roofing.pack,
  'hvac': hvac.pack,
  'landscaping': landscaping.pack,
  'plumbing': plumbing.pack,
  'electrical': electrical.pack,
  'painting': painting.pack,
  'pressure-washing': pressureWashing.pack,
  'pest-control': pestControl.pack,
  'snow-removal': snowRemoval.pack,
  'auto-detail': autoDetail.pack,
  'generic-service': genericService.pack,
  'generic-rental': genericRental.pack,
  'generic-project': genericProject.pack,
};

// Helper functions
export function getForm(verticalKey: string, formKey: string, orgId: string) {
  const pack = verticalsRegistry[verticalKey];
  if (!pack) throw new Error(`Unknown vertical ${verticalKey}`);
  return pack.getForm(formKey, orgId);
}

export function getPriceBook(verticalKey: string, orgId: string) {
  const pack = verticalsRegistry[verticalKey];
  if (!pack) throw new Error(`Unknown vertical ${verticalKey}`);
  return pack.getPriceBook(orgId);
}

export function estimate(verticalKey: string, inputs: Record<string, any>): EstimateResult {
  const pack = verticalsRegistry[verticalKey];
  if (!pack) throw new Error(`Unknown vertical ${verticalKey}`);
  return pack.estimate(inputs);
}

export default verticalsRegistry;

