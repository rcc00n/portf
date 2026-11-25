import { useEffect, useMemo, useRef, useState } from "react";
import { ChoiceGroup } from "./SiteShell.jsx";
import { PRODUCT_OPTIONS, SCALE_OPTIONS, buildPreset } from "../pages/engineering/architectureData.js";
import { buildArchitectureScenario } from "./architectureScenarios.js";
import "./architecture-explorer.css";

function routePath(from, to, mobile = false) {
  const width = mobile ? 400 : 1000, height = mobile ? 680 : 600;
  const x = mobile ? "mobileX" : "x", y = mobile ? "mobileY" : "y";
  const ax = from[x] * width, ay = from[y] * height;
  const bx = to[x] * width, by = to[y] * height;
  // Same-column routes use the central channel, keeping intermediate nodes clear.
  const channel = width * (mobile ? .25 : .12);
  const mid = ax === bx ? ax + (ax < width / 2 ? channel : -channel) : (ax + bx) / 2;
  return `M${ax} ${ay}H${mid}V${by}H${bx}`;
}

function Routes({ scenario, active, flow, pulse, mobile = false }) {
  const nodes = Object.fromEntries(scenario.nodes.map(node => [node.id, node]));
  const tracing = ["running", "paused", "complete"].includes(flow.phase);
  const pairs = scenario.steps.slice(1, flow.index + 1).map((step, i) => [scenario.steps[i].node, step.node]);
  const currentPair = pairs.at(-1);
  return <svg className={`arch-routes arch-routes--${mobile ? "mobile" : "desktop"}`} viewBox={mobile ? "0 0 400 680" : "0 0 1000 600"} preserveAspectRatio="none" aria-hidden="true">
    {scenario.edges.map(edge => {
      const related = edge.from === active || edge.to === active;
      const matches = pair => pair && pair.includes(edge.from) && pair.includes(edge.to);
      const traversed = tracing && pairs.some(matches);
      const receiving = tracing ? flow.phase === "running" && matches(currentPair) : related;
      const reverse = tracing && matches(currentPair) && currentPair[0] === edge.to;
      const d = routePath(nodes[edge.from], nodes[edge.to], mobile);
      return <g key={edge.id} className={`${related ? "is-related" : ""} ${traversed ? "is-traversed" : ""}`}>
        <path className={`arch-route ${edge.async ? "is-async" : ""}`} data-edge={edge.id} d={d} style={{ d: `path("${d}")` }} />
        {receiving && <path key={`${pulse}-${flow.pass}-${flow.index}`} className="arch-signal" pathLength="1" d={reverse ? routePath(nodes[edge.to], nodes[edge.from], mobile) : d} />}
      </g>;
    })}
  </svg>;
}

