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

    const resize = () => {
      const { width, height } = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(width, height);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [nodes, connections, stroke]);

  return (
    <div ref={wrapperRef} className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

export default DiagramCanvas;
