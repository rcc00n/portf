import ogImage from "../assets/raccoon-logo.png";

const DEFAULT_META = {
  title: "studio - Senior software studio",
  description: "Senior-only product studio building CRMs, marketplaces, and internal platforms with production-grade engineering.",
  image: ogImage,
};

const ROUTE_META = {
  "/": {
    title: "studio - Senior software studio",
    description: "Senior-only teams building CRMs, marketplaces, and internal tools with reliable delivery and clear outcomes.",
  },
  "/services": {
    title: "Services - studio",
    description: "Senior delivery for software development, CRM transformation, analytics, and growth systems.",
  },
  "/projects": {
    title: "Projects - studio",
    description: "Case studies with measurable outcomes across CRM, marketplaces, and automation platforms.",
  },
  "/process": {
    title: "Process - studio",
    description: "Delivery rituals, risk tracking, and weekly demos that keep launches predictable.",
  },
  "/pricing": {
    title: "Pricing - studio",
    description: "Transparent tiers with senior-only delivery and scoped outcomes.",
  },
  "/tech": {
    title: "Tech - studio",
    description: "Modern, reliable stack choices across frontend, backend, data, and DevOps.",
  },
  "/journal": {
    title: "Engineering Journal - studio",
    description: "Short, opinionated notes on admin-first systems, scaling failure modes, and auditability.",
  },
  "/decisions": {
    title: "Decisions - studio",
    description: "Public decision records covering architecture defaults, trade-offs, and when we change course.",
  },
  "/about": {
    title: "About - studio",
    description: "A senior-only team founded by engineers and focused on delivery quality.",
  },
  "/not-for-everyone": {
    title: "Not for everyone - studio",
    description: "A calm fit check to help teams self-select before starting.",
  },
  "/start": {
    title: "Start - studio",
    description: "Qualification gate to align project type, complexity, budget, and timeline.",
  },
  "/contact": {
    title: "Contact - studio",
    description: "Request a technical estimate with clear scope, timeline, and budget.",
  },
  "/pre-call": {
    title: "Pre-call package - studio",
    description: "Prep package covering workflow, resources, and what to bring to the call.",
  },
  "/summary": {
    title: "Project summary - studio",
    description: "Single-screen project one-pager with scope signals and next steps.",
  },
  "/engineering": {
    title: "Engineering Lab - studio",
    description: "Advanced modules that surface architecture depth and delivery standards.",
  },
  "/architecture-preview": {
    title: "Architecture Preview - studio",
    description: "Interactive system map showing frontend, backend, data, and integrations.",
  },
  "/admin-first": {
    title: "Admin-First Toggle - studio",
    description: "Switch between customer and admin views to reveal control layers.",
  },
  "/production-ready": {
    title: "Production Readiness - studio",
    description: "Checklist of auth, monitoring, backups, and security defaults.",
  },
  "/estimate": {
    title: "Estimator - studio",
    description: "Range-based estimator for timelines, budgets, and architecture scope.",
  },
  "/admin-demo": {
    title: "Admin Demo - studio",
    description: "Interactive admin control demo showing roles, ops, disputes, and financial transparency.",
  },
  "/demo/admin": {
    title: "Admin Demo - studio",
    description: "Interactive admin control demo showing roles, ops, disputes, and financial transparency.",
  },
  "/cases/renter-architecture": {
    title: "Renter Architecture - studio",
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
      title: "Case Study - studio",
      description: "Public architecture case studies with engineering constraints and decisions.",
    };
  }
  return DEFAULT_META;
};
