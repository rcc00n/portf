import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Rocket,
  Workflow,
  Braces,
  Megaphone,
  LineChart,
  Gauge,
  Mail,
  Phone,
  Sparkles,
  Star,
  ShieldCheck,
  Bot,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import raccoonLogo from "./assets/raccoon-logo.png";
import ToggleGroup from "./components/ToggleGroup";
import DataCard from "./components/DataCard";
import { trackCtaClick, trackPageView } from "./utils/analytics";
import { getMetaForPath } from "./utils/seo";
import {
  buildEstimate,
  PRODUCT_OPTIONS as ESTIMATE_PRODUCT_OPTIONS,
  COMPLEXITY_OPTIONS as ESTIMATE_COMPLEXITY_OPTIONS,
  TEAM_OPTIONS as ESTIMATE_TEAM_OPTIONS,
  INTEGRATION_OPTIONS as ESTIMATE_INTEGRATION_OPTIONS,
} from "./pages/engineering/estimateData";

const EngineeringLandingPage = lazy(() => import("./pages/engineering/EngineeringLanding.jsx"));
const ArchitecturePreviewPage = lazy(() => import("./pages/engineering/ArchitecturePreview.jsx"));
const AdminFirstPage = lazy(() => import("./pages/engineering/AdminFirst.jsx"));
const ProductionReadyPage = lazy(() => import("./pages/engineering/ProductionReady.jsx"));
const EstimatePage = lazy(() => import("./pages/engineering/Estimate.jsx"));
const RenterArchitectureCasePage = lazy(() => import("./pages/cases/RenterArchitectureCase.jsx"));
const AdminDemoPage = lazy(() => import("./pages/admin/AdminDemo.jsx"));

/* ===================== Data ===================== */
const nav = [
  { id: "services", label: "Services", href: "/services", icon: Workflow, desc: "Product build + growth" },
  { id: "projects", label: "Projects", href: "/projects", icon: Rocket, desc: "Selected case studies" },
  { id: "process", label: "Process", href: "/process", icon: Gauge, desc: "Delivery rituals" },
  { id: "pricing", label: "Pricing", href: "/pricing", icon: LineChart, desc: "Clear tiers" },
  { id: "stack", label: "Tech", href: "/tech", icon: Braces, desc: "Stack and tooling" },
  { id: "engineering", label: "Engineering", href: "/engineering", icon: Braces, desc: "Advanced modules" },
  { id: "about", label: "About", href: "/about", icon: Sparkles, desc: "Studio story" },
  { id: "contact", label: "Contact", href: "/start", icon: Mail, desc: "Get estimate in 24h" },
];

const CONTACT = {
  email: "vadrud2016@gmail.com",
  phone: "+15873227188",
};

const SALES_PROMISE = "Reply in 24h with scope, timeline, and budget.";

const services = [
  { icon: Braces, title: "Software Development", desc: "Back-/front-end, mobile apps, integrations, microservices, DevOps.", tags: ["Django", "Node", "React", "Postgres", "Docker", "K8s"] },
  { icon: Workflow, title: "Custom CRM", desc: "Process analysis, architecture, data migration, roles, reporting.", tags: ["Leads", "Pipelines", "BI", "RBAC", "SLA"] },
  { icon: Megaphone, title: "SMM & Marketing", desc: "Content strategy, creative, performance, UGC, influencers.", tags: ["Meta/Ads", "TikTok", "SEO", "Email", "Brand"] },
  { icon: LineChart, title: "Analytics & Growth", desc: "Funnels, LTV/CAC, A/B testing, attribution, unit-economics.", tags: ["GA4", "Amplitude", "Mixpanel", "DBT", "ETL"] },
  { icon: Gauge, title: "Support & SLA", desc: "24/7 monitoring, SRE practices, observability, disaster recovery.", tags: ["SLO/SLA", "On-call", "Grafana", "Sentry"] },
  { icon: Rocket, title: "Launch & GTM", desc: "Product-market fit, roadmaps, releases, demos, sales enablement.", tags: ["GTM", "Pitch", "Demo"] },
  { icon: Bot, title: "AI Chatbot Service", desc: "Custom AI assistant for automation, lead generation and support.", tags: ["AI", "RAG", "Chat", "CRM"] },
  { icon: Sparkles, title: "Branding & Design", desc: "Identity, UI systems, motion, design tokens.", tags: ["Logo", "UI Kit", "Motion", "Tokens"] },
  { icon: Star, title: "SEO / ASO", desc: "Technical SEO, content ops, on-page, app store optimization.", tags: ["Core Web Vitals", "Schema", "Backlinks"] },
];

const whoWeWorkWith = [
  { title: "For Founders", lines: ["MVP → product → scale", "SaaS, marketplaces, internal tools"] },
  { title: "For Small Businesses", lines: ["Websites, e-commerce, bookings", "Automation instead of hiring staff"] },
  { title: "For Teams", lines: ["Internal CRMs & dashboards", "Roles, reporting, integrations"] },
];

const notForEveryoneItems = [
  { title: "Founders without decision power", desc: "We need a clear owner who can approve scope, budget, and trade-offs." },
  { title: "\"Copy competitor X\" requests", desc: "We research markets, but we do not clone existing products." },
  { title: "Projects without admin control", desc: "Admin access is non-negotiable for reliable operations." },
  { title: "\"Cheap & fast\" expectations", desc: "We move quickly, but never by trading away quality." },
];

const QUALIFICATION_STORAGE_KEY = "qualificationGate";

const QUAL_DEFAULTS = {
  projectType: "saas",
  complexity: "medium",
  budget: "10_25k",
  timeline: "soon",
};

const QUAL_PROJECT_OPTIONS = [
  { value: "saas", label: "SaaS / web product", description: "MVP to scale" },
  { value: "crm", label: "CRM / internal tool", description: "Admin-first workflows" },
  { value: "marketplace", label: "Marketplace / platform", description: "Multi-sided flows" },
  { value: "commerce", label: "Commerce", description: "Catalog, checkout, operations" },
  { value: "unsure", label: "Not sure yet", description: "We can scope together" },
];

const QUAL_COMPLEXITY_OPTIONS = [
  { value: "simple", label: "Simple", description: "1-2 workflows, low integrations", minBudget: 5000 },
  { value: "medium", label: "Medium", description: "Multiple workflows, core integrations", minBudget: 10000 },
  { value: "complex", label: "Complex", description: "Heavy integrations, multi-role ops", minBudget: 25000 },
];

const QUAL_BUDGET_OPTIONS = [
  { value: "under_5k", label: "Under $5k", description: "Prototype or discovery", amount: 4000 },
  { value: "5_10k", label: "$5k-10k", description: "Tight MVP scope", amount: 7500 },
  { value: "10_25k", label: "$10k-25k", description: "Standard build", amount: 15000 },
  { value: "25_50k", label: "$25k-50k", description: "Multi-sprint delivery", amount: 35000 },
  { value: "50k_plus", label: "$50k+", description: "Platform scale", amount: 60000 },
];

const QUAL_TIMELINE_OPTIONS = [
  { value: "urgent", label: "ASAP (2-3 weeks)", description: "Hard launch or deadline" },
  { value: "soon", label: "4-8 weeks", description: "Standard delivery window" },
  { value: "steady", label: "8-12 weeks", description: "Phased build" },
  { value: "flexible", label: "Flexible", description: "Open timeline" },
];

const ESTIMATE_STORAGE_KEY = "estimateSnapshot";

const MATURITY_LABELS = {
  idea: "Idea",
  mvp: "MVP",
  growth: "Growth",
  scale: "Scale",
  unknown: "Unspecified",
};

const preCallWorkflow = [
  { title: "Discovery", desc: "Clarify goals, constraints, success metrics, and decision owner." },
  { title: "Design", desc: "Map flows, data model, and system boundaries." },
  { title: "Build", desc: "Plan milestones, sprints, QA, and launch." },
  { title: "Grow", desc: "Instrument, review outcomes, and iterate." },
];

const preCallResources = [
  { title: "Architecture Preview", desc: "System map across frontend, backend, data, and integrations.", to: "/architecture-preview" },
  { title: "Production Checklist", desc: "Release, monitoring, and security defaults.", to: "/production-ready" },
  { title: "Engineering Journal", desc: "Decision notes and trade-offs from real builds.", to: "/journal" },
];

const preCallPrepItems = [
  "Primary goal and non-goals for this build.",
  "Current stack or screenshots if replacing something.",
  "Must-have workflows and known risks.",
  "Decision owner + stakeholders who must sign off.",
  "Timeline drivers and acceptable budget range.",
  "External systems or integrations to consider.",
];

/* ===== Projects with image galleries ===== */
const projectSeed = [
  {
    title: "Bad Guy Motors — Motorcycle Parts Catalog",
    impact: "Commerce · SEO",
    blurb: "E-commerce catalog for motorcycle parts with clear navigation and search.",
    outcome: "Searchable catalog with SKU taxonomy and SEO landing pages.",
    links: [{ label: "Live", href: "https://badguymotors.com" }],
    url: "https://badguymotors.com",
    tags: ["Commerce", "Catalog", "SEO"],
    images: [
      "assets/projects/bgm/1.png",
      "assets/projects/bgm/2.png",
      "assets/projects/bgm/3.png",
    ],
  },
  {
    title: "SwiftFleet — Car Rental Platform",
    impact: "Frontend · Canvas",
    blurb: "Modern car rental web app with playful interactions and fast browsing.",
    outcome: "Multi-step booking flow with availability, pricing, and vehicle filters.",
    links: [
      { label: "Live", href: "https://rcc00n.github.io/grr/index.html" },
      { label: "Repo", href: "https://github.com/rcc00n/grr" },
    ],
    url: "https://rcc00n.github.io/grr/",
    tags: ["Web", "Rental"],
    images: [
      "assets/projects/swiftfleet/1.png",
      "assets/projects/swiftfleet/2.png",
      "assets/projects/swiftfleet/3.png",
    ],
  },
  {
    title: "WorldDoc — Global Doctor Finder",
    impact: "Search · Directory",
    blurb: "Online service to discover doctors worldwide, filter by speciality and region.",
    outcome: "Global directory with specialty taxonomy and region-based filters.",
    links: [
      { label: "Live", href: "https://rcc00n.github.io/prj_E/" },
      { label: "Repo", href: "https://github.com/rcc00n/prj_E" },
    ],
    url: "https://rcc00n.github.io/prj_E/",
    tags: ["Directory", "Search"],
    images: [
      "assets/projects/worlddoc/1.png",
      "assets/projects/worlddoc/2.png",
    ],
  },
  {
    title: "NorthPeak — Personal Portfolio Site",
    impact: "Landing · Branding",
    blurb: "Clean personal landing page to showcase work, bio and contacts.",
    outcome: "Fast, single-page funnel that directs leads to contact.",
    links: [
      { label: "Live", href: "https://rcc00n.github.io/SnowPlow/" },
      { label: "Repo", href: "https://github.com/rcc00n/SnowPlow" },
    ],
    url: "https://rcc00n.github.io/SnowPlow/",
    tags: ["Portfolio", "Landing"],
    images: [
      "assets/projects/northpeak/1.png",
      "assets/projects/northpeak/2.png",
    ],
  },
  {
    title: "Mobile Arcade (Android/iOS)",
    impact: "Unity · Mobile",
    blurb: "Lightweight arcade game for phones. Store links/APK can be attached later.",
    outcome: "Cross-platform build pipeline for iOS and Android releases.",
    links: [{ label: "APK / TestFlight", href: "#" }],
    url: "https://example.com",
    tags: ["Mobile", "Game"],
    images: [
      "assets/projects/arcade/1.png",
      // "/assets/projects/arcade/2.png",
    ],
  },
  {
    title: "PortfolioSite — Studio Website",
    impact: "React · Tailwind · Framer Motion",
    blurb: "This very site: modern portfolio built with React, Tailwind, and Framer Motion. Responsive, animated, and fully modular.",
    outcome: "Modular marketing site with reusable sections and routed pages.",
    links: [
      { label: "Live", href: "https://rcc00n.github.io/portf/" },
      { label: "Repo", href: "https://github.com/rcc00n/portf" },
    ],
    url: "https://yourdomain.com",
    tags: ["Portfolio", "React", "Tailwind", "Framer Motion"],
    images: [
      "assets/projects/portfolio/1.png",
      "assets/projects/portfolio/2.png",
      // "/assets/projects/portfolio/3.png",
    ],
  },
];

