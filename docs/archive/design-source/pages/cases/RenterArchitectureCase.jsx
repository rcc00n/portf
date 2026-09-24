import EngineeringLayout from "../engineering/EngineeringLayout";

const SectionCard = ({ title, children }) => (
  <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <h2 className="text-lg font-semibold text-white">{title}</h2>
    <div className="mt-3 text-sm text-zinc-300">{children}</div>
  </section>
);

const ArchitectureDiagram = () => (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
    <div className="overflow-x-auto">
      <svg viewBox="0 0 900 320" className="h-[320px] min-w-[720px] w-full text-zinc-200" aria-label="Architecture diagram" role="img">
        <rect x="20" y="20" width="220" height="60" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" />
        <rect x="20" y="130" width="220" height="60" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" />
        <rect x="20" y="240" width="220" height="60" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" />

        <rect x="340" y="20" width="220" height="60" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(56,189,248,0.4)" />
        <rect x="340" y="130" width="220" height="60" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" />
        <rect x="340" y="240" width="220" height="60" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" />

        <rect x="660" y="20" width="220" height="60" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" />
        <rect x="660" y="130" width="220" height="60" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" />
        <rect x="660" y="240" width="220" height="60" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" />

        <line x1="240" y1="50" x2="340" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <line x1="240" y1="160" x2="340" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
        <line x1="240" y1="270" x2="340" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />

        <line x1="450" y1="80" x2="450" y2="130" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <line x1="450" y1="190" x2="450" y2="240" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

        <line x1="560" y1="270" x2="660" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeDasharray="6 6" />
        <line x1="560" y1="270" x2="660" y2="160" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <line x1="560" y1="270" x2="660" y2="270" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

        <text x="130" y="52" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize="14">Customer web</text>
        <text x="130" y="162" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize="14">Provider portal</text>
        <text x="130" y="272" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize="14">Admin console</text>

        <text x="450" y="52" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize="14">API gateway</text>
        <text x="450" y="162" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize="14">Auth + RBAC</text>
        <text x="450" y="272" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize="14">Core services</text>

        <text x="770" y="52" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize="14">Payments + KYC</text>
        <text x="770" y="162" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize="14">Postgres + ledger</text>
        <text x="770" y="272" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize="14">Search + cache</text>
      </svg>
    </div>
    <div className="mt-3 text-xs text-zinc-500">Static architecture view, optimized for clarity.</div>
  </div>
);

const RenterArchitectureCase = () => (
  <EngineeringLayout
    kicker="Case Study"
    title="Renter Marketplace Architecture"
    subtitle="Public breakdown of a rental marketplace system with admin-first controls and scale decisions."
  >
    <div className="space-y-6">
      <SectionCard title="Business problem">
        <p>
          Build a two-sided rental marketplace with verified providers, time-based availability, and
          trusted payments. The platform needed to scale without sacrificing operational control.
        </p>
        <ul className="mt-3 space-y-2 list-disc pl-5">
          <li>Marketplace matching between renters and providers</li>
          <li>Availability windows, deposits, and dispute handling</li>
          <li>Admin workflows for verification and risk control</li>
        </ul>
      </SectionCard>

      <SectionCard title="Constraints">
        <ul className="space-y-2 list-disc pl-5">
          <li>Single region launch with a path to multi-region growth</li>
          <li>Payment compliance and KYC requirements</li>
          <li>Admin controls must be faster than customer-facing UX iteration</li>
          <li>Search results must stay accurate under high write rates</li>
        </ul>
      </SectionCard>

      <SectionCard title="Architecture diagram">
        <ArchitectureDiagram />
      </SectionCard>

      <SectionCard title="Admin flows">
        <ol className="space-y-2 list-decimal pl-5">
          <li>Provider verification queue with document review</li>
          <li>Listing approval and pricing override tooling</li>
          <li>Dispute resolution with evidence capture</li>
          <li>Refund approval with ledger reconciliation</li>
        </ol>
      </SectionCard>

      <SectionCard title="Scaling decisions">
        <ul className="space-y-2 list-disc pl-5">
          <li>Queue-based ingestion for listing changes and pricing updates</li>
          <li>Read replicas for search and availability queries</li>
          <li>Cache layer for popular listings and availability windows</li>
          <li>Event-driven audit log for every state transition</li>
        </ul>
      </SectionCard>

      <SectionCard title="Mistakes & fixes">
        <ul className="space-y-2 list-disc pl-5">
          <li>Search drift under heavy writes solved with async index rebuilds</li>
          <li>Payment retries created duplicates, fixed with idempotency keys</li>
          <li>Admin overrides lacked visibility, fixed with mandatory audit notes</li>
        </ul>
      </SectionCard>
    </div>
  </EngineeringLayout>
);

export default RenterArchitectureCase;
