import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ControlPlane, { RaccnGlyph } from "./ControlPlane.jsx";
import HomeStartForm from "./HomeStartForm.jsx";
import SystemsInstrument from "./SystemsInstrument.jsx";
import useHomeMotion from "./useHomeMotion.js";
import { approachSteps, selectHomepageProjects, systemModes } from "./homeData.js";
import { trackCtaClick, trackPageView } from "../utils/analytics.js";
import useProjectCatalog from "../projects/useProjectCatalog.js";
import CatalogStatus from "../projects/CatalogStatus.jsx";
import { casePath, imageAlt, presentProject, selectProjectEvidence } from "../projects/catalog.js";
import "./home.css";
import "./home-refinement.css";
import "./home-journey.css";

const DeferredImage = ({ src, alt, width, height }) => {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const image = ref.current;
    if (!image) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setActive(true);
      observer.disconnect();
    }, { rootMargin: "100px" });
    observer.observe(image);
    return () => observer.disconnect();
  }, []);

  return <img ref={ref} src={active ? src : undefined} alt={alt} width={width} height={height} decoding="async" />;
};

const HomeHeader = () => (
  <header className="hp-header">
    <a className="hp-brand" href="#top" aria-label="RACCN Code home">
      <RaccnGlyph />
      <span>RACCN <b>CODE</b></span>
    </a>
    <nav className="hp-nav" aria-label="Homepage">
      <a href="#work">Work</a>
      <a href="#systems">Systems</a>
      <a href="#approach">Approach</a>
      <a href="#start">Start</a>
    </nav>
    <div className="hp-header-state" aria-label="Active page state">
      <span>Control plane</span>
      <b className="hp-header-state__value">
        <i data-state="hero">01 / Active</i>
        <i data-state="work">02 / Evidence</i>
        <i data-state="systems">03 / Routing</i>
        <i data-state="approach">04 / Resolve</i>
        <i data-state="start">05 / Start</i>
      </b>
    </div>
  </header>
);

const SecondaryProject = ({ project, index }) => {
  const content = (
    <>
      {project.image && <figure data-home-evidence>
        <DeferredImage src={project.image} alt={project.imageAlt} width="1800" height={project.key === "worlddoc" ? "858" : "810"} />
        <figcaption><span>0{index + 2}</span><span>Interface evidence</span></figcaption>
      </figure>}
      <div className="hp-secondary-project__copy">
        <span className="hp-system-label">{project.type}</span>
        <h3>{project.title}</h3>
        <p>{project.blurb}</p>
        {project.href ? <span className="hp-secondary-project__open">Open project ↗</span> : null}
      </div>
    </>
  );

  return project.href ? (
    <a data-project-slug={project.slug} className="hp-secondary-project" href={project.href} target="_blank" rel="noreferrer" aria-label={`${project.title} — open project in a new tab`}>{content}</a>
  ) : (
    <article data-project-slug={project.slug} className="hp-secondary-project">{content}</article>
  );
};

