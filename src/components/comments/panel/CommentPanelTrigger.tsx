import React from "react";
import { MessageSquare } from "lucide-react";

interface CommentPanelTriggerProps {
  openCount: number;
  onOpen: () => void;
}

export const CommentPanelTrigger: React.FC<CommentPanelTriggerProps> = ({
  openCount,
  onOpen,
}) => {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="fixed top-4 right-4 z-40 flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-850 backdrop-blur-md border border-slate-700/80 text-slate-200 text-xs font-medium rounded-xl shadow-xl transition-all hover:scale-105 cursor-pointer"
      title="Open Comments Panel"
    >
      <MessageSquare className="w-4 h-4 text-blue-400" />
      <span>Comments</span>
      {openCount > 0 && (
        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {openCount}
        </span>
      )}
    </button>
  );
};
