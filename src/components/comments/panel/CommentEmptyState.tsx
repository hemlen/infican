import React from "react";
import type { CommentStatus } from "../../../types/comment";
import { MessageSquare, CheckCircle, Plus } from "lucide-react";

interface CommentEmptyStateProps {
  activeFilter: CommentStatus;
  onStartPlacing: () => void;
}

export const CommentEmptyState: React.FC<CommentEmptyStateProps> = ({
  activeFilter,
  onStartPlacing,
}) => {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
      {activeFilter === "open" ? (
        <>
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <MessageSquare className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-xs font-medium text-slate-300 mb-1">
            No open comments
          </p>
          <p className="text-[11px] text-slate-500 mb-4 max-w-xs">
            Click the "+" button above or press below to drop a pin on the canvas.
          </p>
          <button
            type="button"
            onClick={onStartPlacing}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add comment
          </button>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-500/70" />
          </div>
          <p className="text-xs font-medium text-slate-300 mb-1">
            No resolved comments
          </p>
          <p className="text-[11px] text-slate-500 max-w-xs">
            Comments marked as resolved will be archived here and hidden from the canvas.
          </p>
        </>
      )}
    </div>
  );
};
