import { useEffect, useRef, useState } from "react";

const paths = [
  { a: [1.08, 0.08], c1: [0.78, 0.03], c2: [0.88, 0.32], b: [0.59, 0.30], c3: [0.37, 0.28], c4: [0.36, 0.08], d: [0.08, 0.18] },
  { a: [1.10, 0.19], c1: [0.82, 0.13], c2: [0.84, 0.40], b: [0.60, 0.39], c3: [0.39, 0.38], c4: [0.37, 0.19], d: [0.06, 0.34] },
  { a: [1.06, 0.34], c1: [0.84, 0.30], c2: [0.78, 0.52], b: [0.56, 0.49], c3: [0.34, 0.45], c4: [0.33, 0.36], d: [0.03, 0.51] },
  { a: [1.02, 0.50], c1: [0.79, 0.52], c2: [0.73, 0.66], b: [0.51, 0.61], c3: [0.30, 0.56], c4: [0.26, 0.54], d: [-0.04, 0.68] },
  { a: [0.96, 0.66], c1: [0.71, 0.72], c2: [0.66, 0.78], b: [0.44, 0.73], c3: [0.24, 0.68], c4: [0.18, 0.71], d: [-0.08, 0.83] },
  { a: [0.87, 0.82], c1: [0.66, 0.88], c2: [0.56, 0.87], b: [0.37, 0.82], c3: [0.16, 0.77], c4: [0.10, 0.86], d: [-0.12, 0.96] },
];

const mix = (a, b, t) => a + (b - a) * t;

const point = (p, width, height, pointer, influence = 1) => {
  const px = p[0] * width;
  const py = p[1] * height;
  const dx = pointer.x * width - px;
  const dy = pointer.y * height - py;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const pull = Math.max(0, 1 - distance / (Math.min(width, height) * 0.42)) * influence;
  return [px + dx * pull * 0.035, py + dy * pull * 0.025];
};

export default function TraceCanvas() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const stateRef = useRef({ pointer: { x: 0.72, y: 0.42 }, target: { x: 0.72, y: 0.42 }, scroll: 0, phase: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let last = 0;

    const size = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawPath = (path, index, progress, pointer) => {
      const settle = Math.min(1, Math.max(0, (progress - 0.08) / 0.75));
      const flattened = {
        a: [1.08, mix(path.a[1], 0.92, settle)],
        c1: [0.82, mix(path.c1[1], 0.92, settle)],
        c2: [0.74, mix(path.c2[1], 0.90, settle)],
        b: [0.58, mix(path.b[1], 0.88 + index * 0.006, settle)],
        c3: [0.38, mix(path.c3[1], 0.87 + index * 0.006, settle)],
        c4: [0.22, mix(path.c4[1], 0.87 + index * 0.006, settle)],
        d: [-0.12, mix(path.d[1], 0.87 + index * 0.006, settle)],
      };
      const a = point(flattened.a, width, height, pointer, 0.2);
      const c1 = point(flattened.c1, width, height, pointer, 0.35);
      const c2 = point(flattened.c2, width, height, pointer, 0.85);
      const b = point(flattened.b, width, height, pointer, 1);
      const c3 = point(flattened.c3, width, height, pointer, 0.65);
      const c4 = point(flattened.c4, width, height, pointer, 0.35);
      const d = point(flattened.d, width, height, pointer, 0.1);

      const trace = () => {
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], b[0], b[1]);
        ctx.bezierCurveTo(c3[0], c3[1], c4[0], c4[1], d[0], d[1]);
      };

      ctx.lineCap = "square";
      ctx.setLineDash([]);
      trace();
      ctx.strokeStyle = `rgba(0,0,0,${0.45 - index * 0.025})`;
      ctx.lineWidth = 10 + index * 0.7;
      ctx.stroke();
      trace();
      ctx.strokeStyle = index === 2 ? "rgba(236,96,56,0.95)" : `rgba(213,210,199,${0.5 + index * 0.055})`;
      ctx.lineWidth = index === 2 ? 2.4 : 1.2;
      ctx.stroke();

      if (index === 2 && !reduced.matches && !coarse.matches && settle < 0.75) {
        trace();
        ctx.setLineDash([Math.max(70, width * 0.08), width * 1.5]);
        ctx.lineDashOffset = -stateRef.current.phase;
        ctx.strokeStyle = "#f3eee2";
        ctx.lineWidth = 3.2;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const draw = (time = 0) => {
      frame = 0;
      const animated = !reduced.matches && !coarse.matches && visible && document.visibilityState === "visible";
      if (animated && last && time - last < 42) {
        frame = requestAnimationFrame(draw);
        return;
      }
      if (animated) last = time;

      const state = stateRef.current;
      state.pointer.x += (state.target.x - state.pointer.x) * 0.035;
      state.pointer.y += (state.target.y - state.pointer.y) * 0.035;
      if (!reduced.matches && !coarse.matches) state.phase = (state.phase + 0.7) % Math.max(width * 1.5, 1);

      ctx.clearRect(0, 0, width, height);
      const gridAlpha = Math.max(0.03, 0.13 - state.scroll * 0.1);
      ctx.strokeStyle = `rgba(213,210,199,${gridAlpha})`;
      ctx.lineWidth = 1;
      [0.16, 0.37, 0.59, 0.81].forEach((x) => {
        ctx.beginPath(); ctx.moveTo(x * width, 0); ctx.lineTo(x * width, height); ctx.stroke();
      });
      [0.20, 0.45, 0.70].forEach((y) => {
        ctx.beginPath(); ctx.moveTo(0, y * height); ctx.lineTo(width, y * height); ctx.stroke();
      });

      paths.forEach((path, index) => drawPath(path, index, state.scroll, state.pointer));

      const terminals = [[0.61, 0.30], [0.60, 0.39], [0.56, 0.49], [0.51, 0.61]];
      terminals.forEach(([x, y], i) => {
        const flatten = Math.min(1, state.scroll * 1.3);
        const px = x * width;
        const py = mix(y, 0.88 + i * 0.008, flatten) * height;
        ctx.fillStyle = i === 2 ? "#ec6038" : "#0b0c0a";
        ctx.strokeStyle = i === 2 ? "#ec6038" : "rgba(226,222,211,.7)";
        ctx.lineWidth = 1;
        ctx.fillRect(px - 8, py - 8, 16, 16);
        ctx.strokeRect(px - 8, py - 8, 16, 16);
      });

      if (animated) {
        frame = requestAnimationFrame(draw);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const onPointerMove = (event) => {
      if (coarse.matches || reduced.matches) return;
      const rect = wrap.getBoundingClientRect();
      stateRef.current.target = {
        x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
      };
    };

    const onPointerLeave = () => {
      stateRef.current.target = { x: 0.72, y: 0.42 };
    };

    const onScroll = () => {
      const rect = wrap.getBoundingClientRect();
      stateRef.current.scroll = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height * 0.82, 1)));
      schedule();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else if (frame) { cancelAnimationFrame(frame); frame = 0; }
    }, { rootMargin: "100px" });
    const resizeObserver = new ResizeObserver(() => { size(); schedule(); });

    size();
    observer.observe(wrap);
    resizeObserver.observe(wrap);
    wrap.addEventListener("pointermove", onPointerMove, { passive: true });
    wrap.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    reduced.addEventListener("change", schedule);
    onScroll();
    setReady(true);
    schedule();

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", schedule);
      reduced.removeEventListener("change", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`tp-trace-canvas ${ready ? "is-ready" : ""}`}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
