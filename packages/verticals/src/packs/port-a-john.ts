import type { VerticalPack, EstimateResult } from "../index";
export const pack: VerticalPack = {
  key: "port-a-john",
  getForm(formKey: string, orgId: string) {
    const forms: Record<string, any> = {
  "lead.port-a-john": {
    "title": "Port-a-John Lead",
    "type": "object",
    "properties": {
      "units": { "type": "integer" },
      "service_freq": { "type": "string" },
      "duration_days": { "type": "integer" }
    }
  },
  "estimate.port-a-john": {
    "title": "Port-a-John Estimate",
    "type": "object",
    "properties": {
      "units": { "type": "integer" },
      "service_freq": { "type": "string" },
      "duration_days": { "type": "integer" },
      "delivery": { "type": "number" },
      "pickup": { "type": "number" },
      "addons_total": { "type": "number" }
    }
  },
  "job.port-a-john.service": {
    "title": "Port-a-John Service Job",
    "type": "object",
    "properties": { "units": { "type": "integer" }, "notes": { "type": "string" } }
  },
  "job.port-a-john.delivery": {
    "title": "Port-a-John Delivery Job",
    "type": "object",
    "properties": { "units": { "type": "integer" }, "site": { "type": "string" } }
  },
  "job.port-a-john.removal": {
    "title": "Port-a-John Removal Job",
    "type": "object",
    "properties": { "units": { "type": "integer" }, "site": { "type": "string" } }
  }
};
    return forms[formKey] ?? { title: formKey, type: "object", properties: {} };
  },
  getPriceBook(orgId: string) {
    return [
  { "sku": "PAJ_UNIT_STD", "name": "Standard Unit (per day)", "unit": "day", "verticalKey": "port-a-john", "basePrice": 6 },
  { "sku": "PAJ_SERVICE", "name": "Service visit", "unit": "visit", "verticalKey": "port-a-john", "basePrice": 25 },
  { "sku": "PAJ_DELIVERY", "name": "Delivery", "unit": "each", "verticalKey": "port-a-john", "basePrice": 50 },
  { "sku": "PAJ_PICKUP", "name": "Pickup", "unit": "each", "verticalKey": "port-a-john", "basePrice": 50 },
  { "sku": "PAJ_HANDWASH", "name": "Handwash station", "unit": "each", "verticalKey": "port-a-john", "basePrice": 35 }
];
  },
  estimate(inputs: Record<string, any>): EstimateResult {
    const units = Number(inputs.units ?? 1);
    const duration_days = Number(inputs.duration_days ?? 30);
    const service_freq = String(inputs.service_freq ?? "weekly");
    const service_visits = service_freq === "weekly" ? duration_days/7 : service_freq === "biweekly" ? duration_days/14 : duration_days/30;
    const unit_rate = Number(inputs.unit_rate ?? 6);
    const service_rate = Number(inputs.service_rate ?? 25);
    const delivery = Number(inputs.delivery ?? 50);
    const pickup = Number(inputs.pickup ?? 50);
    const addons = Number(inputs.addons_total ?? 0);
    const total = Math.round(units*unit_rate*duration_days + units*service_visits*service_rate + delivery + pickup + addons);
    return { total, lines: [{ sku: "PAJ_UNIT_STD", qty: units, unit: unit_rate, total: Math.round(units*unit_rate*duration_days) }], warnings: [] };
  }
};

