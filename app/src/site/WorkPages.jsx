import { useEffect } from "react";
import { Link } from "react-router-dom";
import useProjectCatalog from "../projects/useProjectCatalog.js";
import CatalogStatus from "../projects/CatalogStatus.jsx";
import { casePath, imageAlt, presentProject, projectLinks, selectProjectEvidence } from "../projects/catalog.js";
import { ClosingAction, Evidence, NotFound, PageLead, SignalLink } from "./SiteShell.jsx";

function ProjectEvidence({project, index, eager=false, className=""}) {
  const image=project.media[0];
  if (!image) return null;
  const evidence=<Evidence eager={eager} height={project.slug==="worlddoc"?858:810} src={image.url} alt={imageAlt(project,image)} label={`${String(index).padStart(2,"0")} / ${project.title}`} note={casePath(project)?"Explore the case ↗":projectLinks(project).length?"Visit project ↗":"Project evidence"}/>;
  if(casePath(project))return <Link className={className} to={casePath(project)} aria-label={`Explore ${project.title}`}>{evidence}</Link>;
  const href=presentProject(project).href;
  return href?<a className={className} href={href} target="_blank" rel="noreferrer" aria-label={`${project.title} — opens in a new tab`}>{evidence}</a>:evidence;
}
function ProjectLinks({project}) {
  return <>{projectLinks(project).map((link,i)=><a className="site-text-link" key={i} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</>;
}
export function WorkPage() {
  const catalog=useProjectCatalog();
  const {lead,supporting,archive}=selectProjectEvidence(catalog.projects);
  return <>
    <PageLead index="02 / Selected work" title={<>Products in front.<br /><em>Systems behind.</em></>} intro="Marketplace, service, and directory interfaces. Explore the product and the operational thinking behind it." />
    {catalog.status!=="ready"&&<section className="site-section"><CatalogStatus catalog={catalog}/></section>}
    {lead && <section className="site-work-feature" data-project-slug={lead.slug}>
      <ProjectEvidence project={lead} eager index={1} className="site-work-image"/>
      <div className="site-project-caption"><span className="site-label">{lead.impact}{lead.status?` / ${lead.status}`:""}</span><h2>{(lead.headline||lead.title).split("\n").map((line,i)=><span key={i}>{i>0&&<br/>}{line}</span>)}</h2><div><p>{lead.blurb}</p>{casePath(lead)?<SignalLink to={casePath(lead)}>Explore {lead.title}</SignalLink>:<ProjectLinks project={lead}/>}</div></div>
    </section>}
    {supporting.length>0 && <section className="site-project-pair" aria-label="More selected work">{supporting.map((project,i)=><article key={project.slug} data-project-slug={project.slug}>
      <ProjectEvidence project={project} index={i+(lead?2:1)}/><span className="site-label">{project.impact}{project.status?` / ${project.status}`:""}</span><h2>{project.title}</h2><p>{project.blurb}</p><ProjectLinks project={project}/>
    </article>)}</section>}
    {archive.length>0 && <section className="site-section"><span className="site-label">From the project archive</span>{archive.map(project=><details className="site-disclosure" key={project.slug} data-project-slug={project.slug}><summary>{project.title}<span aria-hidden="true">+</span></summary><div><span className="site-label">{project.impact}{project.status?` / ${project.status}`:""}</span><p>{project.blurb}</p>{project.media.map((image,i)=><img className="site-archive-image" key={image.id} src={image.url} alt={imageAlt(project,image,i)} loading="lazy" />)}{casePath(project)&&<SignalLink to={casePath(project)}>Explore {project.title}</SignalLink>}<ProjectLinks project={project}/></div></details>)}</section>}
    <ClosingAction title={<>A product to build.<br />A system to resolve.</>} />
  </>;
}
export function RenterPage() {
  const catalog=useProjectCatalog();
  const project=catalog.projects.find(item=>item.slug==="renter");
  useEffect(()=>{
    if(catalog.status==="loading")return;
    const title=project?`${project.title} — RACCN Code`:catalog.status==="error"?"Project evidence unavailable — RACCN Code":"Project not found — RACCN Code";
    document.title=title;
    for(const selector of ['meta[property="og:title"]','meta[name="twitter:title"]'])document.head.querySelector(selector)?.setAttribute("content",title);
    for(const selector of ['meta[name="description"]','meta[property="og:description"]','meta[name="twitter:description"]'])document.head.querySelector(selector)?.setAttribute("content",project?.blurb||"Project evidence is not currently available.");
    document.head.querySelector('meta[name="robots"]')?.setAttribute("content",project?"index, follow":"noindex, follow");
  },[project,catalog.status]);
  if(catalog.status==="loading"||catalog.status==="error")return <section className="site-section"><CatalogStatus catalog={catalog}/></section>;
  if(!project)return <NotFound/>;
  return <>
    <PageLead index={`Work / 01 — ${project.title}`} className="site-case-lead" title={project.title} intro={project.blurb}><span className="site-label">{project.impact}{project.status?` / ${project.status}`:""}</span><ProjectLinks project={project}/></PageLead>
    {project.media[0] && <Evidence eager className="site-case-opening" src={project.media[0].url} alt={imageAlt(project,project.media[0])} label="01 / The customer-facing surface" note={project.media[0].alt} />}
    <section className="site-editorial site-section" data-resolve><span className="site-label">Context / One shared market</span><h2>Make the next step clear.<br />Keep the whole market legible.</h2><div><p>A renter needs to find an item and understand its availability. A provider needs to manage a listing and a booking. Operators need a way to handle exceptions across both sides.</p><p>The product has to make those different responsibilities work together.</p></div></section>
    <section className="site-case-structure site-section" data-resolve><span className="site-label">System / Connected responsibilities</span><div className="site-case-layers">{[["01","Customer","Find → request → rent"],["02","Provider","List → manage → fulfill"],["03","Operations","Review → resolve → record"]].map(([n,title,body])=><div key={n}><span>{n}</span><h3>{title}</h3><p>{body}</p><i aria-hidden="true" /></div>)}</div><p className="site-caption">A responsibility map for the product and its control surfaces.</p></section>
    <section className="site-case-control"><header><span className="site-label">Control / The other interface</span><h2>Exceptions need<br />an interface, too.</h2><p>Verification, disputes, ledger activity, and audit information become an operational workspace.</p></header>{project.media[1] && <Evidence src={project.media[1].url} alt={imageAlt(project,project.media[1],1)} label="02 / Operator control" note={project.media[1].alt} />}</section>
    <section className="site-section"><span className="site-label">Decisions / Product and operations</span><div className="site-decision-rows">{[["Keep discovery direct","The customer surface gives the listing, availability, and booking path priority."],["Separate responsibilities","Customer, provider, and operator surfaces need different information and decision rights."],["Keep the exception visible","Operational detail belongs beside the action it helps someone take."]].map(([title,body],i)=><article key={title} data-resolve><span>0{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    {project.media.slice(2).map((image,i)=><Evidence key={image.id} src={image.url} alt={imageAlt(project,image,i+2)} label={`${i+3} / ${project.title}`} note={image.alt}/>)}
    <ClosingAction title={<>Build both sides<br />of your product.</>} detail="Share the customer journey and the operational problem behind it." />
    <SignalLink to="/work" className="site-return">Return to selected work</SignalLink>
  </>;
}
