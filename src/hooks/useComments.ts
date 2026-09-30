import { useState, useEffect, useCallback } from "react";
import type { Point } from "../types/canvas";
import type { CommentThread, CommentStatus, CommentReply } from "../types/comment";
import { getAvatarColor } from "../utils/comment";
import {
  loadStoredThreads,
  saveStoredThreads,
  loadStoredUsername,
  saveStoredUsername,
  resetStoredThreadsToDemo,
} from "../services/commentStorage";

export function useComments() {
  const [threads, setThreads] = useState<CommentThread[]>(loadStoredThreads);
  const [currentUser, setCurrentUser] = useState<string>(loadStoredUsername);
  const [activeFilter, setActiveFilter] = useState<CommentStatus>("open");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isPlacingComment, setIsPlacingComment] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [draftPosition, setDraftPosition] = useState<Point | null>(null);
  const [draftZoom, setDraftZoom] = useState<number | null>(null);

  useEffect(() => {
    saveStoredThreads(threads);
  }, [threads]);

  useEffect(() => {
    saveStoredUsername(currentUser);
  }, [currentUser]);

  const createThread = useCallback(
    (position: Point, content: string, customAuthor?: string, zoomLevel?: number): CommentThread => {
      const author = customAuthor?.trim() || currentUser.trim() || "Anonymous";
      const newThread: CommentThread = {
        id: `thread-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        author,
        avatarColor: getAvatarColor(author),
        content: content.trim(),
        createdAt: Date.now(),
        position,
        // Store creation zoom as baseline reference for visual scale calculations
        zoom: zoomLevel ?? draftZoom ?? 1,
        status: "open",
        replies: [],
      };

      setThreads((prev) => [newThread, ...prev]);
      setActiveFilter("open");
      setActiveThreadId(newThread.id);
      setIsPlacingComment(false);
      setDraftPosition(null);
      setDraftZoom(null);
      setIsPanelOpen(true);

      return newThread;
    },
    [currentUser, draftZoom],
  );

  const editThread = useCallback((threadId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, content: trimmed } : thread,
      ),
    );
  }, []);

  const deleteThread = useCallback(
    (threadId: string) => {
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (activeThreadId === threadId) {
        setActiveThreadId(null);
      }
    },
    [activeThreadId],
  );

  const toggleResolve = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        const nextStatus: CommentStatus = thread.status === "open" ? "resolved" : "open";
        return { ...thread, status: nextStatus };
      }),
    );
  }, []);

  const addReply = useCallback(
    (threadId: string, content: string, customAuthor?: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      const author = customAuthor?.trim() || currentUser.trim() || "Anonymous";
      const newReply: CommentReply = {
        id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        author,
        avatarColor: getAvatarColor(author),
        content: trimmed,
        createdAt: Date.now(),
      };

      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id !== threadId) return thread;
          return {
            ...thread,
            replies: [...thread.replies, newReply],
          };
        }),
      );
    },
    [currentUser],
  );

  const editReply = useCallback(
    (threadId: string, replyId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id !== threadId) return thread;
          return {
            ...thread,
            replies: thread.replies.map((reply) =>
              reply.id === replyId ? { ...reply, content: trimmed } : reply,
            ),
          };
        }),
      );
    },
    [],
  );

  const deleteReply = useCallback((threadId: string, replyId: string) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        return {
          ...thread,
          replies: thread.replies.filter((r) => r.id !== replyId),
        };
      }),
    );
  }, []);

  const startPlacingComment = useCallback(() => {
    setIsPlacingComment(true);
    setDraftPosition(null);
    setDraftZoom(null);
  }, []);

  const placeCommentAt = useCallback((position: Point, zoom?: number) => {
    setDraftPosition(position);
    setDraftZoom(zoom ?? null);
    setIsPlacingComment(false);
    setIsPanelOpen(true);
    setActiveFilter("open");
  }, []);

  const cancelDraft = useCallback(() => {
    setDraftPosition(null);
    setDraftZoom(null);
  }, []);

  const cancelPlacing = useCallback(() => {
    setIsPlacingComment(false);
    setDraftPosition(null);
    setDraftZoom(null);
  }, []);

  const selectThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId);
    setIsPanelOpen(true);
    // Switch active tab so selecting a pin automatically exposes the corresponding thread card
    setThreads((prev) => {
      const found = prev.find((t) => t.id === threadId);
      if (found) {
        setActiveFilter(found.status);
      }
      return prev;
    });
  }, []);

  const resetToDemo = useCallback(() => {
    const freshDemo = resetStoredThreadsToDemo();
    setThreads(freshDemo);
    setActiveThreadId(null);
  }, []);

  const openCount = threads.filter((t) => t.status === "open").length;
  const resolvedCount = threads.filter((t) => t.status === "resolved").length;

  return {
    threads,
    currentUser,
    setCurrentUser,
    activeFilter,
    setActiveFilter,
    activeThreadId,
    setActiveThreadId,
    selectThread,
    isPlacingComment,
    startPlacingComment,
    placeCommentAt,
    cancelPlacing,
    cancelDraft,
    isPanelOpen,
    setIsPanelOpen,
    draftPosition,
    setDraftPosition,
    draftZoom,
    setDraftZoom,
    createThread,
    editThread,
    deleteThread,
    toggleResolve,
    addReply,
    editReply,
    deleteReply,
    resetToDemo,
    openCount,
    resolvedCount,
  };
}

export type UseCommentsReturn = ReturnType<typeof useComments>;