export default function ArchitectureExplorer() {
  const [product, setProduct] = useState("CRM");
  const [scale, setScale] = useState("MVP");
  const [active, setActive] = useState("backend");
  const [pulse, setPulse] = useState(0);
  const [flow, setFlow] = useState({ phase: "idle", index: 0, pass: 0 });
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const root = useRef(null);
  const canvas = useRef(null);
  const scenario = useMemo(() => buildArchitectureScenario(product, scale), [product, scale]);
  const preset = useMemo(() => buildPreset(product, scale), [product, scale]);
  const selected = scenario.nodes.find(node => node.id === active) || scenario.nodes[0];
  const block = selected.details || preset.blocks[selected.layer];
  const tracing = ["running", "paused", "complete"].includes(flow.phase);
  const visited = tracing ? scenario.steps.slice(0, flow.index + 1).map(step => step.node) : [];
  const currentStep = scenario.steps[flow.index];

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(query.matches);
      if (query.matches) setFlow(previous => previous.phase === "running" ? { ...previous, phase: "paused" } : previous);
    };
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    if (flow.phase !== "running") return;
    const timer = window.setTimeout(() => {
      if (flow.index === scenario.steps.length - 1) {
        setFlow(previous => ({ ...previous, phase: "complete" }));
      } else {
        setActive(scenario.steps[flow.index + 1].node);
        setFlow(previous => ({ ...previous, index: previous.index + 1 }));
      }
    }, 760);
    return () => window.clearTimeout(timer);
  }, [flow.phase, flow.index, flow.pass, scenario]);

  useEffect(() => {
    const pause = () => setFlow(previous => previous.phase === "running" ? { ...previous, phase: "paused" } : previous);
    const visibility = () => { if (document.hidden) pause(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) pause(); }, { threshold: .05 });
    observer.observe(canvas.current);
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  function changeScenario(kind, value) {
    if (kind === "product") setProduct(value); else setScale(value);
    setActive("backend");
    setPulse(previous => previous + 1);
    setFlow(previous => ({ phase: "idle", index: 0, pass: previous.pass + 1 }));
  }

  function inspect(id, index = null) {
    setActive(id);
    setPulse(previous => previous + 1);
    setFlow(previous => ({ ...previous, phase: index === null ? "idle" : "inspect", index: index ?? 0 }));
  }

  function followConnection(id) {
    inspect(id);
    // The inspector changes its contents; keep keyboard focus on the destination.
    root.current?.querySelector(`[data-node="${id}"]`)?.focus();
  }

  function run() {
    if (flow.phase === "running") {
      setFlow(previous => ({ ...previous, phase: "paused" }));
      return;
    }
    const index = reduced ? scenario.steps.length - 1 : flow.phase === "paused" ? flow.index : 0;
    setActive(scenario.steps[index].node);
    setFlow(previous => ({ phase: reduced ? "complete" : "running", index, pass: previous.pass + 1 }));
    setPulse(previous => previous + 1);
  }

  const status = flow.phase === "complete" ? `${scenario.title} complete. Select any step to inspect its responsibility.`
    : flow.phase === "paused" ? `Paused at ${currentStep.title}. Resume or inspect any layer.`
    : flow.phase === "running" || flow.phase === "inspect" ? currentStep.detail
    : scenario.summary;
  const runLabel = flow.phase === "running" ? "Pause flow" : flow.phase === "paused" ? "Resume flow" : flow.phase === "complete" ? "Replay flow" : scenario.actionLabel;

  return <div className="architecture-explorer" ref={root} data-product={product} data-scale={scale} data-flow={flow.phase} style={{ "--arch-signal": scenario.accent }}>
    <section className="site-section site-architecture-controls">
      <ChoiceGroup legend="01 / Product" name="architecture-product" options={PRODUCT_OPTIONS} value={product} onChange={value => changeScenario("product", value)} />
      <ChoiceGroup legend="02 / Operating scale" name="architecture-scale" options={SCALE_OPTIONS} value={scale} onChange={value => changeScenario("scale", value)} />
    </section>
    <section className="site-section arch-workspace" aria-label="Interactive architecture">
      <div className="arch-instrument">
        <header className="arch-heading"><div><span className="site-label">{product} / {scale}</span><h2>{scenario.title}</h2></div><span className="arch-key"><i aria-hidden="true" />Select a layer</span></header>
        <div className="arch-flow-controls"><span className="site-label">Illustrative workflow</span><button className="arch-run" type="button" onClick={run}><span>{runLabel}</span><b aria-hidden="true">{flow.phase === "running" ? "Ⅱ" : "↗"}</b></button></div>
        <div className="arch-canvas" ref={canvas} role="group" aria-label={`${product} ${scale} system layers`}>
          <div className="arch-grid" aria-hidden="true" />
          <Routes scenario={scenario} active={active} flow={flow} pulse={pulse} />
          <Routes scenario={scenario} active={active} flow={flow} pulse={pulse} mobile />
          {scenario.nodes.map((node, index) => {
            const related = scenario.edges.some(edge => (edge.from === active && edge.to === node.id) || (edge.to === active && edge.from === node.id));
            return <button key={node.id} type="button" className={`arch-node ${related ? "is-related" : ""} ${visited.includes(node.id) ? "is-visited" : ""}`} data-node={node.id} aria-pressed={active === node.id} aria-controls="architecture-inspector" aria-label={`${node.title}: ${node.role}`} onClick={() => inspect(node.id)} style={{ "--node-x": `${node.x * 100}%`, "--node-y": `${node.y * 100}%`, "--mobile-x": `${node.mobileX * 100}%`, "--mobile-y": `${node.mobileY * 100}%` }}>
              <span className="arch-node-index">{String(index + 1).padStart(2, "0")}<i aria-hidden="true" /></span>
              <strong>{node.title}</strong><small>{node.role}</small>
              {active === node.id && <span key={`${pulse}-${flow.index}-${scenario.id}`} className="arch-node-response" aria-hidden="true" />}
            </button>;
          })}
          <span className="arch-canvas-caption" aria-hidden="true">{scale === "MVP" ? "Shared application boundary" : scale === "Growth" ? "Background work / independent reads" : "Isolated work / separate read path"}</span>
        </div>
        <ol className="arch-sequence" aria-label={`${scenario.title} steps`}>
          {scenario.steps.map((step, index) => <li key={`${step.node}-${index}`} className={tracing && index <= flow.index ? "is-reached" : ""}><button type="button" className="arch-step" aria-current={(tracing || flow.phase === "inspect") && flow.index === index ? "step" : undefined} onClick={() => inspect(step.node, index)}><span>{String(index + 1).padStart(2, "0")}</span>{step.title}</button></li>)}
        </ol>
        <p className="arch-status" role="status" aria-live="polite" aria-atomic="true">{status}</p>
        <div className="arch-decision" key={scenario.id}><span className="site-label">What changes at {scale}</span><p>{scenario.decision}</p><span className="arch-tradeoff">Trade-off <span>{scenario.tradeoff}</span></span></div>
      </div>
      <aside className="arch-inspector" id="architecture-inspector" aria-label="Selected system layer" onFocusCapture={() => setFlow(previous => previous.phase === "running" ? { ...previous, phase: "paused" } : previous)}>
        <span className="site-label">Layer / {selected.layer}</span>
        <div className="arch-inspector-content" key={`${scenario.id}-${active}`}>
          <h2>{selected.title}</h2><p className="arch-inspector-role">{selected.role}</p><p>{selected.summary}</p>
          <dl><div><dt>System decision</dt><dd>{selected.decision}</dd></div><div><dt>Trade-off</dt><dd>{selected.tradeoff}</dd></div></dl>
          <div className="arch-connections"><h3>Connected layers</h3>{scenario.edges.filter(edge => edge.from === active || edge.to === active).map(edge => {
            const neighbor = scenario.nodes.find(node => node.id === (edge.from === active ? edge.to : edge.from));
            return <button type="button" key={edge.id} onClick={() => followConnection(neighbor.id)}><span>{neighbor.title}</span><span aria-hidden="true">↗</span></button>;
          })}</div>
          <details className="site-disclosure"><summary>Responsibilities & interfaces <span aria-hidden="true">+</span></summary><div><ul>{block.responsibilities.map(item => <li key={item}>{item}</li>)}</ul><h3>Interfaces</h3><ul>{block.interfaces.map(item => <li key={item}>{item}</li>)}</ul><h3>Technical options</h3><p>{block.stack.join(" · ")}</p><p className="site-caption">Options to evaluate against the real constraints.</p></div></details>
        </div>
      </aside>
    </section>
  </div>;
}
