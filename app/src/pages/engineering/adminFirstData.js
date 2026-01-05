export const VIEW_OPTIONS = [
  { value: "customer", label: "Customer view", description: "UX flow, clarity, and speed" },
  { value: "admin", label: "Admin view", description: "Control, logs, and permissions" },
];

export const VIEW_PROFILES = {
  customer: {
    title: "Customer view",
    summary: "Customer-facing workflows optimized for completion speed and clarity.",
    focus: ["Guided UX", "Low friction", "Fast resolution"],
    shifts: [
      "Expose only the critical controls in-flow",
      "Keep status visibility high, admin noise low",
      "Optimize for completion rate and trust signals",
    ],
  },
  admin: {
    title: "Admin view",
    summary: "Operational control surface with auditability and policy enforcement.",
    focus: ["RBAC guardrails", "Audit trails", "Risk controls"],
    shifts: [
      "Surface operational levers and decision logs",
      "Lock critical actions behind permission checks",
      "Prioritize traceability over minimal UI",
    ],
  },
};

export const MODULE_SECTIONS = [
  {
    id: "pipeline",
    title: "CRM pipeline",
    customer: {
      summary: "Pipeline stages expressed as clear customer milestones.",
      bullets: [
        "Stage progress visible at every step",
        "Inline guidance on required actions",
        "Self-serve updates without support tickets",
      ],
      artifacts: ["Stage SLA hints", "Status notifications"],
    },
    admin: {
      summary: "Pipeline rules enforced with gates, timers, and overrides.",
      bullets: [
        "Stage gates with validation criteria",
        "SLA timers and breach alerts",
        "Manual override history",
      ],
      artifacts: ["Rule engine", "Escalation queues"],
    },
  },
  {
    id: "roles",
    title: "Roles & permissions",
    customer: {
      summary: "Simple, human-readable access rules for teams.",
      bullets: [
        "Role templates with least-privilege defaults",
        "Self-serve invitations and access reviews",
        "Clear ownership boundaries per account",
      ],
      artifacts: ["Invite workflows", "Role presets"],
    },
    admin: {
      summary: "Granular RBAC matrix with compliance-grade logging.",
      bullets: [
        "Permission matrix tied to policy",
        "Access changes logged and reviewed",
        "Periodic access attestations",
      ],
      artifacts: ["RBAC grid", "Access review logs"],
    },
  },
  {
    id: "audit",
    title: "Audit logs",
    customer: {
      summary: "Visible activity history for transparency and trust.",
      bullets: [
        "Account-level activity timeline",
        "Change notifications with context",
        "Exportable summaries",
      ],
      artifacts: ["Activity feed", "Email alerts"],
    },
    admin: {
      summary: "Immutable audit trails with actor and IP attribution.",
      bullets: [
        "Append-only event logging",
        "Actor, IP, and device attribution",
        "Compliance export formats",
      ],
      artifacts: ["Audit store", "Retention policy"],
    },
  },
  {
    id: "finance",
    title: "Financial controls",
    customer: {
      summary: "Transparent billing and safeguards to reduce disputes.",
      bullets: [
        "Real-time balance visibility",
        "Invoice and payment history",
        "Usage alerts before overage",
      ],
      artifacts: ["Billing portal", "Usage alerts"],
    },
    admin: {
      summary: "Approval workflows, ledgers, and reconciliation tooling.",
      bullets: [
        "Approval gates for refunds and payouts",
        "Ledger entries with reconciliation",
        "Risk flags and holdbacks",
      ],
      artifacts: ["Ledger service", "Approval queues"],
    },
  },
];
