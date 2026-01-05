export const CHECKLIST_ITEMS = [
  {
    id: "auth",
    title: "Auth & roles",
    why: "Protects sensitive data and enforces least-privilege access.",
    includes: [
      "Role-based access control",
      "MFA-ready auth flows",
      "Session hardening and token rotation",
    ],
  },
  {
    id: "audit",
    title: "Audit logs",
    why: "Provides traceability for changes, incidents, and compliance.",
    includes: [
      "Append-only audit stream",
      "Actor, IP, and device context",
      "Exportable audit snapshots",
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring",
    why: "Keeps latency, errors, and uptime within defined SLOs.",
    includes: [
      "Golden signal dashboards",
      "Alert routing and paging",
      "Tracing across critical paths",
    ],
  },
  {
    id: "backups",
    title: "Backups",
    why: "Prevents data loss and enables recoverability after incidents.",
    includes: [
      "Automated snapshots",
      "Point-in-time recovery",
      "Restore drills on schedule",
    ],
  },
  {
    id: "rate-limits",
    title: "Rate limits",
    why: "Guards against abuse, runaway integrations, and cost spikes.",
    includes: [
      "Per-tenant throttles",
      "Burst controls",
      "Abuse monitoring hooks",
    ],
  },
  {
    id: "feature-flags",
    title: "Feature flags",
    why: "Allows safe releases, experiments, and instant rollbacks.",
    includes: [
      "Targeted rollouts",
      "Kill-switch toggles",
      "Flag ownership and reviews",
    ],
  },
  {
    id: "security",
    title: "Security policies",
    why: "Codifies hardening standards and reduces surface area.",
    includes: [
      "Secrets management",
      "Security headers and CSP",
      "Vulnerability review cadence",
    ],
  },
];
