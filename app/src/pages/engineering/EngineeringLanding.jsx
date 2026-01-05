import { Link } from "react-router-dom";
import DataCard from "../../components/DataCard";
import EngineeringLayout from "./EngineeringLayout";

const modules = [
  {
    id: "architecture-preview",
    title: "Architecture Preview",
    status: "Live module",
    summary: "Interactive system map that adapts to product type and scale assumptions.",
    tags: ["System map", "Client-side", "Decision log"],
    to: "/architecture-preview",
    cta: "Open module",
  },
  {
    id: "admin-first",
    title: "Admin-First Toggle",
    status: "Live module",
    summary: "Switch between customer and admin views to surface control layers.",
    tags: ["CRM pipeline", "Audit logs", "RBAC"],
    to: "/admin-first",
    cta: "Open module",
  },
  {
    id: "production-ready",
    title: "Production Readiness Checklist",
    status: "Live module",
    summary: "Expandable checklist of reliability defaults and why they matter.",
    tags: ["Monitoring", "Backups", "Security"],
    to: "/production-ready",
    cta: "Open module",
  },
  {
    id: "estimate",
    title: "Interactive Estimator",
    status: "Live module",
    summary: "Range-based estimator for timeline and budget planning.",
    tags: ["Ranges only", "Architecture blocks", "No spam"],
    to: "/estimate",
    cta: "Use estimator",
  },
  {
    id: "renter-case",
    title: "Renter Architecture Case Study",
    status: "Live module",
    summary: "Public architecture breakdown with decisions and fixes.",
    tags: ["Case study", "Admin flows", "Scaling"],
    to: "/cases/renter-architecture",
    cta: "Read case study",
  },
  {
    id: "observability",
    title: "Observability Readiness",
    status: "Planned",
    summary: "SLO coverage, tracing depth, alert routing, and runbook maturity checks.",
    tags: ["SLOs", "Tracing", "Runbooks"],
  },
  {
    id: "migration",
    title: "Data Migration Blueprint",
    status: "Planned",
    summary: "Entity mapping, backfill sequencing, and cutover risk scoring.",
    tags: ["ETL", "Backfill", "Cutover"],
  },
];

const EngineeringLanding = () => (
  <EngineeringLayout
    title="Engineering Lab"
    subtitle="Advanced modules that expose architecture depth without inflating the homepage. Each module is isolated, fast, and focused on real system constraints."
  >
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <DataCard
            key={module.id}
            meta={module.status}
            title={module.title}
            subtitle={module.summary}
            tags={module.tags}
          >
            {module.to ? (
              <Link
                to={module.to}
                className="inline-flex items-center gap-2 text-sm font-medium text-sky-200 hover:text-sky-100"
              >
                {module.cta}
                <span aria-hidden="true">-&gt;</span>
              </Link>
            ) : (
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">In build</div>
            )}
          </DataCard>
        ))}
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Module rules</div>
          <ul className="mt-3 space-y-2">
            <li>Client-only logic with lazy loading</li>
            <li>No heavy dependencies or builders</li>
            <li>Engineering artifacts over marketing copy</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">What ships next</div>
          <div className="mt-3">Incident rehearsal matrix, latency budgets, and upgrade playbooks.</div>
        </div>
      </div>
    </div>
  </EngineeringLayout>
);

export default EngineeringLanding;
