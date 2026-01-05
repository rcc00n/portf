import { useEffect, useRef } from "react";

const DiagramCanvas = ({ nodes = [], connections = [], className = "", stroke = "rgba(148,163,184,0.4)" }) => {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    let frameId = null;
    let dprQuery = null;

    const draw = (width, height) => {
      ctx.clearRect(0, 0, width, height);
      if (!nodes.length || !connections.length) return;

      const points = new Map(
        nodes.map((node) => [node.id, { x: node.x * width, y: node.y * height }])
      );

      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      connections.forEach((connection) => {
        const from = points.get(connection.from);
        const to = points.get(connection.to);
        if (!from || !to) return;
        const midX = (from.x + to.x) / 2;

        ctx.setLineDash(connection.dashed ? [6, 6] : []);
        ctx.strokeStyle = connection.color || stroke;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.bezierCurveTo(midX, from.y, midX, to.y, to.x, to.y);
        ctx.stroke();
      });
    };

    const render = () => {
      frameId = null;
      const rect = wrapper.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;

      const dpr = window.devicePixelRatio || 1;
      const scaledWidth = Math.max(1, Math.round(width * dpr));
      const scaledHeight = Math.max(1, Math.round(height * dpr));

      if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
      }
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(scaledWidth / width, 0, 0, scaledHeight / height, 0, 0);
      draw(width, height);
    };

    const schedule = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(render);
    };

    const handleDprChange = () => {
      watchDpr();
      schedule();
    };

    const watchDpr = () => {
      if (typeof window.matchMedia !== "function") return;
      if (dprQuery) {
        dprQuery.removeEventListener("change", handleDprChange);
      }
      const currentDpr = window.devicePixelRatio || 1;
      dprQuery = window.matchMedia(`(resolution: ${currentDpr}dppx)`);
      dprQuery.addEventListener("change", handleDprChange);
    };

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    if (resizeObserver) {
      resizeObserver.observe(wrapper);
    }
    window.addEventListener("resize", schedule);
    watchDpr();
    schedule();

    return () => {
      window.removeEventListener("resize", schedule);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (dprQuery) {
        dprQuery.removeEventListener("change", handleDprChange);
      }
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [nodes, connections, stroke]);

  return (
    <div ref={wrapperRef} className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

export default DiagramCanvas;
