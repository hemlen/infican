import React, { useState } from "react";
import type { Camera, Point } from "../../types/canvas";
import type { CommentThread } from "../../types/comment";
import { worldToScreen } from "../../utils/canvas";
import { getInitials, formatRelativeTime } from "../../utils/comment";
import { MessageSquare } from "lucide-react";

interface CommentPinProps {
  thread: CommentThread;
  camera: Camera;
  isActive: boolean;
  onSelect: (threadId: string) => void;
}

export const CommentPin: React.FC<CommentPinProps> = ({
  thread,
  camera,
  isActive,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const screenPos = worldToScreen(thread.position, camera);

  const initials = getInitials(thread.author);
  const replyCount = thread.replies.length;

  // Scale with zoom: bubble cannot increase from its original size, only decrease (scale <= 1.0)
  const createdZoom =
    typeof thread.zoom === "number" && !isNaN(thread.zoom) && thread.zoom > 0
      ? thread.zoom
      : 1;
  const currentZoom = camera.zoom || 1;
  const scale = Math.max(Math.min(currentZoom / createdZoom, 1.0), 0.2);

  // If the bubble is really small (e.g. zoomed far out), don't show the hover preview tooltip
  const isReallySmall = scale < 0.55;

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
        zIndex: isActive ? 40 : 20,
      }}
    >
      {/* Hover preview card - positioned so pin sits at top-left corner and drawn BEHIND the pin (z-10) */}
      {isHovered && !isReallySmall && (
        <div
          className="absolute w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-slate-100 rounded-xl p-3 shadow-2xl text-left pointer-events-none z-10 animate-in fade-in zoom-in-95 duration-100"
          style={{
            left: `${-16 * scale - 10}px`,
            top: `${-38 * scale - 10}px`,
          }}
        >
          {/* Header row with padding offset to leave room for the pin at top-left */}
          <div
            className="flex items-start justify-between gap-1 mb-1.5"
            style={{
              paddingLeft: `${Math.max(32 * scale + 6, 36)}px`,
              minHeight: `${Math.min(Math.max(38 * scale - 6, 28), 54)}px`,
            }}
          >
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-xs truncate text-slate-200 block">
                {thread.author}
              </span>
              <span className="text-slate-400 text-[10px] block">
                {formatRelativeTime(thread.createdAt)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed break-words whitespace-pre-wrap">
            {thread.content}
          </p>

          {replyCount > 0 && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-blue-400 flex items-center gap-1 font-medium">
              <MessageSquare className="w-3 h-3" />
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </div>
          )}
        </div>
      )}

      {/* Scaled Pin Body - drawn OVER the hover card (z-20) with anchor point at bottom center */}
      <div
        className="relative group cursor-pointer pointer-events-auto transition-transform duration-75 z-20"
        style={{
          transform: `translate(-50%, -100%) scale(${scale})`,
          transformOrigin: "bottom center",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(thread.id);
        }}
      >
        <div
          className={`relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 transition-all duration-150 ${
            isActive
              ? "border-blue-400 ring-4 ring-blue-500/30 scale-110"
              : isHovered
                ? "border-white ring-2 ring-white/20 scale-105"
                : "border-slate-800"
          } ${thread.avatarColor} text-white font-medium text-xs`}
        >
          {initials}

          {/* Reply count badge */}
          {replyCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-700 text-slate-200 text-[10px] font-bold px-1.5 py-0.2 rounded-full border-2 border-black shadow-sm flex items-center gap-0.5">
              {replyCount}
            </span>
          )}
        </div>

        {/* Pin triangle indicator pointing to the exact anchor point */}
        <div
          className={`w-0 h-0 mx-auto border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 transition-colors ${
            isActive
              ? "border-t-blue-400"
              : isHovered
                ? "border-t-white invisible"
                : "border-t-slate-800"
          }`}
        />
      </div>
    </div>
  );
};

interface DraftAnchorPinProps {
  position: Point;
  camera: Camera;
  draftZoom?: number | null;
}

export const DraftAnchorPin: React.FC<DraftAnchorPinProps> = ({
  position,
  camera,
  draftZoom,
}) => {
  const screenPos = worldToScreen(position, camera);
  const createdZoom = draftZoom && draftZoom > 0 ? draftZoom : camera.zoom || 1;
  const scale = Math.max(Math.min((camera.zoom || 1) / createdZoom, 1.0), 0.2);

  return (
    <div
      className="absolute pointer-events-none select-none z-30"
      style={{
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
      }}
    >
      <div
        className="relative flex flex-col items-center"
        style={{
          transform: `translate(-50%, -100%) scale(${scale})`,
          transformOrigin: "bottom center",
        }}
      >
        {/* Steady, static pin marker */}
        <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-500/40 shadow-lg flex items-center justify-center text-white">
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 border-t-white" />
      </div>
    </div>
  );
};
