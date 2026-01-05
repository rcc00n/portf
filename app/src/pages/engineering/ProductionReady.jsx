import { useState } from "react";
import EngineeringLayout from "./EngineeringLayout";
import { CHECKLIST_ITEMS } from "./productionReadyData";

const ChecklistItem = ({ item, open, onToggle }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={`checklist-${item.id}`}
      className="flex w-full items-start justify-between gap-4 text-left"
    >
      <div>
        <div className="text-sm font-semibold text-white">{item.title}</div>
        <div className="mt-1 text-xs uppercase tracking-[0.3em] text-emerald-200">Included by default</div>
      </div>
      <div className="text-xs text-zinc-400">{open ? "Collapse" : "Expand"}</div>
    </button>
    <div
      id={`checklist-${item.id}`}
      hidden={!open}
      aria-hidden={!open}
      className={`mt-3 space-y-3 text-sm text-zinc-300 ${open ? "" : "hidden"}`}
    >
      <p>{item.why}</p>
      <ul className="space-y-2">
        {item.includes.map((detail) => (
          <li key={detail} className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300/80" />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const ProductionReady = () => {
  const [openId, setOpenId] = useState(CHECKLIST_ITEMS[0]?.id || null);

  return (
    <EngineeringLayout
      title="Production Readiness Checklist"
      subtitle="A lightweight checklist of production-grade defaults. Expand each item to see the reasoning and what is included by default."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {CHECKLIST_ITEMS.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                open={openId === item.id}
                onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Why this matters</div>
            <p className="mt-3">
              These checks anchor delivery to operational reality: auth, observability, recovery, and security
              posture. Each item is part of the baseline release, not a paid add-on.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Scope</div>
            <ul className="mt-3 space-y-2">
              <li>Zero API calls and no external dependencies</li>
              <li>Designed to stay fast even on complex systems</li>
              <li>Aligned with audit, compliance, and reliability needs</li>
            </ul>
          </div>
        </div>
      </div>
    </EngineeringLayout>
  );
};

export default ProductionReady;
