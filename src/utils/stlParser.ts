import type { Mesh3D, Triangle3D } from "../types/canvasItems";

/**
 * Checks whether an ArrayBuffer is binary STL or ASCII STL.
 */
function isBinarySTL(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 84) return false;

  const reader = new DataView(buffer);
  const faceCount = reader.getUint32(80, true);
  const expectedSize = 84 + faceCount * 50;

  // Exact byte length match is the most reliable binary STL indicator
  return expectedSize === buffer.byteLength;
}

/**
 * Parses binary STL ArrayBuffer.
 */
function parseBinarySTL(buffer: ArrayBuffer, name: string): Mesh3D {
  const reader = new DataView(buffer);
  const triangleCount = reader.getUint32(80, true);
  const triangles: Triangle3D[] = [];

  let offset = 84;
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (let i = 0; i < triangleCount; i++) {
    // Normal vector
    const nx = reader.getFloat32(offset, true);
    const ny = reader.getFloat32(offset + 4, true);
    const nz = reader.getFloat32(offset + 8, true);

    // 3 vertices (3 x 4 bytes each = 12 bytes per vertex)
    const v1x = reader.getFloat32(offset + 12, true);
    const v1y = reader.getFloat32(offset + 16, true);
    const v1z = reader.getFloat32(offset + 20, true);

    const v2x = reader.getFloat32(offset + 24, true);
    const v2y = reader.getFloat32(offset + 28, true);
    const v2z = reader.getFloat32(offset + 32, true);

    const v3x = reader.getFloat32(offset + 36, true);
    const v3y = reader.getFloat32(offset + 40, true);
    const v3z = reader.getFloat32(offset + 44, true);

    offset += 50; // Skip 2 attribute bytes

    // Track bounding box
    minX = Math.min(minX, v1x, v2x, v3x);
    minY = Math.min(minY, v1y, v2y, v3y);
    minZ = Math.min(minZ, v1z, v2z, v3z);

    maxX = Math.max(maxX, v1x, v2x, v3x);
    maxY = Math.max(maxY, v1y, v2y, v3y);
    maxZ = Math.max(maxZ, v1z, v2z, v3z);

    triangles.push({
      normal: [nx, ny, nz],
      v1: [v1x, v1y, v1z],
      v2: [v2x, v2y, v2z],
      v3: [v3x, v3y, v3z],
    });
  }

  // Calculate center and scale normalization to fit within [-1, 1] range
  const centerX = (minX + maxX) / 2 || 0;
  const centerY = (minY + maxY) / 2 || 0;
  const centerZ = (minZ + maxZ) / 2 || 0;

  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const spanZ = maxZ - minZ || 1;
  const maxSpan = Math.max(spanX, spanY, spanZ) || 1;
  const scale = 2 / maxSpan;

  // Center and normalize coordinates so models scale cleanly at any viewport zoom
  const normalizedTriangles: Triangle3D[] = triangles.map((t) => ({
    normal: t.normal,
    v1: [(t.v1[0] - centerX) * scale, (t.v1[1] - centerY) * scale, (t.v1[2] - centerZ) * scale],
    v2: [(t.v2[0] - centerX) * scale, (t.v2[1] - centerY) * scale, (t.v2[2] - centerZ) * scale],
    v3: [(t.v3[0] - centerX) * scale, (t.v3[1] - centerY) * scale, (t.v3[2] - centerZ) * scale],
  }));

  return {
    name,
    triangles: normalizedTriangles,
    bounds: {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
      radius: maxSpan / 2,
    },
    triangleCount: triangles.length,
  };
}

/**
 * Parses ASCII text STL format.
 */
