import { PRODUCT_OPTIONS, COMPLEXITY_OPTIONS, TEAM_OPTIONS, INTEGRATION_OPTIONS, buildEstimate } from "../pages/engineering/estimateData.js";

export const fields = {
  product: [...PRODUCT_OPTIONS, { value: "unsure", label: "Not sure", description: "We can define this together" }],
  complexity: COMPLEXITY_OPTIONS,
  team: TEAM_OPTIONS,
  integrations: INTEGRATION_OPTIONS,
};
// Display/calculation assumptions only. Never serialize these as visitor choices.
export const defaults = { product: "CRM", complexity: "Lean", team: "Core", integrations: "Standard" };
export const budgetOptions = [{value:"under_5k",label:"Under $5k"},{value:"5_10k",label:"$5k–10k"},{value:"10_25k",label:"$10k–25k"},{value:"25_50k",label:"$25k–50k"},{value:"50k_plus",label:"$50k+"}];
export const timelineOptions = [{value:"urgent",label:"ASAP / 2–3 weeks"},{value:"soon",label:"4–8 weeks"},{value:"steady",label:"8–12 weeks"},{value:"flexible",label:"Flexible"}];
const projectMap = {crm:"CRM",marketplace:"Marketplace",commerce:"E-commerce","e-commerce":"E-commerce",saas:"SaaS",unsure:"unsure",unknown:"unsure","not sure":"unsure","not sure yet":"unsure"};
const complexityMap = {simple:"Lean",medium:"Balanced",complex:"Advanced"};
const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const productValue = value => typeof value === "string" ? projectMap[value.trim().toLowerCase()] : undefined;
const productLabel = value => fields.product.find(option => option.value === value)?.label;

export function readStorage(key) {
  try { return object(JSON.parse(localStorage.getItem(key))); } catch { return {}; }
}
export function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify({...value, updatedAt:new Date().toISOString()})); return true; } catch { return false; }
}
export function validInputs(value = {}) {
  const normalized = {...object(value), product:productValue(value?.product), complexity:complexityMap[value?.complexity] || value?.complexity};
  return Object.fromEntries(Object.entries(fields)
    .filter(([key, options]) => options.some(option => option.value === normalized[key]))
    .map(([key]) => [key, normalized[key]]));
}
export function saveDefinition(selected) {
  // v2 snapshots contain explicit choices only; old snapshots also saved defaults.
  return saveStorage("estimateSnapshot", {...validInputs(selected), version:2});
}
export function loadDefinition(search = "") {
  const raw = readStorage("qualificationGate");
  const qualification = {};
  const project = productValue(raw.projectType);
  if (project) qualification.projectType = project === "unsure" ? "unsure" : raw.projectType;
  if (complexityMap[raw.complexity]) qualification.complexity = raw.complexity;
  if (budgetOptions.some(x => x.value === raw.budget)) qualification.budget = raw.budget;
  if (timelineOptions.some(x => x.value === raw.timeline)) qualification.timeline = raw.timeline;
  const mapped = validInputs({product:project, complexity:complexityMap[qualification.complexity]});
  const snapshot = readStorage("estimateSnapshot");
  const stored = validInputs(snapshot);
  // An old CRM snapshot may be the bug's fallback, not a later product decision.
  // Preserve explicit uncertainty unless a v2 selection or URL overrides it.
  if (project === "unsure" && snapshot.version !== 2 && stored.product !== "unsure") delete stored.product;
  const params = Object.fromEntries(new URLSearchParams(search));
  const query = validInputs(params);
  const selected = {...mapped, ...stored, ...query};
  return {
    inputs:{...defaults, ...selected}, selected, qualification,
    maturity:["idea","mvp","growth","scale","unknown"].includes(params.maturity) ? params.maturity : null,
    hasInputs:Object.keys({...qualification, ...selected}).length > 0,
  };
}
export function inquiryQualification(selected, qualification = {}) {
  const choices = validInputs(selected);
  const pair = (value, label) => ({value, label});
  const result = {};
  if (choices.product) result.projectType = pair(choices.product, productLabel(choices.product));
  if (choices.complexity) result.complexity = pair(choices.complexity, choices.complexity);
  for (const [key, options] of [["budget",budgetOptions],["timeline",timelineOptions]]) {
    const option = options.find(x => x.value === qualification[key]);
    if (option) result[key] = pair(option.value, option.label);
  }
  return Object.keys(result).length ? result : null;
}
export function definitionSearch(selected) { return new URLSearchParams(validInputs(selected)).toString(); }
export function definitionSource(selected, maturity) {
  const choices = validInputs(selected);
  return `site-start:${Object.keys(fields).map(key => choices[key] || "unspecified").join("/")}${maturity ? `/${maturity}` : ""}`;
}
export function definitionChoiceLabel(selected) {
  const choices = validInputs(selected);
  return [productLabel(choices.product), choices.complexity && `${choices.complexity} scope`, choices.team && `${choices.team} team`, choices.integrations && `${choices.integrations} integrations`].filter(Boolean).join(" / ") || "Planning preferences only; product not specified";
}
export function buildDefinitionSummary(selected) {
  const choices = validInputs(selected);
  const exampleInputs = {...defaults, ...choices};
  if (exampleInputs.product === "unsure") exampleInputs.product = defaults.product;
  const assumptions = Object.keys(fields).filter(key => !choices[key] || (key === "product" && choices.product === "unsure"));
  const labels = {product:"product", complexity:"complexity", team:"team", integrations:"integrations"};
  return {
    estimate:buildEstimate(exampleInputs),
    illustrative:assumptions.length > 0,
    assumptionNote:assumptions.length ? `Example assumptions: ${assumptions.map(key => `${exampleInputs[key]} ${labels[key]}`).join(", ")}. These are not submitted as your choices.` : "",
    productLabel:productLabel(choices.product) || "Product not specified",
    scopeLabel:choices.complexity ? `${choices.complexity} scope.` : `${defaults.complexity} example scope.`,
  };
}
