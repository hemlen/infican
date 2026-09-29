import React from "react";
import type { CommentThread } from "../../../types/comment";
import { formatRelativeTime } from "../../../utils/comment";
import { MessageSquare } from "lucide-react";

interface CommentPinTooltipProps {
  thread: CommentThread;
  scale: number;
}

export const CommentPinTooltip: React.FC<CommentPinTooltipProps> = ({
  thread,
  scale,
}) => {
  const replyCount = thread.replies.length;

  return (
    <div
      className="absolute w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-slate-100 rounded-xl p-3 shadow-2xl text-left pointer-events-none z-10 animate-in fade-in zoom-in-95 duration-100"
      style={{
        // Align card so the scaled canvas pin anchors directly over its top-left corner
        left: `${-16 * scale - 10}px`,
        top: `${-38 * scale - 10}px`,
      }}
    >
      {/* Dynamic left padding reserves clearance for the floating pin regardless of its zoom scale */}
      <div
        className="flex items-start justify-between gap-1 mb-1.5"
        style={{
          paddingLeft: `${Math.max(32 * scale + 6, 36)}px`,
          minHeight: `${Math.min(Math.max(38 * scale - 6, 28), 54)}px`,
        }}
      >
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-xs truncate text-slate-200 block">
            {thread.author}
          </span>
          <span className="text-slate-400 text-[10px] block">
            {formatRelativeTime(thread.createdAt)}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed break-words whitespace-pre-wrap">
        {thread.content}
      </p>

      {replyCount > 0 && (
        <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-blue-400 flex items-center gap-1 font-medium">
          <MessageSquare className="w-3 h-3" />
          {replyCount} {replyCount === 1 ? "reply" : "replies"}
        </div>
      )}
    </div>
  );
};