const projectOutcomeOverrides = {
  "PDF Creator": "Automated contract generation for small teams",
  "Renter": "Full marketplace with payments, disputes, and financial ledger",
  "MeatDirect": "Production-ready e-commerce with admin-managed content",
};

const pricingSeed = [
  { tier: "CRM Basic", price: "$6k", info: "4–6 weeks · core features", points: ["Architecture & UX", "Main CRM features", "Basic analytics", "Deploy & docs"] },
  { tier: "CRM Standard", price: "$11k", info: "6–10 weeks · 2+ integrations", points: ["Advanced roles & reports", "Custom dashboards", "Sales pipeline automation", "Observability & alerts"], featured: true },
  { tier: "CRM Pro", price: "$18k", info: "10–14 weeks · scale", points: ["Complex integrations", "Full analytics suite", "Marketing funnels", "Support & SLA"] },
  { tier: "Custom Software", price: "Custom", info: "Unique scope & team setup", points: ["Dedicated squad", "Architecture runway", "Budget & roadmap", "SLA on demand"] },
  { tier: "AI Bot Service", price: "$3k", info: "Chatbot + CRM integration", points: ["Your data (RAG)", "Web/Widget/WhatsApp", "Handover to human agent", "Dashboards & KPIs"] },
];

const stack = [
  "TypeScript", "React/Next.js", "Node", "Python/Django", "Go", "Ruby/Rails",
  "Postgres", "MySQL", "MongoDB", "Redis", "Elasticsearch",
  "Kafka/SQS", "gRPC", "WebSockets", "Docker/K8s", "Terraform",
  "AWS/GCP/Azure", "CloudFront/CF", "Vercel/Netlify",
  "Tailwind", "Framer Motion", "Radix UI", "shadcn/ui",
  "Cypress/Playwright", "Vitest/Jest", "Storybook",
  "OpenAPI/Swagger", "LangChain", "Vector DBs (PGVector/Weaviate)", "RAG",
];

const journalPosts = [
  {
    title: "Why admin-first systems outperform pretty dashboards",
    sections: [
      {
        title: "Control plane first",
        body: "Dashboards are read-only. Admin tools are where decisions become edits. If the write path is weak, the UI is theater.",
      },
      {
        title: "Exceptions show the truth",
        body: "Refunds, overrides, and edge cases reveal where margin leaks. Admin-first builds those flows before the polish.",
      },
      {
        title: "Schema exposes intent",
        body: "Admin screens force you to name entities and lifecycle states. That clarity keeps analytics honest.",
      },
      {
        title: "Permissions are architecture",
        body: "Roles define data boundaries and workflows. If you postpone them, you rebuild later.",
      },
      {
        title: "Speed beats beauty",
        body: "Ops teams care about getting out of trouble fast. A fast, plain tool beats a slow, pretty one.",
      },
      {
        title: "Auditability over aesthetics",
        body: "If you cannot track who changed what, you cannot scale a team.",
      },
    ],
  },
  {
    title: "What breaks first when a product scales",
    sections: [
      {
        title: "Support load, not servers",
        body: "Tickets spike before CPU does. Missing workflows and unclear ownership show up first.",
      },
      {
        title: "State assumptions",
        body: "A single source of truth turns into multiple writers. Concurrency bugs replace feature bugs.",
      },
      {
        title: "Role edges",
        body: "Happy-path permissions fail when new teams join. You end up patching with exceptions.",
      },
      {
        title: "Background jobs",
        body: "Queues grow, retries cascade, idempotency becomes mandatory.",
      },
      {
        title: "Observability noise",
        body: "Logs multiply without correlation. If you cannot trace a request, you cannot fix it.",
      },
      {
        title: "Process drift",
        body: "Manual workarounds become default behavior. If you do not formalize them, quality drops.",
      },
    ],
  },
  {
    title: "Why we never ship without audit logs",
    sections: [
      {
        title: "Debugging time",
        body: "Audit logs turn anecdotes into timelines. Root cause starts with a concrete sequence.",
      },
      {
        title: "Security baseline",
        body: "Without logs, you cannot prove or disprove a breach. That is operational debt.",
      },
      {
        title: "Operational trust",
        body: "Teams act faster when edits are traceable. Confidence beats hesitation.",
      },
      {
        title: "Compliance pressure",
        body: "Even small businesses get asked for change history. Logs keep you ahead of it.",
      },
      {
        title: "Rollback with context",
        body: "You can reverse a change only if you know the actor and the payload.",
      },
      {
        title: "Product discipline",
        body: "If a feature cannot emit audit events, it is not ready to ship.",
      },
    ],
  },
];

const decisionRecords = [
  {
    title: "Why we don't start with microservices",
    context: "Early teams have moving requirements, unclear domain boundaries, and limited operators. Splitting too soon multiplies failure modes.",
    decision: "Start with a modular monolith and enforce boundaries through interfaces, packages, and clear ownership.",
    tradeoffs: "Less independent deployment and more shared runtime risk. You trade flexibility for focus and speed.",
    change: "We split when domains stabilize, teams can own services end-to-end, and deployment coupling becomes the bottleneck.",
  },
  {
    title: "When real-time is a bad idea",
    context: "Real-time adds state, infra, and UX complexity. Most workflows do not require sub-second updates.",
    decision: "Prefer near-real-time with polling or event-driven refresh for the few panels that demand it.",
    tradeoffs: "Slightly stale data and less visual drama. You gain simpler failure handling and lower cost.",
    change: "We go real-time when latency directly impacts revenue or safety and the budget covers streaming infra.",
  },
  {
    title: "Why every system needs roles & permissions",
    context: "Data access is never uniform. The first incident usually starts with someone seeing or changing too much.",
    decision: "Define roles early and design data models around least-privilege access.",
    tradeoffs: "More upfront design and a larger test surface. It prevents expensive rework later.",
    change: "We relax only for truly single-user products with no sensitive data and no audit needs.",
  },
];

const engagementModels = [
  {
    title: "Product Squad",
    desc: "Cross-functional team to ship roadmap in weeks, not quarters.",
    points: ["PM + Tech Lead", "Design system", "Weekly demos"],
  },
  {
    title: "CRM Transformation",
    desc: "Audit, rebuild, and integrate the operations layer of your business.",
    points: ["Data migration", "Role-based access", "SLA + observability"],
  },
  {
    title: "Growth Pod",
    desc: "Performance marketing with analytics that ties spend to revenue.",
    points: ["Channel strategy", "Experiment cadence", "LTV/CAC modeling"],
  },
];

const serviceStandards = [
  "Senior-only delivery team",
  "Security and compliance reviews",
  "QA automation in every sprint",
  "Product analytics from day one",
  "Production-grade monitoring",
  "Clear documentation and handoff",
];

const projectOutcomes = [
  { title: "Revenue acceleration", metric: "3.1x", desc: "Average uplift from CRM and growth revamps." },
  { title: "Operational efficiency", metric: "27%", desc: "Shorter sales cycles with automation." },
  { title: "Conversion lift", metric: "38%", desc: "UX and performance improvements in funnels." },
];

const processSteps = [
  {
    title: "Discovery",
    desc: "Align on outcomes, constraints, and technical risk early.",
    points: ["Stakeholder interviews", "Success metrics", "Risk map"],
  },
  {
    title: "Strategy",
    desc: "Define the product shape and the measurable win.",
    points: ["Roadmap", "Information architecture", "Technical plan"],
  },
  {
    title: "Design",
    desc: "Prototype fast, lock the system, test with real users.",
    points: ["UX flows", "Design system", "Usability tests"],
  },
  {
    title: "Build",
    desc: "Ship with velocity and quality controls in every sprint.",
    points: ["2-week sprints", "QA automation", "Security review"],
  },
  {
    title: "Launch + Grow",
    desc: "Release, monitor, and optimize the metrics that matter.",
    points: ["Analytics setup", "Experiments", "Support playbooks"],
  },
];

const processRituals = [
  { title: "Weekly demos", desc: "Stakeholder alignment every 7 days." },
  { title: "Decision log", desc: "Clear records for scope, risks, and trade-offs." },
  { title: "Release cadence", desc: "Predictable launches without crunch." },
];

const pricingPrinciples = [
  { title: "Fixed scope or squad", desc: "Choose milestones or a dedicated team." },
  { title: "Transparent change control", desc: "No surprises when scope shifts." },
  { title: "Launch support included", desc: "Stabilization and monitoring post-launch." },
  { title: "Value-based options", desc: "Tie budgets to measurable outcomes." },
];

const pricingAddOns = [
  "Growth experiments and media buying",
  "24/7 on-call and SLA",
  "Security and compliance audits",
  "Data warehouse + BI",
];

const stackGroups = [
  { title: "Product", items: ["TypeScript", "React/Next.js", "Tailwind", "Framer Motion", "Radix UI"] },
  { title: "Backend", items: ["Node", "Python/Django", "Go", "Ruby/Rails", "gRPC"] },
  { title: "Data", items: ["Postgres", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Kafka"] },
  { title: "Infra", items: ["Docker", "K8s", "Terraform", "AWS/GCP/Azure", "Vercel/Netlify"] },
  { title: "Quality", items: ["Cypress", "Playwright", "Vitest/Jest", "Storybook", "OpenAPI/Swagger"] },
  { title: "AI", items: ["LangChain", "RAG", "Vector DBs", "Prompt evals"] },
];

const engineeringPrinciples = [
  { title: "Performance budgets", desc: "Every screen ships with clear speed targets." },
  { title: "Security by default", desc: "Threat modeling and least-privilege access." },
  { title: "Observability first", desc: "Logs, traces, and metrics wired in from day one." },
];

const aboutValues = [
  { title: "Ownership", desc: "We act like partners, not vendors." },
  { title: "Signal over noise", desc: "Decisions backed by data and user insight." },
  { title: "Design with intent", desc: "Every pixel has a reason." },
  { title: "Calm execution", desc: "Senior teams keep the pace sustainable." },
];

const contactSteps = [
  { title: "Intro call", desc: "30 minutes to align on goals." },
  { title: "Scope brief", desc: "We map features, tech, and risks." },
  { title: "Proposal", desc: "Timeline, budget, and team in 3-5 days." },
];

const getValidOption = (value, options, fallback) => (
  options.some((option) => option.value === value) ? value : fallback
);

const normalizeQualification = (payload = {}) => ({
  projectType: getValidOption(payload.projectType, QUAL_PROJECT_OPTIONS, QUAL_DEFAULTS.projectType),
  complexity: getValidOption(payload.complexity, QUAL_COMPLEXITY_OPTIONS, QUAL_DEFAULTS.complexity),
  budget: getValidOption(payload.budget, QUAL_BUDGET_OPTIONS, QUAL_DEFAULTS.budget),
  timeline: getValidOption(payload.timeline, QUAL_TIMELINE_OPTIONS, QUAL_DEFAULTS.timeline),
});

const getStoredQualification = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(QUALIFICATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return normalizeQualification(parsed);
  } catch {
    return null;
  }
};

const normalizeEstimate = (payload = {}) => ({
  product: getValidOption(payload.product, ESTIMATE_PRODUCT_OPTIONS, ESTIMATE_PRODUCT_OPTIONS[0].value),
  complexity: getValidOption(payload.complexity, ESTIMATE_COMPLEXITY_OPTIONS, ESTIMATE_COMPLEXITY_OPTIONS[0].value),
  team: getValidOption(payload.team, ESTIMATE_TEAM_OPTIONS, ESTIMATE_TEAM_OPTIONS[1].value),
  integrations: getValidOption(payload.integrations, ESTIMATE_INTEGRATION_OPTIONS, ESTIMATE_INTEGRATION_OPTIONS[1].value),
});

const getStoredEstimate = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ESTIMATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return normalizeEstimate(parsed);
  } catch {
    return null;
  }
};

const mapQualificationToEstimate = (qualification) => {
  if (!qualification) return null;
  const productMap = {
    crm: "CRM",
    marketplace: "Marketplace",
    commerce: "E-commerce",
    saas: "CRM",
    unsure: ESTIMATE_PRODUCT_OPTIONS[0].value,
  };
  const complexityMap = {
    simple: "Lean",
    medium: "Balanced",
    complex: "Advanced",
  };

  return normalizeEstimate({
    product: productMap[qualification.projectType] || ESTIMATE_PRODUCT_OPTIONS[0].value,
    complexity: complexityMap[qualification.complexity] || ESTIMATE_COMPLEXITY_OPTIONS[0].value,
    team: ESTIMATE_TEAM_OPTIONS[1].value,
    integrations: ESTIMATE_INTEGRATION_OPTIONS[1].value,
  });
};

