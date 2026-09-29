import React, { useState, useRef } from "react";
import type { CommentThread } from "../../types/comment";
import {
  getInitials,
  formatRelativeTime,
  formatFullDate,
} from "../../utils/comment";
import {
  CheckCircle2,
  RotateCcw,
  Trash2,
  CornerDownRight,
  Send,
  MapPin,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Pencil,
  Check,
} from "lucide-react";

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
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(thread.content);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyText, setEditReplyText] = useState("");
  const replyInputRef = useRef<HTMLTextAreaElement | null>(null);

  const hasManyReplies = thread.replies.length > 1;
  const visibleReplies =
    hasManyReplies && !isRepliesExpanded ? [thread.replies[0]] : thread.replies;
  const hiddenCount = thread.replies.length - visibleReplies.length;

  const handleReplySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim()) return;
    onAddReply(thread.id, replyText);
    setReplyText("");
    setIsReplying(false);
    setIsRepliesExpanded(true); // Auto-expand when a new reply is added
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleReplySubmit();
    }
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    if (onEditThread) {
      onEditThread(thread.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
      setEditText(thread.content);
    }
  };

  return (
    <div
      onClick={() => onSelect(thread.id)}
      className={`rounded-xl border transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-slate-900/90 border-blue-500/70 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
          : "bg-slate-900/40 border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/60"
      } p-3.5 mb-3`}
    >
      {/* Thread Header */}
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

        {/* Quick action buttons */}
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
              onClick={() => {
                setIsEditing((prev) => {
                  if (!prev) setEditText(thread.content);
                  return !prev;
                });
              }}
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

      {/* Main Comment Content / Inline Edit */}
      {isEditing ? (
        <div className="pl-9 pr-1 my-1" onClick={(e) => e.stopPropagation()}>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
            autoFocus
            rows={3}
            className="w-full bg-slate-950/90 border border-blue-500/80 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none shadow-inner"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-slate-500">
              Ctrl+Enter to save, Esc to cancel
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(thread.content);
                }}
                className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!editText.trim()}
                onClick={handleSaveEdit}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md shadow-sm transition-colors cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-200 leading-relaxed break-words whitespace-pre-wrap pl-9 pr-1">
          {thread.content}
        </p>
      )}

      {/* Nested Replies Section */}
      {thread.replies.length > 0 && (
        <div className="mt-3 pl-5 border-l-2 border-slate-800 space-y-2 ml-3">
          {/* Render visible replies (first reply when collapsed, or all replies when expanded) */}
          {visibleReplies.map((reply) => {
            const isEditingThisReply = editingReplyId === reply.id;
            return (
              <div
                key={reply.id}
                className="group/reply relative flex items-start gap-2 bg-slate-950/40 rounded-lg p-2 border border-slate-800/60"
                onClick={(e) => {
                  if (isEditingThisReply) e.stopPropagation();
                }}
              >
                <div
                  className={`w-5 h-5 rounded-full ${reply.avatarColor} text-white font-medium text-[10px] flex items-center justify-center shrink-0 mt-0.5`}
                >
                  {getInitials(reply.author)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold text-slate-300 truncate">
                      {reply.author}
                    </span>
                    <span
                      className="text-[9px] text-slate-500 shrink-0"
                      title={formatFullDate(reply.createdAt)}
                    >
                      {formatRelativeTime(reply.createdAt)}
                    </span>
                  </div>

                  {isEditingThisReply ? (
                    <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                      <textarea
                        value={editReplyText}
                        onChange={(e) => setEditReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            if (editReplyText.trim() && onEditReply) {
                              onEditReply(
                                thread.id,
                                reply.id,
                                editReplyText.trim(),
                              );
                              setEditingReplyId(null);
                            }
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setEditingReplyId(null);
                          }
                        }}
                        autoFocus
                        rows={2}
                        className="w-full bg-slate-950 border border-blue-500/80 rounded-md p-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none shadow-inner"
                      />
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => setEditingReplyId(null)}
                          className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors rounded cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={!editReplyText.trim()}
                          onClick={() => {
                            if (editReplyText.trim() && onEditReply) {
                              onEditReply(
                                thread.id,
                                reply.id,
                                editReplyText.trim(),
                              );
                              setEditingReplyId(null);
                            }
                          }}
                          className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-medium rounded shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-2.5 h-2.5" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed break-words whitespace-pre-wrap mt-0.5">
                      {reply.content}
                    </p>
                  )}
                </div>

                {/* Actions on reply hover (edit & delete) */}
                {!isEditingThisReply && (
                  <div className="opacity-0 group-hover/reply:opacity-100 flex items-center gap-0.5 transition-opacity absolute top-1.5 right-1.5">
                    {onEditReply && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingReplyId(reply.id);
                          setEditReplyText(reply.content);
                        }}
                        title="Edit Reply"
                        className="p-0.5 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteReply(thread.id, reply.id);
                      }}
                      title="Delete Reply"
                      className="p-0.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Expand more replies button below the first reply when collapsed */}
          {hasManyReplies && !isRepliesExpanded && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsRepliesExpanded(true);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-950/70 hover:bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer group mt-2 shadow-sm"
              title="Click to view all replies"
            >
              <div className="flex items-center gap-1.5 font-medium">
                <MessageSquare className="w-3 h-3 text-blue-400" />
                <span>
                  Show {hiddenCount} more{" "}
                  {hiddenCount === 1 ? "reply" : "replies"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 group-hover:translate-y-0.5 transition-transform" />
            </button>
          )}

          {/* Collapse replies button when expanded */}
          {hasManyReplies && isRepliesExpanded && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsRepliesExpanded(false);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-950/40 hover:bg-slate-900/80 border border-slate-800/80 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer group mt-2"
              title="Click to collapse replies"
            >
              <div className="flex items-center gap-1.5 font-medium">
                <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 group-hover:-translate-y-0.5 transition-transform" />
                <span>Collapse replies</span>
              </div>
              <span className="text-[10px] text-slate-500">
                {thread.replies.length} total
              </span>
            </button>
          )}
        </div>
      )}

      {/* Reply Trigger or Reply Input Form */}
      <div
        className="mt-3 pl-3 pt-2 border-t border-slate-800/70"
        onClick={(e) => e.stopPropagation()}
      >
        {!isReplying ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsReplying(true);
                  setTimeout(() => replyInputRef.current?.focus(), 50);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors py-1 cursor-pointer font-medium"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                Reply
              </button>

              {thread.replies.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsRepliesExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-400 bg-slate-800/60 hover:bg-slate-800 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                  title={
                    isRepliesExpanded ? "Collapse replies" : "Expand replies"
                  }
                >
                  <MessageSquare className="w-2.5 h-2.5 text-blue-400" />
                  <span>{thread.replies.length}</span>
                  {hasManyReplies &&
                    (isRepliesExpanded ? (
                      <ChevronUp className="w-2.5 h-2.5" />
                    ) : (
                      <ChevronDown className="w-2.5 h-2.5" />
                    ))}
                </button>
              )}
            </div>

            {thread.status === "open" ? (
              <button
                type="button"
                onClick={() => onToggleResolve(thread.id)}
                className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3" />
                Resolve
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleResolve(thread.id)}
                className="text-[11px] text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reopen
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Replying as{" "}
                <strong className="text-slate-200">{currentUser}</strong>
              </span>
              <span className="text-[10px] text-slate-500">
                Ctrl+Enter to send
              </span>
            </div>
            <textarea
              ref={replyInputRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleReplyKeyDown}
              placeholder="Write a reply..."
              rows={2}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsReplying(false);
                  setReplyText("");
                }}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!replyText.trim()}
                onClick={() => handleReplySubmit()}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                Reply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
