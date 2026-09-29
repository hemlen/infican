import React from "react";
import { X } from "lucide-react";

interface PlacementBannerProps {
  onCancel: () => void;
}

export const PlacementBanner: React.FC<PlacementBannerProps> = ({ onCancel }) => {
  return (
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
        onClick={onCancel}
        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
        <span>Cancel (Esc)</span>
      </button>
    </div>
  );
};