const getMaturityFromQualification = (qualification) => {
  if (!qualification) return "unknown";
  const budgetScore = {
    under_5k: 0,
    "5_10k": 1,
    "10_25k": 2,
    "25_50k": 3,
    "50k_plus": 4,
  };
  const complexityScore = {
    simple: 0,
    medium: 1,
    complex: 2,
  };
  const score = (budgetScore[qualification.budget] ?? 0) + (complexityScore[qualification.complexity] ?? 0);
  if (score <= 1) return "idea";
  if (score <= 3) return "mvp";
  if (score <= 5) return "growth";
  return "scale";
};

const getMaturityFromEstimate = (estimate) => {
  if (!estimate) return "unknown";
  const complexityScore = { Lean: 0, Balanced: 1, Advanced: 2 };
  const integrationScore = { None: 0, Standard: 1, Heavy: 2 };
  const score = (complexityScore[estimate.complexity] ?? 0) + (integrationScore[estimate.integrations] ?? 0);
  if (score <= 1) return "idea";
  if (score <= 2) return "mvp";
  if (score <= 3) return "growth";
  return "scale";
};

const getLeadRouting = () => {
  const qualification = getStoredQualification();
  if (qualification) {
    return {
      productType: qualification.projectType,
      complexity: qualification.complexity,
      maturity: getMaturityFromQualification(qualification),
    };
  }
  const estimate = getStoredEstimate();
  if (estimate) {
    const productMap = {
      CRM: "crm",
      Marketplace: "marketplace",
      "E-commerce": "commerce",
    };
    const complexityMap = {
      Lean: "simple",
      Balanced: "medium",
      Advanced: "complex",
    };
    return {
      productType: productMap[estimate.product] || "unknown",
      complexity: complexityMap[estimate.complexity] || "unknown",
      maturity: getMaturityFromEstimate(estimate),
    };
  }
  return { productType: "unknown", complexity: "unknown", maturity: "unknown" };
};

const getOptionLabel = (value, options) => options.find((option) => option.value === value)?.label || value || "-";

const getOptionRating = (value, options) => {
  const index = options.findIndex((option) => option.value === value);
  return index >= 0 ? index + 1 : null;
};

const buildQualificationSnapshot = (qualification) => {
  if (!qualification) return null;
  const buildItem = (value, options) => {
    const option = options.find((entry) => entry.value === value);
    const rating = getOptionRating(value, options);
    if (!option || rating === null) return null;
    return {
      value: option.value,
      label: option.label,
      rating,
      total: options.length,
    };
  };

  const snapshot = {
    projectType: buildItem(qualification.projectType, QUAL_PROJECT_OPTIONS),
    complexity: buildItem(qualification.complexity, QUAL_COMPLEXITY_OPTIONS),
    budget: buildItem(qualification.budget, QUAL_BUDGET_OPTIONS),
    timeline: buildItem(qualification.timeline, QUAL_TIMELINE_OPTIONS),
  };

  return Object.values(snapshot).some(Boolean) ? snapshot : null;
};

const getMaturityLabel = (value) => MATURITY_LABELS[value] || MATURITY_LABELS.unknown;

const buildRoutingParams = (routing) => {
  const params = new URLSearchParams();
  if (routing?.productType && routing.productType !== "unknown") {
    params.set("product", routing.productType);
  }
  if (routing?.complexity && routing.complexity !== "unknown") {
    params.set("complexity", routing.complexity);
  }
  if (routing?.maturity && routing.maturity !== "unknown") {
    params.set("maturity", routing.maturity);
  }
  return params;
};

const appendRoutingToSource = (source, routing) => {
  const params = buildRoutingParams(routing);
  const query = params.toString();
  if (!query) return source;
  if (!source) return `/?${query}`;
  const joiner = source.includes("?") ? "&" : "?";
  return `${source}${joiner}${query}`;
};

const buildPreCallUrl = (routing) => {
  const params = buildRoutingParams(routing);
  const query = params.toString();
  return query ? `/pre-call?${query}` : "/pre-call";
};

const buildSummaryNextSteps = ({ product, integrations }) => {
  const steps = [
    "Review the pre-call package.",
    "Share goals, constraints, and success metrics.",
    "Confirm decision owner and stakeholders.",
    "Confirm timeline range and launch drivers.",
  ];
  if (integrations && integrations !== "None") {
    steps.push("List external systems, owners, and access needs.");
  }
  if (product === "Marketplace") {
    steps.push("Define trust, payouts, and dispute flow.");
  } else if (product === "E-commerce") {
    steps.push("Provide catalog structure and fulfillment flow.");
  } else if (product === "CRM") {
    steps.push("Share pipeline stages and role matrix.");
  }
  return steps;
};

/* ===================== UI helpers ===================== */
const PERFORMANCE_MODE = true;
const fade = PERFORMANCE_MODE
  ? { initial: false, transition: {} }
  : { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: "easeOut" }, viewport: { once: true, amount: 0.3 } };
const collapsedFadeMask = {
  WebkitMaskImage: "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 55%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0) 100%)",
  maskImage: "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 55%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0) 100%)",
};
const collapsedOverlayMask = {
  WebkitMaskImage: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 55%, rgba(255,255,255,0) 100%)",
  maskImage: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 55%, rgba(255,255,255,0) 100%)",
};
const isExternalUrl = (url) => /^https?:\/\//i.test(url || "");
const getProjectMeta = (project) => {
  const rawLinks = Array.isArray(project?.links) ? project.links.filter((l) => l?.href) : [];
  const primaryUrl = project?.url || project?.website || project?.link || rawLinks[0]?.href;
  const hasPrimaryLink = primaryUrl && rawLinks.some((l) => l.href === primaryUrl);
  const actionLinks = primaryUrl && !hasPrimaryLink
    ? [{ label: "Visit site", href: primaryUrl }, ...rawLinks]
    : rawLinks;

  return {
    primaryUrl,
    actionLinks,
    isPrimaryExternal: isExternalUrl(primaryUrl),
    previewUrl: isExternalUrl(primaryUrl) ? primaryUrl : null,
  };
};
const getProjectOutcome = (project) => project?.outcome || projectOutcomeOverrides[project?.title] || "";

const InfiniteBackground = () => (
  <div className="infinite-bg" aria-hidden>
    <div className="infinite-bg__mesh" />
    <div className="infinite-bg__spectrum" />
    <div className="infinite-bg__aurora" />
    <div className="infinite-bg__noise" />
    <div className="infinite-bg__vignette" />
  </div>
);

const Section = ({ id, children, className = "" }) => (
  <section id={id} className={`relative py-24 sm:py-28 ${className}`}>
    <div className="mx-auto w-full max-w-7xl px-6">{children}</div>
  </section>
);