function parseAsciiSTL(text: string, name: string): Mesh3D {
  const normalRegex = /facet\s+normal\s+([-\d.eE]+)\s+([-\d.eE]+)\s+([-\d.eE]+)/g;
  const vertexRegex = /vertex\s+([-\d.eE]+)\s+([-\d.eE]+)\s+([-\d.eE]+)/g;

  const triangles: Triangle3D[] = [];
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  let normalMatch: RegExpExecArray | null;
  while ((normalMatch = normalRegex.exec(text)) !== null) {
    const nx = parseFloat(normalMatch[1]);
    const ny = parseFloat(normalMatch[2]);
    const nz = parseFloat(normalMatch[3]);

    const v1Match = vertexRegex.exec(text);
    const v2Match = vertexRegex.exec(text);
    const v3Match = vertexRegex.exec(text);

    if (!v1Match || !v2Match || !v3Match) break;

    const v1: [number, number, number] = [
      parseFloat(v1Match[1]),
      parseFloat(v1Match[2]),
      parseFloat(v1Match[3]),
    ];
    const v2: [number, number, number] = [
      parseFloat(v2Match[1]),
      parseFloat(v2Match[2]),
      parseFloat(v2Match[3]),
    ];
    const v3: [number, number, number] = [
      parseFloat(v3Match[1]),
      parseFloat(v3Match[2]),
      parseFloat(v3Match[3]),
    ];

    minX = Math.min(minX, v1[0], v2[0], v3[0]);
    minY = Math.min(minY, v1[1], v2[1], v3[1]);
    minZ = Math.min(minZ, v1[2], v2[2], v3[2]);

    maxX = Math.max(maxX, v1[0], v2[0], v3[0]);
    maxY = Math.max(maxY, v1[1], v2[1], v3[1]);
    maxZ = Math.max(maxZ, v1[2], v2[2], v3[2]);

    triangles.push({
      normal: [nx, ny, nz],
      v1,
      v2,
      v3,
    });
  }

  const centerX = (minX + maxX) / 2 || 0;
  const centerY = (minY + maxY) / 2 || 0;
  const centerZ = (minZ + maxZ) / 2 || 0;

  const maxSpan = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
  const scale = 2 / maxSpan;

  const normalizedTriangles: Triangle3D[] = triangles.map((t) => ({
    normal: t.normal,
    v1: [(t.v1[0] - centerX) * scale, (t.v1[1] - centerY) * scale, (t.v1[2] - centerZ) * scale],
    v2: [(t.v2[0] - centerX) * scale, (t.v2[1] - centerY) * scale, (t.v2[2] - centerZ) * scale],
    v3: [(t.v3[0] - centerX) * scale, (t.v3[1] - centerY) * scale, (t.v3[2] - centerZ) * scale],
  }));

  return {
    name,
    triangles: normalizedTriangles,
    bounds: {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
      radius: maxSpan / 2,
    },
    triangleCount: triangles.length,
  };
}

/**
 * Parses either Binary or ASCII STL file into a normalized 3D mesh.
 */
export function parseSTL(buffer: ArrayBuffer, fileName: string = "model.stl"): Mesh3D {
  if (isBinarySTL(buffer)) {
    return parseBinarySTL(buffer, fileName);
  }

  // Fallback to ASCII text decoding
  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(buffer);
  return parseAsciiSTL(text, fileName);
}

/**
 * Synthesizes a valid binary STL ArrayBuffer of a 3D faceted geometric prism
 * so the canvas has a realistic 3D CAD model immediately available without external assets.
 */
export function generateSampleSTL(): ArrayBuffer {
  // Hexagonal dual-pyramid gem / mechanical bracket
  const segments = 8;
  const radius = 1.0;
  const height = 1.4;

  const topApex: [number, number, number] = [0, 0, height];
  const bottomApex: [number, number, number] = [0, 0, -height];

  const ringVertices: [number, number, number][] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    ringVertices.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0]);
  }

  const rawTriangles: [
    [number, number, number],
    [number, number, number],
    [number, number, number],
  ][] = [];

  // Top cone triangles
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    rawTriangles.push([topApex, ringVertices[i], ringVertices[next]]);
  }

  // Bottom cone triangles
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    rawTriangles.push([bottomApex, ringVertices[next], ringVertices[i]]);
  }

  // Pack into binary STL buffer: 80 bytes header + 4 bytes count + 50 bytes * N
  const triangleCount = rawTriangles.length;
  const buffer = new ArrayBuffer(84 + triangleCount * 50);
  const view = new DataView(buffer);

  // Write header text
  const headerText = "Infican 3D Sample Model (Binary STL)";
  for (let i = 0; i < headerText.length; i++) {
    view.setUint8(i, headerText.charCodeAt(i));
  }

  view.setUint32(80, triangleCount, true);

  let offset = 84;
  for (const [v1, v2, v3] of rawTriangles) {
    // Calculate normal vector (v2 - v1) x (v3 - v1)
    const ax = v2[0] - v1[0], ay = v2[1] - v1[1], az = v2[2] - v1[2];
    const bx = v3[0] - v1[0], by = v3[1] - v1[1], bz = v3[2] - v1[2];

    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;
    const len = Math.hypot(nx, ny, nz) || 1;

    view.setFloat32(offset, nx / len, true);
    view.setFloat32(offset + 4, ny / len, true);
    view.setFloat32(offset + 8, nz / len, true);

    view.setFloat32(offset + 12, v1[0], true);
    view.setFloat32(offset + 16, v1[1], true);
    view.setFloat32(offset + 20, v1[2], true);

    view.setFloat32(offset + 24, v2[0], true);
    view.setFloat32(offset + 28, v2[1], true);
    view.setFloat32(offset + 32, v2[2], true);

    view.setFloat32(offset + 36, v3[0], true);
    view.setFloat32(offset + 40, v3[1], true);
    view.setFloat32(offset + 44, v3[2], true);

    view.setUint16(offset + 48, 0, true); // attribute byte count
    offset += 50;
  }

  return buffer;
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

