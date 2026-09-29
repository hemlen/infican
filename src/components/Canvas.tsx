import { useEffect, useRef, useCallback } from "react";
import { useCamera } from "../hooks/useCamera";
import { worldToScreen } from "../utils/canvas";

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    camera,
    isDragging,
    resetView,
    zoomAt,
    handleMouseDown,
    handleContextMenu,
  } = useCamera();

  const lastWheelTimeRef = useRef<number>(0);
  const accelVelocityRef = useRef<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const isTrackpad = !Number.isInteger(e.deltaY) || Math.abs(e.deltaY) < 30;

      let acceleration = 1;
      if (!isTrackpad) {
        const now = performance.now();
        const timeSinceLast = now - lastWheelTimeRef.current;
        lastWheelTimeRef.current = now;

        if (timeSinceLast < 120) {
          accelVelocityRef.current = Math.min(accelVelocityRef.current + 0.3, 2.4);
        } else {
          accelVelocityRef.current = 1;
        }
        acceleration = accelVelocityRef.current;
      }

      const zoomFactor = Math.exp(-e.deltaY * 0.0015 * acceleration);

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      zoomAt({ x: mouseX, y: mouseY }, zoomFactor);
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [zoomAt]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#0b0f19";
    ctx.fillRect(0, 0, width, height);

    const baseGridSize = 40;
    let gridSize = baseGridSize;
    while (gridSize * camera.zoom < 20) gridSize *= 2;
    while (gridSize * camera.zoom > 80) gridSize /= 2;

    const screenGridSize = gridSize * camera.zoom;

    const startX = Math.floor(-camera.x / screenGridSize) * gridSize;
    const endX = Math.ceil((width - camera.x) / screenGridSize) * gridSize;
    const startY = Math.floor(-camera.y / screenGridSize) * gridSize;
    const endY = Math.ceil((height - camera.y) / screenGridSize) * gridSize;

    ctx.fillStyle = "rgba(148, 163, 184, 0.28)";
    for (let x = startX; x <= endX; x += gridSize) {
      for (let y = startY; y <= endY; y += gridSize) {
        const sx = x * camera.zoom + camera.x;
        const sy = y * camera.zoom + camera.y;

        ctx.beginPath();
        ctx.arc(sx, sy, 1.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const originX = camera.x;
    const originY = camera.y;

    ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
    ctx.lineWidth = 1.5;
    const crossSize = 12;

    ctx.beginPath();
    ctx.moveTo(originX - crossSize, originY);
    ctx.lineTo(originX + crossSize, originY);
    ctx.moveTo(originX, originY - crossSize);
    ctx.lineTo(originX, originY + crossSize);
    ctx.stroke();

    ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillStyle = "rgba(56, 189, 248, 0.7)";
    ctx.fillText("(0, 0)", originX + 6, originY - 6);

    const squareWorldPos = { x: 100, y: 0 };
    const squareWorldSize = 60;

    const squareScreenPos = worldToScreen(squareWorldPos, camera);
    const squareScreenSize = squareWorldSize * camera.zoom;

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(
      squareScreenPos.x,
      squareScreenPos.y,
      squareScreenSize,
      squareScreenSize
    );

    ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillStyle = "#fca5a5";
    ctx.fillText(
      "100x, 0y",
      squareScreenPos.x,
      squareScreenPos.y - 4
    );

    ctx.restore();
  }, [camera]);

  useEffect(() => {
    let animationFrameId: number;
    animationFrameId = requestAnimationFrame(draw);

    const handleResize = () => {
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [draw]);

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden select-none ${
        isDragging ? "cursor-grabbing" : "cursor-default"
      }`}
      onContextMenu={handleContextMenu}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        onMouseDown={handleMouseDown}
      />

      <div className="absolute bottom-4 right-4 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur border border-slate-800 text-xs text-slate-400 pointer-events-auto shadow-md">
        <span className="font-mono text-slate-200">
          {Math.round(camera.zoom * 100)}%
        </span>
        <span className="text-slate-600">|</span>
        <button
          onClick={resetView}
          className="hover:text-slate-100 transition-colors cursor-pointer"
          title="Reset View to Origin (0,0)"
        >
          Reset View
        </button>
      </div>

      <div className="absolute bottom-4 left-4 text-xs text-slate-500 pointer-events-none">
        Right-click + Drag to pan • Scroll to zoom
      </div>
    </div>
  );
}