const Badge = ({ children, className = "" }) => (
  <span className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 ${className}`}>{children}</span>
);

const Card = ({ children, className = "", ...props }) => (
  <div {...props} className={`rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl shadow-black/30 ${className}`}>{children}</div>
);

const H2 = ({ children }) => (
  <motion.h2 {...fade} className="mb-10 text-3xl font-semibold">
    <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">{children}</span>
  </motion.h2>
);

const Btn = ({ as = "a", className = "", children, ...props }) => {
  const Comp = as === "button" ? motion.button : motion.a;
  const motionProps = PERFORMANCE_MODE ? {} : { whileHover: { y: -2, scale: 1.02 }, whileTap: { scale: 0.98 } };
  return (
    <Comp {...motionProps} {...props} className={`inline-flex items-center justify-center text-center rounded-xl px-5 py-3 font-medium transition-colors ${className}`}>
      {children}
    </Comp>
  );
};

const BtnLink = ({ to, className = "", children, analyticsLabel = "", analyticsMeta, onClick, ...props }) => {
  const handleClick = (event) => {
    if (analyticsLabel) {
      trackCtaClick(analyticsLabel, to, analyticsMeta);
    }
    if (onClick) onClick(event);
  };

  return (
    <motion.span
      {...(PERFORMANCE_MODE ? {} : { whileHover: { y: -2, scale: 1.02 }, whileTap: { scale: 0.98 } })}
      className="inline-flex"
    >
      <Link
        to={to}
        onClick={handleClick}
        className={`inline-flex items-center justify-center text-center rounded-xl px-5 py-3 font-medium transition-colors ${className}`}
        {...props}
      >
        {children}
      </Link>
    </motion.span>
  );
};

const Logo = ({ size = "h-12 w-12 sm:h-14 sm:w-14" }) => (
  <div className="flex items-center gap-3">
    <img
      src={raccoonLogo}
      alt="raccoon logo"
      className={`${size} -ml-1 select-none drop-shadow-[0_0_24px_rgba(56,189,248,.45)]`}
      decoding="async"
      loading="eager"
      draggable={false}
    />
    <span className="text-lg sm:text-xl font-semibold tracking-wide">studio</span>
  </div>
);

const ContactInline = ({ className = "", linkClassName = "" }) => (
  <div className={`flex flex-wrap items-center gap-4 ${className}`}>
    <a
      href={`mailto:${CONTACT.email}`}
      className={`inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-300 hover:text-white ${linkClassName}`}
    >
      <Mail className="h-4 w-4" /> {CONTACT.email}
    </a>
    <a
      href={`tel:${CONTACT.phone}`}
      className={`inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-300 hover:text-white ${linkClassName}`}
    >
      <Phone className="h-4 w-4" /> {CONTACT.phone}
    </a>
  </div>
);

/* ===== Pricing card variants ===== */
const TierCardClean = ({ children, featured = false }) => (
  <div
    className={[
      "relative h-full rounded-2xl p-[1px]",
      "bg-[linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.06))]",
      featured ? "ring-1 ring-white/25" : "ring-1 ring-white/10",
      "transition-transform duration-300 will-change-transform"
    ].join(" ")}
  >
    <Card
      className={[
        "relative h-full rounded-[14px] bg-zinc-950/70",
        "shadow-[0_18px_60px_rgba(0,0,0,.45)]",
        "hover:shadow-[0_24px_80px_rgba(0,0,0,.55)]",
        "transition-all duration-300"
      ].join(" ")}
    >
      {children}
    </Card>
  </div>
);

const StatPill = ({ icon: Icon, children }) => (
  <li className="flex items-center gap-2 rounded-xl bg-white/6 p-3 text-sm text-zinc-200">
    <Icon className="h-4 w-4 opacity-90" /> {children}
  </li>
);

const PageHero = ({ kicker, title, subtitle, primary, secondary, stats = [] }) => (
  <header className="relative overflow-hidden">
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 pb-16 pt-20 text-center sm:pb-20">
      {kicker ? (
        <motion.div {...fade} className="flex flex-wrap items-center justify-center gap-3">
          <Badge>{kicker}</Badge>
          <Badge className="border-white/15 text-white/80">Senior-only delivery</Badge>
        </motion.div>
      ) : null}
      <motion.h1 {...fade} className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-4xl font-semibold leading-tight text-transparent sm:text-6xl">
        {title}
      </motion.h1>
      <motion.p {...fade} className="max-w-2xl text-lg text-zinc-300">
        {subtitle}
      </motion.p>
      {(primary || secondary) ? (
        <motion.div {...fade} className="flex flex-wrap items-center justify-center gap-3">
          {primary ? (
            <BtnLink to={primary.to} analyticsLabel={primary.label} analyticsMeta={{ context: "hero" }} className="bg-white text-black hover:bg-zinc-200">
              {primary.label}
            </BtnLink>
          ) : null}
          {secondary ? (
            <BtnLink to={secondary.to} analyticsLabel={secondary.label} analyticsMeta={{ context: "hero" }} className="border border-white/15 text-white hover:bg-white/5">
              {secondary.label}
            </BtnLink>
          ) : null}
        </motion.div>
      ) : null}
      <div className="mt-4 text-xs text-zinc-400">{SALES_PROMISE}</div>
      {stats.length ? (
        <div className="mx-auto mt-6 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat, idx) => (
            <motion.div key={`${stat.label}-${idx}`} {...fade} transition={{ ...fade.transition, delay: idx * 0.05 }}>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left">
                <div className="text-2xl font-semibold text-white">{stat.value}</div>
                <div className="text-xs uppercase tracking-wide text-zinc-400">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : null}
    </div>
  </header>
);

const emptyContactForm = {
  name: "",
  email: "",
  company: "",
  message: "",
};

const ContactForm = ({ apiBase = "", source = "" }) => {
  const [form, setForm] = useState(emptyContactForm);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const isSubmitting = status.state === "loading";
  const navigate = useNavigate();

  const validate = (values) => {
    const errors = {};
    if (!values.name.trim()) errors.name = "Name is required.";
    if (!values.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = "Enter a valid email.";
    }
    if (!values.message.trim()) errors.message = "Project details are required.";
    return errors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (status.state !== "idle" && status.state !== "loading") {
      setStatus({ state: "idle", message: "" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setSubmitted(true);

    const errors = validate(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setStatus({ state: "error", message: "Please fill the highlighted fields." });
      return;
    }

    setStatus({ state: "loading", message: "" });
    setFieldErrors({});

    const routing = getLeadRouting();
    const baseSource = source || (typeof window !== "undefined" ? window.location.pathname : "");
    const sourceWithRouting = appendRoutingToSource(baseSource, routing);
    const qualificationSnapshot = buildQualificationSnapshot(getStoredQualification());

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      message: form.message.trim(),
      source: sourceWithRouting,
      routing,
    };
    if (qualificationSnapshot) {
      payload.qualification = qualificationSnapshot;
    }

    try {
      const response = await fetch(`${apiBase}/api/contacts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }
        const serverErrors = data?.fields && typeof data.fields === "object" ? data.fields : {};
        if (Object.keys(serverErrors).length) {
          setFieldErrors(serverErrors);
        }
        setStatus({
          state: "error",
          message: data?.error || "We could not send your brief. Please try again.",
        });
        return;
      }

      setStatus({ state: "success", message: "Thanks! We will reply within 24 hours." });
      setForm(emptyContactForm);
      setSubmitted(false);
      navigate(buildPreCallUrl(routing), { replace: true });
    } catch {
      setStatus({ state: "error", message: "We could not send your brief. Please try again." });
    }
  };

  const baseField = "rounded-xl border bg-zinc-900/60 px-4 py-3 outline-none placeholder:text-zinc-500 transition";
  const focusField = "focus:border-cyan-300/60 focus:ring-1 focus:ring-cyan-300/30";
  const errorField = "border-rose-400/50 focus:border-rose-400/80 focus:ring-1 focus:ring-rose-400/30";
  const fieldClass = (hasError) => `${baseField} ${hasError ? errorField : `border-white/10 ${focusField}`}`;
  const showError = (field) => submitted && fieldErrors[field];

  return (
    <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-1">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className={fieldClass(showError("name"))}
          placeholder="Name"
          autoComplete="name"
          aria-invalid={showError("name")}
        />
        {showError("name") ? <span className="text-xs text-rose-300">{fieldErrors.name}</span> : null}
      </div>
      <div className="flex flex-col gap-1">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className={fieldClass(showError("email"))}
          placeholder="Email"
          autoComplete="email"
          aria-invalid={showError("email")}
        />
        {showError("email") ? <span className="text-xs text-rose-300">{fieldErrors.email}</span> : null}
      </div>
      <div className="flex flex-col gap-1 md:col-span-2">
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={handleChange}
          className={fieldClass(false)}
          placeholder="Company / website"
          autoComplete="organization"
        />
      </div>
      <div className="flex flex-col gap-1 md:col-span-2">
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          className={fieldClass(showError("message"))}
          placeholder="Describe the project: goals, deadlines, key features"
          aria-invalid={showError("message")}
        />
        {showError("message") ? <span className="text-xs text-rose-300">{fieldErrors.message}</span> : null}
      </div>
      {status.message ? (
        <div
          className={`md:col-span-2 text-sm ${status.state === "success" ? "text-emerald-300" : "text-rose-300"}`}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-4 md:col-span-2">
        <ContactInline />
        <Btn
          as="button"
          type="submit"
          disabled={isSubmitting}
          className={`ml-auto bg-white text-black hover:bg-zinc-200 ${isSubmitting ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {isSubmitting ? "Sending..." : "Get estimate in 24h"}
        </Btn>
      </div>
      <div className="md:col-span-2 flex flex-wrap gap-3 text-xs text-zinc-500">
        <span>We reply personally</span>
        <span>NDA available on request</span>
        <span>No sales calls unless needed</span>
      </div>
    </form>
  );
};

const CTABox = ({ title, subtitle, primaryLabel = "Get estimate in 24h", primaryTo = "/start", secondaryLabel = "See pricing", secondaryTo = "/pricing" }) => (
  <Section className="pt-8">
    <div className="relative">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(80%_120%_at_50%_-20%,rgba(99,102,241,0.35),transparent)]" />
      <Card className="relative overflow-hidden bg-zinc-950/70">
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_10%_10%,rgba(56,189,248,0.15),transparent_45%),radial-gradient(circle_at_90%_0%,rgba(168,85,247,0.18),transparent_50%)]" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Next step</div>
            <div className="mt-2 text-2xl font-semibold text-white">{title}</div>
            <p className="mt-2 max-w-xl text-sm text-zinc-300">{subtitle}</p>
            <div className="mt-4 text-xs text-zinc-400">{SALES_PROMISE}</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <BtnLink to={primaryTo} analyticsLabel={primaryLabel} analyticsMeta={{ context: "cta_box" }} className="bg-white text-black hover:bg-zinc-200">{primaryLabel}</BtnLink>
            <BtnLink to={secondaryTo} analyticsLabel={secondaryLabel} analyticsMeta={{ context: "cta_box" }} className="border border-white/15 text-white hover:bg-white/5">{secondaryLabel}</BtnLink>
          </div>
        </div>
      </Card>
    </div>
  </Section>
);

/* ===== Favicon fallback preview ===== */
const FaviconPreview = ({ url, className = "", heightClass = "h-44", iconClassName = "h-12 w-12" }) => {
  const host = new URL(url).host;
  const chain = [
    `https://www.google.com/s2/favicons?domain=${host}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${host}.ico`,
    url.replace(/\/$/, "") + "/favicon.ico",
  ];

  const onErr = (e) => {
    const i = +(e.currentTarget.dataset.i || 0);
    if (i < chain.length - 1) {
      e.currentTarget.dataset.i = String(i + 1);
      e.currentTarget.src = chain[i + 1];
    } else {
      e.currentTarget.style.display = "none";
      const placeholder = e.currentTarget.nextSibling;
      if (placeholder && placeholder.style) placeholder.style.display = "flex";
    }
  };

  const initials = host.replace(/^www\./, "").split(".")[0].slice(0, 2).toUpperCase();

  return (
    <div className={`mb-4 w-full rounded-xl border border-white/10 bg-zinc-950/60 flex flex-col items-center justify-center text-zinc-400 ${heightClass} ${className}`}>
      <img
        src={chain[0]}
        data-i="0"
        onError={onErr}
        alt=""
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        className={`${iconClassName} rounded`}
      />
      <div style={{ display: "none" }} className={`${iconClassName} items-center justify-center rounded bg-white/5 text-sm`}>
        {initials}
      </div>
      <div className="mt-2 text-xs opacity-70">{host}</div>
    </div>
  );
};

/* ===== Lightweight image carousel ===== */
const ImageCarousel = ({ images, alt = "Preview", heightClass = "h-44", showIndex = false, className = "" }) => {
  const [i, setI] = useState(0);
  const len = images.length;
  const go = (d) => setI((v) => (v + d + len) % len);
  const Img = PERFORMANCE_MODE ? "img" : motion.img;
  const motionProps = PERFORMANCE_MODE
    ? {}
    : { initial: { opacity: 0, scale: 1.02 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.35, ease: "easeOut" } };

  return (
    <div className={`mb-4 relative select-none ${className}`}>
      <div className={`${heightClass} w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950/60`}>
        <Img
          key={i}
          src={images[i]}
          alt={alt}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          draggable={false}
          className={`${heightClass} w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]`}
          {...motionProps}
        />
      </div>

      {showIndex ? (
        <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/60 px-2 py-1 text-[11px] text-white/80">
          {i + 1} / {len}
        </div>
      ) : null}

      <button
        aria-label="Previous"
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-black/55 hover:bg-black/75 border border-white/10"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="Next"
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-black/55 hover:bg-black/75 border border-white/10"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-1.5 w-3 rounded-full ${idx === i ? "bg-white/90" : "bg-white/30 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const MobileNav = ({ open, onClose }) => {
  const location = useLocation();

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (open) onClose();
  }, [location.pathname]);

  if (!open) return null;

  const panel = (
    <>
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={onClose}>
          <Logo size="h-10 w-10" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 bg-white/5 p-2 text-white/80 hover:bg-white/10"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {nav.map((item, idx) => {
          const active = location.pathname === item.href;
          const Icon = item.icon;
          const entry = (
            <Link
              to={item.href}
              onClick={onClose}
              className={`group flex items-center gap-4 rounded-2xl border border-white/10 px-4 py-3 transition ${active ? "bg-white/10" : "bg-white/5 hover:bg-white/10"}`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40">
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-white">{item.label}</span>
                <span className="text-xs text-zinc-400">{item.desc}</span>
              </span>
            </Link>
          );

          return PERFORMANCE_MODE ? (
            <div key={item.id}>{entry}</div>
          ) : (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {entry}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Availability</div>
        <div className="mt-3 text-xl font-semibold text-white">Next slot in 2-3 weeks</div>
        <p className="mt-2 text-sm text-zinc-300">Limited slots per quarter. Reserve yours now.</p>
        <div className="mt-4">
          <BtnLink to="/start" analyticsLabel="Get estimate in 24h" analyticsMeta={{ context: "mobile_nav" }} className="w-full bg-white text-black hover:bg-zinc-200">Get estimate in 24h</BtnLink>
        </div>
        <div className="mt-4 text-xs text-zinc-400">{SALES_PROMISE}</div>
      </div>
    </>
  );

  if (PERFORMANCE_MODE) {
    return (
      <>
        <div
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-black/75"
        />
        <aside
          className="fixed right-0 top-0 z-[70] h-full w-[86vw] max-w-sm overflow-y-auto border-l border-white/10 bg-zinc-950/95 p-6 shadow-2xl"
          aria-label="Mobile navigation"
        >
          {panel}
        </aside>
      </>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/75"
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="fixed right-0 top-0 z-[70] h-full w-[86vw] max-w-sm overflow-y-auto border-l border-white/10 bg-zinc-950/95 p-6 shadow-2xl"
        aria-label="Mobile navigation"
      >
        {panel}
      </motion.aside>
    </AnimatePresence>
  );
};

const FloatingContactButton = () => (
  <div className="fixed bottom-6 left-6 z-40 sm:bottom-8 sm:left-8">
    <BtnLink
      to="/start"
      analyticsLabel="Get estimate in 24h"
      analyticsMeta={{ context: "floating_cta" }}
      className="gap-2 bg-white px-4 py-3 text-sm text-black shadow-lg shadow-black/40 ring-1 ring-white/10 hover:bg-zinc-200"
      aria-label="Get estimate in 24h"
    >
      <Mail className="h-4 w-4" />
      Get estimate in 24h
    </BtnLink>
  </div>
);

const SiteNav = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const handleHomeClick = (event) => {
    if (location.pathname !== "/") return;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.scrollTo(0, 0);
  };

  return (
    <>
      <div className="sticky top-0 z-50">
        <div className="border-b border-white/10 bg-black/85">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link to="/" onClick={handleHomeClick} className="flex items-center gap-2 font-semibold tracking-wide">
              <Logo />
            </Link>
            <nav className="hidden gap-6 md:flex">
              {nav.map((n) => {
                const active = location.pathname === n.href;
                return (
                  <Link
                    key={n.id}
                    to={n.href}
                    className={`text-sm transition-colors ${active ? "text-white" : "text-zinc-300 hover:text-white"}`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <BtnLink to="/start" analyticsLabel="Get estimate in 24h" analyticsMeta={{ context: "nav" }} className="bg-white text-black hover:bg-zinc-200 px-4 py-2 text-sm">Get estimate in 24h</BtnLink>
              </div>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white/80 hover:bg-white/10 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <MobileNav open={open} onClose={() => setOpen(false)} />
    </>
  );
};

const SiteFooter = () => (
  <footer className="border-t border-white/10 py-10">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
      <div className="text-sm text-zinc-400">© {new Date().getFullYear()} studio — CRM, Software, SMM, Marketing</div>
      <ContactInline linkClassName="text-zinc-400 hover:text-white" />
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
        <span className="opacity-50">•</span>
        <a href="#" className="hover:text-zinc-300">Terms</a>
      </div>
    </div>
  </footer>
);

const setMetaTag = (attribute, key, content) => {
  if (typeof document === "undefined") return;
  const selector = `meta[${attribute}="${key}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const applyMeta = (meta) => {
  if (typeof document === "undefined") return;
  document.title = meta.title;
  const origin = window.location.origin;
  const imageUrl = meta.image.startsWith("http") ? meta.image : `${origin}${meta.image}`;

  setMetaTag("name", "description", meta.description);
  setMetaTag("property", "og:title", meta.title);
  setMetaTag("property", "og:description", meta.description);
  setMetaTag("property", "og:type", "website");
  setMetaTag("property", "og:url", window.location.href);
  setMetaTag("property", "og:image", imageUrl);
  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", meta.title);
  setMetaTag("name", "twitter:description", meta.description);
  setMetaTag("name", "twitter:image", imageUrl);
};

const RouteFallback = () => (
  <div className="mx-auto flex min-h-[40vh] max-w-6xl items-center justify-center px-6 py-16 text-sm text-zinc-400">
    Loading module...
  </div>
);

const LazyRoute = ({ children }) => (
  <Suspense fallback={<RouteFallback />}>
    {children}
  </Suspense>
);

const ProjectDetailsModal = ({ project, onClose }) => (
  <AnimatePresence>
    {project ? (() => {
      const { primaryUrl, actionLinks, previewUrl } = getProjectMeta(project);
      return (
        <motion.div
          key={project.title || "project-details"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            role="dialog"
            aria-modal="true"
            aria-label="Project details"
            className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-[0_30px_120px_rgba(0,0,0,.65)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="max-h-[85vh] overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="truncate text-2xl font-semibold">{project.title || "Project"}</h3>
                    {project.impact ? (
                      <span className="rounded-full border border-emerald-400/25 bg-emerald-500/15 px-3 py-1 text-[11px] uppercase tracking-wide text-emerald-200/90">
                        {project.impact}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">Project details</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white/80 transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-6 px-6 pb-6 pt-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  {project.images?.length ? (
                    <ImageCarousel
                      images={project.images}
                      alt={project.title}
                      heightClass="h-64 sm:h-80"
                      showIndex
                      className="mb-0"
                    />
                  ) : previewUrl ? (
                    <FaviconPreview url={previewUrl} heightClass="h-64 sm:h-80" iconClassName="h-16 w-16" className="mb-0" />
                  ) : (
                    <div className="h-64 w-full rounded-2xl border border-white/10 bg-zinc-950/60 flex items-center justify-center text-zinc-500">
                      Project preview
                    </div>
                  )}
                </div>

                <div className="flex h-full flex-col gap-6">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Overview</div>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                      {project.blurb || "Detailed project notes will be published soon."}
                    </p>
                  </div>

                  {project.tags?.length ? (
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Tech stack</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                      </div>
                    </div>
                  ) : null}

                  {actionLinks?.length ? (
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Links</div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {actionLinks.map((l) => {
                          const isExternal = l?.href ? isExternalUrl(l.href) : false;
                          const isPrimary = primaryUrl && l?.href === primaryUrl;
                          return (
                            <Btn
                              key={`${l.label}-${l.href}`}
                              href={l.href}
                              target={isExternal ? "_blank" : undefined}
                              rel={isExternal ? "noreferrer" : undefined}
                              className={[
                                "px-4 py-2 text-xs",
                                isPrimary ? "bg-white text-black hover:bg-zinc-200" : "border border-white/15 text-white hover:bg-white/5"
                              ].join(" ")}
                            >
                              {l.label}
                            </Btn>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      );
    })() : null}
  </AnimatePresence>
);

/* ===================== Pages ===================== */
const HomePage = ({ projectsData, pricingData, apiBase }) => {
  const [showAll, setShowAll] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    if (!activeProject) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeProject]);

  useEffect(() => {
    if (!activeProject) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveProject(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeProject]);

  const handleProjectCardClick = (event, project) => {
    if (event.defaultPrevented) return;
    if (event.target.closest("a,button")) return;
    setActiveProject(project);
  };

  const handleProjectCardKeyDown = (event, project) => {
    if (event.currentTarget !== event.target) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveProject(project);
    }
  };

  return (
    <>
      {/* Hero */}
      <header id="top" className="relative overflow-hidden">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 pb-20 pt-24 text-center">
          <motion.div {...fade} className="flex items-center gap-3">
            <Badge>Revenue-first CRM · Software · Marketing</Badge>
            <Badge><ShieldCheck className="mr-1 inline h-4 w-4" /> Senior-only delivery</Badge>
          </motion.div>
          <motion.h1 {...fade} className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-4xl font-semibold leading-tight text-transparent sm:text-6xl">We build custom software & CRMs that replace manual work and scale revenue</motion.h1>
          <motion.p {...fade} className="max-w-2xl text-lg text-zinc-300">From internal CRMs to marketplaces and automation — built end-to-end with analytics and full admin control.</motion.p>
          <motion.div {...fade} className="flex flex-wrap items-center justify-center gap-3">
            <Btn href="#contact" className="bg-white text-black hover:bg-zinc-200">Get estimate in 24h</Btn>
            <Btn href="#projects" className="border border-white/15 text-white hover:bg-white/5">See our work</Btn>
            <Btn href="#pricing" className="border border-white/15 text-white hover:bg-white/5">Pricing</Btn>
          </motion.div>
          <div className="text-xs text-zinc-400">{SALES_PROMISE}</div>
        </div>
      </header>

      {/* Who we work with */}
      <Section id="who">
        <H2>Who we work with</H2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {whoWeWorkWith.map((group, idx) => (
            <motion.div key={group.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.04 }}>
              <Card className="h-full">
                <div className="text-lg font-semibold">{group.title}</div>
                <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                  {group.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Services */}
      <Section id="services">
        <H2>Services</H2>
        <div className="relative">
          <div
            className={`grid grid-cols-1 gap-6 md:grid-cols-3 transition-all duration-300 ${showAll ? "" : "max-h-[520px] overflow-hidden pb-8"}`}
            style={showAll ? undefined : collapsedFadeMask}
          >
            {services.slice(0, showAll ? services.length : 3).map((s, idx) => (
              <motion.div key={s.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.04 }}>
                <Card className="h-full">
                  <div className="mb-4 flex items-center gap-3"><s.icon className="h-6 w-6 text-white" /><h3 className="text-lg font-semibold">{s.title}</h3></div>
                  <p className="mb-4 text-sm text-zinc-300">{s.desc}</p>
                  <div className="flex flex-wrap gap-2">{s.tags.map((t) => (<Badge key={t}>{t}</Badge>))}</div>
                </Card>
              </motion.div>
            ))}
          </div>
          {!showAll && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
              style={collapsedOverlayMask}
            />
          )}
        </div>
        <div className="mt-8 flex justify-center">
          <Btn as="button" onClick={() => setShowAll(v=>!v)} className="border border-white/15 text-white hover:bg-white/5">{showAll ? 'Show less' : 'View all services'}</Btn>
        </div>
      </Section>

      {/* Projects */}
      <Section id="projects">
        <H2>Projects</H2>

        <div className="relative">
          <div
            className={`grid grid-cols-1 gap-6 md:grid-cols-3 transition-all duration-300 ${
              showAllProjects ? "" : "max-h-[560px] overflow-hidden pb-8"
            }`}
            style={showAllProjects ? undefined : collapsedFadeMask}
          >
            {(showAllProjects ? projectsData : projectsData.slice(0, 3)).map((c, idx) => {
              const { primaryUrl, actionLinks, previewUrl } = getProjectMeta(c);
              const outcome = getProjectOutcome(c);

              return (
                <motion.div key={c.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.03 }} className="h-full">
                  <Card
                    role="button"
                    tabIndex={0}
                    aria-haspopup="dialog"
                    aria-label={`View ${c.title} details`}
                    onClick={(event) => handleProjectCardClick(event, c)}
                    onKeyDown={(event) => handleProjectCardKeyDown(event, c)}
                    className={[
                      "group relative h-full overflow-hidden flex flex-col",
                      "border-white/10 bg-zinc-900/60",
                      "shadow-[0_18px_60px_rgba(0,0,0,.45)]",
                      "transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_28px_90px_rgba(0,0,0,.55)]",
                      "cursor-pointer focus-visible:ring-2 focus-visible:ring-white/25"
                    ].join(" ")}
                  >
                    <div className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="absolute -top-24 right-[-20%] h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
                      <div className="absolute -bottom-24 left-[-20%] h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
                    </div>

                    <div className="relative z-10 flex h-full flex-col">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-xl font-semibold">{c.title}</h3>
                        {c.impact ? (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-wide text-emerald-200/90">
                            {c.impact}
                          </span>
                        ) : null}
                      </div>

                      {c.images?.length ? (
                        <ImageCarousel images={c.images} alt={c.title} />
                      ) : previewUrl ? (
                        <FaviconPreview url={previewUrl} />
                      ) : (
                        <div className="mb-4 h-44 w-full rounded-xl border border-white/10 bg-zinc-950/60 flex items-center justify-center text-zinc-500">Project preview</div>
                      )}

                      <p className="text-sm text-zinc-300">{c.blurb}</p>
                      {outcome ? <p className="mt-3 text-sm text-zinc-400">{outcome}</p> : null}

                      {c.tags?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {c.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                        </div>
                      ) : null}

                      <div className="mt-auto flex flex-wrap gap-3 pt-4">
                        {actionLinks.map((l) => {
                          const isExternal = l?.href ? isExternalUrl(l.href) : false;
                          const isPrimary = primaryUrl && l?.href === primaryUrl;
                          return (
                            <Btn
                              key={`${l.label}-${l.href}`}
                              href={l.href}
                              target={isExternal ? "_blank" : undefined}
                              rel={isExternal ? "noreferrer" : undefined}
                              className={[
                                "px-3 py-1.5 text-xs",
                                isPrimary ? "bg-white text-black hover:bg-zinc-200" : "border border-white/15 text-white hover:bg-white/5"
                              ].join(" ")}
                            >
                              {l.label}
                            </Btn>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {!showAllProjects && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
              style={collapsedOverlayMask}
            />
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <Btn
            as="button"
            onClick={() => setShowAllProjects((v) => !v)}
            className="border border-white/15 text-white hover:bg-white/5"
          >
            {showAllProjects ? "Show less" : "View all projects"}
          </Btn>
        </div>
      </Section>

      <ProjectDetailsModal project={activeProject} onClose={() => setActiveProject(null)} />

      {/* Process */}
      <Section id="process">
        <H2>Process</H2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {["Discovery", "Design", "Build", "Grow"].map((step, i) => (
            <motion.div key={step} {...fade} transition={{ ...fade.transition, delay: i * 0.05 }}>
              <Card>
                <div className="mb-2 text-sm uppercase tracking-wide text-zinc-400">Step {i + 1}</div>
                <div className="text-lg font-semibold">{step}</div>
                <ul className="mt-3 space-y-1 text-sm text-zinc-300">
                  {i === 0 && (<><li>Stakeholder interviews</li><li>Success metrics</li><li>Roadmap & risks</li></>)}
                  {i === 1 && (<><li>User flows & prototypes</li><li>Data models</li><li>API contracts</li></>)}
                  {i === 2 && (<><li>Sprints & demos</li><li>QA & automation</li><li>Security review</li></>)}
                  {i === 3 && (<><li>Analytics & A/B tests</li><li>Performance marketing</li><li>Support & SLA</li></>)}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Pricing — luxe cards */}
      <Section id="pricing">
        <H2>Pricing</H2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {pricingData.map((p, i) => {
            const points = Array.isArray(p.points) ? p.points : [];
            const isCustomTier = /custom/i.test(p.tier);
            return (
              <motion.div key={`${p.tier}-${i}`} {...fade} transition={{ ...fade.transition, delay: i * 0.04 }} className="h-full">
                <TierCardClean featured={p.featured}>
                  <div className="flex h-full flex-col">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-xs uppercase tracking-wide text-zinc-400">{p.tier}</div>
                        {p.featured && (<span className="rounded-full bg-white/12 px-2 py-0.5 text-[10px] text-white/95">Most popular</span>)}
                      </div>
                      <div className="mb-1 text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">{p.price}</div>
                      <div className="mb-5 text-sm text-zinc-400">
                        {p.info}
                        {isCustomTier ? (
                          <div className="mt-3 text-xs text-zinc-500">
                            <div>Typical budgets: $15k–50k+</div>
                            <div>Avg timeline: 6–12 weeks</div>
                          </div>
                        ) : null}
                      </div>
                      <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <ul className="space-y-2 text-sm text-zinc-300">
                        {points.map((pt, idx) => (
                          <li key={`${p.tier}-${idx}`} className="flex items-start gap-2">
                            <ShieldCheck className="mt-0.5 h-4 w-4 opacity-90" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-auto pt-6">
                      <Btn href="#contact" className="w-full bg-white text-black hover:bg-zinc-200">Get estimate in 24h</Btn>
                    </div>
                  </div>
                </TierCardClean>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Tech */}
      <Section id="stack">
        <H2>Tech Stack</H2>
        <motion.p {...fade} className="mb-6 max-w-2xl text-sm text-zinc-400">
          We choose technology based on scale, security, and long-term maintainability — not trends.
        </motion.p>
        <div className="flex flex-wrap gap-3">
          {stack.map((t, i) => (
            <motion.div key={t} {...fade} transition={{ ...fade.transition, delay: i * 0.02 }}>
              <span className="rounded-full border border-white/10 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-3 py-1 text-xs text-white/80 shadow-inner shadow-black/40">{t}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* About */}
      <Section id="about">
        <H2>About</H2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <motion.div {...fade} className="col-span-2">
            <Card className="bg-zinc-900/70">
              <p className="text-lg text-zinc-300">
                We’re a senior-only product studio focused on outcomes. We ship fast, measure impact, and own the roadmap — from discovery to growth. Our CRMs and growth systems don’t just look premium — they pay for themselves in months. Founded by engineers — not salespeople.
              </p>
              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatPill icon={LineChart}>↗ 38% avg. conversion uplift</StatPill>
                <StatPill icon={Gauge}>↓ 27% shorter sales cycles</StatPill>
                <StatPill icon={Rocket}>120+ releases across 6 industries</StatPill>
                <StatPill icon={ShieldCheck}>99.95% uptime · SRE practices</StatPill>
              </ul>
            </Card>
          </motion.div>
          <motion.div {...fade}>
            <Card className="h-full flex flex-col gap-3 bg-zinc-900/70">
              <Badge>SOC2-ready</Badge>
              <Badge>GDPR / ISO27001</Badge>
              <Badge>Design systems</Badge>
              <Badge>24/7 on-call</Badge>
              <Badge>HIPAA-ready (PHI)</Badge>
              <Badge>NDA & security reviews</Badge>
            </Card>
          </motion.div>
        </div>
      </Section>

      {/* Contact */}
      <Section id="contact">
        <H2>Free estimate & architecture outline in 24 hours — no commitment.</H2>
        <motion.p {...fade} className="mb-4 max-w-2xl text-zinc-300">Share your goals and we will return with a free estimate, architecture outline, and timeline within 24 hours.</motion.p>
        <Card>
          <ContactForm apiBase={apiBase} source="home-contact" />
        </Card>
      </Section>
    </>
  );
};

const ServicesPage = () => (
  <>
    <PageHero
      kicker="Services"
      title="Senior teams that ship product, not slides"
      subtitle="We lead end-to-end delivery from discovery to growth. Expect sharp decisions, modern craft, and measurable outcomes."
      primary={{ label: "Get estimate in 24h", to: "/start" }}
      secondary={{ label: "See projects", to: "/projects" }}
      stats={[
        { label: "Avg. delivery", value: "10-14 w" },
        { label: "Senior specialists", value: "15+" },
        { label: "Uptime targets", value: "99.95%" },
      ]}
    />
    <Section>
      <H2>Service tracks</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {services.map((s, idx) => (
          <motion.div key={s.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.04 }}>
            <Card className="h-full">
              <div className="mb-4 flex items-center gap-3"><s.icon className="h-6 w-6 text-white" /><h3 className="text-lg font-semibold">{s.title}</h3></div>
              <p className="mb-4 text-sm text-zinc-300">{s.desc}</p>
              <div className="flex flex-wrap gap-2">{s.tags.map((t) => (<Badge key={t}>{t}</Badge>))}</div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
    <Section>
      <H2>Engagement models</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {engagementModels.map((model, idx) => (
          <motion.div key={model.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.05 }}>
            <Card className="h-full">
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Model</div>
              <h3 className="mt-3 text-xl font-semibold">{model.title}</h3>
              <p className="mt-3 text-sm text-zinc-300">{model.desc}</p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-300">
                {model.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 opacity-80" /> {pt}</li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
    <Section>
      <H2>Delivery standards</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="h-full">
          <p className="text-sm text-zinc-300">Every engagement ships with a senior-only team, strict QA, and a performance baseline. You get reliable releases and documentation that makes handoff painless.</p>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {serviceStandards.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-zinc-200"><ShieldCheck className="h-4 w-4 opacity-80" /> {item}</li>
            ))}
          </ul>
        </Card>
        <Card className="h-full">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Guarantees</div>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            <p>Weekly demos and a decision log keep stakeholders aligned.</p>
            <p>Clear risk tracking with mitigation steps visible in every sprint.</p>
            <p>We stay on the roadmap and surface trade-offs early.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge>Senior QA</Badge>
            <Badge>Security review</Badge>
            <Badge>Analytics setup</Badge>
          </div>
        </Card>
      </div>
    </Section>
    <CTABox title="Ready to map scope and timelines?" subtitle="Share your goals and we will return with a plan, budget, and launch date." />
  </>
);

const ProjectsPage = ({ projectsData }) => {
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    if (!activeProject) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeProject]);

  useEffect(() => {
    if (!activeProject) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveProject(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeProject]);

  const handleProjectCardClick = (event, project) => {
    if (event.defaultPrevented) return;
    if (event.target.closest("a,button")) return;
    setActiveProject(project);
  };

  const handleProjectCardKeyDown = (event, project) => {
    if (event.currentTarget !== event.target) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveProject(project);
    }
  };

  return (
    <>
    <PageHero
      kicker="Projects"
      title="Case studies with measurable impact"
      subtitle="We design, build, and grow digital products that move real metrics. Here is a selection of recent work."
      primary={{ label: "Get estimate in 24h", to: "/start" }}
      secondary={{ label: "See services", to: "/services" }}
      stats={[
        { label: "Launches", value: "120+" },
        { label: "Industries", value: "6" },
        { label: "Avg. uplift", value: "38%" },
      ]}
    />
    <Section>
      <H2>Selected work</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {projectsData.map((project, idx) => {
          const { primaryUrl, actionLinks, previewUrl } = getProjectMeta(project);
          const outcome = getProjectOutcome(project);
          return (
            <motion.div key={project.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.04 }}>
              <Card
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-label={`View ${project.title} details`}
                onClick={(event) => handleProjectCardClick(event, project)}
                onKeyDown={(event) => handleProjectCardKeyDown(event, project)}
                className={[
                  "group relative h-full overflow-hidden",
                  "cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-white/20",
                  "focus-visible:ring-2 focus-visible:ring-white/25"
                ].join(" ")}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  {project.impact ? (
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-wide text-emerald-200/90">
                      {project.impact}
                    </span>
                  ) : null}
                </div>
                {project.images?.length ? (
                  <ImageCarousel images={project.images} alt={project.title} />
                ) : previewUrl ? (
                  <FaviconPreview url={previewUrl} />
                ) : (
                  <div className="mb-4 h-44 w-full rounded-xl border border-white/10 bg-zinc-950/60 flex items-center justify-center text-zinc-500">Project preview</div>
                )}
                <p className="text-sm text-zinc-300">{project.blurb}</p>
                {outcome ? <p className="mt-3 text-sm text-zinc-400">{outcome}</p> : null}
                {project.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  {actionLinks.map((l) => {
                    const isExternal = l?.href ? isExternalUrl(l.href) : false;
                    const isPrimary = primaryUrl && l?.href === primaryUrl;
                    return (
                      <Btn
                        key={`${l.label}-${l.href}`}
                        href={l.href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noreferrer" : undefined}
                        className={[
                          "px-3 py-1.5 text-xs",
                          isPrimary ? "bg-white text-black hover:bg-zinc-200" : "border border-white/15 text-white hover:bg-white/5"
                        ].join(" ")}
                      >
                        {l.label}
                      </Btn>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Section>
    <Section>
      <H2>Outcomes we optimize for</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {projectOutcomes.map((outcome, idx) => (
          <motion.div key={outcome.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.05 }}>
            <Card className="h-full">
              <div className="text-3xl font-semibold text-white">{outcome.metric}</div>
              <div className="mt-2 text-sm uppercase tracking-wide text-zinc-400">{outcome.title}</div>
              <p className="mt-3 text-sm text-zinc-300">{outcome.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
    <CTABox
      title="Want your project here next?"
      subtitle="We can move fast on discovery and give you a clear roadmap within days."
      secondaryLabel="Read renter architecture"
      secondaryTo="/cases/renter-architecture"
    />
    <ProjectDetailsModal project={activeProject} onClose={() => setActiveProject(null)} />
  </>
  );
};

const ProcessPage = () => (
  <>
    <PageHero
      kicker="Process"
      title="A delivery engine built for clarity"
      subtitle="Our process keeps stakeholders aligned, risks visible, and releases predictable. It is calm, transparent, and senior-led."
      primary={{ label: "Get estimate in 24h", to: "/start" }}
      secondary={{ label: "See pricing", to: "/pricing" }}
      stats={[
        { label: "Cadence", value: "2-week" },
        { label: "Demo rhythm", value: "Weekly" },
        { label: "Launches", value: "On time" },
      ]}
    />
    <Section>
      <H2>Five phases, no surprises</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {processSteps.map((step, idx) => (
          <motion.div key={step.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.04 }}>
            <Card className="h-full">
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Step {idx + 1}</div>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm text-zinc-300">{step.desc}</p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                {step.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 opacity-80" /> {pt}</li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
    <Section>
      <H2>Operating rhythm</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {processRituals.map((ritual, idx) => (
          <motion.div key={ritual.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.05 }}>
            <Card className="h-full">
              <div className="text-xl font-semibold">{ritual.title}</div>
              <p className="mt-3 text-sm text-zinc-300">{ritual.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
    <CTABox title="Ready to kick off discovery?" subtitle="We can start with a 1-week sprint to align goals, risks, and roadmap." secondaryLabel="See services" secondaryTo="/services" />
  </>
);

const PricingPage = ({ pricingData }) => (
  <>
    <PageHero
      kicker="Pricing"
      title="Transparent tiers with senior delivery"
      subtitle="Choose a fixed scope or a dedicated squad. Every tier comes with senior-only execution and clear reporting."
      primary={{ label: "Get estimate in 24h", to: "/start" }}
      secondary={{ label: "See process", to: "/process" }}
      stats={[
        { label: "Quote time", value: "24h" },
        { label: "Scoping", value: "Fixed" },
        { label: "Support", value: "Included" },
      ]}
    />
    <Section>
      <H2>Pricing tiers</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {pricingData.map((p, i) => {
          const points = Array.isArray(p.points) ? p.points : [];
          const isCustomTier = /custom/i.test(p.tier);
          return (
            <motion.div key={`${p.tier}-${i}`} {...fade} transition={{ ...fade.transition, delay: i * 0.04 }} className="h-full">
              <TierCardClean featured={p.featured}>
                <div className="flex h-full flex-col">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs uppercase tracking-wide text-zinc-400">{p.tier}</div>
                      {p.featured && (<span className="rounded-full bg-white/12 px-2 py-0.5 text-[10px] text-white/95">Most popular</span>)}
                    </div>
                    <div className="mb-1 text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">{p.price}</div>
                    <div className="mb-5 text-sm text-zinc-400">
                      {p.info}
                      {isCustomTier ? (
                        <div className="mt-3 text-xs text-zinc-500">
                          <div>Typical budgets: $15k–50k+</div>
                          <div>Avg timeline: 6–12 weeks</div>
                        </div>
                      ) : null}
                    </div>
                    <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <ul className="space-y-2 text-sm text-zinc-300">
                      {points.map((pt, idx) => (
                        <li key={`${p.tier}-${idx}`} className="flex items-start gap-2">
                          <ShieldCheck className="mt-0.5 h-4 w-4 opacity-90" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto pt-6">
                    <BtnLink to="/start" analyticsLabel="Get estimate in 24h" analyticsMeta={{ context: "pricing_tier" }} className="w-full bg-white text-black hover:bg-zinc-200">Get estimate in 24h</BtnLink>
                  </div>
                </div>
              </TierCardClean>
            </motion.div>
          );
        })}
      </div>
    </Section>
    <Section>
      <H2>How pricing works</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {pricingPrinciples.map((item, idx) => (
          <motion.div key={item.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.05 }}>
            <Card className="h-full">
              <div className="text-xl font-semibold">{item.title}</div>
              <p className="mt-3 text-sm text-zinc-300">{item.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {pricingAddOns.map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </div>
    </Section>
    <CTABox
      title="Need a custom scope?"
      subtitle="Share your goals and we will craft a plan that fits budget and timeline."
      secondaryLabel="Use estimator"
      secondaryTo="/estimate"
    />
  </>
);

const TechPage = () => (
  <>
    <PageHero
      kicker="Tech"
      title="Modern stack, engineered for reliability"
      subtitle="We pick proven tools that ship fast and scale without drama. Every layer is optimized for performance and observability."
      primary={{ label: "Get estimate in 24h", to: "/start" }}
      secondary={{ label: "See projects", to: "/projects" }}
      stats={[
        { label: "Stack maturity", value: "Battle-tested" },
        { label: "DevOps", value: "Automated" },
        { label: "Security", value: "Built-in" },
      ]}
    />
    <Section>
      <H2>Stack by layer</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stackGroups.map((group, idx) => (
          <motion.div key={group.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.04 }}>
            <Card className="h-full">
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">{group.title}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
    <Section>
      <H2>Engineering principles</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {engineeringPrinciples.map((item, idx) => (
          <motion.div key={item.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.05 }}>
            <Card className="h-full">
              <div className="text-xl font-semibold">{item.title}</div>
              <p className="mt-3 text-sm text-zinc-300">{item.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        {stack.map((t) => (
          <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">{t}</span>
        ))}
      </div>
    </Section>
    <CTABox title="Need a technical audit?" subtitle="We can review your architecture and propose a modernization plan." secondaryLabel="See process" secondaryTo="/process" />
  </>
);

const AboutPage = () => (
  <>
    <PageHero
      kicker="About"
      title="Senior-only studio with a product mindset"
      subtitle="We are a compact team of senior operators. We move fast, stay calm, and own outcomes with you."
      primary={{ label: "Get estimate in 24h", to: "/start" }}
      secondary={{ label: "See projects", to: "/projects" }}
      stats={[
        { label: "Years in product", value: "14+" },
        { label: "Releases", value: "120+" },
        { label: "Team model", value: "Senior" },
      ]}
    />
    <Section>
      <H2>Studio model</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div {...fade} className="md:col-span-2">
          <Card className="bg-zinc-900/70">
            <p className="text-lg text-zinc-300">
              We are not a big agency. We are a tight senior crew that pairs product thinking with modern engineering. Our teams are built for focus, velocity, and accountability. Founded by engineers — not salespeople.
            </p>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatPill icon={LineChart}>↗ 38% avg. conversion uplift</StatPill>
              <StatPill icon={Gauge}>↓ 27% shorter sales cycles</StatPill>
              <StatPill icon={Rocket}>120+ releases across 6 industries</StatPill>
              <StatPill icon={ShieldCheck}>99.95% uptime · SRE practices</StatPill>
            </ul>
          </Card>
        </motion.div>
        <motion.div {...fade}>
          <Card className="h-full flex flex-col gap-3 bg-zinc-900/70">
            <Badge>SOC2-ready</Badge>
            <Badge>GDPR / ISO27001</Badge>
            <Badge>Design systems</Badge>
            <Badge>24/7 on-call</Badge>
            <Badge>HIPAA-ready (PHI)</Badge>
            <Badge>NDA & security reviews</Badge>
          </Card>
        </motion.div>
      </div>
    </Section>
    <Section>
      <H2>Values we build by</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {aboutValues.map((value, idx) => (
          <motion.div key={value.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.05 }}>
            <Card className="h-full">
              <div className="text-xl font-semibold">{value.title}</div>
              <p className="mt-3 text-sm text-zinc-300">{value.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
    <CTABox title="Looking for a senior partner?" subtitle="We can join discovery or take full delivery of your roadmap." secondaryLabel="See services" secondaryTo="/services" />
  </>
);

const NotForEveryonePage = () => (
  <>
    <PageHero
      kicker="Fit"
      title="Not for everyone"
      subtitle="We're not a fit for everyone. That's intentional."
      primary={{ label: "Start qualification", to: "/start" }}
      secondary={{ label: "See services", to: "/services" }}
      stats={[
        { label: "Decision owner", value: "Required" },
        { label: "Admin control", value: "Non-negotiable" },
        { label: "Quality bar", value: "Senior-only" },
      ]}
    />
    <Section>
      <H2>We don't work with</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {notForEveryoneItems.map((item, idx) => (
          <motion.div key={item.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.05 }}>
            <Card className="h-full">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <X className="h-4 w-4 text-zinc-300" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">{item.title}</div>
                  <p className="mt-2 text-sm text-zinc-300">{item.desc}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
    <Section className="pt-8">
      <Card className="bg-zinc-950/70">
        <div className="text-2xl font-semibold text-white">If this sounds like you - we'll probably work well together.</div>
        <p className="mt-3 text-sm text-zinc-300">
          Start the qualification gate to confirm fit before the estimate request.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <BtnLink to="/start" analyticsLabel="Start qualification" analyticsMeta={{ context: "not_for_everyone" }} className="bg-white text-black hover:bg-zinc-200">Start qualification</BtnLink>
          <BtnLink to="/pricing" analyticsLabel="See pricing" analyticsMeta={{ context: "not_for_everyone" }} className="border border-white/15 text-white hover:bg-white/5">See pricing</BtnLink>
        </div>
      </Card>
    </Section>
  </>
);

const StartPage = () => {
  const [answers, setAnswers] = useState(() => getStoredQualification() || normalizeQualification(QUAL_DEFAULTS));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = { ...answers, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(QUALIFICATION_STORAGE_KEY, JSON.stringify(payload));
  }, [answers]);

  const projectOption = QUAL_PROJECT_OPTIONS.find((option) => option.value === answers.projectType);
  const complexityOption = QUAL_COMPLEXITY_OPTIONS.find((option) => option.value === answers.complexity);
  const budgetOption = QUAL_BUDGET_OPTIONS.find((option) => option.value === answers.budget);
  const timelineOption = QUAL_TIMELINE_OPTIONS.find((option) => option.value === answers.timeline);
  const budgetAmount = budgetOption?.amount || 0;
  const minBudget = complexityOption?.minBudget || 0;
  const budgetGap = budgetAmount < minBudget;
  const isUrgent = answers.timeline === "urgent";
  const timelineMismatch = isUrgent && answers.complexity !== "simple";
  const isAligned = !budgetGap && !timelineMismatch;

  const recommendations = [];
  if (budgetGap) {
    recommendations.push("Start with a smaller MVP scope or a phased rollout.");
    recommendations.push("Consider a discovery sprint to lock scope before build.");
  }
  if (timelineMismatch) {
    recommendations.push("Plan a short discovery sprint, then phase the build.");
    recommendations.push("Ship a thin slice first, then expand.");
  }
  if (isUrgent && budgetAmount < 15000) {
    recommendations.push("Adjust timeline or budget to protect quality.");
  }
  const uniqueRecommendations = Array.from(new Set(recommendations));

  return (
    <>
      <PageHero
        kicker="Start"
        title="A quick fit check before we talk"
        subtitle="Four quick selections so we can align scope, budget, and timeline. No forms, no judgment."
        primary={{ label: "Who we don't work with", to: "/not-for-everyone" }}
        secondary={{ label: "See pricing", to: "/pricing" }}
        stats={[
          { label: "Steps", value: "4" },
          { label: "Time", value: "1 min" },
          { label: "Response", value: "24h" },
        ]}
      />
      <Section>
        <H2>Qualification gate</H2>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Step 1</div>
              <div className="text-lg font-semibold text-white">Project type</div>
              <ToggleGroup
                options={QUAL_PROJECT_OPTIONS}
                value={answers.projectType}
                onChange={(value) => setAnswers((prev) => ({ ...prev, projectType: value }))}
              />
            </Card>
            <Card className="space-y-4">
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Step 2</div>
              <div className="text-lg font-semibold text-white">Complexity</div>
              <ToggleGroup
                options={QUAL_COMPLEXITY_OPTIONS}
                value={answers.complexity}
                onChange={(value) => setAnswers((prev) => ({ ...prev, complexity: value }))}
              />
            </Card>
            <Card className="space-y-4">
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Step 3</div>
              <div className="text-lg font-semibold text-white">Budget range</div>
              <ToggleGroup
                options={QUAL_BUDGET_OPTIONS}
                value={answers.budget}
                onChange={(value) => setAnswers((prev) => ({ ...prev, budget: value }))}
              />
            </Card>
            <Card className="space-y-4">
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Step 4</div>
              <div className="text-lg font-semibold text-white">Timeline urgency</div>
              <ToggleGroup
                options={QUAL_TIMELINE_OPTIONS}
                value={answers.timeline}
                onChange={(value) => setAnswers((prev) => ({ ...prev, timeline: value }))}
              />
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Your selections</div>
              <div className="grid gap-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Project</span>
                  <span className="text-right text-zinc-200">{projectOption?.label || "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Complexity</span>
                  <span className="text-right text-zinc-200">{complexityOption?.label || "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Budget</span>
                  <span className="text-right text-zinc-200">{budgetOption?.label || "-"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Timeline</span>
                  <span className="text-right text-zinc-200">{timelineOption?.label || "-"}</span>
                </div>
              </div>
              <div className="text-xs text-zinc-500">Saved locally on this device.</div>
            </Card>
            <Card className="space-y-4">
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Fit signal</div>
              {isAligned ? (
                <>
                  <div className="text-lg font-semibold text-emerald-300">Looks aligned.</div>
                  <p className="text-sm text-zinc-300">
                    If you want an estimate, continue to the request form and we will reply within 24 hours.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <BtnLink to="/contact" analyticsLabel="Continue to estimate request" analyticsMeta={{ context: "qualification_gate" }} className="bg-white text-black hover:bg-zinc-200">
                      Continue to estimate request
                    </BtnLink>
                    <BtnLink to="/not-for-everyone" analyticsLabel="Who we don't work with" analyticsMeta={{ context: "qualification_gate" }} className="border border-white/15 text-white hover:bg-white/5">
                      Who we don't work with
                    </BtnLink>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-semibold text-amber-300">This might not be the best fit - here's what we recommend instead.</div>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    {(uniqueRecommendations.length ? uniqueRecommendations : ["Start with a focused scope and a realistic timeline."]).map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-300/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <BtnLink to="/not-for-everyone" analyticsLabel="Who we don't work with" analyticsMeta={{ context: "qualification_gate" }} className="border border-white/15 text-white hover:bg-white/5">
                      Who we don't work with
                    </BtnLink>
                    <BtnLink to="/contact" analyticsLabel="Continue anyway" analyticsMeta={{ context: "qualification_gate" }} className="text-white/80 hover:text-white">
                      Continue anyway
                    </BtnLink>
                  </div>
                  <div className="text-xs text-zinc-500">No hard stops. If you want to talk, we'll review it with you.</div>
                </>
              )}
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
};

const PreCallPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const productParam = params.get("product");
  const complexityParam = params.get("complexity");
  const maturityParam = params.get("maturity");
  const hasRouting = Boolean(productParam || complexityParam || maturityParam);

  const intakeCards = [
    productParam
      ? { meta: "Project type", title: getOptionLabel(productParam, QUAL_PROJECT_OPTIONS) }
      : null,
    complexityParam
      ? { meta: "Complexity", title: getOptionLabel(complexityParam, QUAL_COMPLEXITY_OPTIONS) }
      : null,
    maturityParam
      ? { meta: "Maturity", title: getMaturityLabel(maturityParam) }
      : null,
  ].filter(Boolean);

  return (
    <>
      <PageHero
        kicker="Pre-call"
        title="Pre-call package"
        subtitle="Read this before we meet. It covers how we work, what to review, and what to prepare."
        primary={{ label: "View one-pager", to: "/summary" }}
        secondary={{ label: "Back to contact", to: "/contact" }}
        stats={[
          { label: "Read time", value: "10 min" },
          { label: "Call length", value: "30 min" },
          { label: "Outcome", value: "Clear next step" },
        ]}
      />
      {hasRouting ? (
        <Section className="pt-8">
          <H2>Intake snapshot</H2>
          <div className="grid gap-4 md:grid-cols-3">
            {intakeCards.map((card) => (
              <DataCard key={card.meta} meta={card.meta} title={card.title} />
            ))}
          </div>
        </Section>
      ) : null}
      <Section>
        <H2>How we work</H2>
        <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Discovery → Design → Build → Grow</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {preCallWorkflow.map((step, idx) => (
            <motion.div key={step.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.05 }}>
              <Card className="h-full">
                <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Step {idx + 1}</div>
                <div className="mt-3 text-lg font-semibold text-white">{step.title}</div>
                <p className="mt-2 text-sm text-zinc-300">{step.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>
      <Section className="pt-8">
        <H2>Read before the call</H2>
        <div className="grid gap-4 md:grid-cols-3">
          {preCallResources.map((item, idx) => (
            <motion.div key={item.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.05 }}>
              <Link to={item.to} className="block h-full">
                <Card className="h-full transition hover:border-white/30 hover:bg-white/10">
                  <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Resource</div>
                  <div className="mt-3 text-lg font-semibold text-white">{item.title}</div>
                  <p className="mt-2 text-sm text-zinc-300">{item.desc}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>
      <Section className="pt-8">
        <H2>Prepare before the call</H2>
        <Card>
          <ul className="space-y-3 text-sm text-zinc-300">
            {preCallPrepItems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/60" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-xs text-zinc-500">If something is missing, call it out. We'll fill gaps in discovery.</div>
        </Card>
      </Section>
    </>
  );
};

const SummaryPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const overrides = {
    product: params.get("product"),
    complexity: params.get("complexity"),
    team: params.get("team"),
    integrations: params.get("integrations"),
  };
  const overrideValues = Object.fromEntries(
    Object.entries(overrides).filter(([, value]) => value)
  );
  const hasOverrides = Object.keys(overrideValues).length > 0;
  const storedEstimate = getStoredEstimate();
  const qualification = getStoredQualification();
  const fallbackEstimate = mapQualificationToEstimate(qualification);
  const estimateInputs = normalizeEstimate({
    ...(fallbackEstimate || {}),
    ...(storedEstimate || {}),
    ...(hasOverrides ? overrideValues : {}),
  });
  const estimate = buildEstimate(estimateInputs);

  const estimateProductLabel = getOptionLabel(estimateInputs.product, ESTIMATE_PRODUCT_OPTIONS);
  const estimateComplexityLabel = getOptionLabel(estimateInputs.complexity, ESTIMATE_COMPLEXITY_OPTIONS);
  const projectLabel = qualification
    ? getOptionLabel(qualification.projectType, QUAL_PROJECT_OPTIONS)
    : estimateProductLabel;
  const complexityLabel = qualification
    ? getOptionLabel(qualification.complexity, QUAL_COMPLEXITY_OPTIONS)
    : estimateComplexityLabel;
  const maturityLabel = qualification
    ? getMaturityLabel(getMaturityFromQualification(qualification))
    : getMaturityLabel(getMaturityFromEstimate(estimateInputs));
  const projectTags = [complexityLabel, maturityLabel].filter(
    (tag) => tag && tag !== "-" && tag !== MATURITY_LABELS.unknown
  );
  const nextSteps = buildSummaryNextSteps(estimateInputs);
  const hasInputs = Boolean(storedEstimate || qualification || hasOverrides);

  return (
    <>
      <PageHero
        kicker="Summary"
        title="Project one-pager"
        subtitle="A single-screen summary of scope signals and next steps. No PDF, just the essentials."
        primary={{ label: "Open pre-call package", to: "/pre-call" }}
        secondary={{ label: "Adjust estimate", to: "/estimate" }}
        stats={[
          { label: "Format", value: "HTML" },
          { label: "Update", value: "Live" },
          { label: "Share", value: "Screen" },
        ]}
      />
      <Section>
        <H2>Project snapshot</H2>
        <div className="grid gap-4 md:grid-cols-2">
          <DataCard
            meta="Project type"
            title={projectLabel}
            subtitle={projectTags.length ? "Complexity + maturity signal" : ""}
            tags={projectTags}
          />
          <DataCard
            meta="Timeline range"
            title={estimate.timeline.range}
            subtitle={estimate.timeline.note}
            tags={["Range only", "Scope-driven"]}
          />
        </div>
        {hasInputs ? (
          <div className="mt-4 text-xs text-zinc-500">Based on your latest estimator or qualification inputs.</div>
        ) : (
          <Card className="mt-6 bg-zinc-950/70">
            <div className="text-sm text-zinc-300">
              No inputs captured yet. Run the estimator or qualification gate to generate a tailored summary.
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <BtnLink to="/estimate" analyticsLabel="Run estimator" analyticsMeta={{ context: "summary_empty" }} className="bg-white text-black hover:bg-zinc-200">
                Run estimator
              </BtnLink>
              <BtnLink to="/start" analyticsLabel="Start qualification" analyticsMeta={{ context: "summary_empty" }} className="border border-white/15 text-white hover:bg-white/5">
                Start qualification
              </BtnLink>
            </div>
          </Card>
        )}
      </Section>
      <Section className="pt-8">
        <H2>Architecture blocks</H2>
        <div className="grid gap-4 md:grid-cols-2">
          {estimate.blocks.map((block) => (
            <DataCard
              key={block.id}
              title={block.title}
              subtitle={block.summary}
              tags={block.tags}
            />
          ))}
        </div>
      </Section>
      <Section className="pt-8">
        <H2>Next steps</H2>
        <Card>
          <ul className="space-y-3 text-sm text-zinc-300">
            {nextSteps.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/60" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <BtnLink to="/pre-call" analyticsLabel="Open pre-call package" analyticsMeta={{ context: "summary_next_steps" }} className="bg-white text-black hover:bg-zinc-200">
              Open pre-call package
            </BtnLink>
            <BtnLink to="/contact" analyticsLabel="Send intake" analyticsMeta={{ context: "summary_next_steps" }} className="border border-white/15 text-white hover:bg-white/5">
              Send intake
            </BtnLink>
          </div>
        </Card>
      </Section>
    </>
  );
};

const JournalPage = () => (
  <>
    <header className="border-b border-white/10">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Engineering Journal</div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">How we reason about systems</h1>
        <p className="mt-4 text-base text-zinc-300 sm:text-lg">Short notes from active builds. Opinionated, technical, and decision-driven.</p>
        <p className="mt-3 text-sm text-zinc-400">If you need a cosmetic dashboard before operational control, we are not a fit.</p>
      </div>
    </header>
    <Section className="pt-16">
      <div className="mx-auto max-w-4xl space-y-12">
        {journalPosts.map((post) => (
          <article key={post.title} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-white">{post.title}</h2>
            <div className="mt-6 space-y-6">
              {post.sections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">{section.title}</div>
                  <p className="text-sm text-zinc-300">{section.body}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  </>
);

const DecisionsPage = () => (
  <>
    <header className="border-b border-white/10">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Public Decision Records</div>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">We document trade-offs, not slogans</h1>
        <p className="mt-4 text-base text-zinc-300 sm:text-lg">These defaults hold until constraints change. We revisit them openly.</p>
        <p className="mt-3 text-sm text-zinc-400">If you need the opposite, we should know early.</p>
      </div>
    </header>
    <Section className="pt-16">
      <div className="mx-auto max-w-4xl space-y-6">
        {decisionRecords.map((record) => (
          <details key={record.title} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 sm:p-7">
            <summary className="cursor-pointer text-lg font-semibold text-white focus:outline-none">
              {record.title}
            </summary>
            <div className="mt-5 space-y-4 text-sm text-zinc-300">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Context</div>
                <p className="mt-2">{record.context}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Decision</div>
                <p className="mt-2">{record.decision}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Trade-offs</div>
                <p className="mt-2">{record.tradeoffs}</p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">When we would change our mind</div>
                <p className="mt-2">{record.change}</p>
              </div>
            </div>
          </details>
        ))}
      </div>
    </Section>
  </>
);

const ContactPage = ({ apiBase }) => (
  <>
    <PageHero
      kicker="Contact"
      title="Tell us what you want to build"
      subtitle="Share your goals and we will return with architecture, timeline, and budget within 24 hours."
      primary={{ label: "See process", to: "/process" }}
      secondary={{ label: "See pricing", to: "/pricing" }}
      stats={[
        { label: "Response time", value: "24h" },
        { label: "Discovery", value: "1 week" },
        { label: "Launch", value: "2-7 weeks" },
      ]}
    />
    <Section>
      <H2>Project intake</H2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <ContactForm apiBase={apiBase} source="/contact" />
        </Card>
        <div className="space-y-4">
          {contactSteps.map((step, idx) => (
            <motion.div key={step.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.05 }}>
              <Card className="h-full">
                <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Step {idx + 1}</div>
                <div className="mt-3 text-lg font-semibold">{step.title}</div>
                <p className="mt-2 text-sm text-zinc-300">{step.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  </>
);

const NotFoundPage = () => (
  <>
    <PageHero
      kicker="404"
      title="This page does not exist"
      subtitle="The page you are looking for moved or was never published."
      primary={{ label: "Back home", to: "/" }}
      secondary={{ label: "Get estimate in 24h", to: "/start" }}
      stats={[]}
    />
  </>
);

/* ===================== App ===================== */
export default function PortfolioSite() {
  const apiBase = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
  const [projectsData, setProjectsData] = useState(projectSeed);
  const [pricingData, setPricingData] = useState(pricingSeed);
  const location = useLocation();
  const lastTrackedPath = useRef("");

  useEffect(() => {
    if (lastTrackedPath.current === location.pathname) return;
    lastTrackedPath.current = location.pathname;
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const meta = getMetaForPath(location.pathname);
    applyMeta(meta);
  }, [location.pathname]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBase}/api/projects/`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const payload = Array.isArray(data) ? data : data?.projects;
        if (Array.isArray(payload) && payload.length > 0) {
          setProjectsData(payload);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [apiBase]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBase}/api/pricing/`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const payload = Array.isArray(data) ? data : data?.pricing;
        if (Array.isArray(payload) && payload.length > 0) {
          const normalized = payload.map((item) => ({
            tier: item?.tier || "",
            price: item?.price || "",
            info: item?.info || "",
            featured: Boolean(item?.featured),
            points: Array.isArray(item?.points) ? item.points : [],
          }));
          setPricingData(normalized.slice(0, 5));
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [apiBase]);

  return (
    <div className="relative min-h-screen text-zinc-100 antialiased">
      <InfiniteBackground />
      <div className="relative z-10">
        <ScrollToTop />
        <SiteNav />
        <Routes>
          <Route path="/" element={<HomePage projectsData={projectsData} pricingData={pricingData} apiBase={apiBase} />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/projects" element={<ProjectsPage projectsData={projectsData} />} />
          <Route path="/process" element={<ProcessPage />} />
          <Route path="/pricing" element={<PricingPage pricingData={pricingData} />} />
          <Route path="/tech" element={<TechPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/decisions" element={<DecisionsPage />} />
          <Route path="/engineering" element={<LazyRoute><EngineeringLandingPage /></LazyRoute>} />
          <Route path="/architecture-preview" element={<LazyRoute><ArchitecturePreviewPage /></LazyRoute>} />
          <Route path="/admin-first" element={<LazyRoute><AdminFirstPage /></LazyRoute>} />
          <Route path="/production-ready" element={<LazyRoute><ProductionReadyPage /></LazyRoute>} />
          <Route path="/estimate" element={<LazyRoute><EstimatePage /></LazyRoute>} />
          <Route path="/cases/renter-architecture" element={<LazyRoute><RenterArchitectureCasePage /></LazyRoute>} />
          <Route path="/admin-demo" element={<LazyRoute><AdminDemoPage /></LazyRoute>} />
          <Route path="/demo/admin" element={<LazyRoute><AdminDemoPage /></LazyRoute>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/not-for-everyone" element={<NotForEveryonePage />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/pre-call" element={<PreCallPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/contact" element={<ContactPage apiBase={apiBase} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <SiteFooter />
        <FloatingContactButton />
      </div>
    </div>
  );
}
