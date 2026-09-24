import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import HomeStartForm from "../home/HomeStartForm.jsx";
import "../home/home.css";
import { ChoiceGroup, EstimatorLink, PageLead, SignalLink } from "./SiteShell.jsx";
import { budgetOptions, buildDefinitionSummary, defaults, definitionChoiceLabel, definitionSearch, definitionSource, fields, inquiryQualification, loadDefinition, saveDefinition, saveStorage, timelineOptions } from "./definition.js";

export function StartPage(){const {search}=useLocation();return <StartEditor key={search} search={search}/>;}
function StartEditor({search}){
  const [definition]=useState(()=>loadDefinition(search));
  const [include,setInclude]=useState(()=>new URLSearchParams(search).get("definition")==="1");
  const context=definition.hasInputs&&include;
  const source=context?definitionSource(definition.selected,definition.maturity):"site-start";
  return <>
    <PageLead index="05 / Start a project" title={<>Start with<br /><em>the context.</em></>} intro="Tell us what you’re building, what needs to work, and where you need help. A few sentences are enough." />
    <section className="site-start-section" aria-label="Project inquiry">
      {definition.hasInputs && <label className="site-include-definition"><input type="checkbox" checked={include} onChange={event=>setInclude(event.target.checked)}/><span>Include my saved project definition <small>{definitionChoiceLabel(definition.selected)}</small></span></label>}
      <div className="raccn-home site-inquiry"><HomeStartForm apiBase={(import.meta.env.VITE_API_BASE||"").replace(/\/$/,"")} source={source} qualification={context?inquiryQualification(definition.selected,definition.qualification):null}/></div>
      <EstimatorLink />
    </section>
    <section className="site-editorial site-section site-next-step" id="next-step"><span className="site-label">After you send / The next step</span><h2>A conversation.<br />Then a clear next step.</h2><div><p>RACCN reviews your project context and replies by email. We can clarify the constraints, discuss fit, and decide what would be useful next.</p><p>If you already have a workflow, reference, or existing product, it can help the conversation. No polished brief or booked call is required.</p><a className="site-text-link" href="mailto:vadrud2016@gmail.com">Prefer email? Write directly ↗</a></div></section>
  </>;
}
export function DefinePage(){const {search}=useLocation();return <DefinitionEditor key={search} search={search}/>;}
function DefinitionEditor({search}){
  const [initial]=useState(()=>loadDefinition(search));
  const [selected,setSelected]=useState(initial.selected);
  const inputs={...defaults,...selected};const [qualification,setQualification]=useState(initial.qualification);
  const [hasInputs,setHasInputs]=useState(initial.hasInputs);const [notice,setNotice]=useState("");
  const summary=useMemo(()=>buildDefinitionSummary(selected),[selected]);
  const {estimate}=summary;
  const update=(key,value)=>{const next={...selected,[key]:value};setSelected(next);setHasInputs(true);const saved=saveDefinition(next);setNotice(saved?"Choices saved in this browser.":"Choices are available in this visit. Browser storage is unavailable.");};
  const updateOptional=(key,value)=>{const next={...qualification,[key]:value};setQualification(next);setHasInputs(true);saveStorage("qualificationGate",next);saveDefinition(selected);};
  const scopeNote=qualification.timeline==="urgent"&&inputs.complexity!=="Lean"
    ? "This timing may need a smaller first release. We can discuss a phased scope."
    : ["under_5k","5_10k"].includes(qualification.budget)&&inputs.complexity!=="Lean"
      ? "This budget preference may call for a smaller first release. The conversation can help establish the useful scope." : "";
  const query=definitionSearch(selected);const startTo=hasInputs?`/start?definition=1${query?`&${query}`:""}`:"/start";
  const copy=async()=>{const url=`${window.location.origin}/start/define?${query}#summary`;try{await navigator.clipboard.writeText(url);setNotice("Definition link copied. It includes only your selected scope choices.");}catch{setNotice("Copy the definition link below using your browser.");}};
  return <>
    <PageLead className="site-tool-lead" index="Start / Optional project definition" title={<>Give the scope<br /><em>a first shape.</em></>} intro="Explore indicative timeline, budget, and system responsibilities. You can contact RACCN at any point; this step is optional."><SignalLink to="/start">Go straight to a conversation</SignalLink></PageLead>
    <section className="site-define-workspace site-section"><div className="site-define-inputs">{Object.entries(fields).map(([key,options],i)=><ChoiceGroup key={key} legend={`0${i+1} / ${({product:"Product",complexity:"Complexity",team:"Team assumption",integrations:"Integrations"})[key]}`} name={`definition-${key}`} options={options} value={selected[key]||""} onChange={value=>update(key,value)}/>)}<p className="site-caption">Only selected choices are saved. Unselected fields use the example assumptions listed alongside the ranges. <Link to="/privacy#browser-storage">Privacy and saved choices ↗</Link></p></div><aside className="site-estimate-result" aria-live="polite"><span className="site-label">{summary.illustrative?"Illustrative example / Indicative ranges":"Your scope / Indicative ranges"}</span><div key={`time-${estimate.timeline.range}`}><span>Timeline</span><h2>{estimate.timeline.range}</h2><p>{estimate.timeline.note}</p></div><div key={`cost-${estimate.budget.range}`}><span>Budget</span><h2>{estimate.budget.range}</h2><p>{estimate.budget.note}</p></div>{summary.assumptionNote&&<p className="site-caption">{summary.assumptionNote}</p>}<p className="site-caption">An illustration, not a quote or delivery commitment. Currency, scope, team availability, and commercial assumptions are confirmed in conversation.</p></aside></section>
    <section className="site-section site-definition-summary" id="summary"><header><span className="site-label">Definition / {hasInputs?"Current choices":"Example only"}</span><h2>{summary.productLabel}<br /><em>{summary.scopeLabel}</em></h2><p>{summary.illustrative?"Only your selected choices accompany an inquiry. The system blocks below use the example assumptions shown above.":"Use this as a starting point for the conversation."}</p></header><div className="site-summary-blocks">{estimate.blocks.map((block,i)=><details className="site-disclosure" key={block.id}><summary><span className="site-disclosure-number">0{i+1}</span>{block.title}<span aria-hidden="true">+</span></summary><div><p>{block.summary}</p><p className="site-caption">{block.tags.join(" · ")}</p></div></details>)}</div></section>
    <section className="site-section site-definition-optional"><div><span className="site-label">Optional / Planning context</span><h2>Already have<br />constraints?</h2><p>These preferences can accompany your inquiry. They do not prevent you from contacting us.</p></div><div className="site-optional-fields"><label>Budget preference<select value={qualification.budget||""} onChange={event=>updateOptional("budget",event.target.value)}><option value="">Not specified</option>{budgetOptions.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></label><label>Timing preference<select value={qualification.timeline||""} onChange={event=>updateOptional("timeline",event.target.value)}><option value="">Not specified</option>{timelineOptions.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></label>{scopeNote && <p className="site-scope-note" role="status">{scopeNote}</p>}</div></section>
    <section className="site-define-actions"><SignalLink to={startTo}>Discuss this project definition</SignalLink><button type="button" onClick={copy}>Copy definition link ↗</button><a href={`/start/define?${query}#summary`}>Open definition link</a><p role="status">{notice}</p></section>
  </>;
}
