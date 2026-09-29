import React, { useState } from "react";
import { User, Check, X } from "lucide-react";

interface CommentUserProfileProps {
  currentUser: string;
  onUpdateUsername: (name: string) => void;
}

export const CommentUserProfile: React.FC<CommentUserProfileProps> = ({
  currentUser,
  onUpdateUsername,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed) {
      onUpdateUsername(trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNameInput(currentUser);
    setIsEditing(false);
  };

  return (
    <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/50 flex items-center justify-between text-[11px]">
      <span className="text-slate-400">Commenting as:</span>
      {!isEditing ? (
        <button
          type="button"
          onClick={() => {
            setNameInput(currentUser);
            setIsEditing(true);
          }}
          className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors"
          title="Click to change your username"
        >
          <User className="w-3 h-3" />
          <span>{currentUser}</span>
        </button>
      ) : (
        <form onSubmit={handleSave} className="flex items-center gap-1">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-28 bg-slate-950 border border-blue-500 rounded px-1.5 py-0.5 text-[11px] text-slate-200 focus:outline-none"
            autoFocus
            maxLength={25}
          />
          <button
            type="submit"
            className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
            title="Save username"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Cancel"
          >
            <X className="w-3 h-3" />
          </button>
        </form>
      )}
    </div>
  );
};
