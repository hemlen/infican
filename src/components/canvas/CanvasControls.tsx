import React from "react";

interface CanvasControlsProps {
  zoom: number;
  onResetView: () => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  zoom,
  onResetView,
}) => {
  return (
    <>
      <div className="absolute bottom-4 left-4 flex items-center gap-3 text-xs text-slate-500 pointer-events-none select-none">
        <span>Right-click + Drag to pan • Scroll to zoom</span>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur border border-slate-800 text-xs text-slate-400 pointer-events-auto shadow-md select-none">
        <span className="font-mono text-slate-200">
          {Math.round(zoom * 100)}%
        </span>
        <span className="text-slate-600">|</span>
        <button
          onClick={onResetView}
          className="hover:text-slate-100 transition-colors cursor-pointer"
          title="Reset View to Origin (0,0)"
        >
          Reset View
        </button>
      </div>
    </>
  );
};
