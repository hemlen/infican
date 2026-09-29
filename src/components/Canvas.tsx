import { useEffect, useRef, useCallback } from "react";
import { useCamera } from "../hooks/useCamera";
import { useCameraFly } from "../hooks/useCameraFly";
import { screenToWorld } from "../utils/canvas";
import { renderCanvas } from "../utils/canvasRenderer";
import type { Point } from "../types/canvas";
import type { UseCommentsReturn } from "../hooks/useComments";
import { CommentPin, DraftAnchorPin } from "./comments";
import { PlacementBanner } from "./canvas/PlacementBanner";
import { CanvasControls } from "./canvas/CanvasControls";

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

  const { panToWorld } = useCameraFly({
    cameraRef,
    setCamera,
    isPanelOpen: comments.isPanelOpen,
  });

  const lastWheelTimeRef = useRef<number>(0);
  const accelVelocityRef = useRef<number>(1);

  // Register pan function with parent
  useEffect(() => {
    if (onRegisterPanTo) {
      onRegisterPanTo(panToWorld);
    }
  }, [onRegisterPanTo, panToWorld]);

  // Handle escape key shortcuts
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

  // Zoom wheel handling with trackpad detection & mouse acceleration
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

  // Draw loop delegated to renderCanvas
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

    renderCanvas(ctx, camera, width, height, dpr);
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

  // Canvas click handler for deselecting active comment on empty canvas space
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!comments.isPlacingComment && !comments.draftPosition && e.button === 0) {
      comments.setActiveThreadId(null);
    }
  };

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

        {comments.draftPosition && (
          <DraftAnchorPin
            position={comments.draftPosition}
            camera={camera}
            draftZoom={comments.draftZoom}
          />
        )}
      </div>

      {/* Top Banner when placing comment */}
      {comments.isPlacingComment && (
        <PlacementBanner onCancel={comments.cancelPlacing} />
      )}

      {/* Bottom controls: zoom & instructions */}
      <CanvasControls zoom={camera.zoom} onResetView={resetView} />
    </div>
  );
}
