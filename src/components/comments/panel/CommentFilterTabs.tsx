import React from "react";
import type { CommentStatus } from "../../../types/comment";
import { MessageSquare, CheckCircle } from "lucide-react";

interface CommentFilterTabsProps {
  activeFilter: CommentStatus;
  openCount: number;
  resolvedCount: number;
  onSelectFilter: (filter: CommentStatus) => void;
}

export const CommentFilterTabs: React.FC<CommentFilterTabsProps> = ({
  activeFilter,
  openCount,
  resolvedCount,
  onSelectFilter,
}) => {
  return (
    <div className="flex border-b border-slate-800/80 bg-slate-950/50">
      <button
        type="button"
        onClick={() => onSelectFilter("open")}
        className={`flex-1 py-2.5 px-4 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
          activeFilter === "open"
            ? "border-blue-500 text-blue-400 bg-slate-900/40"
            : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
        }`}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Open</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeFilter === "open"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {openCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSelectFilter("resolved")}
        className={`flex-1 py-2.5 px-4 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
          activeFilter === "resolved"
            ? "border-emerald-500 text-emerald-400 bg-slate-900/40"
            : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
        }`}
      >
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Resolved</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeFilter === "resolved"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {resolvedCount}
        </span>
      </button>
    </div>
  );
};
