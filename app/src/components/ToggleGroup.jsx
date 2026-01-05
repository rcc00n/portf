const ToggleGroup = ({ label, options, value, onChange, className = "" }) => {
  const columnClass = options.length <= 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    <div className={`space-y-2 ${className}`}>
      {label ? (
        <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">{label}</div>
      ) : null}
      <div role="radiogroup" className={`grid gap-2 ${columnClass}`}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={[
                "rounded-xl border px-4 py-3 text-left transition",
                active ? "border-white/35 bg-white/10 text-white" : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/25 hover:bg-white/10",
              ].join(" ")}
            >
              <div className="text-sm font-semibold">{option.label}</div>
              {option.description ? (
                <div className="mt-1 text-xs text-zinc-400">{option.description}</div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ToggleGroup;
