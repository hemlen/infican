import { useRef, useCallback } from "react";
import { Canvas } from "./components/Canvas";
import { CommentPanel } from "./components/comments/CommentPanel";
import { useComments } from "./hooks/useComments";
import type { Point } from "./types/canvas";

export default function App() {
  const comments = useComments();
  const panToRef = useRef<((worldPoint: Point, zoom?: number) => void) | null>(null);

  const handleRegisterPanTo = useCallback((panFn: (worldPoint: Point, zoom?: number) => void) => {
    panToRef.current = panFn;
  }, []);

  const handleFocusPin = useCallback((position: Point, zoom?: number) => {
    if (panToRef.current) {
      panToRef.current(position, zoom);
    }
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      <Canvas
        comments={comments}
        onRegisterPanTo={handleRegisterPanTo}
      />
      <CommentPanel
        comments={comments}
        onFocusPin={handleFocusPin}
      />
    </main>
  );
}
