export const PRODUCT_OPTIONS = [
  { value: "CRM", label: "CRM", description: "Workflows, pipelines, and audit trails" },
  { value: "Marketplace", label: "Marketplace", description: "Matching, trust, and payouts" },
  { value: "E-commerce", label: "E-commerce", description: "Catalog, checkout, fulfillment" },
];

export const SCALE_OPTIONS = [
  { value: "MVP", label: "MVP", description: "Ship core flows fast" },
  { value: "Growth", label: "Growth", description: "Automate, cache, and scale" },
  { value: "Scale", label: "Scale", description: "Reliability and throughput" },
];

export const BLOCKS = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "database", label: "Database" },
  { id: "integrations", label: "Integrations" },
  { id: "admin", label: "Admin panel" },
  { id: "analytics", label: "Analytics" },
];

export const DIAGRAM_NODES = [
  { id: "frontend", x: 0.18, y: 0.26 },
  { id: "backend", x: 0.5, y: 0.2 },
  { id: "integrations", x: 0.82, y: 0.26 },
  { id: "admin", x: 0.18, y: 0.74 },
  { id: "database", x: 0.5, y: 0.78 },
  { id: "analytics", x: 0.82, y: 0.74 },
];

export const DIAGRAM_CONNECTIONS = [
  { from: "frontend", to: "backend" },
  { from: "backend", to: "database" },
  { from: "backend", to: "integrations", dashed: true },
  { from: "admin", to: "backend" },
  { from: "analytics", to: "database", dashed: true },
];

const BASE_BLOCKS = {
  frontend: {
    title: "Frontend",
    summary: "Typed UI optimized for workflow speed and data density.",
    responsibilities: [
      "Role-aware navigation",
      "Workflow forms + validation",
      "Client caching + optimistic updates",
      "Session hardening",
    ],
    stack: ["React/Next.js", "TypeScript", "Edge caching", "Design tokens"],
    interfaces: ["REST/GraphQL APIs", "Feature flags", "Realtime updates"],
    quality: ["p95 TTI < 1.2s", "CLS < 0.1", "WCAG AA"],
  },
  backend: {
    title: "Backend",
    summary: "Domain services, orchestration, and workflow execution.",
    responsibilities: [
      "Business rules + invariants",
      "Auth + RBAC",
      "Background jobs",
      "Webhook processing",
    ],
    stack: ["Node/Django", "Modular service layer", "Queue workers", "API gateway"],
    interfaces: ["REST/gRPC", "Event bus", "Webhook ingress"],
    quality: ["p95 < 250ms", "Idempotent writes", "SLO 99.9%"],
  },
  database: {
    title: "Database",
    summary: "Transactional store with audit trail and reporting.",
    responsibilities: [
      "Schema + migrations",
      "Indexing + query budgets",
      "Row-level security",
      "Backups + PITR",
    ],
    stack: ["Postgres", "Read replicas", "Connection pooler"],
    interfaces: ["CDC/ETL", "Read models"],
    quality: ["RPO < 15m", "RTO < 1h", "Encryption at rest"],
  },
  integrations: {
    title: "Integrations",
    summary: "Outbound/inbound connectors with retries and DLQs.",
    responsibilities: [
      "OAuth + token refresh",
      "Rate limiting",
      "Retries + backoff",
      "Mapping + normalization",
    ],
    stack: ["Webhook workers", "Job scheduler", "Secrets vault"],
    interfaces: ["Payments", "Messaging", "ERP/CRM"],
    quality: ["At-least-once delivery", "DLQ + replay"],
  },
  admin: {
    title: "Admin panel",
    summary: "Operational console for support, roles, and overrides.",
    responsibilities: [
      "Role management",
      "Manual overrides",
      "Audit log",
      "Support tooling",
    ],
    stack: ["Internal UI", "Audit store", "Feature flags"],
    interfaces: ["Admin APIs", "Impersonation controls"],
    quality: ["Tamper-evident logs", "Least privilege"],
  },
  analytics: {
    title: "Analytics",
    summary: "Event taxonomy and product intelligence.",
    responsibilities: [
      "Event capture + schema",
      "Dashboarding",
      "Funnel + cohort analysis",
      "Attribution",
    ],
    stack: ["Segment/GA4", "Warehouse", "BI layer"],
    interfaces: ["Event ingestion", "ETL pipelines"],
    quality: ["Schema governance", "Single source of truth"],
  },
};

const PRODUCT_PROFILES = {
  CRM: {
    summary: "Pipeline-centric operations with strong permissions and auditability.",
    focus: ["Workflow automation", "RBAC + audit", "Data migration"],
  },
  Marketplace: {
    summary: "Supply-demand matching with payments, trust, and dispute handling.",
    focus: ["Matching + pricing", "Payments + payouts", "Trust + safety"],
  },
  "E-commerce": {
    summary: "Catalog, checkout, and fulfillment optimization across channels.",
    focus: ["Merchandising", "Checkout + tax", "Inventory accuracy"],
  },
};

