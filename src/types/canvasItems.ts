import type { Point } from "./canvas";

export interface Triangle3D {
  v1: [number, number, number];
  v2: [number, number, number];
  v3: [number, number, number];
  normal: [number, number, number];
}

export interface Mesh3D {
  name: string;
  triangles: Triangle3D[];
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
    radius: number;
  };
  triangleCount: number;
}

export interface STLModelItem {
  id: string;
  type: "stl-model";
  position: Point;
  mesh: Mesh3D;
  size: number;
  color: string;
  rotation: { x: number; y: number; z: number };
  autoRotate?: boolean;
}

export interface RectItem {
  id: string;
  type: "rect";
  position: Point;
  width: number;
  height: number;
  color: string;
  borderColor?: string;
  label?: string;
}

export interface ImageItem {
  id: string;
  type: "image";
  position: Point;
  width: number;
  height: number;
  src: string;
  label?: string;
}

export type CanvasPlaceholderItem = STLModelItem | RectItem | ImageItem;
