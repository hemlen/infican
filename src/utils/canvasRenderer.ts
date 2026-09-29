import type { Camera } from "../types/canvas";
import { clampZoom, worldToScreen } from "./canvas";

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  width: number,
  height: number,
  dpr: number = 1,
): void {
  ctx.save();
  ctx.scale(dpr, dpr);

  ctx.fillStyle = "#0b0f19";
  ctx.fillRect(0, 0, width, height);

  const zoom = clampZoom(isNaN(camera.zoom) ? 1 : camera.zoom);
  const camX = isNaN(camera.x) ? 0 : camera.x;
  const camY = isNaN(camera.y) ? 0 : camera.y;

  // Scale grid step by powers of 2 to keep on-screen spacing visually stable between 20px and 80px.
  // loopGuard caps iterations to protect against browser freeze if zoom is near-zero or non-finite.
  const baseGridSize = 40;
  let gridSize = baseGridSize;
  let loopGuard = 0;

  while (gridSize * zoom < 20 && loopGuard < 12) {
    gridSize *= 2;
    loopGuard++;
  }

  loopGuard = 0;
  while (gridSize * zoom > 80 && loopGuard < 12) {
    gridSize /= 2;
    loopGuard++;
  }

  const screenGridSize = Math.max(gridSize * zoom, 1);
  const startX = Math.floor(-camX / screenGridSize) * gridSize;
  const endX = Math.ceil((width - camX) / screenGridSize) * gridSize;
  const startY = Math.floor(-camY / screenGridSize) * gridSize;
  const endY = Math.ceil((height - camY) / screenGridSize) * gridSize;

  const countX = Math.abs((endX - startX) / (gridSize || 1));
  const countY = Math.abs((endY - startY) / (gridSize || 1));

  // Cap visible dot count to guarantee 60fps rendering even during rapid zoom transitions
  if (gridSize > 0 && countX < 300 && countY < 300) {
    ctx.fillStyle = "rgba(148, 163, 184, 0.28)";
    for (let x = startX; x <= endX; x += gridSize) {
      for (let y = startY; y <= endY; y += gridSize) {
        const sx = x * zoom + camX;
        const sy = y * zoom + camY;

        ctx.beginPath();
        ctx.arc(sx, sy, 1.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Anchor crosshair indicating world origin (0, 0)
  const originX = camX;
  const originY = camY;
  const crossSize = 12;

  ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(originX - crossSize, originY);
  ctx.lineTo(originX + crossSize, originY);
  ctx.moveTo(originX, originY - crossSize);
  ctx.lineTo(originX, originY + crossSize);
  ctx.stroke();

  ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillStyle = "rgba(56, 189, 248, 0.7)";
  ctx.fillText("(0, 0)", originX + 6, originY - 6);

  // Baseline reference object for spatial orientation and zoom verification
  const squareWorldPos = { x: 100, y: 0 };
  const squareWorldSize = 60;
  const squareScreenPos = worldToScreen(squareWorldPos, { x: camX, y: camY, zoom });
  const squareScreenSize = squareWorldSize * zoom;

  ctx.fillStyle = "#ef4444";
  ctx.fillRect(
    squareScreenPos.x,
    squareScreenPos.y,
    squareScreenSize,
    squareScreenSize,
  );

  ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillStyle = "#fca5a5";
  ctx.fillText("100x, 0y", squareScreenPos.x, squareScreenPos.y - 4);

  ctx.restore();
}
