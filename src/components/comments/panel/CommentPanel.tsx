import React, { useEffect, useRef } from "react";
import type { UseCommentsReturn } from "../../../hooks/useComments";
import { CommentThreadCard } from "../thread/CommentThreadCard";
import { CommentPanelTrigger } from "./CommentPanelTrigger";
import { CommentPanelHeader } from "./CommentPanelHeader";
import { CommentUserProfile } from "./CommentUserProfile";
import { CommentFilterTabs } from "./CommentFilterTabs";
import { CommentDraftCard } from "./CommentDraftCard";
import { CommentEmptyState } from "./CommentEmptyState";

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
    resetToDemo,
    openCount,
    resolvedCount,
  } = comments;

  const threadListRef = useRef<HTMLDivElement | null>(null);

  // Scroll to active card when selected from canvas pin; "nearest" prevents jarring shifts if already in view
  useEffect(() => {
    if (!activeThreadId) return;
    const cardEl = document.getElementById(`thread-card-${activeThreadId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeThreadId]);

  if (!isPanelOpen) {
    return (
      <CommentPanelTrigger
        openCount={openCount}
        onOpen={() => setIsPanelOpen(true)}
      />
    );
  }

  const filteredThreads = threads.filter((t) => t.status === activeFilter);

  return (
    <aside
      className="fixed top-0 right-0 h-full w-84 sm:w-96 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800/80 shadow-2xl flex flex-col z-40 transition-transform duration-200 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <CommentPanelHeader
        totalCount={threads.length}
        isPlacingComment={isPlacingComment}
        onTogglePlacing={() => {
          if (isPlacingComment) {
            cancelPlacing();
          } else {
            startPlacingComment();
          }
        }}
        onClose={() => setIsPanelOpen(false)}
      />

      <CommentUserProfile
        currentUser={currentUser}
        onUpdateUsername={setCurrentUser}
      />

      <CommentFilterTabs
        activeFilter={activeFilter}
        openCount={openCount}
        resolvedCount={resolvedCount}
        onSelectFilter={setActiveFilter}
      />

      <div ref={threadListRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {draftPosition && (
          <CommentDraftCard
            currentUser={currentUser}
            onSubmit={(content) => {
              createThread(draftPosition, content, currentUser, draftZoom ?? undefined);
            }}
            onCancel={cancelDraft}
          />
        )}

        {filteredThreads.length === 0 && !draftPosition ? (
          <CommentEmptyState
            activeFilter={activeFilter}
            onStartPlacing={startPlacingComment}
            onResetDemo={resetToDemo}
          />
        ) : (
          filteredThreads.map((thread) => (
            <div key={thread.id} id={`thread-card-${thread.id}`}>
              <CommentThreadCard
                thread={thread}
                isActive={activeThreadId === thread.id}
                currentUser={currentUser}
                onSelect={setActiveThreadId}
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

      <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Press Esc to cancel</span>
        <div className="flex items-center gap-1.5">
          <span>Saved locally</span>
          <span>•</span>
          <button
            type="button"
            onClick={resetToDemo}
            className="text-slate-400 hover:text-blue-400 underline underline-offset-2 transition-colors cursor-pointer"
            title="Reset comments to default mock threads"
          >
            Reset demo
          </button>
        </div>
      </div>
    </aside>
  );
};
