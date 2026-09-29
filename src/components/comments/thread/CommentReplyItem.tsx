import React, { useState } from "react";
import type { CommentReply } from "../../../types/comment";
import { getInitials, formatRelativeTime, formatFullDate } from "../../../utils/comment";
import { InlineCommentEditor } from "../editor/InlineCommentEditor";
import { Pencil, Trash2 } from "lucide-react";

interface CommentReplyItemProps {
  reply: CommentReply;
  onEdit?: (replyId: string, content: string) => void;
  onDelete: (replyId: string) => void;
}

export const CommentReplyItem: React.FC<CommentReplyItemProps> = ({
  reply,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div
      className="group/reply relative flex items-start gap-2 bg-slate-950/40 rounded-lg p-2 border border-slate-800/60"
      onClick={(e) => {
        if (isEditing) e.stopPropagation();
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

        {isEditing ? (
          <InlineCommentEditor
            initialValue={reply.content}
            rows={2}
            size="sm"
            onSave={(updatedText) => {
              if (onEdit) onEdit(reply.id, updatedText);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <p className="text-xs text-slate-300 leading-relaxed break-words whitespace-pre-wrap mt-0.5">
            {reply.content}
          </p>
        )}
      </div>

      {/* Action buttons on reply hover */}
      {!isEditing && (
        <div className="opacity-0 group-hover/reply:opacity-100 flex items-center gap-0.5 transition-opacity absolute top-1.5 right-1.5">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
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
              onDelete(reply.id);
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
};
