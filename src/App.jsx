import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Workflow,
  Braces,
  Megaphone,
  LineChart,
  Gauge,
  Mail,
  Phone,
  Globe,
  Sparkles,
  Star,
  ShieldCheck,
  Bot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ===================== Data ===================== */
const nav = [
  { id: "services", label: "Services" },
  { id: "projects", label: "Projects" },
  { id: "process", label: "Process" },
  { id: "pricing", label: "Pricing" },
  { id: "stack", label: "Tech" },
  { id: "about", label: "About" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
];

const services = [
  { icon: Braces, title: "Software Development", desc: "Back-/front-end, mobile apps, integrations, microservices, DevOps.", tags: ["Django", "Node", "React", "Postgres", "Docker", "K8s"] },
  { icon: Workflow, title: "Custom CRM", desc: "Process analysis, architecture, data migration, roles, reporting.", tags: ["Leads", "Pipelines", "BI", "RBAC", "SLA"] },
  { icon: Megaphone, title: "SMM & Marketing", desc: "Content strategy, creative, performance, UGC, influencers.", tags: ["Meta/Ads", "TikTok", "SEO", "Email", "Brand"] },
  { icon: LineChart, title: "Analytics & Growth", desc: "Funnels, LTV/CAC, A/B testing, attribution, unit-economics.", tags: ["GA4", "Amplitude", "Mixpanel", "DBT", "ETL"] },
  { icon: Gauge, title: "Support & SLA", desc: "24/7 monitoring, SRE practices, observability, disaster recovery.", tags: ["SLO/SLA", "On-call", "Grafana", "Sentry"] },
  { icon: Rocket, title: "Launch & GTM", desc: "Product-market fit, roadmaps, releases, demos, sales enablement.", tags: ["GTM", "Pitch", "Demo"] },
  { icon: Bot, title: "AI Chatbot Service", desc: "Custom AI assistant for automation, lead generation and support.", tags: ["AI", "RAG", "Chat", "CRM"] },
  { icon: Sparkles, title: "Branding & Design", desc: "Identity, UI systems, motion, design tokens.", tags: ["Logo", "UI Kit", "Motion", "Tokens"] },
  { icon: Star, title: "SEO / ASO", desc: "Technical SEO, content ops, on-page, app store optimization.", tags: ["Core Web Vitals", "Schema", "Backlinks"] },
];

/* ===== Projects with image galleries ===== */
const projects = [
  {
    title: "Bad Guy Motors — Motorcycle Parts Catalog",
    impact: "Commerce · SEO",
    blurb: "E-commerce catalog for motorcycle parts with clear navigation and search.",
    links: [{ label: "Live", href: "https://badguymotors.com" }],
    url: "https://badguymotors.com",
    tags: ["Commerce", "Catalog", "SEO"],
    images: [
      "assets/projects/bgm/1.png",
      "assets/projects/bgm/2.png",
      "assets/projects/bgm/3.png",
    ],
  },
  {
    title: "SwiftFleet — Car Rental Platform",
    impact: "Frontend · Canvas",
    blurb: "Modern car rental web app with playful interactions and fast browsing.",
    links: [
      { label: "Live", href: "https://rcc00n.github.io/grr/index.html" },
      { label: "Repo", href: "https://github.com/rcc00n/grr" },
    ],
    url: "https://rcc00n.github.io/grr/",
    tags: ["Web", "Rental"],
    images: [
      "assets/projects/swiftfleet/1.png",
      "assets/projects/swiftfleet/2.png",
      "assets/projects/swiftfleet/3.png",
    ],
  },
  {
    title: "WorldDoc — Global Doctor Finder",
    impact: "Search · Directory",
    blurb: "Online service to discover doctors worldwide, filter by speciality and region.",
    links: [
      { label: "Live", href: "https://rcc00n.github.io/prj_E/" },
      { label: "Repo", href: "https://github.com/rcc00n/prj_E" },
    ],
    url: "https://rcc00n.github.io/prj_E/",
    tags: ["Directory", "Search"],
    images: [
      "assets/projects/worlddoc/1.png",
      "assets/projects/worlddoc/2.png",
    ],
  },
  {
    title: "NorthPeak — Personal Portfolio Site",
    impact: "Landing · Branding",
    blurb: "Clean personal landing page to showcase work, bio and contacts.",
    links: [
      { label: "Live", href: "https://rcc00n.github.io/SnowPlow/" },
      { label: "Repo", href: "https://github.com/rcc00n/SnowPlow" },
    ],
    url: "https://rcc00n.github.io/SnowPlow/",
    tags: ["Portfolio", "Landing"],
    images: [
      "assets/projects/northpeak/1.png",
      "assets/projects/northpeak/2.png",
    ],
  },
  {
    title: "Mobile Arcade (Android/iOS)",
    impact: "Unity · Mobile",
    blurb: "Lightweight arcade game for phones. Store links/APK can be attached later.",
    links: [{ label: "APK / TestFlight", href: "#" }],
    url: "https://example.com",
    tags: ["Mobile", "Game"],
    images: [
      "assets/projects/arcade/1.png",
      // "/assets/projects/arcade/2.png",
    ],
  },
  {
    title: "PortfolioSite — Studio Website",
    impact: "React · Tailwind · Framer Motion",
    blurb: "This very site: modern portfolio built with React, Tailwind, and Framer Motion. Responsive, animated, and fully modular.",
    links: [
      { label: "Live", href: "https://rcc00n.github.io/portf/" },
      { label: "Repo", href: "https://github.com/rcc00n/portf" },
    ],
    url: "https://yourdomain.com",
    tags: ["Portfolio", "React", "Tailwind", "Framer Motion"],
    images: [
      "assets/projects/portfolio/1.png",
      "assets/projects/portfolio/2.png",
      // "/assets/projects/portfolio/3.png",
    ],
  },
];

const pricing = [
  { tier: "CRM Basic", price: "$6k", info: "4–6 weeks · core features", points: ["Architecture & UX", "Main CRM features", "Basic analytics", "Deploy & docs"] },
  { tier: "CRM Standard", price: "$11k", info: "6–10 weeks · 2+ integrations", points: ["Advanced roles & reports", "Custom dashboards", "Sales pipeline automation", "Observability & alerts"], featured: true },
  { tier: "CRM Pro", price: "$18k", info: "10–14 weeks · scale", points: ["Complex integrations", "Full analytics suite", "Marketing funnels", "Support & SLA"] },
  { tier: "Custom Projects", price: "Custom", info: "Unique scope & team setup", points: ["Dedicated squad", "Architecture runway", "Budget & roadmap", "SLA on demand"] },
  { tier: "AI Bot Service", price: "$3k", info: "Chatbot + CRM integration", points: ["Your data (RAG)", "Web/Widget/WhatsApp", "Handover to human agent", "Dashboards & KPIs"] },
];

const stack = [
  "TypeScript", "React/Next.js", "Node", "Python/Django", "Go", "Ruby/Rails",
  "Postgres", "MySQL", "MongoDB", "Redis", "Elasticsearch",
  "Kafka/SQS", "gRPC", "WebSockets", "Docker/K8s", "Terraform",
  "AWS/GCP/Azure", "CloudFront/CF", "Vercel/Netlify",
  "Tailwind", "Framer Motion", "Radix UI", "shadcn/ui",
  "Cypress/Playwright", "Vitest/Jest", "Storybook",
  "OpenAPI/Swagger", "LangChain", "Vector DBs (PGVector/Weaviate)", "RAG",
];

const testimonials = [
  { name: "CEO, FinTech", quote: "The team mapped our domains, wired the CRM to our services and delivered the reporting we always lacked." },
  { name: "CMO, D2C", quote: "Creative + performance + analytics — the puzzle finally clicked and growth became predictable." },
  { name: "COO, Logistics", quote: "We cut idle time and empty rides; dashboards are clear even for drivers — magic." },
];

/* ===================== UI helpers ===================== */
const fade = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: "easeOut" }, viewport: { once: true, amount: 0.3 } };

