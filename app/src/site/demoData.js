// Retained fictional demo fixtures. No connection to the admin/CMS or live data.
export const VIEW_OPTIONS = [
  { value: "customer", label: "Customer View" },
  { value: "admin", label: "Admin View" },
];

export const ADMIN_NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
    summary: "Ops pulse across revenue, usage, and risk.",
    controls: ["KPIs", "Ops queues", "Risk flags"],
  },
  {
    id: "users",
    label: "Users & Roles",
    summary: "RBAC and approval scopes for every operator.",
    controls: ["Roles", "Permissions", "Approvals"],
  },
  {
    id: "pipelines",
    label: "Pipelines",
    summary: "Live workflow stages with handoffs and blockers.",
    controls: ["Stage control", "Work routing"],
  },
  {
    id: "transactions",
    label: "Transactions",
    summary: "Money movement with fee transparency.",
    controls: ["Settlement", "Fees", "Risk checks"],
  },
  {
    id: "disputes",
    label: "Disputes",
    summary: "Evidence, timelines, and resolution actions.",
    controls: ["Evidence", "Decisions", "Outcomes"],
  },
  {
    id: "settings",
    label: "Settings",
    summary: "Business rules that keep ops predictable.",
    controls: ["Policies", "Thresholds", "Alerts"],
  },
  {
    id: "audit",
    label: "Audit Log",
    summary: "Append-only accountability across the system.",
    controls: ["Traceability", "Compliance"],
  },
];

export const CONTROL_SURFACES = [
  "Roles & permissions",
  "Money flow",
  "Dispute decisions",
  "Pipeline velocity",
  "Auditability",
];

export const KPI_DATA = [
  { id: "active", label: "Active users", value: "1,284", trend: { direction: "up", value: "8% today" }, note: "7-day avg" },
  { id: "revenue", label: "Revenue today", value: "$12.4k", trend: { direction: "up", value: "4% vs yesterday" }, note: "Net of fees" },
  { id: "disputes", label: "Open disputes", value: "6", trend: { direction: "down", value: "2 resolved" }, note: "Within SLA" },
  { id: "conversion", label: "Conversion rate", value: "3.2%", trend: { direction: "up", value: "0.4% lift" }, note: "Trial -> paid" },
];

export const USERS_SEED = [
  {
    id: "u1",
    name: "Ava Cohen",
    email: "ava@ops.studio",
    role: "Admin",
    permissions: ["Manage users", "Approve payouts", "Resolve disputes", "Export data", "Edit pricing", "View analytics"],
  },
  {
    id: "u2",
    name: "Kai Romero",
    email: "kai@ops.studio",
    role: "Operator",
    permissions: ["Resolve disputes", "View analytics", "Export data", "Approve payouts"],
  },
  {
    id: "u3",
    name: "Lina Park",
    email: "lina@ops.studio",
    role: "Viewer",
    permissions: ["View analytics"],
  },
  {
    id: "u4",
    name: "Noah Patel",
    email: "noah@ops.studio",
    role: "Operator",
    permissions: ["Approve payouts", "Resolve disputes", "Export data"],
  },
];

export const PERMISSION_OPTIONS = [
  "Manage users",
  "Approve payouts",
  "Resolve disputes",
  "Export data",
  "Edit pricing",
  "View analytics",
];

export const PIPELINE_COLUMNS = [
  { id: "new", label: "New" },
  { id: "in_progress", label: "In Progress" },
  { id: "blocked", label: "Blocked" },
  { id: "completed", label: "Completed" },
];

export const PIPELINE_SEED = [
  { id: "p1", title: "Onboard Acme Retail", owner: "Ava", detail: "KYC + contract", status: "new" },
  { id: "p2", title: "Refund review - #4831", owner: "Kai", detail: "Evidence requested", status: "in_progress" },
  { id: "p3", title: "Payout delay - EU batch", owner: "Noah", detail: "Bank reconciliation", status: "blocked" },
  { id: "p4", title: "Enterprise renewal", owner: "Ava", detail: "Pricing approved", status: "completed" },
];

