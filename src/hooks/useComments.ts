import { useState, useEffect, useCallback } from "react";
import type { Point } from "../types/canvas";
import type { CommentThread, CommentStatus, CommentReply } from "../types/comment";
import { getAvatarColor } from "../utils/comment";

const STORAGE_KEY = "infican_comments_v1";
const USERNAME_KEY = "infican_username_v1";

const INITIAL_DEMO_THREADS: CommentThread[] = [
  {
    id: "thread-1",
    author: "Alex Morgan",
    avatarColor: "bg-blue-500",
    content: "We should consider scaling this red accent block to match the primary grid alignment.",
    createdAt: Date.now() - 1000 * 60 * 35, // 35 minutes ago
    position: { x: 100, y: -20 },
    zoom: 1.5,
    status: "open",
    replies: [
      {
        id: "reply-1",
        author: "Sarah Chen",
        avatarColor: "bg-emerald-500",
        content: "Agreed! Let's align it with the 40px grid baseline.",
        createdAt: Date.now() - 1000 * 60 * 25,
      },
      {
        id: "reply-2",
        author: "Devin Taylor",
        avatarColor: "bg-amber-500",
        content: "I tested it with 2x zoom and it feels much more balanced.",
        createdAt: Date.now() - 1000 * 60 * 15,
      },
      {
        id: "reply-3",
        author: "Alex Morgan",
        avatarColor: "bg-blue-500",
        content: "Sounds great. Updating the geometry now.",
        createdAt: Date.now() - 1000 * 60 * 5,
      },
    ],
  },
  {
    id: "thread-2",
    author: "Jordan Lee",
    avatarColor: "bg-purple-500",
    content: "Origin crosshair (0,0) looks crisp. Ready for the vector exporter.",
    createdAt: Date.now() - 1000 * 60 * 180, // 3 hours ago
    position: { x: 0, y: 30 },
    zoom: 1,
    status: "resolved",
    replies: [],
  },
];

export function useComments() {
  const [threads, setThreads] = useState<CommentThread[]>(() => {
    if (typeof window === "undefined") return INITIAL_DEMO_THREADS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((t) => ({
            ...t,
            zoom: typeof t.zoom === "number" && !isNaN(t.zoom) && t.zoom > 0 ? t.zoom : 1,
            position: {
              x: typeof t.position?.x === "number" && !isNaN(t.position.x) ? t.position.x : 0,
              y: typeof t.position?.y === "number" && !isNaN(t.position.y) ? t.position.y : 0,
            },
            replies: Array.isArray(t.replies) ? t.replies : [],
          }));
        }
      }
    } catch (e) {
      console.error("Failed to load comments from localStorage:", e);
    }
    return INITIAL_DEMO_THREADS;
  });

  const [currentUser, setCurrentUser] = useState<string>(() => {
    if (typeof window === "undefined") return "You";
    return localStorage.getItem(USERNAME_KEY) || "You";
  });

  const [activeFilter, setActiveFilter] = useState<CommentStatus>("open");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isPlacingComment, setIsPlacingComment] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [draftPosition, setDraftPosition] = useState<Point | null>(null);
  const [draftZoom, setDraftZoom] = useState<number | null>(null);

  // Sync threads to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch (e) {
      console.error("Failed to save comments to localStorage:", e);
    }
  }, [threads]);

  // Sync currentUser to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USERNAME_KEY, currentUser);
    } catch (e) {
      console.error("Failed to save username to localStorage:", e);
    }
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

  const addReply = useCallback(
    (threadId: string, content: string, customAuthor?: string) => {
      if (!content.trim()) return;
      const author = customAuthor?.trim() || currentUser.trim() || "Anonymous";
      const newReply: CommentReply = {
        id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        author,
        avatarColor: getAvatarColor(author),
        content: content.trim(),
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

  const toggleResolve = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        const nextStatus: CommentStatus = thread.status === "open" ? "resolved" : "open";
        return {
          ...thread,
          status: nextStatus,
        };
      }),
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

  const editThread = useCallback((threadId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, content: trimmed } : thread,
      ),
    );
  }, []);

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
    // Find thread and update tab if necessary
    setThreads((prev) => {
      const found = prev.find((t) => t.id === threadId);
      if (found) {
        setActiveFilter(found.status);
      }
      return prev;
    });
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
    addReply,
    toggleResolve,
    deleteThread,
    deleteReply,
    editThread,
    editReply,
    openCount,
    resolvedCount,
  };
}

export type UseCommentsReturn = ReturnType<typeof useComments>;