const Glow = ({ className = "" }) => (
  <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
    <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-fuchsia-600 via-indigo-600 to-cyan-500" />
    <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-violet-600 via-blue-600 to-teal-400" />
  </div>
);

const Section = ({ id, children, className = "" }) => (
  <section id={id} className={`relative py-24 sm:py-28 ${className}`}>
    <div className="mx-auto w-full max-w-7xl px-6">{children}</div>
  </section>
);

const Badge = ({ children }) => (
  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur-sm">{children}</span>
);

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl shadow-black/30 ${className}`}>{children}</div>
);

const H2 = ({ children }) => (
  <motion.h2 {...fade} className="mb-10 text-3xl font-semibold">
    <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">{children}</span>
  </motion.h2>
);

const Btn = ({ as: As = 'a', className = '', children, ...props }) => (
  <motion.a whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }} {...props} className={`rounded-xl px-5 py-3 font-medium transition-colors ${className}`}>
    {children}
  </motion.a>
);

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff"/>
          <stop offset="1" stopColor="#9ca3af"/>
        </linearGradient>
      </defs>
      <path d="M4 12c0-4.418 3.582-8 8-8 1.657 0 3.19.504 4.46 1.36L12 12l6.4 6.4A7.963 7.963 0 0 1 12 20c-4.418 0-8-3.582-8-8Z" fill="url(#g)"/>
      <path d="M19 5l-7 7 3.5 3.5L22 9.5" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    <span className="font-semibold tracking-wide">studio</span>
  </div>
);

/* ===== Pricing card variants ===== */
const TierCard = ({ children, featured = false }) => (
  <div className={`group relative h-full rounded-2xl p-[1px] bg-gradient-to-b from-white/15 via-white/8 to-transparent ${featured ? 'ring-2 ring-white/30' : ''}`}>
    <div className="absolute inset-0 -z-10 rounded-2xl opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100 bg-[radial-gradient(600px_200px_at_50%_-10%,rgba(147,197,253,0.35),transparent)]" />
    <Card className="relative h-full bg-zinc-950/70">
      <div className="absolute -top-24 left-1/2 h-48 w-[110%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,255,255,.07),transparent)]" />
      <div className="relative z-10">{children}</div>
    </Card>
  </div>
);

const TierCardClean = ({ children, featured = false }) => (
  <div
    className={[
      "relative h-full rounded-2xl p-[1px]",
      "bg-[linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.06))]",
      featured ? "ring-1 ring-white/25" : "ring-1 ring-white/10",
      "transition-transform duration-300 will-change-transform"
    ].join(" ")}
  >
    <Card
      className={[
        "relative h-full rounded-[14px] bg-zinc-950/70",
        "shadow-[0_18px_60px_rgba(0,0,0,.45)]",
        "hover:shadow-[0_24px_80px_rgba(0,0,0,.55)]",
        "transition-all duration-300"
      ].join(" ")}
    >
      {children}
    </Card>
  </div>
);

const StatPill = ({ icon: Icon, children }) => (
  <li className="flex items-center gap-2 rounded-xl bg-white/6 p-3 text-sm text-zinc-200">
    <Icon className="h-4 w-4 opacity-90" /> {children}
  </li>
);

/* ===== Favicon fallback preview ===== */
const FaviconPreview = ({ url }) => {
  const host = new URL(url).host;
  const chain = [
    `https://www.google.com/s2/favicons?domain=${host}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${host}.ico`,
    url.replace(/\/$/, "") + "/favicon.ico",
  ];

  const onErr = (e) => {
    const i = +(e.currentTarget.dataset.i || 0);
    if (i < chain.length - 1) {
      e.currentTarget.dataset.i = String(i + 1);
      e.currentTarget.src = chain[i + 1];
    } else {
      e.currentTarget.style.display = "none";
      const placeholder = e.currentTarget.nextSibling;
      if (placeholder && placeholder.style) placeholder.style.display = "flex";
    }
  };

  const initials = host.replace(/^www\./, "").split(".")[0].slice(0, 2).toUpperCase();

  return (
    <div className="mb-4 h-44 w-full rounded-xl border border-white/10 bg-zinc-950/60 flex flex-col items-center justify-center text-zinc-400">
      <img src={chain[0]} data-i="0" onError={onErr} alt="" className="h-12 w-12 rounded" />
      <div style={{ display: "none" }} className="h-12 w-12 items-center justify-center rounded bg-white/5 text-sm">
        {initials}
      </div>
      <div className="mt-2 text-xs opacity-70">{host}</div>
    </div>
  );
};

