import * as s from "./settings.ts";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function rectBlocked(rect: Rect, obstacles: Rect[]): boolean {
  return obstacles.some((o) => rectsOverlap(rect, o));
}

export function pointBlocked(x: number, y: number, obstacles: Rect[], pad = 0): boolean {
  const size = pad * 2 || 1;
  return rectBlocked({ x: x - pad, y: y - pad, w: size, h: size }, obstacles);
}

// Liang-Barsky segment/rect intersection — enough to know whether a straight
// line of sight between two points is blocked by any wall rect.
function segmentHitsRect(ax: number, ay: number, bx: number, by: number, r: Rect): boolean {
  const dx = bx - ax;
  const dy = by - ay;
  let t0 = 0;
  let t1 = 1;
  const edges: [number, number][] = [
    [-dx, ax - r.x],
    [dx, r.x + r.w - ax],
    [-dy, ay - r.y],
    [dy, r.y + r.h - ay],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const t = q / p;
    if (p < 0) {
      if (t > t1) return false;
      if (t > t0) t0 = t;
    } else {
      if (t < t0) return false;
      if (t < t1) t1 = t;
    }
  }
  return t0 <= t1;
}

export function segmentBlocked(ax: number, ay: number, bx: number, by: number, obstacles: Rect[]): boolean {
  return obstacles.some((o) => segmentHitsRect(ax, ay, bx, by, o));
}

type Side = "N" | "S" | "E" | "W";
const OPPOSITE: Record<Side, Side> = { N: "S", S: "N", E: "W", W: "E" };

function generateMaze(rand: () => number): Record<Side, boolean>[][] {
  const walls: Record<Side, boolean>[][] = Array.from({ length: s.MAZE_ROWS }, () =>
    Array.from({ length: s.MAZE_COLS }, () => ({ N: true, S: true, E: true, W: true })),
  );
  const visited = Array.from({ length: s.MAZE_ROWS }, () => new Array(s.MAZE_COLS).fill(false));

  const stack: [number, number][] = [[0, 0]];
  visited[0][0] = true;

  while (stack.length > 0) {
    const [gy, gx] = stack[stack.length - 1]!;
    const neighbors: [number, number, Side, Side][] = [];
    const deltas: [number, number, Side, Side][] = [
      [0, -1, "N", "S"],
      [0, 1, "S", "N"],
      [1, 0, "E", "W"],
      [-1, 0, "W", "E"],
    ];
    for (const [dx, dy, side, opp] of deltas) {
      const nx = gx + dx;
      const ny = gy + dy;
      if (nx >= 0 && nx < s.MAZE_COLS && ny >= 0 && ny < s.MAZE_ROWS && !visited[ny]![nx]) {
        neighbors.push([nx, ny, side, opp]);
      }
    }
    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }
    const [nx, ny, side, opp] = neighbors[Math.floor(rand() * neighbors.length)]!;
    walls[gy]![gx]![side] = false;
    walls[ny]![nx]![opp] = false;
    visited[ny]![nx] = true;
    stack.push([ny, nx]);
  }

  return walls;
}

const cellW = s.WIDTH / s.MAZE_COLS;
const cellH = s.HEIGHT / s.MAZE_ROWS;

function hWallRect(gx: number, gy: number): Rect {
  const x = gx * cellW;
  const y = gy * cellH;
  return { x: x - s.WALL_THICK / 2, y: y - s.WALL_THICK / 2, w: cellW + s.WALL_THICK, h: s.WALL_THICK };
}

function vWallRect(gx: number, gy: number): Rect {
  const x = gx * cellW;
  const y = gy * cellH;
  return { x: x - s.WALL_THICK / 2, y: y - s.WALL_THICK / 2, w: s.WALL_THICK, h: cellH + s.WALL_THICK };
}

export function buildMaze(rand: () => number = Math.random): { obstacles: Rect[]; start: [number, number] } {
  const walls = generateMaze(rand);
  const rects: Rect[] = [];
  for (let gy = 0; gy < s.MAZE_ROWS; gy++) {
    for (let gx = 0; gx < s.MAZE_COLS; gx++) {
      const cell = walls[gy]![gx]!;
      if (gy === 0 && cell.N) rects.push(hWallRect(gx, 0));
      if (gx === 0 && cell.W) rects.push(vWallRect(0, gy));
      if (cell.S) rects.push(hWallRect(gx, gy + 1));
      if (cell.E) rects.push(vWallRect(gx + 1, gy));
    }
  }
  const midGx = Math.floor(s.MAZE_COLS / 2);
  const midGy = Math.floor(s.MAZE_ROWS / 2);
  const start: [number, number] = [(midGx + 0.5) * cellW, (midGy + 0.5) * cellH];
  return { obstacles: rects, start };
}

export function cellCenters(): [number, number][] {
  const centers: [number, number][] = [];
  for (let gy = 0; gy < s.MAZE_ROWS; gy++) {
    for (let gx = 0; gx < s.MAZE_COLS; gx++) {
      centers.push([(gx + 0.5) * cellW, (gy + 0.5) * cellH]);
    }
  }
  return centers;
}

export function drawMaze(ctx: CanvasRenderingContext2D, obstacles: Rect[]): void {
  ctx.fillStyle = s.COLOR_WALL;
  ctx.strokeStyle = s.COLOR_WALL_EDGE;
  ctx.lineWidth = 2;
  for (const o of obstacles) {
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeRect(o.x, o.y, o.w, o.h);
  }
}
