import React, { useState, useRef, useEffect } from "react";
import { getAvatarColor, getInitials } from "../../../utils/comment";
import { Send, X } from "lucide-react";

interface CommentDraftCardProps {
  currentUser: string;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

export const CommentDraftCard: React.FC<CommentDraftCardProps> = ({
  currentUser,
  onSubmit,
  onCancel,
}) => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-blue-500/70 rounded-xl p-3.5 mb-4 shadow-xl ring-2 ring-blue-500/20 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full ${getAvatarColor(
              currentUser,
            )} text-white font-medium text-xs flex items-center justify-center shrink-0`}
          >
            {getInitials(currentUser)}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200">
              {currentUser}
            </span>
            <span className="text-[10px] text-blue-400 block font-medium">
              New Comment Pin
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
          title="Cancel comment"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Leave a comment on the canvas..."
          rows={3}
          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none shadow-inner"
        />

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Ctrl+Enter to post • Esc to cancel
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              Post
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
