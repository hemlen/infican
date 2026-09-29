import { useState, useRef, useEffect, useCallback } from "react";
import type { Camera, Point } from "../types/canvas";
import { clampZoom } from "../utils/canvas";

interface UseCameraOptions {
  initialCamera?: Camera;
  minZoom?: number;
  maxZoom?: number;
}

export function useCamera(options: UseCameraOptions = {}) {
  const { minZoom, maxZoom } = options;

  const [camera, setCamera] = useState<Camera>(() => {
    if (options.initialCamera) return options.initialCamera;
    const isClient = typeof window !== "undefined";
    return {
      x: isClient ? window.innerWidth / 2 : 0,
      y: isClient ? window.innerHeight / 2 : 0,
      zoom: 1,
    };
  });

  const [isDragging, setIsDragging] = useState(false);

  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef<Point>({ x: 0, y: 0 });

  const resetView = useCallback(() => {
    setCamera({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      zoom: 1,
    });
  }, []);

  const zoomAt = useCallback(
    (screenPoint: Point, factor: number) => {
      setCamera((prev) => {
        const nextZoom = clampZoom(prev.zoom * factor, minZoom, maxZoom);
        if (nextZoom === prev.zoom) return prev;

        const worldX = (screenPoint.x - prev.x) / prev.zoom;
        const worldY = (screenPoint.y - prev.y) / prev.zoom;

        return {
          x: screenPoint.x - worldX * nextZoom,
          y: screenPoint.y - worldY * nextZoom,
          zoom: nextZoom,
        };
      });
    },
    [minZoom, maxZoom],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (e.button === 2) {
        isDraggingRef.current = true;
        setIsDragging(true);
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      setCamera((prev) => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      if (e.button === 2 && isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, []);

  return {
    camera,
    setCamera,
    cameraRef,
    isDragging,
    resetView,
    zoomAt,
    handleMouseDown,
    handleContextMenu,
  };
}