/* ===== Lightweight image carousel ===== */
const ImageCarousel = ({ images, alt = "Preview" }) => {
  const [i, setI] = useState(0);
  const len = images.length;
  const go = (d) => setI((v) => (v + d + len) % len);

  return (
    <div className="mb-4 relative select-none">
      <div className="h-44 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950/60">
        <motion.img
          key={i}
          src={images[i]}
          alt={alt}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          draggable={false}
          className="h-44 w-full object-cover"
        />
      </div>

      <button
        aria-label="Previous"
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-black/55 hover:bg-black/75 border border-white/10"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="Next"
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-black/55 hover:bg-black/75 border border-white/10"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-1.5 w-3 rounded-full ${idx === i ? "bg-white/90" : "bg-white/30 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
};

/* ===================== Page ===================== */
export default function PortfolioSite() {
  const [showAll, setShowAll] = useState(false);            // Services
  const [showAllProjects, setShowAllProjects] = useState(false); // Projects

  return (
    <div className="min-h-screen scroll-smooth bg-black text-zinc-100 antialiased">
      {/* Nav */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/55">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-2 font-semibold tracking-wide"><Logo /></a>
          <nav className="hidden gap-6 md:flex">
            {nav.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="text-sm text-zinc-300 hover:text-white transition-colors">{n.label}</a>
            ))}
          </nav>
          <Btn href="#contact" className="bg-white text-black hover:bg-zinc-200 px-4 py-2 text-sm">Start a project</Btn>
        </div>
      </div>

      {/* Hero */}
      <header id="top" className="relative overflow-hidden">
        <Glow />
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 pb-20 pt-24 text-center">
          <motion.div {...fade} className="flex items-center gap-3">
            <Badge>CRM · Software · SMM · Marketing</Badge>
            <Badge><ShieldCheck className="mr-1 inline h-4 w-4" /> Senior-level craft</Badge>
          </motion.div>
          <motion.h1 {...fade} className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-4xl font-semibold leading-tight text-transparent sm:text-6xl">Products that look premium<br />and perform even better</motion.h1>
          <motion.p {...fade} className="max-w-2xl text-lg text-zinc-300">We design, build and grow digital products — from custom CRMs to performance marketing with end-to-end analytics.</motion.p>
          <motion.div {...fade} className="flex flex-wrap items-center justify-center gap-3">
            <Btn href="#projects" className="bg-white text-black hover:bg-zinc-200">See our work</Btn>
            <Btn href="#pricing" className="border border-white/15 text-white hover:bg-white/5">Pricing</Btn>
          </motion.div>
        </div>
      </header>

      {/* Services */}
      <Section id="services">
        <Glow />
        <H2>Services</H2>
        <div className="relative">
          <div className={`grid grid-cols-1 gap-6 md:grid-cols-3 transition-all duration-300 ${showAll ? '' : 'max-h-[520px] overflow-hidden pb-10'}`}>
            {services.slice(0, showAll ? services.length : 3).map((s, idx) => (
              <motion.div key={s.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.04 }}>
                <Card className="h-full">
                  <div className="mb-4 flex items-center gap-3"><s.icon className="h-6 w-6 text-white" /><h3 className="text-lg font-semibold">{s.title}</h3></div>
                  <p className="mb-4 text-sm text-zinc-300">{s.desc}</p>
                  <div className="flex flex-wrap gap-2">{s.tags.map((t) => (<Badge key={t}>{t}</Badge>))}</div>
                </Card>
              </motion.div>
            ))}
          </div>
          {!showAll && (<div className="pointer-events-none absolute inset-x-0 bottom-10 h-24 bg-gradient-to-t from-black via-black/60 to-transparent" />)}
        </div>
        <div className="mt-8 flex justify-center">
          <Btn as="button" onClick={() => setShowAll(v=>!v)} className="border border-white/15 text-white hover:bg-white/5">{showAll ? 'Show less' : 'View all services'}</Btn>
        </div>
      </Section>

      {/* Projects */}
      <Section id="projects">
        <Glow />
        <H2>Projects</H2>

        <div className="relative">
          <div
            className={`grid grid-cols-1 gap-6 md:grid-cols-3 transition-all duration-300 ${
              showAllProjects ? "" : "max-h-[560px] overflow-hidden pb-10"
            }`}
          >
            {(showAllProjects ? projects : projects.slice(0, 3)).map((c, idx) => (
              <motion.div key={c.title} {...fade} transition={{ ...fade.transition, delay: idx * 0.03 }} className="h-full">
                <Card className="h-full flex flex-col">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{c.title}</h3>
                    <span className="text-sm text-emerald-400/90">{c.impact}</span>
                  </div>

                  {c.images?.length ? (
                    <ImageCarousel images={c.images} alt={c.title} />
                  ) : c.url ? (
                    <FaviconPreview url={c.url} />
                  ) : (
                    <div className="mb-4 h-44 w-full rounded-xl border border-white/10 bg-zinc-950/60 flex items-center justify-center text-zinc-500">Project preview</div>
                  )}

                  <p className="text-sm text-zinc-300">{c.blurb}</p>

                  {c.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                    </div>
                  ) : null}

                  <div className="mt-auto flex flex-wrap gap-3 pt-4">
                    {c.links?.map((l) => (
                      <Btn key={l.label} href={l.href} className="border border-white/15 text-white hover:bg-white/5 px-3 py-1.5 text-xs">
                        {l.label}
                      </Btn>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {!showAllProjects && (
            <div className="pointer-events-none absolute inset-x-0 bottom-10 h-24 bg-gradient-to-t from-black via-black/60 to-transparent" />
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <Btn
            as="button"
            onClick={() => setShowAllProjects((v) => !v)}
            className="border border-white/15 text-white hover:bg-white/5"
          >
            {showAllProjects ? "Show less" : "View all projects"}
          </Btn>
        </div>
      </Section>

      {/* Process */}
      <Section id="process">
        <Glow />
        <H2>Process</H2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {["Discovery", "Design", "Build", "Grow"].map((step, i) => (
            <motion.div key={step} {...fade} transition={{ ...fade.transition, delay: i * 0.05 }}>
              <Card>
                <div className="mb-2 text-sm uppercase tracking-wide text-zinc-400">Step {i + 1}</div>
                <div className="text-lg font-semibold">{step}</div>
                <ul className="mt-3 space-y-1 text-sm text-zinc-300">
                  {i === 0 && (<><li>Stakeholder interviews</li><li>Success metrics</li><li>Roadmap & risks</li></>)}
                  {i === 1 && (<><li>User flows & prototypes</li><li>Data models</li><li>API contracts</li></>)}
                  {i === 2 && (<><li>Sprints & demos</li><li>QA & automation</li><li>Security review</li></>)}
                  {i === 3 && (<><li>Analytics & A/B tests</li><li>Performance marketing</li><li>Support & SLA</li></>)}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Pricing — luxe cards */}
      <Section id="pricing">
        <Glow />
        <H2>Pricing</H2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {pricing.map((p, i) => (
            <motion.div key={p.tier} {...fade} transition={{ ...fade.transition, delay: i * 0.04 }} className="h-full">
              <TierCardClean featured={p.featured}>
                <div className="flex h-full flex-col">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs uppercase tracking-wide text-zinc-400">{p.tier}</div>
                      {p.featured && (<span className="rounded-full bg-white/12 px-2 py-0.5 text-[10px] text-white/95">Most popular</span>)}
                    </div>
                    <div className="mb-1 text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">{p.price}</div>
                    <div className="mb-5 text-sm text-zinc-400">{p.info}</div>
                    <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <ul className="space-y-2 text-sm text-zinc-300">
                      {p.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-2">
                          <ShieldCheck className="mt-0.5 h-4 w-4 opacity-90" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto pt-6">
                    <Btn href="#contact" className="w-full bg-white text-black hover:bg-zinc-200">Choose</Btn>
                  </div>
                </div>
              </TierCardClean>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Tech */}
      <Section id="stack">
        <Glow />
        <H2>Tech Stack</H2>
        <div className="flex flex-wrap gap-3">
          {stack.map((t, i) => (
            <motion.div key={t} {...fade} transition={{ ...fade.transition, delay: i * 0.02 }}>
              <span className="rounded-full border border-white/10 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 px-3 py-1 text-xs text-white/80 shadow-inner shadow-black/40">{t}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* About */}
      <Section id="about">
        <Glow />
        <H2>About</H2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <motion.div {...fade} className="col-span-2">
            <Card className="bg-zinc-900/70">
              <p className="text-lg text-zinc-300">
                We’re a senior-only product studio focused on outcomes. We ship fast, measure impact, and own the roadmap — from discovery to growth. Our CRMs and growth systems don’t just look premium — they pay for themselves in months.
              </p>
              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatPill icon={LineChart}>↗ 38% avg. conversion uplift</StatPill>
                <StatPill icon={Gauge}>↓ 27% shorter sales cycles</StatPill>
                <StatPill icon={Rocket}>120+ releases across 6 industries</StatPill>
                <StatPill icon={ShieldCheck}>99.95% uptime · SRE practices</StatPill>
              </ul>
            </Card>
          </motion.div>
          <motion.div {...fade}>
            <Card className="h-full flex flex-col gap-3 bg-zinc-900/70">
              <Badge>SOC2-ready</Badge>
              <Badge>GDPR / ISO27001</Badge>
              <Badge>Design systems</Badge>
              <Badge>24/7 on-call</Badge>
              <Badge>HIPAA-ready (PHI)</Badge>
              <Badge>NDA & security reviews</Badge>
            </Card>
          </motion.div>
        </div>
      </Section>

      {/* Testimonials */}
      <Section id="testimonials">
        <Glow />
        <H2>Testimonials</H2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 auto-rows-fr">
          {testimonials.map((r, i) => (
            <motion.div key={r.name} {...fade} transition={{ ...fade.transition, delay: i * 0.05 }} className="h-full">
              <Card className="h-full flex flex-col">
                <p className="mb-4 text-zinc-200">“{r.quote}”</p>
                <div className="mt-auto text-sm text-zinc-400">— {r.name}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <Section id="contact">
        <Glow />
        <H2>Contact</H2>
        <motion.p {...fade} className="mb-8 max-w-2xl text-zinc-300">Tell us about your challenge — we'll return with architecture, timeline and budget within 24 hours.</motion.p>
        <Card>
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <input className="rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 outline-none placeholder:text-zinc-500" placeholder="Name" />
            <input className="rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 outline-none placeholder:text-zinc-500" placeholder="Email" />
            <input className="rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 outline-none placeholder:text-zinc-500 md:col-span-2" placeholder="Company / website" />
            <textarea rows={5} className="rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-3 outline-none placeholder:text-zinc-500 md:col-span-2" placeholder="Describe the project: goals, deadlines, key features" />
            <div className="flex flex-wrap items-center gap-4 md:col-span-2">
              <a href="mailto:hello@studio.dev" className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white"><Mail className="h-4 w-4"/> hello@studio.dev</a>
              <a href="tel:+10000000000" className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white"><Phone className="h-4 w-4"/> +1 (000) 000-0000</a>
              <a href="#" className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white"><Globe className="h-4 w-4"/> @studio</a>
              <Btn as="button" type="submit" className="ml-auto bg-white text-black hover:bg-zinc-200">Send brief</Btn>
            </div>
          </form>
        </Card>
      </Section>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="text-sm text-zinc-400">© {new Date().getFullYear()} studio — CRM, Software, SMM, Marketing</div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
            <span className="opacity-50">•</span>
            <a href="#" className="hover:text-zinc-300">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
