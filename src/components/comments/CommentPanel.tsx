import React, { useRef, useEffect, useState } from "react";
import type { UseCommentsReturn } from "../../hooks/useComments";
import { CommentThreadCard } from "./CommentThreadCard";
import {
  Plus,
  MessageSquare,
  CheckCircle,
  X,
  ChevronRight,
  User,
  Send,
} from "lucide-react";

interface CommentPanelProps {
  comments: UseCommentsReturn;
  onFocusPin?: (position: { x: number; y: number }, zoom?: number) => void;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({
  comments,
  onFocusPin,
}) => {
  const {
    threads,
    currentUser,
    setCurrentUser,
    activeFilter,
    setActiveFilter,
    activeThreadId,
    setActiveThreadId,
    isPlacingComment,
    startPlacingComment,
    cancelPlacing,
    draftPosition,
    draftZoom,
    cancelDraft,
    createThread,
    isPanelOpen,
    setIsPanelOpen,
    toggleResolve,
    deleteThread,
    editThread,
    editReply,
    addReply,
    deleteReply,
    openCount,
    resolvedCount,
  } = comments;

  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userNameInput, setUserNameInput] = useState(currentUser);
  const [panelDraftText, setPanelDraftText] = useState("");
  const panelDraftInputRef = useRef<HTMLTextAreaElement | null>(null);
  const threadListRef = useRef<HTMLDivElement | null>(null);

  // Sync draft focus
  useEffect(() => {
    if (draftPosition) {
      setPanelDraftText("");
      setTimeout(() => panelDraftInputRef.current?.focus(), 50);
    }
  }, [draftPosition]);

  const handlePanelDraftSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!panelDraftText.trim() || !draftPosition) return;
    createThread(draftPosition, panelDraftText, currentUser, draftZoom ?? undefined);
    setPanelDraftText("");
  };

  // Filter threads by current tab
  const filteredThreads = threads.filter((t) => t.status === activeFilter);

  // Scroll active thread into view
  useEffect(() => {
    if (!activeThreadId) return;
    const cardEl = document.getElementById(`thread-card-${activeThreadId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeThreadId]);

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (userNameInput.trim()) {
      setCurrentUser(userNameInput.trim());
    }
    setIsEditingUser(false);
  };

  if (!isPanelOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsPanelOpen(true)}
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
  }

  return (
    <aside
      className="fixed top-0 right-0 h-full w-84 sm:w-96 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800/80 shadow-2xl flex flex-col z-40 transition-transform duration-200 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-100 tracking-wide">
            Comments
          </h2>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {threads.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Add comment button */}
          <button
            type="button"
            onClick={() => {
              if (isPlacingComment) {
                cancelPlacing();
              } else {
                startPlacingComment();
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isPlacingComment
                ? "bg-blue-600 text-white ring-2 ring-blue-400/40 animate-pulse"
                : "bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white"
            }`}
            title={isPlacingComment ? "Cancel placement" : "Add comment to canvas"}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isPlacingComment ? "Placing..." : "Add"}</span>
          </button>

          {/* Close Panel Button */}
          <button
            type="button"
            onClick={() => setIsPanelOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            title="Collapse Panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User profile identifier bar */}
      <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/50 flex items-center justify-between text-[11px]">
        {isEditingUser ? (
          <form onSubmit={handleSaveUsername} className="flex items-center gap-1.5 w-full">
            <input
              type="text"
              value={userNameInput}
              onChange={(e) => setUserNameInput(e.target.value)}
              placeholder="Your name"
              autoFocus
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-medium"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditingUser(false)}
              className="px-1.5 py-0.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          </form>
        ) : (
          <>
            <span className="text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-500" />
              Posting as: <strong className="text-slate-200">{currentUser}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setUserNameInput(currentUser);
                setIsEditingUser(true);
              }}
              className="text-blue-400 hover:text-blue-300 text-[10px] underline cursor-pointer"
            >
              Change
            </button>
          </>
        )}
      </div>

      {/* Placed Mode Notification Banner */}
      {isPlacingComment && (
        <div className="px-4 py-2.5 bg-blue-500/10 border-b border-blue-500/20 text-blue-300 text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>Click anywhere on canvas to anchor pin</span>
          </div>
          <button
            type="button"
            onClick={cancelPlacing}
            className="text-blue-300 hover:text-white p-0.5 cursor-pointer"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tab Switcher: Open vs Resolved */}
      <div className="px-4 pt-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveFilter("open")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeFilter === "open"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeFilter === "open"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {openCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("resolved")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeFilter === "resolved"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resolved</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeFilter === "resolved"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {resolvedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Threads List */}
      <div
        ref={threadListRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {/* Panel Draft Form if user clicked canvas */}
        {activeFilter === "open" && draftPosition && (
          <div className="mb-3 p-3 bg-blue-950/40 border border-blue-500/60 rounded-xl shadow-lg ring-1 ring-blue-500/20 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-blue-300 font-medium mb-1.5">
              <span className="flex items-center gap-1.5 font-medium">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                New Comment
              </span>
              <button
                type="button"
                onClick={cancelDraft}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Cancel draft"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <form onSubmit={handlePanelDraftSubmit} className="space-y-2">
              <textarea
                ref={panelDraftInputRef}
                value={panelDraftText}
                onChange={(e) => setPanelDraftText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handlePanelDraftSubmit();
                  } else if (e.key === "Escape") {
                    cancelDraft();
                  }
                }}
                placeholder="Type your comment... (Ctrl+Enter to post)"
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500">Esc to cancel</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={cancelDraft}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!panelDraftText.trim()}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    Post
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {filteredThreads.length === 0 && !draftPosition ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            {activeFilter === "open" ? (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-medium text-slate-300 mb-1">
                  No open comments
                </p>
                <p className="text-[11px] text-slate-500 mb-4 max-w-xs">
                  Click the "+" button above or press below to drop a pin on the canvas.
                </p>
                <button
                  type="button"
                  onClick={startPlacingComment}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add comment
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500/70" />
                </div>
                <p className="text-xs font-medium text-slate-300 mb-1">
                  No resolved comments
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Comments marked as resolved will be archived here and hidden from the canvas.
                </p>
              </>
            )}
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <div key={thread.id} id={`thread-card-${thread.id}`}>
              <CommentThreadCard
                thread={thread}
                isActive={activeThreadId === thread.id}
                currentUser={currentUser}
                onSelect={(id) => setActiveThreadId(id)}
                onToggleResolve={toggleResolve}
                onDeleteThread={deleteThread}
                onEditThread={editThread}
                onEditReply={editReply}
                onAddReply={addReply}
                onDeleteReply={deleteReply}
                onFocusPin={onFocusPin}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Press Esc to cancel placement</span>
        <span>Saved locally</span>
      </div>
    </aside>
  );
};
