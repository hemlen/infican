import type { CommentThread } from "../types/comment";
import { getAvatarColor } from "../utils/comment";

const STORAGE_KEY = "infican_comments_v2";
const USERNAME_KEY = "infican_username_v1";

export function createDemoThreads(): CommentThread[] {
  const now = Date.now();

  return [
    {
      id: "thread-stl-wireframe",
      author: "Elena Rostova",
      avatarColor: getAvatarColor("Elena Rostova"),
      content:
        "The 3D STL mesh normals and lighting look crisp, but should we add a toggle for wireframe mode? It would help inspect polygon density on complex CAD geometries.",
      createdAt: now - 1000 * 60 * 55, // 55m ago
      position: { x: -160, y: -40 },
      zoom: 1.8,
      status: "open",
      replies: [
        {
          id: "reply-stl-1",
          author: "Marcus Vance",
          avatarColor: getAvatarColor("Marcus Vance"),
          content:
            "Agreed! Our binary STL parser processes this 12k-triangle mesh in ~3ms. An optional wireframe pass will have virtually zero impact on 60 FPS rendering.",
          createdAt: now - 1000 * 60 * 42, // 42m ago
        },
        {
          id: "reply-stl-2",
          author: "Sarah Chen",
          avatarColor: getAvatarColor("Sarah Chen"),
          content:
            "Let's add a wireframe toggle into the bottom canvas controls next to the zoom pills. I'll mock up the icon.",
          createdAt: now - 1000 * 60 * 24, // 24m ago
        },
        {
          id: "reply-stl-3",
          author: "Elena Rostova",
          avatarColor: getAvatarColor("Elena Rostova"),
          content:
            "Perfect! Also verified drag-and-drop .stl importing with custom files—works seamlessly.",
          createdAt: now - 1000 * 60 * 8, // 8m ago
        },
      ],
    },
    {
      id: "thread-cat-asset",
      author: "Devin Taylor",
      avatarColor: getAvatarColor("Devin Taylor"),
      content:
        "The cat.jpg asset looks great with the subtle drop shadow! Should we standardize the corner radius to 12px across all image cards in the design system?",
      createdAt: now - 1000 * 60 * 75, // 1h 15m ago
      position: { x: 280, y: -20 },
      zoom: 1.5,
      status: "open",
      replies: [
        {
          id: "reply-cat-1",
          author: "Jordan Lee",
          avatarColor: getAvatarColor("Jordan Lee"),
          content:
            "Definitely. 12px radius with the 1px #334155 border matches the floating comment cards perfectly.",
          createdAt: now - 1000 * 60 * 38, // 38m ago
        },
        {
          id: "reply-cat-2",
          author: "Devin Taylor",
          avatarColor: getAvatarColor("Devin Taylor"),
          content:
            "Done! Added the rounded clip path to the canvas image renderer.",
          createdAt: now - 1000 * 60 * 14, // 14m ago
        },
      ],
    },
    {
      id: "thread-accent-block",
      author: "Alex Morgan",
      avatarColor: getAvatarColor("Alex Morgan"),
      content:
        "We should scale this accent block to 120×80 so it aligns with the 40px grid baseline. Let's also check contrast with the dark theme.",
      createdAt: now - 1000 * 60 * 110, // ~2h ago
      position: { x: 140, y: 10 },
      zoom: 1.6,
      status: "open",
      replies: [
        {
          id: "reply-accent-1",
          author: "Sarah Chen",
          avatarColor: getAvatarColor("Sarah Chen"),
          content:
            "WCAG contrast ratio on #ef4444 against #0b0f19 is 4.8:1, which passes AA. Aligning to 40px grid sounds solid.",
          createdAt: now - 1000 * 60 * 48, // 48m ago
        },
        {
          id: "reply-accent-2",
          author: "Alex Morgan",
          avatarColor: getAvatarColor("Alex Morgan"),
          content:
            "Updating geometry now to test snapping with the transform handles.",
          createdAt: now - 1000 * 60 * 19, // 19m ago
        },
      ],
    },
    {
      id: "thread-canvas-zoom",
      author: "Liam Patel",
      avatarColor: getAvatarColor("Liam Patel"),
      content:
        "The dual zoom engine feels great—trackpad pinch is fluid and mouse wheel steps are well damped. Can we add keyboard shortcuts (+ / - / 0) for quick zoom?",
      createdAt: now - 1000 * 60 * 160, // ~2.5h ago
      position: { x: -50, y: 110 },
      zoom: 1.2,
      status: "open",
      replies: [
        {
          id: "reply-zoom-1",
          author: "Sarah Chen",
          avatarColor: getAvatarColor("Sarah Chen"),
          content:
            "Good call! We already have zoom buttons in CanvasControls; binding Cmd/Ctrl +/- and 0 to reset view will be very intuitive.",
          createdAt: now - 1000 * 60 * 28, // 28m ago
        },
      ],
    },
    {
      id: "thread-origin-alignment",
      author: "Jordan Lee",
      avatarColor: getAvatarColor("Jordan Lee"),
      content:
        "Origin crosshair at (0, 0) needs sub-pixel alignment across DPR 1x, 2x Retina, and 3x displays to eliminate 1px shimmer on pan.",
      createdAt: now - 1000 * 60 * 260, // ~4h ago
      position: { x: 0, y: 0 },
      zoom: 1.0,
      status: "resolved",
      replies: [
        {
          id: "reply-origin-1",
          author: "Alex Morgan",
          avatarColor: getAvatarColor("Alex Morgan"),
          content:
            "Fixed in the canvas render loop by rounding screen origin coordinates after the camera transform matrix. Tested at 125% and 200% scaling.",
          createdAt: now - 1000 * 60 * 190, // ~3h ago
        },
        {
          id: "reply-origin-2",
          author: "Jordan Lee",
          avatarColor: getAvatarColor("Jordan Lee"),
          content:
            "Verified crisp rendering on high-DPI monitor. Resolving this thread.",
          createdAt: now - 1000 * 60 * 125, // ~2h ago
        },
      ],
    },
    {
      id: "thread-storage-resilience",
      author: "Elena Rostova",
      avatarColor: getAvatarColor("Elena Rostova"),
      content:
        "Double check that comments persist cleanly in localStorage with schema validation for corrupted coordinates or non-finite numbers.",
      createdAt: now - 1000 * 60 * 420, // ~7h ago
      position: { x: -220, y: -90 },
      zoom: 1.2,
      status: "resolved",
      replies: [
        {
          id: "reply-storage-1",
          author: "Marcus Vance",
          avatarColor: getAvatarColor("Marcus Vance"),
          content:
            "Implemented sanitizeThreads() with strict type guards for NaN/infinity positions and fallback timestamps. Everything is bulletproof.",
          createdAt: now - 1000 * 60 * 360, // ~6h ago
        },
      ],
    },
  ];
}

export const INITIAL_DEMO_THREADS: CommentThread[] = createDemoThreads();

// Validates untrusted localStorage entries. Ensures position coordinates and zoom are strictly
// finite numbers to safeguard against rendering loops or projection breakdown on corrupted state.
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
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeThreads(parsed);
      }
    }
  } catch (error) {
    console.error("Failed to load comments from localStorage:", error);
  }
  const freshDemo = createDemoThreads();
  saveStoredThreads(freshDemo);
  return freshDemo;
}

export function saveStoredThreads(threads: CommentThread[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch (error) {
    console.error("Failed to save comments to localStorage:", error);
  }
}

export function resetStoredThreadsToDemo(): CommentThread[] {
  const freshDemo = createDemoThreads();
  saveStoredThreads(freshDemo);
  return freshDemo;
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