const PRODUCT_VARIANTS = {
  CRM: {
    frontend: {
      summary: "Pipeline UI tuned for fast triage and bulk actions.",
      responsibilities: ["Pipeline views", "Keyboard shortcuts", "Bulk edits"],
    },
    backend: {
      responsibilities: ["Workflow engine", "SLA timers", "Lead scoring"],
      stack: ["Rules engine"],
    },
    database: {
      responsibilities: ["Tenant isolation", "Audit tables"],
    },
    integrations: {
      interfaces: ["Email + calendar", "Telephony", "Billing"],
      responsibilities: ["Bi-directional sync"],
    },
    admin: {
      responsibilities: ["Field configuration", "Permission sets"],
    },
    analytics: {
      responsibilities: ["Stage conversion", "Activity SLA"],
    },
  },
  Marketplace: {
    frontend: {
      summary: "Discovery, listing management, and messaging surfaces.",
      responsibilities: ["Search + filters", "Listings UX", "Messaging"],
    },
    backend: {
      responsibilities: ["Matching logic", "Pricing + fees", "Payouts"],
      stack: ["Ledger service"],
    },
    database: {
      responsibilities: ["Listing search indices", "Order ledger"],
    },
    integrations: {
      interfaces: ["Payments", "Identity/KYC", "Maps"],
      responsibilities: ["Fraud signals"],
    },
    admin: {
      responsibilities: ["Moderation tools", "Dispute resolution"],
    },
    analytics: {
      responsibilities: ["Liquidity metrics", "Take rate tracking"],
    },
  },
  "E-commerce": {
    frontend: {
      summary: "Catalog discovery with high-converting checkout flows.",
      responsibilities: ["PDP + variants", "Cart + checkout"],
    },
    backend: {
      responsibilities: ["Cart orchestration", "Fulfillment", "Tax + discounts"],
    },
    database: {
      responsibilities: ["Catalog + inventory", "Order ledger"],
    },
    integrations: {
      interfaces: ["Shipping carriers", "Tax", "Payments"],
    },
    admin: {
      responsibilities: ["Merchandising", "Returns + refunds"],
    },
    analytics: {
      responsibilities: ["Attribution", "Repeat purchase rate"],
    },
  },
};

const SCALE_PROFILES = {
  MVP: {
    summary: "Single region, monolith-first, optimized for rapid iteration.",
    traits: ["Monolith-first", "Manual ops", "Limited integrations"],
  },
  Growth: {
    summary: "Automation, caching, and structured observability for scale-up.",
    traits: ["Async jobs", "Cache + search", "Multi-AZ"],
  },
  Scale: {
    summary: "High availability, partitioning, and service isolation.",
    traits: ["Multi-region", "Event streaming", "SLO-driven ops"],
  },
};

const SCALE_SIGNALS = {
  MVP: [
    { label: "Traffic", value: "0-50 rps", description: "Core flows + experiments" },
    { label: "Data", value: "< 50GB", description: "Single primary DB" },
    { label: "Ops", value: "Lean", description: "Manual escalation" },
  ],
  Growth: [
    { label: "Traffic", value: "50-300 rps", description: "Async jobs + cache" },
    { label: "Data", value: "50GB-1TB", description: "Read replicas" },
    { label: "Ops", value: "SLO aware", description: "On-call rotation" },
  ],
  Scale: [
    { label: "Traffic", value: "300+ rps", description: "Streaming + queues" },
    { label: "Data", value: "1TB+", description: "Partitioned storage" },
    { label: "Ops", value: "24/7", description: "SRE coverage" },
  ],
};

const SCALE_VARIANTS = {
  MVP: {
    backend: { stack: ["Modular monolith"], quality: ["Simple rollout strategy"] },
    database: { stack: ["Single primary"], quality: ["Daily snapshots"] },
    analytics: { stack: ["Event tables"], quality: ["Core KPI tracking"] },
  },
  Growth: {
    backend: { stack: ["Redis cache", "Search service"], quality: ["Blue/green deploys"] },
    database: { stack: ["Read replicas"], quality: ["Index tuning cadence"] },
    integrations: { quality: ["Circuit breakers"] },
    analytics: { stack: ["Warehouse sync"], quality: ["Data contracts"] },
  },
  Scale: {
    backend: { stack: ["Service boundaries", "Event streaming"], quality: ["Chaos drills"] },
    database: { stack: ["Sharding", "Read/write split"], quality: ["Hot path SLAs"] },
    integrations: { quality: ["Regional failover"] },
    analytics: { stack: ["Streaming ingestion"], quality: ["Near-real-time KPIs"] },
  },
};

const mergeBlock = (...layers) => {
  const merged = {};
  layers.filter(Boolean).forEach((layer) => {
    Object.entries(layer).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        merged[key] = Array.from(new Set([...(merged[key] || []), ...value]));
      } else {
        merged[key] = value;
      }
    });
  });
  return merged;
};

export const buildPreset = (product, scale) => {
  const productVariant = PRODUCT_VARIANTS[product] || {};
  const scaleVariant = SCALE_VARIANTS[scale] || {};
  const blocks = Object.keys(BASE_BLOCKS).reduce((acc, key) => {
    acc[key] = mergeBlock(BASE_BLOCKS[key], productVariant[key], scaleVariant[key]);
    return acc;
  }, {});

  return {
    product,
    scale,
    productProfile: PRODUCT_PROFILES[product],
    scaleProfile: SCALE_PROFILES[scale],
    signals: SCALE_SIGNALS[scale] || [],
    blocks,
  };
};
