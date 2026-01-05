import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Circle } from "lucide-react";

const VIEW_OPTIONS = [
  { value: "customer", label: "Customer View" },
  { value: "admin", label: "Admin View" },
];

const ADMIN_NAV = [
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

const CONTROL_SURFACES = [
  "Roles & permissions",
  "Money flow",
  "Dispute decisions",
  "Pipeline velocity",
  "Auditability",
];

const KPI_DATA = [
  { id: "active", label: "Active users", value: "1,284", trend: { direction: "up", value: "8% today" }, note: "7-day avg" },
  { id: "revenue", label: "Revenue today", value: "$12.4k", trend: { direction: "up", value: "4% vs yesterday" }, note: "Net of fees" },
  { id: "disputes", label: "Open disputes", value: "6", trend: { direction: "down", value: "2 resolved" }, note: "Within SLA" },
  { id: "conversion", label: "Conversion rate", value: "3.2%", trend: { direction: "up", value: "0.4% lift" }, note: "Trial -> paid" },
];

const USERS_SEED = [
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

const PERMISSION_OPTIONS = [
  "Manage users",
  "Approve payouts",
  "Resolve disputes",
  "Export data",
  "Edit pricing",
  "View analytics",
];

const PIPELINE_COLUMNS = [
  { id: "new", label: "New" },
  { id: "in_progress", label: "In Progress" },
  { id: "blocked", label: "Blocked" },
  { id: "completed", label: "Completed" },
];

const PIPELINE_SEED = [
  { id: "p1", title: "Onboard Acme Retail", owner: "Ava", detail: "KYC + contract", status: "new" },
  { id: "p2", title: "Refund review - #4831", owner: "Kai", detail: "Evidence requested", status: "in_progress" },
  { id: "p3", title: "Payout delay - EU batch", owner: "Noah", detail: "Bank reconciliation", status: "blocked" },
  { id: "p4", title: "Enterprise renewal", owner: "Ava", detail: "Pricing approved", status: "completed" },
];

const TRANSACTIONS_SEED = [
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

const DISPUTES_SEED = [
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

const SETTINGS_SEED = [
  { id: "s1", label: "Auto-approve refunds under $200", value: "On", detail: "Escalate above threshold" },
  { id: "s2", label: "Require two-person approval for payouts", value: "On", detail: "Applies to $5k+" },
  { id: "s3", label: "Dispute SLA window", value: "48h", detail: "Escalate at 24h" },
  { id: "s4", label: "Risk reserve %", value: "2.5%", detail: "Auto-adjust weekly" },
];

const AUDIT_LOG = [
  { id: "a1", action: "Ava Cohen updated Lina Park role to Viewer", time: "Today 09:12", source: "Admin console", ip: "73.81.22.41" },
  { id: "a2", action: "Kai Romero approved payout batch EU-22", time: "Today 08:20", source: "Payouts", ip: "73.81.22.41" },
  { id: "a3", action: "Noah Patel changed dispute SLA to 48h", time: "Yesterday 17:45", source: "Settings", ip: "63.12.84.11" },
  { id: "a4", action: "System flagged transaction t3 for review", time: "Yesterday 15:08", source: "Risk engine", ip: "system" },
];

const CUSTOMER_ORDERS = [
  { id: "o1", label: "Order #4831", status: "Processing", detail: "ETA 2 days" },
  { id: "o2", label: "Order #4824", status: "Shipped", detail: "Tracking available" },
  { id: "o3", label: "Order #4811", status: "Delivered", detail: "Rate experience" },
];

const CUSTOMER_NOTIFICATIONS = [
  { id: "n1", label: "Payout completed", detail: "Invoice INV-4412" },
  { id: "n2", label: "New message", detail: "Support updated ticket #228" },
  { id: "n3", label: "Policy update", detail: "Terms refreshed" },
];

const classNames = (...classes) => classes.filter(Boolean).join(" ");
const parseMoney = (value) => Number(String(value).replace(/[$,]/g, ""));
const formatMoney = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const Panel = ({ kicker, title, children, className = "" }) => (
  <div className={classNames("rounded-2xl border border-white/10 bg-white/5 p-4", className)}>
    {kicker ? <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">{kicker}</div> : null}
    {title ? <div className="mt-2 text-lg font-semibold text-white">{title}</div> : null}
    {children ? <div className={title || kicker ? "mt-4" : ""}>{children}</div> : null}
  </div>
);

const Tag = ({ children, className = "" }) => (
  <span className={classNames("rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] text-zinc-300", className)}>
    {children}
  </span>
);

const Trend = ({ direction, value }) => {
  const positive = direction === "up";
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={classNames("inline-flex items-center gap-1 text-xs", positive ? "text-emerald-300" : "text-rose-300")}>
      <Icon className="h-3 w-3" />
      {value}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    Settled: "border-emerald-400/40 text-emerald-300 bg-emerald-400/10",
    Pending: "border-amber-400/40 text-amber-300 bg-amber-400/10",
    Failed: "border-rose-400/40 text-rose-300 bg-rose-400/10",
    Open: "border-amber-400/40 text-amber-300 bg-amber-400/10",
    Reviewing: "border-sky-400/40 text-sky-300 bg-sky-400/10",
    Resolved: "border-emerald-400/40 text-emerald-300 bg-emerald-400/10",
  };
  return (
    <span className={classNames("rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide", styles[status] || "border-white/20 text-zinc-300")}>
      {status}
    </span>
  );
};

const PermissionToggle = ({ label, enabled, onToggle }) => (
  <button
    type="button"
    aria-pressed={enabled}
    onClick={onToggle}
    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-left text-xs text-zinc-300 transition hover:border-white/30 hover:bg-white/5"
  >
    <span>{label}</span>
    <span className={classNames("inline-flex items-center gap-1 text-[11px]", enabled ? "text-emerald-300" : "text-zinc-500")}>
      {enabled ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
      {enabled ? "Enabled" : "Off"}
    </span>
  </button>
);

const AdminDemo = () => {
  const [view, setView] = useState("admin");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [users, setUsers] = useState(USERS_SEED);
  const [activeUserId, setActiveUserId] = useState(USERS_SEED[0]?.id);
  const [pipelineCards, setPipelineCards] = useState(PIPELINE_SEED);
  const [draggingCardId, setDraggingCardId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [activeDisputeId, setActiveDisputeId] = useState(DISPUTES_SEED[0]?.id);

  const activeSection = ADMIN_NAV.find((item) => item.id === activeNav);
  const activeUser = users.find((user) => user.id === activeUserId) || users[0];
  const activeDispute = DISPUTES_SEED.find((dispute) => dispute.id === activeDisputeId) || DISPUTES_SEED[0];

  useEffect(() => {
    if (!activeTransaction) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeTransaction]);

  const pipelineByStatus = useMemo(() => {
    return PIPELINE_COLUMNS.reduce((acc, column) => {
      acc[column.id] = pipelineCards.filter((card) => card.status === column.id);
      return acc;
    }, {});
  }, [pipelineCards]);

  const handlePermissionToggle = (permission) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== activeUserId) return user;
        const hasPermission = user.permissions.includes(permission);
        return {
          ...user,
          permissions: hasPermission
            ? user.permissions.filter((item) => item !== permission)
            : [...user.permissions, permission],
        };
      })
    );
  };

  const handleDragStart = (event, cardId) => {
    event.dataTransfer.setData("text/plain", cardId);
    setDraggingCardId(cardId);
  };

  const handleDrop = (event, columnId) => {
    event.preventDefault();
    const cardId = event.dataTransfer.getData("text/plain");
    if (!cardId) return;
    setPipelineCards((prev) =>
      prev.map((card) => (card.id === cardId ? { ...card, status: columnId } : card))
    );
    setDraggingCardId(null);
    setDragOverColumn(null);
  };

  const isAdminView = view === "admin";
  const netAmount = activeTransaction
    ? formatMoney(
      parseMoney(activeTransaction.amount) - activeTransaction.fees.reduce((sum, fee) => sum + parseMoney(fee.value), 0)
    )
    : null;

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-12">
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Interactive admin demo</div>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Interactive admin demo</h1>
        <p className="max-w-3xl text-sm text-zinc-300 sm:text-base">
          A glimpse into how we design control, roles, and operations - not just dashboards.
        </p>
        <div className="text-xs text-zinc-500">Demo data - No real users</div>
      </div>

      <div className="mt-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Global view switch</div>
            <div className="mt-2 text-sm text-zinc-400">Switch to reveal who controls what.</div>
          </div>
          <div role="radiogroup" aria-label="View mode" className="inline-flex rounded-full border border-white/10 bg-black/40 p-1">
            {VIEW_OPTIONS.map((option) => {
              const active = option.value === view;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setView(option.value)}
                  className={classNames(
                    "rounded-full px-4 py-2 text-xs font-semibold transition",
                    active ? "bg-white text-black" : "text-zinc-300 hover:text-white"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel
            kicker="Active lens"
            title={isAdminView ? "Admin control surfaces" : "Customer-facing surface"}
            className={isAdminView ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/10"}
          >
            <p className="text-sm text-zinc-200">
              {isAdminView
                ? "Operators see roles, money movement, disputes, and policy levers."
                : "Customers only see their own orders, profile, and notifications."}
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              {isAdminView
                ? "This is where the business gets controlled, not just observed."
                : "Customer UX stays clean while admin systems handle the complexity."}
            </p>
            <div className="mt-3 text-xs text-zinc-500">Business-control showcase, not a UI gallery.</div>
          </Panel>
          <Panel kicker="Emphasis shift" title="What changes">
            <ul className="space-y-2 text-sm text-zinc-300">
              {isAdminView ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                    <span>Decision rights, approvals, and auditability become visible.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                    <span>Operational pipelines expose bottlenecks and ownership.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                    <span>Financial flows are transparent and explainable.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300/80" />
                    <span>UI is focused on personal status, not system control.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300/80" />
                    <span>Decisions and risk management stay in admin.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300/80" />
                    <span>Surface area is intentionally narrow.</span>
                  </li>
                </>
              )}
            </ul>
          </Panel>
        </div>
      </div>

      {isAdminView ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <Panel kicker="Admin navigation">
              <div className="space-y-2">
                {ADMIN_NAV.map((item) => {
                  const active = item.id === activeNav;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveNav(item.id)}
                      className={classNames(
                        "flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left transition",
                        active ? "border-white/40 bg-white/10 text-white" : "border-white/10 bg-black/30 text-zinc-300 hover:border-white/30 hover:bg-white/5"
                      )}
                    >
                      <div>
                        <div className="text-sm font-semibold">{item.label}</div>
                        <div className="mt-1 text-xs text-zinc-400">{item.summary}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Panel>
            <Panel kicker="Why this matters">
              <p className="text-xs text-zinc-400">
                Admin navigation isn&apos;t menu chrome. It is the map of how the business runs.
              </p>
            </Panel>
            <Panel kicker="Control surfaces">
              <div className="flex flex-wrap gap-2">
                {CONTROL_SURFACES.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </Panel>
          </aside>

          <div className="space-y-6">
            <Panel
              kicker="Admin module"
              title={activeSection?.label}
              className={classNames("border-white/15 bg-white/5", isAdminView ? "shadow-[0_0_0_1px_rgba(16,185,129,0.2)]" : "")}
            >
              <p className="text-sm text-zinc-300">{activeSection?.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeSection?.controls.map((control) => (
                  <Tag key={control}>{control}</Tag>
                ))}
              </div>
            </Panel>

            {activeNav === "dashboard" ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {KPI_DATA.map((kpi) => (
                    <Panel key={kpi.id} title={kpi.value} kicker={kpi.label}>
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>{kpi.note}</span>
                        <Trend direction={kpi.trend.direction} value={kpi.trend.value} />
                      </div>
                    </Panel>
                  ))}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel kicker="Active queues" title="Ops watchlist">
                    <ul className="space-y-2 text-sm text-zinc-300">
                      <li className="flex items-center justify-between">
                        <span>KYC reviews</span>
                        <span className="text-xs text-amber-300">12 pending</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Payout approvals</span>
                        <span className="text-xs text-zinc-400">4 waiting</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Disputes awaiting evidence</span>
                        <span className="text-xs text-rose-300">2 high risk</span>
                      </li>
                    </ul>
                  </Panel>
                  <Panel kicker="Ops risks" title="Alerts needing decisions">
                    <ul className="space-y-2 text-sm text-zinc-300">
                      <li>Revenue variance flagged in EU region</li>
                      <li>High chargeback ratio for Northwind Co</li>
                      <li>Support backlog breached SLA threshold</li>
                    </ul>
                    <div className="mt-4 text-xs text-zinc-400">
                      <span className="text-zinc-300">Why this matters:</span> Dashboards surface bottlenecks, not vanity metrics.
                    </div>
                  </Panel>
                </div>
              </div>
            ) : null}

            {activeNav === "users" ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <Panel kicker="Users list" title="Active operators">
                  <div className="space-y-2">
                    {users.map((user) => {
                      const active = user.id === activeUserId;
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => setActiveUserId(user.id)}
                          className={classNames(
                            "flex w-full items-start justify-between rounded-xl border px-3 py-2 text-left transition",
                            active ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/10 bg-black/30 hover:border-white/30 hover:bg-white/5"
                          )}
                        >
                          <div>
                            <div className="text-sm font-semibold text-white">{user.name}</div>
                            <div className="text-xs text-zinc-400">{user.email}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Tag>{user.role}</Tag>
                            <div className="flex flex-wrap gap-1">
                              {user.permissions.slice(0, 2).map((perm) => (
                                <span key={perm} className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] text-zinc-400">
                                  {perm}
                                </span>
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-xs text-zinc-400">
                    Role-based access is built-in, not added later.
                  </div>
                </Panel>
                <Panel kicker="Permission controls" title={activeUser?.name}>
                  <div className="text-xs text-zinc-400">{activeUser?.role} - {activeUser?.email}</div>
                  <div className="mt-4 space-y-2">
                    {PERMISSION_OPTIONS.map((permission) => (
                      <PermissionToggle
                        key={permission}
                        label={permission}
                        enabled={activeUser?.permissions.includes(permission)}
                        onToggle={() => handlePermissionToggle(permission)}
                      />
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-zinc-400">
                    <span className="text-zinc-300">Why this matters:</span> Permissions prevent expensive mistakes.
                  </div>
                </Panel>
              </div>
            ) : null}

            {activeNav === "pipelines" ? (
              <Panel kicker="Operational pipeline" title="Drag cards to update status">
                <div className="text-xs text-zinc-400">Ops thinking beats CRM buzzwords.</div>
                <div className="mt-4 grid gap-4 lg:grid-cols-4">
                  {PIPELINE_COLUMNS.map((column) => (
                    <div
                      key={column.id}
                      onDragOver={(event) => event.preventDefault()}
                      onDragEnter={() => setDragOverColumn(column.id)}
                      onDragLeave={() => setDragOverColumn(null)}
                      onDrop={(event) => handleDrop(event, column.id)}
                      className={classNames(
                        "rounded-xl border px-3 py-3 text-left",
                        dragOverColumn === column.id ? "border-emerald-400/50 bg-emerald-400/10" : "border-white/10 bg-black/30"
                      )}
                    >
                      <div className="text-xs uppercase tracking-wide text-zinc-400">{column.label}</div>
                      <div className="mt-3 space-y-3">
                        {pipelineByStatus[column.id]?.map((card) => (
                          <div
                            key={card.id}
                            draggable
                            onDragStart={(event) => handleDragStart(event, card.id)}
                            onDragEnd={() => setDraggingCardId(null)}
                            className={classNames(
                              "rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-200",
                              draggingCardId === card.id ? "opacity-60" : "opacity-100"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">{card.title}</span>
                              <span className="text-xs text-zinc-400">{card.owner}</span>
                            </div>
                            <div className="mt-1 text-xs text-zinc-500">{card.detail}</div>
                          </div>
                        ))}
                        {pipelineByStatus[column.id]?.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-xs text-zinc-500">
                            Drop here
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-zinc-400">
                  <span className="text-zinc-300">Why this matters:</span> Pipelines reveal ownership and blockers fast.
                </div>
              </Panel>
            ) : null}

            {activeNav === "transactions" ? (
              <Panel kicker="Money movement" title="Transactions">
                <div className="text-xs text-zinc-400">Financial transparency by default.</div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">
                      <tr className="border-b border-white/10">
                        <th className="py-2">Amount</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Method</th>
                        <th className="py-2">Date</th>
                        <th className="py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {TRANSACTIONS_SEED.map((txn) => (
                        <tr key={txn.id} className="border-b border-white/5">
                          <td className="py-3 font-semibold text-white">{txn.amount}</td>
                          <td className="py-3"><StatusBadge status={txn.status} /></td>
                          <td className="py-3 text-zinc-400">{txn.method}</td>
                          <td className="py-3 text-zinc-400">{txn.date}</td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setActiveTransaction(txn)}
                              className="text-xs text-sky-200 hover:text-sky-100"
                            >
                              View details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            ) : null}

            {activeNav === "disputes" ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <Panel kicker="Disputes" title="Chargeback & refund flow">
                  <div className="space-y-2">
                    {DISPUTES_SEED.map((dispute) => {
                      const active = dispute.id === activeDisputeId;
                      return (
                        <button
                          key={dispute.id}
                          type="button"
                          onClick={() => setActiveDisputeId(dispute.id)}
                          className={classNames(
                            "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition",
                            active ? "border-amber-400/40 bg-amber-400/10" : "border-white/10 bg-black/30 hover:border-white/30 hover:bg-white/5"
                          )}
                        >
                          <div>
                            <div className="text-sm font-semibold text-white">{dispute.customer}</div>
                            <div className="text-xs text-zinc-400">{dispute.reason}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={dispute.status} />
                            <span className="text-xs text-zinc-400">{dispute.amount}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-xs text-zinc-400">
                    Dispute flows are designed, not improvised.
                  </div>
                </Panel>
                <Panel kicker="Evidence" title="Decision workspace">
                  <div className="space-y-3 text-sm text-zinc-300">
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Evidence</div>
                      <ul className="mt-2 space-y-1">
                        {activeDispute?.evidence.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Timeline</div>
                      <ul className="mt-2 space-y-1">
                        {activeDispute?.timeline.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button type="button" disabled className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-500">
                      Approve refund
                    </button>
                    <button type="button" disabled className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-500">
                      Reject dispute
                    </button>
                  </div>
                </Panel>
              </div>
            ) : null}

            {activeNav === "settings" ? (
              <Panel kicker="Settings" title="Policies and thresholds">
                <div className="space-y-3">
                  {SETTINGS_SEED.map((setting) => (
                    <div key={setting.id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-white">{setting.label}</div>
                        <Tag className="text-zinc-200">{setting.value}</Tag>
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">{setting.detail}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-zinc-400">
                  <span className="text-zinc-300">Why this matters:</span> Policies codify how the business runs.
                </div>
              </Panel>
            ) : null}

            {activeNav === "audit" ? (
              <Panel kicker="Audit log" title="Append-only ledger">
                <ul className="divide-y divide-white/10 text-sm text-zinc-300">
                  {AUDIT_LOG.map((entry) => (
                    <li key={entry.id} className="py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-zinc-200">
                        <span>{entry.action}</span>
                        <span className="text-xs text-zinc-500">{entry.time}</span>
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">{entry.source} - {entry.ip}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-xs text-zinc-400">
                  <span className="text-zinc-300">Why this matters:</span> Without audit logs, ops breaks at scale.
                </div>
              </Panel>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-10 space-y-6">
          <Panel kicker="Customer view" title="Customer-facing UI is intentionally simpler than admin">
            <p className="text-sm text-zinc-300">
              Customers get clarity on their own activity. Operators get the levers.
            </p>
          </Panel>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Panel kicker="Orders" title="Your activity">
              <ul className="space-y-2 text-sm text-zinc-300">
                {CUSTOMER_ORDERS.map((order) => (
                  <li key={order.id} className="flex items-center justify-between">
                    <span>{order.label}</span>
                    <span className="text-xs text-zinc-500">{order.status}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-xs text-zinc-500">Limited to personal history.</div>
            </Panel>
            <Panel kicker="Profile" title="Account details">
              <div className="space-y-2 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Plan</span>
                  <span className="text-xs text-zinc-500">Growth</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Billing</span>
                  <span className="text-xs text-zinc-500">Monthly</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Support</span>
                  <span className="text-xs text-zinc-500">Standard</span>
                </div>
              </div>
            </Panel>
            <Panel kicker="Notifications" title="Recent updates">
              <ul className="space-y-2 text-sm text-zinc-300">
                {CUSTOMER_NOTIFICATIONS.map((note) => (
                  <li key={note.id}>
                    <div>{note.label}</div>
                    <div className="text-xs text-zinc-500">{note.detail}</div>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      )}

      <div className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="text-lg font-semibold text-white">Want something like this for your business?</div>
        <div className="mt-4">
          <Link
            to="/start"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Get estimate in 24h
          </Link>
        </div>
      </div>

      {activeTransaction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0d0f] p-6 text-zinc-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Transaction detail</div>
                <div className="mt-2 text-xl font-semibold text-white">{activeTransaction.amount}</div>
                <div className="mt-1 text-sm text-zinc-400">{activeTransaction.merchant} - {activeTransaction.reference}</div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTransaction(null)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 hover:border-white/30 hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="mt-6 space-y-3 text-sm text-zinc-300">
              {activeTransaction.fees.map((fee) => (
                <div key={fee.label} className="flex items-center justify-between">
                  <span>{fee.label}</span>
                  <span>{fee.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-white">
                <span>Net deposited</span>
                <span className="font-semibold">{netAmount}</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-400">
              Fees are broken out so finance teams can reconcile quickly.
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default AdminDemo;
