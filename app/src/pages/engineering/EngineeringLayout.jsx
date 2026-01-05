import { Link, useLocation } from "react-router-dom";

const engineeringNav = [
  { label: "Overview", to: "/engineering" },
  { label: "Architecture Preview", to: "/architecture-preview" },
  { label: "Admin-First Toggle", to: "/admin-first" },
  { label: "Production Ready", to: "/production-ready" },
  { label: "Estimator", to: "/estimate" },
  { label: "Renter Case", to: "/cases/renter-architecture" },
];

const EngineeringLayout = ({ kicker = "Engineering", title, subtitle, children }) => {
  const location = useLocation();

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-12">
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.4em] text-zinc-500">{kicker}</div>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm text-zinc-300 sm:text-base">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {engineeringNav.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "rounded-full border px-4 py-2 text-xs transition",
                  active ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-zinc-400 hover:border-white/30 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
};

export default EngineeringLayout;
