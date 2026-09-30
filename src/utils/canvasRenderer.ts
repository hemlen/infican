import type { Camera, Point } from "../types/canvas";
import type {
  CanvasPlaceholderItem,
  STLModelItem,
  RectItem,
  ImageItem,
} from "../types/canvasItems";
import { clampZoom, worldToScreen } from "./canvas";

// 3D vector rotation helper
function rotate3D(
  v: [number, number, number],
  cosX: number,
  sinX: number,
  cosY: number,
  sinY: number,
  cosZ: number,
  sinZ: number,
): [number, number, number] {
  // Rotate around X axis
  const y1 = v[1] * cosX - v[2] * sinX;
  const z1 = v[1] * sinX + v[2] * cosX;
  const x1 = v[0];

  // Rotate around Y axis
  const x2 = x1 * cosY + z1 * sinY;
  const z2 = -x1 * sinY + z1 * cosY;
  const y2 = y1;

  // Rotate around Z axis
  const x3 = x2 * cosZ - y2 * sinZ;
  const y3 = x2 * sinZ + y2 * cosZ;
  const z3 = z2;

  return [x3, y3, z3];
}

// Convert hex to RGB values
function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Renders a 3D STL mesh with backface culling, depth sorting (painter's algorithm),
 * and diffuse directional lighting. Zero external libraries required.
 */
function renderSTLModel(
  ctx: CanvasRenderingContext2D,
  item: STLModelItem,
  camera: Camera,
  time: number,
): void {
  const centerScreen = worldToScreen(item.position, camera);
  const zoom = clampZoom(camera.zoom);
  const scale = item.size * zoom;

  // Don't render tiny sub-pixel artifacts
  if (scale < 6) return;

  // Base rotation + subtle continuous auto-rotation if enabled
  const rotX = item.rotation.x;
  const rotY = item.rotation.y + (item.autoRotate ? time * 0.0008 : 0);
  const rotZ = item.rotation.z;

  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

  // Directional light vector normalized (coming from top-left front)
  const lx = -0.577, ly = -0.577, lz = 0.577;

  // Base color components
  const [baseR, baseG, baseB] = hexToRgb(item.color);

  // Soft pedestal shadow under the 3D model
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(centerScreen.x, centerScreen.y + scale * 0.9, scale * 0.8, scale * 0.25, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fill();
  ctx.restore();

  interface TransformedTriangle {
    s1: Point;
    s2: Point;
    s3: Point;
    depth: number;
    intensity: number;
  }

  const projected: TransformedTriangle[] = [];

  for (const tri of item.mesh.triangles) {
    const r1 = rotate3D(tri.v1, cosX, sinX, cosY, sinY, cosZ, sinZ);
    const r2 = rotate3D(tri.v2, cosX, sinX, cosY, sinY, cosZ, sinZ);
    const r3 = rotate3D(tri.v3, cosX, sinX, cosY, sinY, cosZ, sinZ);

    const s1: Point = { x: centerScreen.x + r1[0] * scale, y: centerScreen.y + r1[1] * scale };
    const s2: Point = { x: centerScreen.x + r2[0] * scale, y: centerScreen.y + r2[1] * scale };
    const s3: Point = { x: centerScreen.x + r3[0] * scale, y: centerScreen.y + r3[1] * scale };

    // 2D screen cross-product determines face winding orientation (backface culling)
    const cross2D = (s2.x - s1.x) * (s3.y - s1.y) - (s2.y - s1.y) * (s3.x - s1.x);
    if (cross2D <= 0) continue; // Face is oriented away from camera

    // Rotate normal vector for lighting calculation
    const rotNorm = rotate3D(tri.normal, cosX, sinX, cosY, sinY, cosZ, sinZ);
    const dot = rotNorm[0] * lx + rotNorm[1] * ly + rotNorm[2] * lz;
    const diffuse = Math.max(dot, 0);
    // 0.25 ambient light + 0.75 diffuse direct light
    const intensity = Math.min(0.25 + 0.75 * diffuse, 1);

    const avgDepth = (r1[2] + r2[2] + r3[2]) / 3;

    projected.push({
      s1,
      s2,
      s3,
      depth: avgDepth,
      intensity,
    });
  }

  // Painter's algorithm: sort triangles from furthest to closest
  projected.sort((a, b) => a.depth - b.depth);

  // Render shaded triangles
  for (const tri of projected) {
    const r = Math.round(baseR * tri.intensity);
    const g = Math.round(baseG * tri.intensity);
    const b = Math.round(baseB * tri.intensity);

    ctx.beginPath();
    ctx.moveTo(tri.s1.x, tri.s1.y);
    ctx.lineTo(tri.s2.x, tri.s2.y);
    ctx.lineTo(tri.s3.x, tri.s3.y);
    ctx.closePath();

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fill();

    // Crisp facet edge lines for CAD styling
    ctx.strokeStyle = `rgba(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)}, 0.4)`;
    ctx.lineWidth = Math.max(0.75 * zoom, 0.5);
    ctx.stroke();
  }

  // Label badge below model
  if (scale > 25) {
    const labelY = centerScreen.y + scale * 1.15;
    ctx.font = `${Math.max(Math.min(11 * zoom, 12), 9)}px ui-monospace, SFMono-Regular, monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
    ctx.fillText(`${item.mesh.name} (${item.mesh.triangleCount} △)`, centerScreen.x, labelY);
    ctx.textAlign = "left";
  }
}

/**
 * Renders a colored geometric rectangle with border and dimension markers.
 */
function renderRectItem(
  ctx: CanvasRenderingContext2D,
  item: RectItem,
  camera: Camera,
): void {
  const screenPos = worldToScreen(item.position, camera);
  const zoom = clampZoom(camera.zoom);
  const width = item.width * zoom;
  const height = item.height * zoom;

  if (width < 3 || height < 3) return;

  ctx.save();
  ctx.fillStyle = item.color;
  ctx.fillRect(screenPos.x, screenPos.y, width, height);

  if (item.borderColor) {
    ctx.strokeStyle = item.borderColor;
    ctx.lineWidth = Math.max(1.5 * zoom, 1);
    ctx.strokeRect(screenPos.x, screenPos.y, width, height);
  }

  if (item.label && width > 30) {
    ctx.font = `${Math.max(10 * zoom, 8)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = "#fca5a5";
    ctx.fillText(item.label, screenPos.x, screenPos.y - 4);
  }

  ctx.restore();
}

// Cached images for ImageItem rendering to prevent re-instantiation each frame
const imageCache = new Map<string, HTMLImageElement>();

function getImage(src: string): HTMLImageElement {
  let img = imageCache.get(src);
  if (!img) {
    img = new Image();
    img.src = src;
    imageCache.set(src, img);
  }
  return img;
}

/**
 * Renders an image item on the infinite canvas with rounded corners,
 * crisp border, and drop shadow.
 */
function renderImageItem(
  ctx: CanvasRenderingContext2D,
  item: ImageItem,
  camera: Camera,
): void {
  const screenPos = worldToScreen(item.position, camera);
  const zoom = clampZoom(camera.zoom);
  const width = item.width * zoom;
  const height = item.height * zoom;

  if (width < 3 || height < 3) return;

  const img = getImage(item.src);

  ctx.save();

  // Subtle drop shadow for floating card aesthetic
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 12 * zoom;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 6 * zoom;

  // Background plate / border
  const cornerRadius = Math.min(8 * zoom, 12);
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(screenPos.x, screenPos.y, width, height, cornerRadius);
  } else {
    ctx.rect(screenPos.x, screenPos.y, width, height);
  }
  ctx.fill();

  // Draw image if loaded and valid
  if (img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(screenPos.x, screenPos.y, width, height, cornerRadius);
    } else {
      ctx.rect(screenPos.x, screenPos.y, width, height);
    }
    ctx.clip();
    ctx.drawImage(img, screenPos.x, screenPos.y, width, height);
    ctx.restore();
  } else {
    // Loading indicator text when image hasn't loaded yet
    ctx.font = `${Math.max(10 * zoom, 8)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Loading...", screenPos.x + width / 2, screenPos.y + height / 2);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  // Border outline
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = Math.max(1 * zoom, 1);
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(screenPos.x, screenPos.y, width, height, cornerRadius);
  } else {
    ctx.rect(screenPos.x, screenPos.y, width, height);
  }
  ctx.stroke();

  // Optional badge label
  if (item.label && width > 40) {
    ctx.font = `${Math.max(10 * zoom, 9)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = "rgba(203, 213, 225, 0.9)";
    ctx.fillText(item.label, screenPos.x, screenPos.y - 6);
  }

  ctx.restore();
}

/**
 * Master canvas renderer.
 */
export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  width: number,
  height: number,
  dpr: number = 1,
  items: CanvasPlaceholderItem[] = [],
  time: number = 0,
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

  // Render placeholder items (3D models, rectangles, images)
  for (const item of items) {
    switch (item.type) {
      case "stl-model":
        renderSTLModel(ctx, item, camera, time);
        break;
      case "rect":
        renderRectItem(ctx, item, camera);
        break;
      case "image":
        renderImageItem(ctx, item, camera);
        break;
    }
  }

  ctx.restore();
}
