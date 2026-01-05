import ogImage from "../assets/raccoon-logo.png";

const SITE_NAME = "studio";
const SITE_TAGLINE = "Revenue-first software & CRM systems";
const SITE_TITLE = `${SITE_NAME} - ${SITE_TAGLINE}`;
const withSite = (pageTitle) => `${pageTitle} - ${SITE_TITLE}`;

const DEFAULT_META = {
  title: SITE_TITLE,
  description: "Senior-only product studio building CRMs, marketplaces, and internal platforms with production-grade engineering.",
  image: ogImage,
};

const ROUTE_META = {
  "/": {
    title: SITE_TITLE,
    description: "Senior-only teams building CRMs, marketplaces, and internal tools with reliable delivery and clear outcomes.",
  },
  "/services": {
    title: withSite("Services"),
    description: "Senior delivery for software development, CRM transformation, analytics, and growth systems.",
  },
  "/projects": {
    title: withSite("Projects"),
    description: "Case studies with measurable outcomes across CRM, marketplaces, and automation platforms.",
  },
  "/process": {
    title: withSite("Process"),
    description: "Delivery rituals, risk tracking, and weekly demos that keep launches predictable.",
  },
  "/pricing": {
    title: withSite("Pricing"),
    description: "Transparent tiers with senior-only delivery and scoped outcomes.",
  },
  "/tech": {
    title: withSite("Tech"),
    description: "Modern, reliable stack choices across frontend, backend, data, and DevOps.",
  },
  "/journal": {
    title: withSite("Engineering Journal"),
    description: "Short, opinionated notes on admin-first systems, scaling failure modes, and auditability.",
  },
  "/decisions": {
    title: withSite("Decisions"),
    description: "Public decision records covering architecture defaults, trade-offs, and when we change course.",
  },
  "/about": {
    title: withSite("About"),
    description: "A senior-only team founded by engineers and focused on delivery quality.",
  },
  "/not-for-everyone": {
    title: withSite("Not for everyone"),
    description: "A calm fit check to help teams self-select before starting.",
  },
  "/start": {
    title: withSite("Start"),
    description: "Qualification gate to align project type, complexity, budget, and timeline.",
  },
  "/contact": {
    title: withSite("Contact"),
    description: "Request a technical estimate with clear scope, timeline, and budget.",
  },
  "/pre-call": {
    title: withSite("Pre-call package"),
    description: "Prep package covering workflow, resources, and what to bring to the call.",
  },
  "/summary": {
    title: withSite("Project summary"),
    description: "Single-screen project one-pager with scope signals and next steps.",
  },
  "/engineering": {
    title: withSite("Engineering Lab"),
    description: "Advanced modules that surface architecture depth and delivery standards.",
  },
  "/architecture-preview": {
    title: withSite("Architecture Preview"),
    description: "Interactive system map showing frontend, backend, data, and integrations.",
  },
  "/admin-first": {
    title: withSite("Admin-First Toggle"),
    description: "Switch between customer and admin views to reveal control layers.",
  },
  "/production-ready": {
    title: withSite("Production Readiness"),
    description: "Checklist of auth, monitoring, backups, and security defaults.",
  },
  "/estimate": {
    title: withSite("Estimator"),
    description: "Range-based estimator for timelines, budgets, and architecture scope.",
  },
  "/admin-demo": {
    title: withSite("Admin Demo"),
    description: "Interactive admin control demo showing roles, ops, disputes, and financial transparency.",
  },
  "/demo/admin": {
    title: withSite("Admin Demo"),
    description: "Interactive admin control demo showing roles, ops, disputes, and financial transparency.",
  },
  "/cases/renter-architecture": {
    title: withSite("Renter Architecture"),
    description: "Public breakdown of a rental marketplace architecture and decisions.",
  },
};

export const getMetaForPath = (pathname) => {
  if (ROUTE_META[pathname]) {
    return { ...DEFAULT_META, ...ROUTE_META[pathname] };
  }
  if (pathname.startsWith("/cases/")) {
    return {
      ...DEFAULT_META,
      title: withSite("Case Study"),
      description: "Public architecture case studies with engineering constraints and decisions.",
    };
  }
  return DEFAULT_META;
};
