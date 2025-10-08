// packages/verticals/src/packs/concrete-lifting-and-leveling.ts
import type { VerticalPack, EstimateResult } from "../index";
const FORMS = require("../../../verticals/concrete-lifting-and-leveling/FORMS.json");
const PRICEBOOK = require("../../../verticals/concrete-lifting-and-leveling/PRICEBOOK.json");
const est = require("../../../estimators/concrete-lifting-and-leveling.ts");

export const pack: VerticalPack = {
  key: "concrete-lifting-and-leveling",
  getForm(formKey: string) { return FORMS[formKey] || FORMS["estimate"]; },
  getPriceBook() { return PRICEBOOK; },
  estimate(inputs: Record<string, any>): EstimateResult { return est.estimate(inputs); }
};
