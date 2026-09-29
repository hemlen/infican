import React from "react";
import type { Camera, Point } from "../../../types/canvas";
import { worldToScreen } from "../../../utils/canvas";
import { MessageSquare } from "lucide-react";

interface DraftAnchorPinProps {
  position: Point;
  camera: Camera;
  draftZoom?: number | null;
}

export const DraftAnchorPin: React.FC<DraftAnchorPinProps> = ({
  position,
  camera,
  draftZoom,
}) => {
  const screenPos = worldToScreen(position, camera);
  const createdZoom = draftZoom && draftZoom > 0 ? draftZoom : camera.zoom || 1;
  const scale = Math.max(Math.min((camera.zoom || 1) / createdZoom, 1.0), 0.2);

  return (
    <div
      className="absolute pointer-events-none select-none z-30"
      style={{
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
      }}
    >
      <div
        className="relative flex flex-col items-center"
        style={{
          transform: `translate(-50%, -100%) scale(${scale})`,
          transformOrigin: "bottom center",
        }}
      >
        <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-500/40 shadow-lg flex items-center justify-center text-white">
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 border-t-white" />
      </div>
    </div>
  );
};
