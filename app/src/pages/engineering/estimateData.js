export const PRODUCT_OPTIONS = [
  { value: "CRM", label: "CRM", description: "Pipelines, ops, and auditability" },
  { value: "Marketplace", label: "Marketplace", description: "Matching, trust, payouts" },
  { value: "E-commerce", label: "E-commerce", description: "Catalog, checkout, fulfillment" },
];

export const COMPLEXITY_OPTIONS = [
  { value: "Lean", label: "Lean", description: "Core flows only" },
  { value: "Balanced", label: "Balanced", description: "Multi-role workflows" },
  { value: "Advanced", label: "Advanced", description: "Complex rules and scale" },
];

export const TEAM_OPTIONS = [
  { value: "Small", label: "2-3 builders", description: "Lean delivery" },
  { value: "Core", label: "4-6 builders", description: "Balanced pace" },
  { value: "Expanded", label: "7-9 builders", description: "Parallel tracks" },
];

export const INTEGRATION_OPTIONS = [
  { value: "None", label: "None", description: "First-party only" },
  { value: "Standard", label: "Standard", description: "Payments, email, CRM" },
  { value: "Heavy", label: "Heavy", description: "Multi-vendor sync" },
];

const PRODUCT_WEIGHTS = {
  CRM: 2,
  Marketplace: 3,
  "E-commerce": 3,
};

const COMPLEXITY_WEIGHTS = {
  Lean: 1,
  Balanced: 2,
  Advanced: 3,
};

const INTEGRATION_WEIGHTS = {
  None: 0,
  Standard: 1,
  Heavy: 2,
};

const TEAM_TIMELINE_WEIGHTS = {
  Small: 2,
  Core: 0,
  Expanded: -1,
};

const TEAM_BUDGET_WEIGHTS = {
  Small: -1,
  Core: 0,
  Expanded: 2,
};

const TIMELINE_BUCKETS = [
  { max: 3, range: "4-6 weeks", note: "Core scope with minimal integrations" },
  { max: 5, range: "6-10 weeks", note: "Standard workflows with admin surface" },
  { max: 7, range: "10-14 weeks", note: "Multi-role flows and reporting" },
  { max: 9, range: "14-20 weeks", note: "Complex logic and integrations" },
  { max: 99, range: "20-28 weeks", note: "Multi-system scope and scale work" },
];

const BUDGET_BUCKETS = [
  { max: 3, range: "$12k-$20k", note: "Lean build with core ops" },
  { max: 5, range: "$20k-$35k", note: "Balanced scope and delivery" },
  { max: 7, range: "$35k-$50k", note: "Complex workflows and integrations" },
  { max: 9, range: "$50k-$75k", note: "Advanced reliability and scale" },
  { max: 99, range: "$75k-$120k", note: "Enterprise scope and long-run support" },
];

const BASE_BLOCKS = [
  {
    id: "frontend",
    title: "Frontend",
    summary: "Customer and admin experiences with typed workflows.",
    tags: ["Design system", "Form engine"],
  },
  {
    id: "backend",
    title: "Backend",
    summary: "Domain services, workflows, and policy enforcement.",
    tags: ["Service layer", "Job queue"],
  },
  {
    id: "database",
    title: "Database",
    summary: "Transactional store with audit-ready schema.",
    tags: ["Postgres", "Migrations"],
  },
  {
    id: "integrations",
    title: "Integrations",
    summary: "Vendor connections with retries and throttling.",
    tags: ["Webhooks", "Retries"],
  },
  {
    id: "admin",
    title: "Admin panel",
    summary: "Operational controls, overrides, and audits.",
    tags: ["RBAC", "Audit trail"],
  },
  {
    id: "analytics",
    title: "Analytics",
    summary: "Event taxonomy and reporting layers.",
    tags: ["Events", "Dashboards"],
  },
];

const PRODUCT_BLOCK_TAGS = {
  CRM: {
    frontend: ["Pipeline UI", "Bulk actions"],
    backend: ["Workflow engine", "SLA timers"],
    database: ["Audit tables"],
    integrations: ["Email + calendar"],
    admin: ["Role presets"],
    analytics: ["Stage conversion"],
  },
  Marketplace: {
    frontend: ["Search + filters", "Messaging"],
    backend: ["Matching logic", "Payouts"],
    database: ["Listings + ledger"],
    integrations: ["Payments + KYC"],
    admin: ["Moderation tools"],
    analytics: ["Liquidity metrics"],
  },
  "E-commerce": {
    frontend: ["Catalog UX", "Checkout flow"],
    backend: ["Cart orchestration", "Fulfillment"],
    database: ["Inventory tables"],
    integrations: ["Shipping + tax"],
    admin: ["Merchandising"],
    analytics: ["Repeat purchase"],
  },
};

const COMPLEXITY_TAGS = {
  Lean: {
    backend: ["Core rules"],
    analytics: ["Core KPIs"],
  },
  Balanced: {
    backend: ["Automation rules"],
    database: ["Read replicas"],
    analytics: ["Cohort analysis"],
  },
  Advanced: {
    backend: ["Policy engine"],
    database: ["Partitioning"],
    analytics: ["Near real-time"],
  },
};

const INTEGRATION_TAGS = {
  None: ["Optional adapters"],
  Standard: ["Payments", "Messaging"],
  Heavy: ["Bi-directional sync", "DLQ + replay"],
};

const pickBucket = (buckets, score) => buckets.find((bucket) => score <= bucket.max) || buckets[buckets.length - 1];

export const buildEstimate = ({ product, complexity, team, integrations }) => {
  const timelineScore =
    (PRODUCT_WEIGHTS[product] || 0) +
    (COMPLEXITY_WEIGHTS[complexity] || 0) +
    (INTEGRATION_WEIGHTS[integrations] || 0) +
    (TEAM_TIMELINE_WEIGHTS[team] || 0);

  const budgetScore =
    (PRODUCT_WEIGHTS[product] || 0) +
    (COMPLEXITY_WEIGHTS[complexity] || 0) +
    (INTEGRATION_WEIGHTS[integrations] || 0) +
    (TEAM_BUDGET_WEIGHTS[team] || 0);

  const timeline = pickBucket(TIMELINE_BUCKETS, timelineScore);
  const budget = pickBucket(BUDGET_BUCKETS, budgetScore);

  const blocks = BASE_BLOCKS.map((block) => {
    const productTags = PRODUCT_BLOCK_TAGS[product]?.[block.id] || [];
    const complexityTags = COMPLEXITY_TAGS[complexity]?.[block.id] || [];
    const integrationTags = block.id === "integrations" ? INTEGRATION_TAGS[integrations] : [];
    const tags = Array.from(new Set([...(block.tags || []), ...productTags, ...complexityTags, ...integrationTags]));

    return {
      ...block,
      tags,
    };
  });

  return { timeline, budget, blocks };
};
