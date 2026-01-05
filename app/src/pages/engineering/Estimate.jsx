import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DataCard from "../../components/DataCard";
import ToggleGroup from "../../components/ToggleGroup";
import { trackCtaClick } from "../../utils/analytics";
import EngineeringLayout from "./EngineeringLayout";
import {
  buildEstimate,
  COMPLEXITY_OPTIONS,
  INTEGRATION_OPTIONS,
  PRODUCT_OPTIONS,
  TEAM_OPTIONS,
} from "./estimateData";

const Estimate = () => {
  const [product, setProduct] = useState(PRODUCT_OPTIONS[0].value);
  const [complexity, setComplexity] = useState(COMPLEXITY_OPTIONS[0].value);
  const [team, setTeam] = useState(TEAM_OPTIONS[1].value);
  const [integrations, setIntegrations] = useState(INTEGRATION_OPTIONS[1].value);

  const estimate = useMemo(
    () => buildEstimate({ product, complexity, team, integrations }),
    [product, complexity, team, integrations]
  );

  const handleCtaClick = () => {
    trackCtaClick("Get full estimate in 24h", "/contact", { context: "estimate" });
  };

  return (
    <EngineeringLayout
      kicker="Estimator"
      title="Interactive Estimator"
      subtitle="Select scope inputs to receive range-based estimates. No fake precision, no sales pressure."
    >
      <div className="space-y-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <ToggleGroup label="Product type" options={PRODUCT_OPTIONS} value={product} onChange={setProduct} />
          <ToggleGroup label="Complexity" options={COMPLEXITY_OPTIONS} value={complexity} onChange={setComplexity} />
          <ToggleGroup label="Team size" options={TEAM_OPTIONS} value={team} onChange={setTeam} />
          <ToggleGroup label="Integrations" options={INTEGRATION_OPTIONS} value={integrations} onChange={setIntegrations} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <DataCard
            meta="Timeline range"
            title={estimate.timeline.range}
            subtitle={estimate.timeline.note}
            tags={["Ranges only", "Delivery-grade"]}
          />
          <DataCard
            meta="Budget range"
            title={estimate.budget.range}
            subtitle={estimate.budget.note}
            tags={["No payment required", "Scope based"]}
          />
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Architecture blocks</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {estimate.blocks.map((block) => (
              <DataCard
                key={block.id}
                title={block.title}
                subtitle={block.summary}
                tags={block.tags}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Notes</div>
          <ul className="mt-3 space-y-2">
            <li>Ranges only to avoid false precision.</li>
            <li>No payment, no spam, and no auto-enrollments.</li>
            <li>Final scope is confirmed during discovery.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Next step</div>
          <div className="mt-2 text-lg font-semibold text-white">Get a full estimate in 24 hours.</div>
          <p className="mt-2 text-sm text-zinc-300">
            Share requirements and we will return with a scope breakdown, timeline, and cost range.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/contact"
              onClick={handleCtaClick}
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Get full estimate in 24h
            </Link>
          </div>
        </div>
      </div>
    </EngineeringLayout>
  );
};

export default Estimate;
