import type { CommentThread } from "../types/comment";

const STORAGE_KEY = "infican_comments_v1";
const USERNAME_KEY = "infican_username_v1";

export const INITIAL_DEMO_THREADS: CommentThread[] = [
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

/**
 * Validates and sanitizes a raw thread array from localStorage.
 */
function sanitizeThreads(data: unknown[]): CommentThread[] {
  return data
    .filter((t): t is Record<string, any> => t !== null && typeof t === "object")
    .map((t) => ({
      id: String(t.id || `thread-${Date.now()}`),
      author: String(t.author || "Anonymous"),
      avatarColor: String(t.avatarColor || "bg-blue-500"),
      content: String(t.content || ""),
      createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
      zoom: typeof t.zoom === "number" && !isNaN(t.zoom) && t.zoom > 0 ? t.zoom : 1,
      position: {
        x: typeof t.position?.x === "number" && !isNaN(t.position.x) ? t.position.x : 0,
        y: typeof t.position?.y === "number" && !isNaN(t.position.y) ? t.position.y : 0,
      },
      status: t.status === "resolved" ? "resolved" : "open",
      replies: Array.isArray(t.replies)
        ? t.replies.map((r: any) => ({
            id: String(r.id || `reply-${Date.now()}`),
            author: String(r.author || "Anonymous"),
            avatarColor: String(r.avatarColor || "bg-blue-500"),
            content: String(r.content || ""),
            createdAt: typeof r.createdAt === "number" ? r.createdAt : Date.now(),
          }))
        : [],
    }));
}

export function loadStoredThreads(): CommentThread[] {
  if (typeof window === "undefined") return INITIAL_DEMO_THREADS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return sanitizeThreads(parsed);
      }
    }
  } catch (error) {
    console.error("Failed to load comments from localStorage:", error);
  }
  return INITIAL_DEMO_THREADS;
}

export function saveStoredThreads(threads: CommentThread[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch (error) {
    console.error("Failed to save comments to localStorage:", error);
  }
}

export function loadStoredUsername(): string {
  if (typeof window === "undefined") return "You";
  try {
    return localStorage.getItem(USERNAME_KEY) || "You";
  } catch {
    return "You";
  }
}

export function saveStoredUsername(username: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USERNAME_KEY, username);
  } catch (error) {
    console.error("Failed to save username to localStorage:", error);
  }
}
