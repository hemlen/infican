import React, { useState } from "react";
import type { CommentThread } from "../../../types/comment";
import {
  getInitials,
  formatRelativeTime,
  formatFullDate,
} from "../../../utils/comment";
import { InlineCommentEditor } from "../editor/InlineCommentEditor";
import { CommentReplyList } from "./CommentReplyList";
import { CommentReplyForm } from "./CommentReplyForm";
import { Trash2, MapPin, Pencil } from "lucide-react";

interface CommentThreadCardProps {
  thread: CommentThread;
  isActive: boolean;
  currentUser: string;
  onSelect: (threadId: string) => void;
  onToggleResolve: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onEditThread?: (threadId: string, content: string) => void;
  onAddReply: (threadId: string, content: string) => void;
  onDeleteReply: (threadId: string, replyId: string) => void;
  onEditReply?: (threadId: string, replyId: string, content: string) => void;
  onFocusPin?: (position: { x: number; y: number }, zoom?: number) => void;
}

export const CommentThreadCard: React.FC<CommentThreadCardProps> = ({
  thread,
  isActive,
  currentUser,
  onSelect,
  onToggleResolve,
  onDeleteThread,
  onEditThread,
  onAddReply,
  onDeleteReply,
  onEditReply,
  onFocusPin,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div
      onClick={() => onSelect(thread.id)}
      className={`rounded-xl border transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-slate-900/90 border-blue-500/70 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
          : "bg-slate-900/40 border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/60"
      } p-3.5 mb-3`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-7 h-7 rounded-full ${thread.avatarColor} text-white font-medium text-xs flex items-center justify-center shrink-0 shadow-sm`}
          >
            {getInitials(thread.author)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-200 truncate">
                {thread.author}
              </span>
              {thread.status === "resolved" && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-medium shrink-0">
                  Resolved
                </span>
              )}
            </div>
            <span
              className="text-[10px] text-slate-400 block"
              title={formatFullDate(thread.createdAt)}
            >
              {formatRelativeTime(thread.createdAt)}
            </span>
          </div>
        </div>

        {/* Prevent toolbar clicks from bubbling to card selection */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {onFocusPin && thread.status === "open" && (
            <button
              type="button"
              onClick={() => onFocusPin(thread.position, thread.zoom)}
              title="Zoom camera to comment location"
              className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
          )}

          {onEditThread && (
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              title="Edit Comment"
              className={`p-1 rounded transition-colors cursor-pointer ${
                isEditing
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-slate-400 hover:text-blue-400 hover:bg-slate-800/80"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onDeleteThread(thread.id)}
            title="Delete Thread"
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="pl-9 pr-1">
          <InlineCommentEditor
            initialValue={thread.content}
            rows={3}
            onSave={(content) => {
              if (onEditThread) onEditThread(thread.id, content);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <p className="text-xs text-slate-200 leading-relaxed break-words whitespace-pre-wrap pl-9 pr-1">
          {thread.content}
        </p>
      )}

      <CommentReplyList
        replies={thread.replies}
        onEditReply={
          onEditReply
            ? (replyId, content) => onEditReply(thread.id, replyId, content)
            : undefined
        }
        onDeleteReply={(replyId) => onDeleteReply(thread.id, replyId)}
      />

      <CommentReplyForm
        currentUser={currentUser}
        replyCount={thread.replies.length}
        status={thread.status}
        onSubmitReply={(content) => onAddReply(thread.id, content)}
        onToggleResolve={() => onToggleResolve(thread.id)}
      />
    </div>
  );
};
