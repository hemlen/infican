import { useEffect, useRef, useCallback } from "react";
import { useCamera } from "../hooks/useCamera";
import { worldToScreen, screenToWorld, clampZoom } from "../utils/canvas";
import type { Point } from "../types/canvas";
import type { UseCommentsReturn } from "../hooks/useComments";
import { CommentPin, DraftAnchorPin } from "./comments/CommentPin";
import { X } from "lucide-react";

interface CanvasProps {
  comments: UseCommentsReturn;
  onRegisterPanTo?: (panFn: (worldPoint: Point, targetZoom?: number) => void) => void;
}

export function Canvas({ comments, onRegisterPanTo }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    camera,
    setCamera,
    cameraRef,
    isDragging,
    resetView,
    zoomAt,
    handleMouseDown,
    handleContextMenu,
  } = useCamera();

  const lastWheelTimeRef = useRef<number>(0);
  const accelVelocityRef = useRef<number>(1);
  const flyAnimRef = useRef<number | null>(null);

  // Smooth animated pan and zoom to world coordinate helper
  const panToWorld = useCallback(
    (worldPoint: Point, targetZoom?: number) => {
      if (!worldPoint || isNaN(worldPoint.x) || isNaN(worldPoint.y)) return;

      if (flyAnimRef.current !== null) {
        cancelAnimationFrame(flyAnimRef.current);
        flyAnimRef.current = null;
      }

      const sidebarOffset = comments.isPanelOpen ? 384 / 2 : 0;
      const targetScreenX = window.innerWidth / 2 - sidebarOffset;
      const targetScreenY = window.innerHeight / 2;

      // Make a clean numeric snapshot of starting camera state
      const current = cameraRef.current;
      const startX = isNaN(current.x) ? window.innerWidth / 2 : current.x;
      const startY = isNaN(current.y) ? window.innerHeight / 2 : current.y;
      const startZoom = clampZoom(isNaN(current.zoom) ? 1 : current.zoom);

      // Validate targetZoom: must be positive finite number
      const validTargetZoom =
        typeof targetZoom === "number" && !isNaN(targetZoom) && targetZoom > 0
          ? clampZoom(targetZoom)
          : startZoom;

      const finalX = targetScreenX - worldPoint.x * validTargetZoom;
      const finalY = targetScreenY - worldPoint.y * validTargetZoom;

      const duration = 350; // ms
      const startTime = performance.now();
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(Math.max(elapsed / duration, 0), 1);
        const eased = easeOutCubic(progress);

        const currentZoom = clampZoom(startZoom + (validTargetZoom - startZoom) * eased);
        const currentX = startX + (finalX - startX) * eased;
        const currentY = startY + (finalY - startY) * eased;

        setCamera({
          x: isNaN(currentX) ? 0 : currentX,
          y: isNaN(currentY) ? 0 : currentY,
          zoom: currentZoom,
        });

        if (progress < 1) {
          flyAnimRef.current = requestAnimationFrame(step);
        } else {
          flyAnimRef.current = null;
        }
      };

      flyAnimRef.current = requestAnimationFrame(step);
    },
    [setCamera, comments.isPanelOpen, cameraRef],
  );

  useEffect(() => {
    return () => {
      if (flyAnimRef.current !== null) {
        cancelAnimationFrame(flyAnimRef.current);
      }
    };
  }, []);

  // Register pan function with parent
  useEffect(() => {
    if (onRegisterPanTo) {
      onRegisterPanTo(panToWorld);
    }
  }, [onRegisterPanTo, panToWorld]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (comments.draftPosition) {
          comments.setDraftPosition(null);
        } else if (comments.isPlacingComment) {
          comments.cancelPlacing();
        } else if (comments.activeThreadId) {
          comments.setActiveThreadId(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [comments]);

  // Zoom handling
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

  // Render 2D Canvas background & grid
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

    const zoom = clampZoom(isNaN(camera.zoom) ? 1 : camera.zoom);
    const camX = isNaN(camera.x) ? 0 : camera.x;
    const camY = isNaN(camera.y) ? 0 : camera.y;

    const baseGridSize = 40;
    let gridSize = baseGridSize;
    let loopGuard = 0;
    while (gridSize * zoom < 20 && loopGuard < 12) {
      gridSize *= 2;
      loopGuard++;
    }
    loopGuard = 0;
    while (gridSize * zoom > 80 && loopGuard < 12) {
      gridSize /= 2;
      loopGuard++;
    }

    const screenGridSize = Math.max(gridSize * zoom, 1);

    const startX = Math.floor(-camX / screenGridSize) * gridSize;
    const endX = Math.ceil((width - camX) / screenGridSize) * gridSize;
    const startY = Math.floor(-camY / screenGridSize) * gridSize;
    const endY = Math.ceil((height - camY) / screenGridSize) * gridSize;

    const countX = Math.abs((endX - startX) / (gridSize || 1));
    const countY = Math.abs((endY - startY) / (gridSize || 1));

    if (gridSize > 0 && countX < 300 && countY < 300) {
      ctx.fillStyle = "rgba(148, 163, 184, 0.28)";
      for (let x = startX; x <= endX; x += gridSize) {
        for (let y = startY; y <= endY; y += gridSize) {
          const sx = x * zoom + camX;
          const sy = y * zoom + camY;

          ctx.beginPath();
          ctx.arc(sx, sy, 1.25, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const originX = camX;
    const originY = camY;

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

    const squareScreenPos = worldToScreen(squareWorldPos, { x: camX, y: camY, zoom });
    const squareScreenSize = squareWorldSize * zoom;

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

  // Canvas mouse down handler - intercepts placement mode clicks immediately
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (comments.isPlacingComment && e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const screenPoint: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      const worldPoint = screenToWorld(screenPoint, camera);
      comments.placeCommentAt(worldPoint, camera.zoom);
      return;
    }

    handleMouseDown(e);
  };

  // Canvas click handler for deselecting when clicking empty space
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!comments.isPlacingComment && !comments.draftPosition && e.button === 0) {
      comments.setActiveThreadId(null);
    }
  };

  // Only open comments are displayed on the canvas
  const openThreads = comments.threads.filter((t) => t.status === "open");

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden select-none ${
        isDragging
          ? "cursor-grabbing"
          : comments.isPlacingComment
          ? "cursor-crosshair"
          : "cursor-default"
      }`}
      onContextMenu={handleContextMenu}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        onMouseDown={handleCanvasMouseDown}
        onClick={handleCanvasClick}
      />

      {/* HTML Overlay for Interactive Comment Pins & Drafts */}
      <div className="absolute inset-0 pointer-events-none">
        {openThreads.map((thread) => (
          <CommentPin
            key={thread.id}
            thread={thread}
            camera={camera}
            isActive={comments.activeThreadId === thread.id}
            onSelect={(id) => {
              comments.selectThread(id);
              panToWorld(thread.position, thread.zoom);
            }}
          />
        ))}

        {/* Static anchor pin on canvas while typing in panel */}
        {comments.draftPosition && (
          <DraftAnchorPin
            position={comments.draftPosition}
            camera={camera}
            draftZoom={comments.draftZoom}
          />
        )}
      </div>

      {/* Top Banner when user is in Add Comment mode */}
      {comments.isPlacingComment && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-3 px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-blue-500/60 rounded-full shadow-2xl text-xs text-blue-200 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span className="font-medium">
              Click anywhere on the canvas to place comment
            </span>
          </div>
          <span className="text-slate-500">|</span>
          <button
            type="button"
            onClick={comments.cancelPlacing}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel (Esc)</span>
          </button>
        </div>
      )}

      {/* Bottom controls: zoom & instructions */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 text-xs text-slate-500 pointer-events-none">
        <span>Right-click + Drag to pan • Scroll to zoom</span>
      </div>

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
    </div>
  );
}