export default function HomePage() {
  const rootRef = useRef(null);
  const catalog = useProjectCatalog();
  const lead = selectProjectEvidence(catalog.projects).lead;
  useHomeMotion(rootRef);
  const apiBase = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

  useEffect(() => {
    trackPageView("/");
  }, []);

  useEffect(() => {
    const syncHashTarget = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
      });
    };
    syncHashTarget();
    window.addEventListener("hashchange", syncHashTarget);
    return () => window.removeEventListener("hashchange", syncHashTarget);
  }, []);

  const secondaryProjects = selectHomepageProjects(catalog.projects);

  const skipToWork = (event) => {
    event.preventDefault();
    const work = rootRef.current?.querySelector("#work");
    if (!work) return;
    work.scrollIntoView({ behavior: "auto", block: "start" });
    work.focus({ preventScroll: true });
  };

  return (
    <main ref={rootRef} className="raccn-home" data-route="input" data-current-act="hero">
      <a className="hp-skip" href="#work" onClick={skipToWork}>Skip to work</a>
      <HomeHeader />

      <section id="top" className="hp-hero" data-home-act="hero">
        <div className="hp-hero-grid" aria-hidden="true" />
        <div className="hp-wordmark" aria-label="RACCN Code">
          <h1><span>RACCN</span><span>CODE</span></h1>
        </div>
        <div className="hp-hero-plane"><ControlPlane /></div>

        <div className="hp-hero-intro">
          <span className="hp-system-label">Digital products & systems</span>
          <p>We design and build web products, from marketplaces and commerce to SaaS and AI systems.</p>
        </div>

        <a className="hp-hero-enter" href="#start" onClick={() => trackCtaClick("Start a project", "#start", { context: "home_hero" })}>
          <span>Start a project</span><b aria-hidden="true">↗</b>
        </a>
        <div className="hp-hero-handoff" aria-hidden="true"><span /></div>
      </section>

      <section id="work" className="hp-work" data-home-act="work" tabIndex="-1">
        <header className="hp-act-head">
          <div className="hp-act-route hp-act-route--work" aria-hidden="true"><span /></div>
          <span className="hp-system-label">02 / Work</span>
          <p>Evidence over inventory.</p>
        </header>

        <CatalogStatus catalog={catalog} />
        {catalog.status==="ready"&&!lead&&!secondaryProjects.length&&<p>Explore published projects in the project index.</p>}
        {lead && <article className="hp-flagship" data-project-slug={lead.slug}>
          <div className="hp-flagship__copy">
            <span className="hp-system-label">{lead.impact}{lead.status ? ` / ${lead.status}` : ""}</span>
            <h2>{(lead.headline || lead.title).split("\n").map((line,i)=><span key={i}>{line}</span>)}</h2>
            <p>{lead.blurb}</p>
            {casePath(lead) ? <Link to={casePath(lead)}>Explore {lead.title} <span aria-hidden="true">↗</span></Link> : presentProject(lead).href ? <a href={presentProject(lead).href} target="_blank" rel="noreferrer">Explore {lead.title} ↗</a> : null}
          </div>
          <div className="hp-flagship__evidence">
            {lead.media.slice(0,2).map((image,i)=><figure key={image.id} className={`hp-evidence hp-evidence--${i===0?"market":"control"}`} data-home-evidence>
              <DeferredImage src={image.url} alt={imageAlt(lead,image,i)} width={i===0?"2555":"2566"} height={i===0?"1229":"1238"} />
              <figcaption><span>0{i+1} / {lead.title}</span><span>{image.alt}</span></figcaption>
            </figure>)}
          </div>
          {lead.slug === "renter" && <div className="hp-flagship__architecture" aria-label={`${lead.title} system layers`}>
            {[
              ["01", "Customer"], ["02", "Provider"], ["03", "Admin"], ["04", "API"], ["05", "Ledger"],
            ].map(([index, label]) => <span key={label}><i>{index}</i>{label}</span>)}
          </div>}
        </article>}

        <div className="hp-secondary-work">
          {secondaryProjects.map((project, index) => <SecondaryProject key={project.key} project={project} index={index} />)}
        </div>
        <div className="hp-decision-links"><Link className="hp-work-index-link" to="/work">Project index <span aria-hidden="true">↗</span></Link><a className="hp-project-cta" href="#start">Start a project <span aria-hidden="true">↗</span></a></div>
      </section>

      <section id="systems" className="hp-systems" data-home-act="systems">
        <header className="hp-systems-head">
          <span className="hp-system-label">03 / Systems</span>
          <h2>Beyond the<br />interface.</h2>
          <p>We design the surface people use—and <strong>the controls, architecture, and operations behind it.</strong></p>
        </header>
        <SystemsInstrument modes={systemModes} />

      </section>

      <section id="approach" className="hp-approach" data-home-act="approach">
        <header className="hp-approach-head">
          <span className="hp-system-label">04 / Approach</span>
          <h2>A system is a series<br />of decisions.</h2>
        </header>
        <div className="hp-approach-list">
          {approachSteps.map((step) => (
            <article key={step.index} data-decision-step>
              <span className="hp-decision-marker">{step.index}</span><h3>{step.title}</h3><p>{step.body}</p>
            </article>
          ))}
        </div>
        <Link className="hp-approach-link" to="/systems/decisions">Read the public decision records <span aria-hidden="true">↗</span></Link>
      </section>

      <section id="start" className="hp-start" data-home-act="start">
        <a
          className="hp-start-head hp-start-card"
          href="#project-inquiry"
          aria-label="Start a project — open the inquiry form"
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            rootRef.current?.querySelector("#project-inquiry")?.focus({ preventScroll: true });
            trackCtaClick("Start a project", "#project-inquiry", { context: "home_start_card" });
          }}
        >
          <span className="hp-system-label">05 / Start</span>
          <h2>Start a<br />project.</h2>
          <div className="hp-start-card__invitation">
            <span className="hp-start-card__direction" aria-hidden="true">↗</span>
            <p>Tell us what you’re building, what needs to work, and where you need help.</p>
            <span className="hp-start-card__cue">Begin your inquiry</span>
          </div>
        </a>
        <div id="project-inquiry" className="hp-inquiry" tabIndex="-1" role="region" aria-label="Project inquiry">
          <HomeStartForm apiBase={apiBase} />
        </div>
        <Link className="hp-start-alternative" to="/start/define">
          <span className="hp-system-label">Not ready to write a brief?</span>
          <span className="hp-start-alternative__action">Use the system estimator <span aria-hidden="true">↗</span></span>
        </Link>
        <footer className="hp-footer">
          <a className="hp-brand" href="#top"><RaccnGlyph /><span>RACCN <b>CODE</b></span></a>
          <span>© {new Date().getFullYear()} RACCN Code</span>
          <nav aria-label="Legal"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></nav>
          <a href="mailto:vadrud2016@gmail.com">vadrud2016@gmail.com</a>
        </footer>
      </section>
    </main>
  );
}
