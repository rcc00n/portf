import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { RaccnGlyph } from "../home/ControlPlane.jsx";
import { trackPageView } from "../utils/analytics.js";
import "./site.css";

const sections = [["/work","Work"],["/systems","Systems"],["/approach","Approach"],["/start","Start"]];
export function SiteFooter() {
  return <footer className="site-footer">
    <Link className="site-brand" to="/"><RaccnGlyph /><span>RACCN <b>CODE</b></span></Link>
    <p>Digital products.<br />Systems behind them.</p>
    <nav aria-label="Footer">{sections.map(([to,label])=><Link key={to} to={to}>{label}</Link>)}</nav>
    <a className="site-footer-email" href="mailto:vadrud2016@gmail.com">vadrud2016@gmail.com ↗</a>
    <small>© {new Date().getFullYear()} RACCN Code</small>
    <div className="site-footer-legal"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div>
  </footer>;
}
export default function SiteShell() {
  const { pathname, hash } = useLocation();
  const root = useRef(null);
  const main = useRef(null);
  const previous = useRef(pathname);
  const section = sections.find(([path])=>pathname.startsWith(path));
  useEffect(() => {
    document.documentElement.classList.add("raccn-site-active");
    return () => document.documentElement.classList.remove("raccn-site-active");
  }, []);
  useEffect(() => {
    trackPageView(pathname);
    let anchorHandled = false;
    const place = () => {
      const target = hash ? document.getElementById(hash.slice(1)) : null;
      if (target && !anchorHandled) { target.scrollIntoView({ behavior: "instant", block: "start" }); anchorHandled = true; }
    };
    const frame = requestAnimationFrame(() => {
      if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
      place();
      if (previous.current !== pathname) main.current?.focus({ preventScroll: true });
      previous.current = pathname;
    });
    const observed = new WeakSet();
    const observer = new IntersectionObserver((entries) => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.dataset.resolved = "true"; observer.unobserve(entry.target); }
    }), { threshold: .12 });
    const connect = () => {
      root.current?.querySelectorAll("[data-resolve]").forEach(node => { if (!observed.has(node)) { observed.add(node); observer.observe(node); } });
      place();
    };
    connect();
    const changes = new MutationObserver(connect);
    if (root.current) changes.observe(root.current, { childList: true, subtree: true });
    return () => { cancelAnimationFrame(frame); observer.disconnect(); changes.disconnect(); };
  }, [pathname, hash]);
  return <div className="raccn-site" ref={root}>
    <a className="site-skip" href="#site-content">Skip to content</a>
    <header className="site-header">
      <Link className="site-brand" to="/" aria-label="RACCN Code home"><RaccnGlyph /><span>RACCN <b>CODE</b></span></Link>
      <nav aria-label="Main navigation">{sections.map(([to,label])=><NavLink key={to} to={to}>{label}</NavLink>)}</nav>
      <span className="site-location">{section ? `${String(sections.indexOf(section)+2).padStart(2,"0")} / ${section[1]}` : "RACCN / Information"}</span>
    </header>
    <main id="site-content" ref={main} tabIndex={-1}><Outlet /></main>
    <SiteFooter />
  </div>;
}
export function PageLead({ index, title, intro, children, className="" }) {
  return <header className={`site-lead ${className}`}><p className="site-label">{index}</p><h1>{title}</h1><div className="site-lead-context"><p>{intro}</p>{children}</div><span className="site-lead-rule" aria-hidden="true" /></header>;
}
export function SignalLink({ to, children, className="" }) {
  return <Link className={`site-signal-link ${className}`} to={to}><span>{children}</span><b aria-hidden="true">↗</b></Link>;
}
export function ClosingAction({ label="Start a project", title="What needs to work?", detail="Bring the context. We’ll discuss the next step by email.", to="/start" }) {
  return <section className="site-closing" data-resolve><span className="site-label">Next / {label}</span><h2>{title}</h2><div><p>{detail}</p><SignalLink to={to}>{label}</SignalLink></div></section>;
}
export function Evidence({ src, alt, label, note, className="", eager=false, height=866 }) {
  return <figure className={`site-evidence ${className}`} data-resolve><div><img src={src} alt={alt} width="1800" height={height} loading={eager ? "eager" : "lazy"} decoding="async" /></div><figcaption><span>{label}</span><span>{note}</span></figcaption></figure>;
}
export function ChoiceGroup({ legend, name, options, value, onChange }) {
  return <fieldset className="site-choices"><legend>{legend}</legend><div>{options.map(option=><label key={option.value}><input type="radio" name={name} value={option.value} checked={value===option.value} onChange={()=>onChange(option.value)} /><span><b>{option.label}</b>{option.description && <small>{option.description}</small>}</span></label>)}</div></fieldset>;
}
export function EstimatorLink() {
  return <Link className="site-estimator" to="/start/define"><span className="site-label">Not ready to write a brief?</span><span>Use the system estimator <b aria-hidden="true">↗</b></span></Link>;
}
export function NotFound() {
  return <><PageLead index="404 / Route not found" title={<>This route<br />ends here.</>} intro="The page may have moved, or the address may be incomplete." /><section className="site-not-found"><SignalLink to="/work">Explore the work</SignalLink><SignalLink to="/start">Start a project</SignalLink></section></>;
}
