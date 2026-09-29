import { useRef, useEffect, useCallback } from "react";
import type { Camera, Point } from "../types/canvas";
import { clampZoom } from "../utils/canvas";

interface UseCameraFlyOptions {
  cameraRef: React.RefObject<Camera>;
  setCamera: React.Dispatch<React.SetStateAction<Camera>>;
  isPanelOpen?: boolean;
}

export function useCameraFly({
  cameraRef,
  setCamera,
  isPanelOpen = false,
}: UseCameraFlyOptions) {
  const flyAnimRef = useRef<number | null>(null);

  const panToWorld = useCallback(
    (worldPoint: Point, targetZoom?: number) => {
      if (!worldPoint || isNaN(worldPoint.x) || isNaN(worldPoint.y)) return;

      // Cancel any ongoing flight to immediately take over with the new target
      if (flyAnimRef.current !== null) {
        cancelAnimationFrame(flyAnimRef.current);
        flyAnimRef.current = null;
      }

      // Offset viewport center by half the drawer width so the pin centers in the visible canvas
      const sidebarOffset = isPanelOpen ? 384 / 2 : 0;
      const targetScreenX = window.innerWidth / 2 - sidebarOffset;
      const targetScreenY = window.innerHeight / 2;

      // Snapshot the mutable ref at start time to prevent stale closure values when retargeting
      const current = cameraRef.current;
      const startX = isNaN(current.x) ? window.innerWidth / 2 : current.x;
      const startY = isNaN(current.y) ? window.innerHeight / 2 : current.y;
      const startZoom = clampZoom(isNaN(current.zoom) ? 1 : current.zoom);

      const validTargetZoom =
        typeof targetZoom === "number" && !isNaN(targetZoom) && targetZoom > 0
          ? clampZoom(targetZoom)
          : startZoom;

      const finalX = targetScreenX - worldPoint.x * validTargetZoom;
      const finalY = targetScreenY - worldPoint.y * validTargetZoom;

      // 350ms duration with cubic deceleration gives spatial context without feeling sluggish
      const duration = 350;
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
    [setCamera, isPanelOpen, cameraRef],
  );

  useEffect(() => {
    return () => {
      if (flyAnimRef.current !== null) {
        cancelAnimationFrame(flyAnimRef.current);
      }
    };
  }, []);

  return { panToWorld };
}
