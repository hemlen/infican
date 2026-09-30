import type { CanvasPlaceholderItem } from "../types/canvasItems";
import { parseSTL, base64ToArrayBuffer } from "../utils/stlParser";
import { FREEZER_STL_BASE64 } from "./freezerData";

// Parse freezer 3D model synchronously from base64 binary STL buffer
const freezerBuffer = base64ToArrayBuffer(FREEZER_STL_BASE64);
const freezerMesh = parseSTL(freezerBuffer, "freezer.stl");

export const DEFAULT_PLACEHOLDER_ITEMS: CanvasPlaceholderItem[] = [
  {
    id: "item-freezer",
    type: "stl-model",
    position: { x: -160, y: -40 },
    mesh: freezerMesh,
    size: 75,
    color: "#38bdf8", // Sky blue with specular CAD facets
    rotation: { x: 0.55, y: 0.45, z: 0.1 },
    autoRotate: true,
  },
  {
    id: "item-cat",
    type: "image",
    position: { x: 220, y: -100 },
    width: 120,
    height: 213,
    src: "/cat.jpg",
    label: "cat.jpg",
  },
  {
    id: "item-red-block",
    type: "rect",
    position: { x: 100, y: -20 },
    width: 80,
    height: 60,
    color: "#ef4444",
    borderColor: "#f87171",
    label: "Accent Block (80x60)",
  },
];
