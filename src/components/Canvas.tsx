import React, { useEffect, useRef, useState, useCallback } from "react";
import { useCamera } from "../hooks/useCamera";
import { useCameraFly } from "../hooks/useCameraFly";
import { screenToWorld } from "../utils/canvas";
import { renderCanvas } from "../utils/canvasRenderer";
import type { Point } from "../types/canvas";
import type { UseCommentsReturn } from "../hooks/useComments";
import type { CanvasPlaceholderItem, STLModelItem } from "../types/canvasItems";
import { DEFAULT_PLACEHOLDER_ITEMS } from "../data/placeholderItems";
import { parseSTL } from "../utils/stlParser";
import { CommentPin, DraftAnchorPin } from "./comments";
import { PlacementBanner } from "./canvas/PlacementBanner";
import { CanvasControls } from "./canvas/CanvasControls";
import { Box, CheckCircle } from "lucide-react";

interface CanvasProps {
  comments: UseCommentsReturn;
  onRegisterPanTo?: (panFn: (worldPoint: Point, targetZoom?: number) => void) => void;
}

export function Canvas({ comments, onRegisterPanTo }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [items, setItems] = useState<CanvasPlaceholderItem[]>(DEFAULT_PLACEHOLDER_ITEMS);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const {
    camera,
    setCamera,
    cameraRef,
    isDragging,
    resetView,
    zoomAt,
    panBy,
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

  // Expose panToWorld imperatively so sidebar cards can fly the camera without prop drilling
  useEffect(() => {
    if (onRegisterPanTo) {
      onRegisterPanTo(panToWorld);
    }
  }, [onRegisterPanTo, panToWorld]);

  // Esc clears modal states in priority order: active draft -> placement crosshairs -> active selection
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

  // Auto-dismiss file notifications
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Calibrated sensitivity constants:
  // Trackpad pinch sends continuous fractional deltas (~1-5 per tick); 0.009 yields ~2x zoom per full pinch.
  // Physical mouse wheels send notched integer steps (~100 per notch); 0.0015 yields ~15% per notch.
  const PINCH_ZOOM_SENSITIVITY = 0.009;
  const MOUSE_ZOOM_SENSITIVITY = 0.0015;

  // Handle zoom and pan with device-appropriate response:
  // - Mac Trackpad pinch (ctrlKey=true): fast, fluid exponential zoom around cursor midpoint.
  // - Mac Trackpad two-finger swipe (ctrlKey=false): smooth canvas panning (Figma / Miro style).
  // - Physical mouse wheel: zoom into cursor with velocity ramping.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Normalize delta mode to pixels (e.g. line scrolling in Firefox or page scrolling)
      let deltaX = e.deltaX;
      let deltaY = e.deltaY;
      if (e.deltaMode === 1) {
        deltaX *= 16;
        deltaY *= 16;
      } else if (e.deltaMode === 2) {
        deltaX *= window.innerWidth;
        deltaY *= window.innerHeight;
      }

      // Modern browsers surface Mac trackpad pinch gestures as wheel events with ctrlKey=true
      const isPinchGesture = e.ctrlKey || e.metaKey;
      const isTrackpad = !Number.isInteger(deltaY) || Math.abs(deltaY) < 30;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (isPinchGesture) {
        // Trackpad pinch-to-zoom (or Ctrl + mouse wheel)
        // High-frequency small deltas get calibrated pinch multiplier;
        // Clamp delta to [-60, 60] to prevent jarring jumps on sudden fast pinches.
        const sensitivity = isTrackpad ? PINCH_ZOOM_SENSITIVITY : MOUSE_ZOOM_SENSITIVITY;
        const clampedDelta = Math.max(Math.min(deltaY, 60), -60);
        const zoomFactor = Math.exp(-clampedDelta * sensitivity);
        zoomAt({ x: mouseX, y: mouseY }, zoomFactor);
      } else if (isTrackpad) {
        // Two-finger trackpad drag pans the canvas (Figma / Miro style)
        panBy(-deltaX, -deltaY);
      } else {
        // Physical notched mouse wheel: zoom into cursor with velocity ramping
        const now = performance.now();
        const timeSinceLast = now - lastWheelTimeRef.current;
        lastWheelTimeRef.current = now;

        if (timeSinceLast < 120) {
          accelVelocityRef.current = Math.min(accelVelocityRef.current + 0.3, 2.4);
        } else {
          accelVelocityRef.current = 1;
        }

        const zoomFactor = Math.exp(-deltaY * MOUSE_ZOOM_SENSITIVITY * accelVelocityRef.current);
        zoomAt({ x: mouseX, y: mouseY }, zoomFactor);
      }
    };

    // Prevent Safari's native page zoom from hijacking the canvas during pinch gestures
    const preventSafariGesture = (e: Event) => e.preventDefault();
    canvas.addEventListener("gesturestart", preventSafariGesture);
    canvas.addEventListener("gesturechange", preventSafariGesture);

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener("gesturestart", preventSafariGesture);
      canvas.removeEventListener("gesturechange", preventSafariGesture);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [zoomAt, panBy]);

  const draw = useCallback(
    (time: number = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Synchronize buffer pixel count with physical device pixels for high-DPI display crispness
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      renderCanvas(ctx, camera, width, height, dpr, items, time);
    },
    [camera, items],
  );

  // 60FPS animation loop enables continuous auto-rotation of 3D models and fluid pan animations
  useEffect(() => {
    let animationFrameId: number;

    const loop = (time: number) => {
      draw(time);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [draw]);

  // Intercept left-click during placement mode before pan listener initiates camera drag
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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!comments.isPlacingComment && !comments.draftPosition && e.button === 0) {
      comments.setActiveThreadId(null);
    }
  };

  // Drag & drop support for any user .stl file directly onto the infinite canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const files = Array.from(e.dataTransfer.files);
    const stlFile = files.find((f) => f.name.toLowerCase().endsWith(".stl"));

    if (!stlFile) return;

    try {
      const buffer = await stlFile.arrayBuffer();
      const mesh = parseSTL(buffer, stlFile.name);

      const rect = canvasRef.current?.getBoundingClientRect();
      const mouseScreen: Point = {
        x: e.clientX - (rect?.left || 0),
        y: e.clientY - (rect?.top || 0),
      };
      const dropWorldPos = screenToWorld(mouseScreen, camera);

      const newSTLItem: STLModelItem = {
        id: `stl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: "stl-model",
        position: dropWorldPos,
        mesh,
        size: 70,
        color: "#38bdf8",
        rotation: { x: 0.5, y: 0.4, z: 0 },
        autoRotate: true,
      };

      setItems((prev) => [...prev, newSTLItem]);
      setNotification(`Imported 3D Model: ${stlFile.name} (${mesh.triangleCount} triangles)`);
    } catch (err) {
      console.error("Failed to parse dropped STL file:", err);
      setNotification(`Failed to load ${stlFile.name}`);
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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full touch-none"
        onMouseDown={handleCanvasMouseDown}
        onClick={handleCanvasClick}
      />

      {/* HTML overlay is pointer-events-none so transparent areas do not intercept canvas pan/zoom */}
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

      {comments.isPlacingComment && (
        <PlacementBanner onCancel={comments.cancelPlacing} />
      )}

      {/* Floating toast notification for STL file imports */}
      {notification && (
        <div className="absolute top-4 left-6 z-30 pointer-events-auto flex items-center gap-2 px-3.5 py-2 bg-slate-900/95 backdrop-blur border border-emerald-500/50 rounded-xl shadow-2xl text-xs text-emerald-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Full-screen dropzone overlay during file drag */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 pointer-events-none bg-blue-950/60 backdrop-blur-sm border-4 border-dashed border-blue-400 flex flex-col items-center justify-center text-blue-200 animate-in fade-in duration-100">
          <div className="p-4 bg-blue-600 rounded-2xl shadow-2xl mb-3 text-white">
            <Box className="w-10 h-10 animate-bounce" />
          </div>
          <span className="text-base font-semibold text-white">
            Drop .STL file anywhere to place 3D model
          </span>
          <span className="text-xs text-blue-300 mt-1">
            Zero dependencies • Works with Binary & ASCII STL formats
          </span>
        </div>
      )}

      <CanvasControls zoom={camera.zoom} onResetView={resetView} />
    </div>
  );
}
