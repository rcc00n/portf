import { useMemo, useState } from "react";
import DataCard from "../../components/DataCard";
import DiagramCanvas from "../../components/DiagramCanvas";
import ToggleGroup from "../../components/ToggleGroup";
import EngineeringLayout from "./EngineeringLayout";
import {
  BLOCKS,
  DIAGRAM_CONNECTIONS,
  DIAGRAM_NODES,
  PRODUCT_OPTIONS,
  SCALE_OPTIONS,
  buildPreset,
} from "./architectureData";

const CARD_BLURBS = {
  frontend: "Workflow UI + state",
  backend: "Domain services + jobs",
  database: "Transactional core",
  integrations: "Connectors + retries",
  admin: "Ops + overrides",
  analytics: "Events + BI",
};

const ArchitecturePreview = () => {
  const [product, setProduct] = useState(PRODUCT_OPTIONS[0].value);
  const [scale, setScale] = useState(SCALE_OPTIONS[0].value);
  const [activeBlockId, setActiveBlockId] = useState("backend");

  const preset = useMemo(() => buildPreset(product, scale), [product, scale]);
  const fallbackBlockId = BLOCKS[0]?.id;
  const activeBlock = preset.blocks[activeBlockId] || preset.blocks[fallbackBlockId];

  const detailSections = [
    { label: "Responsibilities", items: activeBlock?.responsibilities },
    { label: "Stack", items: activeBlock?.stack },
    { label: "Interfaces", items: activeBlock?.interfaces },
    { label: "Quality bars", items: activeBlock?.quality },
  ];

  return (
    <EngineeringLayout
      title="Architecture Preview"
      subtitle="Select a product type and scale to reveal a live system decomposition. Each block is interactive, with the underlying responsibilities, stack, and quality bars documented."
    >
      <div className="space-y-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <ToggleGroup
            label="Product type"
            options={PRODUCT_OPTIONS}
            value={product}
            onChange={setProduct}
          />
          <ToggleGroup
            label="Scale"
            options={SCALE_OPTIONS}
            value={scale}
            onChange={setScale}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <DataCard
            meta="Product focus"
            title={preset.product}
            subtitle={preset.productProfile?.summary}
            tags={preset.productProfile?.focus || []}
          />
          <DataCard
            meta="Scale posture"
            title={preset.scale}
            subtitle={preset.scaleProfile?.summary}
            tags={preset.scaleProfile?.traits || []}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {preset.signals.map((signal) => (
            <div key={signal.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">{signal.label}</div>
              <div className="mt-1 text-sm font-semibold text-white">{signal.value}</div>
              <div className="mt-1 text-xs text-zinc-400">{signal.description}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="relative hidden min-h-[420px] rounded-3xl border border-white/10 bg-white/5 p-6 md:block">
              <DiagramCanvas nodes={DIAGRAM_NODES} connections={DIAGRAM_CONNECTIONS} />
              {DIAGRAM_NODES.map((node) => {
                const block = preset.blocks[node.id];
                if (!block) return null;
                return (
                  <DataCard
                    key={node.id}
                    compact
                    title={block.title}
                    subtitle={CARD_BLURBS[node.id]}
                    active={activeBlockId === node.id}
                    onClick={() => setActiveBlockId(node.id)}
                    className="absolute w-44 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
                  />
                );
              })}
            </div>

            <div className="grid gap-3 md:hidden">
              {BLOCKS.map((block) => {
                const data = preset.blocks[block.id];
                if (!data) return null;
                return (
                  <DataCard
                    key={block.id}
                    title={data.title}
                    subtitle={data.summary}
                    active={activeBlockId === block.id}
                    onClick={() => setActiveBlockId(block.id)}
                  />
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5" aria-live="polite">
              <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Selected block</div>
              <div className="mt-2 text-xl font-semibold text-white">{activeBlock?.title}</div>
              <p className="mt-2 text-sm text-zinc-300">{activeBlock?.summary}</p>
              {detailSections.map((section) => (
                section.items?.length ? (
                  <div key={section.label} className="mt-4">
                    <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">{section.label}</div>
                    <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300/80" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-400">
              <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Assumptions</div>
              <div className="mt-2">
                Inputs assume a senior-only delivery team, staged rollouts, and real production constraints.
              </div>
            </div>
          </div>
        </div>
      </div>
    </EngineeringLayout>
  );
};

export default ArchitecturePreview;
