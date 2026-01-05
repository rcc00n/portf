const DataCard = ({
  title,
  subtitle,
  meta,
  tags = [],
  active = false,
  onClick,
  compact = false,
  fullWidth = true,
  className = "",
  children,
  ...props
}) => {
  const interactive = typeof onClick === "function";
  const Element = interactive ? "button" : "div";

  return (
    <Element
      type={interactive ? "button" : undefined}
      onClick={onClick}
      aria-pressed={interactive ? active : undefined}
      className={[
        "rounded-2xl border p-4 text-left transition",
        fullWidth ? "w-full" : "",
        "border-white/10 bg-white/5",
        active ? "border-sky-300/50 bg-sky-300/10 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]" : "",
        interactive ? "cursor-pointer hover:border-white/30 hover:bg-white/10" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {meta ? <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">{meta}</div> : null}
      {title ? (
        <div className={`mt-2 font-semibold text-white ${compact ? "text-sm" : "text-base"}`}>
          {title}
        </div>
      ) : null}
      {subtitle ? (
        <div className={`mt-2 text-zinc-300 ${compact ? "text-xs" : "text-sm"}`}>
          {subtitle}
        </div>
      ) : null}
      {tags.length ? (
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-300">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </Element>
  );
};

export default DataCard;
