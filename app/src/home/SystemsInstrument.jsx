import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./systems-instrument.css";

// The same three planes remain present while the operating model changes.
// Routes and controls share coordinates, including throughout each transition.
const machineStates = {
  architecture: {
    positions: [[150, 108], [360, 230], [570, 352]],
    focus: 0,
    insights: [
      ["The surface is only the beginning.", "Customer journeys connect to the rules and data that make the product work."],
      ["Control belongs in the architecture.", "Permissions and exceptions are designed alongside the customer experience."],
      ["Every action has a path.", "Domain logic, data and integrations form one connected operating model."],
    ],
    link: "Explore the architecture",
  },
  control: {
    positions: [[148, 305], [360, 110], [572, 305]],
    focus: 1,
    insights: [
      ["One product. Two perspectives.", "Customer actions and operator controls are designed together."],
      ["Give operators real control.", "Permissions, overrides and traceable decisions make exceptions manageable."],
      ["A decision leaves a record.", "Changes connect to the underlying operation, with a clear audit trail."],
    ],
    link: "See the admin-first approach",
  },
  readiness: {
    positions: [[148, 125], [360, 344], [572, 125]],
    focus: 2,
    insights: [
      ["Keep the experience dependable.", "Authentication and failure states belong in the product from the start."],
      ["Know what changed.", "Release controls and monitoring make production changes visible."],
      ["Ready means recoverable.", "Monitoring, backups and recovery paths are part of the baseline."],
    ],
    link: "Review production readiness",
  },
};

const planeLabels = ["Surface", "Control", "Operation"];
const easeOut = (value) => 1 - Math.pow(1 - value, 3);
const routePath = (positions, index) => {
  const [x1, y1] = positions[index];
  const [x2, y2] = positions[index + 1];
  const middle = (x1 + x2) / 2;
  return `M${x1} ${y1}H${middle}V${y2}H${x2}`;
};

