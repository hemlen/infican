import React, { useState } from "react";
import type { CommentReply } from "../../../types/comment";
import { CommentReplyItem } from "./CommentReplyItem";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

interface CommentReplyListProps {
  replies: CommentReply[];
  onEditReply?: (replyId: string, content: string) => void;
  onDeleteReply: (replyId: string) => void;
}

export const CommentReplyList: React.FC<CommentReplyListProps> = ({
  replies,
  onEditReply,
  onDeleteReply,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (replies.length === 0) return null;

  const hasManyReplies = replies.length > 1;
  const visibleReplies = hasManyReplies && !isExpanded ? [replies[0]] : replies;
  const hiddenCount = replies.length - visibleReplies.length;

  return (
    <div className="mt-3 pl-5 border-l-2 border-slate-800 space-y-2 ml-3">
      {visibleReplies.map((reply) => (
        <CommentReplyItem
          key={reply.id}
          reply={reply}
          onEdit={onEditReply}
          onDelete={onDeleteReply}
        />
      ))}

      {/* Expand toggle */}
      {hasManyReplies && !isExpanded && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer group mt-2 shadow-sm"
          title="Click to view all replies"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <MessageSquare className="w-3 h-3 text-blue-400" />
            <span>
              Show {hiddenCount} more {hiddenCount === 1 ? "reply" : "replies"}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* Collapse toggle */}
      {hasManyReplies && isExpanded && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
          }}
          className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-950/40 hover:bg-slate-900/80 border border-slate-800/80 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer group mt-2"
          title="Click to collapse replies"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 group-hover:-translate-y-0.5 transition-transform" />
            <span>Collapse replies</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {replies.length} total
          </span>
        </button>
      )}
    </div>
  );
};
