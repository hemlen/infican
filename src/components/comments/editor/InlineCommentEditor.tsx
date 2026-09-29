import React, { useState } from "react";
import { Check } from "lucide-react";

interface InlineCommentEditorProps {
  initialValue: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
  size?: "sm" | "md";
}

export const InlineCommentEditor: React.FC<InlineCommentEditorProps> = ({
  initialValue,
  onSave,
  onCancel,
  placeholder = "Edit comment...",
  rows = 3,
  autoFocus = true,
  size = "md",
}) => {
  const [text, setText] = useState(initialValue);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const isSmall = size === "sm";

  return (
    <div
      className={isSmall ? "mt-1" : "my-1"}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        placeholder={placeholder}
        rows={rows}
        className={`w-full bg-slate-950/90 border border-blue-500/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none shadow-inner ${
          isSmall ? "p-1.5 text-xs" : "p-2 text-xs"
        }`}
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-slate-500">
          Ctrl+Enter to save, Esc to cancel
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-2 py-0.5 text-xs text-slate-400 hover:text-slate-200 transition-colors rounded cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!text.trim()}
            onClick={handleSave}
            className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md shadow-sm transition-colors cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