export default function SystemsInstrument({ modes }) {
  const [selection, setSelection] = useState({ modeId: modes[0]?.id, plane: 0, revision: 0 });
  const mode = modes.find((item) => item.id === selection.modeId) || modes[0];
  const machine = machineStates[mode.id] || machineStates.architecture;
  const [title, detail] = machine.insights[selection.plane];
  const tabRefs = useRef([]);
  const graphRef = useRef(null);
  const geometryRef = useRef(machine.positions.map((position) => [...position]));
  const visibleRef = useRef(false);
  const settleGeometryRef = useRef(null);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio >= .2;
      visibleRef.current = visible;
      graph.dataset.machineVisible = String(visible);
      if (visible) graph.dataset.machineReady = "true";
      else settleGeometryRef.current?.();
    }, { threshold: [0, .2] });
    const onVisibility = () => {
      if (document.visibilityState !== "visible") settleGeometryRef.current?.();
    };
    observer.observe(graph);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return undefined;
    const source = geometryRef.current.map((position) => [...position]);
    const target = machine.positions;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let start;

    const draw = (progress) => {
      const positions = target.map((position, index) => position.map((value, axis) => (
        source[index][axis] + (value - source[index][axis]) * easeOut(progress)
      )));
      geometryRef.current = positions;
      graph.querySelectorAll("[data-machine-plane]").forEach((element, index) => {
        const [x, y] = positions[index];
        element.setAttribute("transform", `translate(${x} ${y})`);
      });
      graph.querySelectorAll("[data-machine-control]").forEach((element, index) => {
        element.style.left = `${positions[index][0] / 7.2}%`;
        element.style.top = `${positions[index][1] / 4.6}%`;
      });
      graph.querySelectorAll("[data-machine-route]").forEach((element) => {
        element.setAttribute("d", routePath(positions, Number(element.dataset.machineRoute)));
      });
    };
    const tick = (time) => {
      start ??= time;
      const progress = Math.min(1, (time - start) / 560);
      draw(progress);
      if (progress < 1) frame = window.requestAnimationFrame(tick);
      else settleGeometryRef.current = null;
    };
    const finish = () => {
      window.cancelAnimationFrame(frame);
      draw(1);
      settleGeometryRef.current = null;
    };
    const onMotionPreference = () => { if (reduced.matches) finish(); };
    settleGeometryRef.current = finish;
    if (reduced.matches || !visibleRef.current || document.visibilityState !== "visible"
      || target.every((position, index) => position.every((value, axis) => value === source[index][axis]))) finish();
    else frame = window.requestAnimationFrame(tick);
    reduced.addEventListener("change", onMotionPreference);
    return () => {
      window.cancelAnimationFrame(frame);
      reduced.removeEventListener("change", onMotionPreference);
      if (settleGeometryRef.current === finish) settleGeometryRef.current = null;
    };
  }, [machine]);

  const selectMode = (nextMode) => {
    setSelection((current) => ({
      modeId: nextMode.id,
      plane: (machineStates[nextMode.id] || machineStates.architecture).focus,
      revision: current.revision + 1,
    }));
  };

  const moveTabFocus = (event, currentIndex) => {
    const keyTargets = {
      ArrowRight: (currentIndex + 1) % modes.length,
      ArrowLeft: (currentIndex - 1 + modes.length) % modes.length,
      Home: 0,
      End: modes.length - 1,
    };
    const nextIndex = keyTargets[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectMode(modes[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="hp-systems-instrument" data-mode={mode.id}>
      <div className="hp-systems-modes" role="tablist" aria-label="Systems view">
        {modes.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => { tabRefs.current[index] = node; }}
            id={`systems-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={item.id === mode.id}
            aria-controls="systems-panel"
            tabIndex={item.id === mode.id ? 0 : -1}
            onClick={() => selectMode(item)}
            onKeyDown={(event) => moveTabFocus(event, index)}
          >
            <span aria-hidden="true">{item.index}</span>
            <b>{item.label}</b>
          </button>
        ))}
      </div>

      <div id="systems-panel" className="hp-system-composition" role="tabpanel" aria-labelledby={`systems-tab-${mode.id}`}>
        <div ref={graphRef} className="hp-system-machine" data-selected-plane={selection.plane} data-machine-ready="false">
          <svg className="hp-system-machine-svg" viewBox="0 0 720 460" preserveAspectRatio="none" aria-hidden="true">
            <g className="hp-system-machine-routes">
              {[0, 1].map((index) => (
                <path key={index} data-machine-route={index} d={routePath(machineStates.architecture.positions, index)} />
              ))}
            </g>
            <g key={`signal-${selection.revision}`} className="hp-system-machine-signal">
              {[0, 1].map((index) => (
                <path key={index} data-machine-route={index} d={routePath(geometryRef.current, index)} pathLength="1" style={{ "--signal-order": index }} />
              ))}
            </g>
            {planeLabels.map((label, index) => (
              <g
                key={label}
                data-machine-plane={index}
                className={`hp-system-machine-plane${selection.plane === index ? " is-selected" : ""}`}
                transform={`translate(${machineStates.architecture.positions[index].join(" ")})`}
                style={{ "--plane-order": index }}
              >
                <path className="hp-system-plane-depth" d="M-99 -34L69 -65L99 34L-69 65Z" transform="translate(0 9)" />
                <g key={`assembly-${selection.revision}`} className="hp-system-plane-assembly">
                  <path className="hp-system-plane-face" d="M-99 -34L69 -65L99 34L-69 65Z" />
                  <path className="hp-system-plane-sweep" d="M-99 -34L69 -65L99 34L-69 65Z" />
                  <path className="hp-system-plane-rule" d="M-80 -12L63 -39" />
                  <path className="hp-system-plane-confirm" d="M-99 -34L69 -65L99 34L-69 65Z" />
                </g>
              </g>
            ))}
          </svg>
          {planeLabels.map((label, index) => (
            <button
              key={label}
              type="button"
              className="hp-system-plane-control"
              data-machine-control={index}
              style={{ left: `${machineStates.architecture.positions[index][0] / 7.2}%`, top: `${machineStates.architecture.positions[index][1] / 4.6}%` }}
              aria-pressed={selection.plane === index}
              aria-controls="systems-insight"
              aria-label={`${label}: show ${mode.label.toLowerCase()} insight`}
              onClick={() => setSelection((current) => ({ ...current, plane: index, revision: current.revision + 1 }))}
            >
              <span>{label}</span>
              <i aria-hidden="true">↗</i>
            </button>
          ))}
        </div>

        <div id="systems-insight" className="hp-system-insight">
          <div className="hp-system-insight-copy" aria-live="polite" aria-atomic="true">
            <div key={`${mode.id}-${selection.plane}`} className="hp-system-insight-content">
              <h3>{title}</h3>
              <p>{detail}</p>
            </div>
          </div>
          <Link to={mode.route}>{machine.link}<span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </div>
  );
}
