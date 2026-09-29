import React from "react";
import { MessageSquare, Plus, ChevronRight } from "lucide-react";

interface CommentPanelHeaderProps {
  totalCount: number;
  isPlacingComment: boolean;
  onTogglePlacing: () => void;
  onClose: () => void;
}

export const CommentPanelHeader: React.FC<CommentPanelHeaderProps> = ({
  totalCount,
  isPlacingComment,
  onTogglePlacing,
  onClose,
}) => {
  return (
    <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-slate-100 tracking-wide">
          Comments
        </h2>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
          {totalCount}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onTogglePlacing}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            isPlacingComment
              ? "bg-blue-600 text-white ring-2 ring-blue-400/40 animate-pulse"
              : "bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white"
          }`}
          title={isPlacingComment ? "Cancel placement" : "Add comment to canvas"}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isPlacingComment ? "Placing..." : "Add"}</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          title="Collapse Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
