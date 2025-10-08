import type { JSONSchema7 as JSONSchema } from "json-schema";
export type EstimateResult = { total: number; lines: any[]; warnings: string[] };
export interface VerticalPack {
  key: string;
  getForm: (formKey: string, orgId: string) => any; // JSONSchema
  getPriceBook: (orgId: string) => any[];
  estimate: (inputs: Record<string, any>) => EstimateResult;
}
import * as cleaning from "./packs/cleaning";
import * as appliance from "./packs/appliance-rental";
import * as concrete from "./packs/concrete-leveling";
import * as fencing from "./packs/fencing";
import * as rolloff from "./packs/rolloff";
import * as portajohn from "./packs/port-a-john";
export const registry: Record<string, VerticalPack> = {
  "cleaning": cleaning.pack,
  "appliance-rental": appliance.pack,
  "concrete-leveling": concrete.pack,
  "fencing": fencing.pack,
  "roll-off": rolloff.pack,
  "port-a-john": portajohn.pack
};
export function getForm(verticalKey: string, formKey: string, orgId: string) {
  const pack = registry[verticalKey];
  if (!pack) throw new Error(`Unknown vertical ${verticalKey}`);
  return pack.getForm(formKey, orgId);
}
export function getPriceBook(verticalKey: string, orgId: string) {
  const pack = registry[verticalKey];
  if (!pack) throw new Error(`Unknown vertical ${verticalKey}`);
  return pack.getPriceBook(orgId);
}
export function estimate(verticalKey: string, inputs: Record<string, any>): EstimateResult {
  const pack = registry[verticalKey];
  if (!pack) throw new Error(`Unknown vertical ${verticalKey}`);
  return pack.estimate(inputs);
}
