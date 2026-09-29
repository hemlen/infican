import React, { useState, useRef } from "react";
import { CornerDownRight, MessageSquare, CheckCircle2, RotateCcw, Send } from "lucide-react";

interface CommentReplyFormProps {
  currentUser: string;
  onSubmitReply: (content: string) => void;
  replyCount: number;
  status: "open" | "resolved";
  onToggleResolve: () => void;
}

export const CommentReplyForm: React.FC<CommentReplyFormProps> = ({
  currentUser,
  onSubmitReply,
  replyCount,
  status,
  onToggleResolve,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed) return;
    onSubmitReply(trimmed);
    setReplyText("");
    setIsReplying(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsReplying(false);
      setReplyText("");
    }
  };

  return (
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
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors py-1 cursor-pointer font-medium"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              Reply
            </button>

            {replyCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                <MessageSquare className="w-2.5 h-2.5 text-blue-400" />
                <span>{replyCount}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleResolve}
            className={`text-[11px] transition-colors flex items-center gap-1 cursor-pointer ${
              status === "open"
                ? "text-slate-400 hover:text-emerald-400"
                : "text-slate-400 hover:text-blue-400"
            }`}
          >
            {status === "open" ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Resolve
              </>
            ) : (
              <>
                <RotateCcw className="w-3 h-3" />
                Reopen
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Replying as <strong className="text-slate-200">{currentUser}</strong>
            </span>
            <span className="text-[10px] text-slate-500">Ctrl+Enter to send</span>
          </div>

          <textarea
            ref={inputRef}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a reply..."
            rows={2}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none shadow-inner"
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
              onClick={() => handleSubmit()}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
