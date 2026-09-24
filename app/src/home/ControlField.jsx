import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./control-field.css";

// The same projected axes as the control, measured only when it is activated.
// Three finite SVG image sheets, no frame loop, particles, canvas, or rendering engine.
export default function ControlField({ source, active, sequence }) {
  const [field, setField] = useState(null);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const node = source.current;
    if (!active || !node || motion.matches || document.hidden) { setField(null); return undefined; }
    const matrix = node.getScreenCTM();
    if (!matrix) return undefined;
    const project = (x, y) => new DOMPoint(x, y).matrixTransform(matrix);
    const center = project(497, 388);
    const top = project(495, 265);
    const right = project(713, 380);
    const left = project(280, 390);
    const compact = innerWidth < 700;
    const step = compact ? innerWidth / 6 : Math.min(innerWidth / 11, 160);
    setField({ x: center.x, y: center.y, width: innerWidth, height: innerHeight, compact, step,
      u: { x: 1, y: (right.y - top.y) / (right.x - top.x) },
      v: { x: -1, y: (left.y - top.y) / (top.x - left.x) } });
    const finish = () => setField(null);
    const timer = window.setTimeout(finish, 1450);
    const visibility = () => { if (document.hidden) finish(); };
    window.addEventListener("scroll", finish, { passive: true });
    window.addEventListener("resize", finish, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", finish);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", finish);
      window.removeEventListener("resize", finish);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", finish);
    };
  }, [active, sequence, source]);
  if (!field) return null;
  const { x, y, width, height, step, compact, u, v } = field;
  const p = (a, b) => [step * (a * u.x + b * v.x), step * (a * u.y + b * v.y)];
  const path = (points, close = false) => points.map(([a,b], i) => `${i ? "L" : "M"}${p(a,b).join(" ")}`).join(" ") + (close ? "Z" : "");
  const reach = compact ? 3 : 7;
  const frame = [[-reach,-reach*.5],[-2,-reach*.5],[-2,-reach],[reach*.6,-reach],[reach*.6,-2],[reach,-2],[reach,reach*.6],[2,reach*.6],[2,reach],[-reach*.6,reach],[-reach*.6,2],[-reach,2]];
  const grid = [];
  for (let n = -reach; n <= reach; n += compact ? 1 : 2) {
    const span = reach - Math.abs(n) * .25;
    grid.push(path([[-span,n],[span,n]]), path([[n,-span],[n,span]]));
  }
  const routes = [
    [[0,0],[2,0],[2,-2],[reach,-2],[reach,-reach]],
    [[0,0],[0,2],[-2,2],[-2,reach],[-reach,reach]],
    [[0,0],[-2,0],[-2,-2],[-reach,-2],[-reach,-reach]],
    [[0,0],[0,-2],[2,-2],[2,-reach],[reach,-reach]],
  ];
  return createPortal(
    <div key={sequence} className="hp-topology-event" aria-hidden="true"
      onAnimationEnd={(event) => { if (event.animationName === "hp-topology-expand") setField(null); }}>
      {(compact ? [0,1] : [0,1,2]).map((layer) => {
        // A static SVG image is rasterized once, then moved by the compositor.
        // Animating live SVG geometry at viewport scale caused repeated paint.
        const color = ["#5264ff", "#9280cd", "#71b0bf"][layer];
        const routesMarkup = routes.slice(0, compact ? 2 : 4).map(route => `<path d="${path(route)}"/>`).join("");
        const risers = compact ? "" : [[-5,2],[-2,-5],[3,-2],[2,5]].map(([a,b]) => {
          const point = p(a,b);
          return `<path d="M${point[0]} ${point[1]}v-92l${step*.55} ${-step*.29}"/>`;
        }).join("");
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g transform="translate(${x} ${y})" fill="none" stroke="${color}"><path d="${path(frame, true)}" stroke-width="1.5" fill="${color}" fill-opacity=".025"/><g opacity="${compact ? .2 : .28}" stroke-width=".8">${grid.map(d => `<path d="${d}"/>`).join("")}</g><g stroke-width="${compact ? 1.8 : 2.5}">${routesMarkup}</g><g stroke="#e7e8dd" opacity=".42" stroke-width="1.4">${risers}</g></g></svg>`;
        return <img alt="" draggable="false" width={width} height={height}
          className={`hp-topology-sheet hp-topology-sheet--${layer}`} key={layer}
          src={`data:image/svg+xml,${encodeURIComponent(svg)}`}
          style={{ "--field-lift": `${(layer - 1) * (compact ? 38 : 92)}px`, transformOrigin: `${x}px ${y}px` }} />;
      })}
    </div>, document.body,
  );
}