export const TRANSACTIONS_SEED = [
  {
    id: "t1",
    amount: "$4,920.00",
    status: "Settled",
    method: "Card **** 4242",
    date: "Today, 10:12",
    merchant: "Acme Retail",
    reference: "INV-4412",
    fees: [
      { label: "Processing fee", value: "$98.40" },
      { label: "Platform fee", value: "$71.60" },
      { label: "Risk reserve", value: "$0.00" },
    ],
  },
  {
    id: "t2",
    amount: "$1,260.00",
    status: "Pending",
    method: "ACH",
    date: "Today, 08:40",
    merchant: "Northwind Co",
    reference: "INV-4401",
    fees: [
      { label: "Processing fee", value: "$18.90" },
      { label: "Platform fee", value: "$22.10" },
      { label: "Risk reserve", value: "$10.00" },
    ],
  },
  {
    id: "t3",
    amount: "$620.00",
    status: "Failed",
    method: "Wire",
    date: "Yesterday, 18:03",
    merchant: "Pulse Logistics",
    reference: "INV-4389",
    fees: [
      { label: "Processing fee", value: "$12.40" },
      { label: "Platform fee", value: "$9.30" },
      { label: "Risk reserve", value: "$0.00" },
    ],
  },
];

export const DISPUTES_SEED = [
  {
    id: "d1",
    customer: "Northwind Co",
    amount: "$1,200",
    status: "Open",
    reason: "Duplicate charge",
    evidence: ["Invoice INV-4401", "Chargeback notice", "Support transcript"],
    timeline: ["2h ago - Dispute opened", "90m ago - Evidence requested", "40m ago - Operator assigned"],
  },
  {
    id: "d2",
    customer: "Lumen Labs",
    amount: "$780",
    status: "Reviewing",
    reason: "Service not delivered",
    evidence: ["Delivery log", "Signed receipt", "Usage report"],
    timeline: ["Yesterday - Dispute opened", "Yesterday - Evidence submitted", "Today - Reviewing"],
  },
  {
    id: "d3",
    customer: "Pulse Logistics",
    amount: "$2,400",
    status: "Resolved",
    reason: "Unauthorized refund",
    evidence: ["Refund policy", "Approval log", "Email confirmation"],
    timeline: ["Apr 7 - Dispute opened", "Apr 8 - Decision drafted", "Apr 9 - Resolved"],
  },
];

export const SETTINGS_SEED = [
  { id: "s1", label: "Auto-approve refunds under $200", value: "On", detail: "Escalate above threshold" },
  { id: "s2", label: "Require two-person approval for payouts", value: "On", detail: "Applies to $5k+" },
  { id: "s3", label: "Dispute SLA window", value: "48h", detail: "Escalate at 24h" },
  { id: "s4", label: "Risk reserve %", value: "2.5%", detail: "Auto-adjust weekly" },
];

export const AUDIT_LOG = [
  { id: "a1", action: "Ava Cohen updated Lina Park role to Viewer", time: "Today 09:12", source: "Admin console", ip: "73.81.22.41" },
  { id: "a2", action: "Kai Romero approved payout batch EU-22", time: "Today 08:20", source: "Payouts", ip: "73.81.22.41" },
  { id: "a3", action: "Noah Patel changed dispute SLA to 48h", time: "Yesterday 17:45", source: "Settings", ip: "63.12.84.11" },
  { id: "a4", action: "System flagged transaction t3 for review", time: "Yesterday 15:08", source: "Risk engine", ip: "system" },
];

export const CUSTOMER_ORDERS = [
  { id: "o1", label: "Order #4831", status: "Processing", detail: "ETA 2 days" },
  { id: "o2", label: "Order #4824", status: "Shipped", detail: "Tracking available" },
  { id: "o3", label: "Order #4811", status: "Delivered", detail: "Rate experience" },
];

export const CUSTOMER_NOTIFICATIONS = [
  { id: "n1", label: "Payout completed", detail: "Invoice INV-4412" },
  { id: "n2", label: "New message", detail: "Support updated ticket #228" },
  { id: "n3", label: "Policy update", detail: "Terms refreshed" },
];

