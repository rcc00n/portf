import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadHomepageProjects, selectHomepageProjects } from "../home/homeData.js";
import { ClosingAction, Evidence, PageLead, SignalLink } from "./SiteShell.jsx";

const safeLink = (href) => { try { return ["https:","http:"].includes(new URL(href).protocol) ? href : null; } catch { return null; } };
export function WorkPage() {
  const [projects,setProjects] = useState([]);
  useEffect(()=>{const controller=new AbortController();loadHomepageProjects({apiBase:(import.meta.env.VITE_API_BASE||"").replace(/\/$/,""),signal:controller.signal}).then(setProjects).catch(()=>{});return()=>controller.abort();},[]);
  const selected = selectHomepageProjects(projects);
  const other = projects.filter(project=>!/(renter|bad guy|motorcycle|worlddoc|doctor finder)/i.test(project.title));
  return <>
    <PageLead index="02 / Selected work" title={<>Products in front.<br /><em>Systems behind.</em></>} intro="Marketplace, service, and directory interfaces. Explore the product and the operational thinking behind it." />
    <section className="site-work-feature">
      <Link to="/work/renter" className="site-work-image" aria-label="Explore the Renter case"><Evidence eager src="/prototype/media/renter-market.webp" alt="Renter marketplace showing rental discovery" label="01 / Renter" note="Explore the case ↗" /></Link>
      <div className="site-project-caption"><span className="site-label">Rental marketplace</span><h2>One market.<br />Two control surfaces.</h2><div><p>Customer discovery and booking, with an operational side for the people running the market.</p><SignalLink to="/work/renter">Explore Renter</SignalLink></div></div>
    </section>
    <section className="site-project-pair" aria-label="More selected work">{selected.map((project,i)=><article key={project.key}>
      <a href={project.href} target="_blank" rel="noreferrer" aria-label={`${project.title} — opens in a new tab`}><Evidence height={project.key==="worlddoc"?858:810} src={project.image} alt={project.imageAlt} label={`0${i+2} / ${project.title}`} note="Visit project ↗" /></a><span className="site-label">{project.type}</span><h2>{project.title}</h2><p>{project.blurb}</p>
    </article>)}</section>
    {other.length>0 && <section className="site-section"><span className="site-label">From the project archive</span>{other.map((project,i)=><details className="site-disclosure" key={`${project.title}-${i}`}><summary>{project.title}<span aria-hidden="true">+</span></summary><div><p>{project.blurb}</p>{project.images?.map((src,j)=><img className="site-archive-image" key={src} src={src} alt={`${project.title} interface ${j+1}`} loading="lazy" />)}{[...(project.links||[]),{label:"Visit project",href:project.url}].filter(link=>safeLink(link.href)).map((link,j)=><a className="site-text-link" key={j} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div></details>)}</section>}
    <ClosingAction title={<>A product to build.<br />A system to resolve.</>} />
  </>;
}
export function RenterPage() {
  return <>
    <PageLead index="Work / 01 — Renter" className="site-case-lead" title="Renter." intro="A two-sided rental marketplace. The customer-facing product and the operational interface belong to the same system."><span className="site-label">Marketplace / Product + control</span></PageLead>
    <Evidence eager className="site-case-opening" src="/prototype/media/renter-market.webp" alt="Renter customer marketplace with search, categories and listings" label="01 / The customer-facing surface" note="Discovery · availability · booking" />
    <section className="site-editorial site-section" data-resolve><span className="site-label">Context / One shared market</span><h2>Make the next step clear.<br />Keep the whole market legible.</h2><div><p>A renter needs to find an item and understand its availability. A provider needs to manage a listing and a booking. Operators need a way to handle exceptions across both sides.</p><p>The product has to make those different responsibilities work together.</p></div></section>
    <section className="site-case-structure site-section" data-resolve><span className="site-label">System / Connected responsibilities</span><div className="site-case-layers">{[["01","Customer","Find → request → rent"],["02","Provider","List → manage → fulfill"],["03","Operations","Review → resolve → record"]].map(([n,title,body])=><div key={n}><span>{n}</span><h3>{title}</h3><p>{body}</p><i aria-hidden="true" /></div>)}</div><p className="site-caption">A responsibility map for the product and its control surfaces.</p></section>
    <section className="site-case-control"><header><span className="site-label">Control / The other interface</span><h2>Exceptions need<br />an interface, too.</h2><p>Verification, disputes, ledger activity, and audit information become an operational workspace.</p></header><Evidence src="/prototype/media/renter-control.webp" alt="Renter operations interface showing management controls" label="02 / Operator control" note="Disputes · ledger · audit" /></section>
    <section className="site-section"><span className="site-label">Decisions / Product and operations</span><div className="site-decision-rows">{[["Keep discovery direct","The customer surface gives the listing, availability, and booking path priority."],["Separate responsibilities","Customer, provider, and operator surfaces need different information and decision rights."],["Keep the exception visible","Operational detail belongs beside the action it helps someone take."]].map(([title,body],i)=><article key={title} data-resolve><span>0{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <ClosingAction title={<>Build both sides<br />of your product.</>} detail="Share the customer journey and the operational problem behind it." />
    <SignalLink to="/work" className="site-return">Return to selected work</SignalLink>
  </>;
}
