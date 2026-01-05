import { useMemo, useState } from "react";
import DataCard from "../../components/DataCard";
import ToggleGroup from "../../components/ToggleGroup";
import EngineeringLayout from "./EngineeringLayout";
import { MODULE_SECTIONS, VIEW_OPTIONS, VIEW_PROFILES } from "./adminFirstData";

const AdminFirst = () => {
  const [view, setView] = useState(VIEW_OPTIONS[0].value);
  const profile = useMemo(() => VIEW_PROFILES[view], [view]);

  return (
    <EngineeringLayout
      title="Admin-First Toggle"
      subtitle="Flip between customer and admin perspectives to reveal how the same system serves UX and operational control."
    >
      <div className="space-y-8">
        <ToggleGroup
          label="Global toggle"
          options={VIEW_OPTIONS}
          value={view}
          onChange={setView}
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <DataCard
            meta="Active mode"
            title={profile.title}
            subtitle={profile.summary}
            tags={profile.focus}
          />
          <DataCard meta="Emphasis shift" title="What changes" subtitle="">
            <ul className="space-y-2 text-sm text-zinc-300">
              {profile.shifts.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300/80" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </DataCard>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {MODULE_SECTIONS.map((section) => {
            const content = section[view];
            return (
              <DataCard
                key={section.id}
                meta="Included by default"
                title={section.title}
                subtitle={content.summary}
                tags={content.artifacts}
              >
                <ul className="space-y-2 text-sm text-zinc-300">
                  {content.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300/80" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </DataCard>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-400">
          <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Note</div>
          <div className="mt-2">
            Both modes ship together. The toggle exposes the admin scaffolding that supports the customer UX.
          </div>
        </div>
      </div>
    </EngineeringLayout>
  );
};

export default AdminFirst;
