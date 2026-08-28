import * as s from "./settings.ts";
import { rectBlocked, type Rect } from "./maze.ts";

const CELL = Math.round(24 * s.SCALE);
const COLS = Math.floor(s.WIDTH / CELL);
const ROWS = Math.floor(s.HEIGHT / CELL);

const NEIGHBORS: [number, number][] = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
];

function cellOf(x: number, y: number): [number, number] {
  return [Math.floor(x / CELL), Math.floor(y / CELL)];
}

function centerOf(cx: number, cy: number): [number, number] {
  return [cx * CELL + CELL / 2, cy * CELL + CELL / 2];
}

function inBounds(cx: number, cy: number): boolean {
  return cx >= 0 && cx < COLS && cy >= 0 && cy < ROWS;
}

function key(cx: number, cy: number): string {
  return `${cx},${cy}`;
}

export function buildBlockedGrid(obstacles: Rect[], pad = s.TANK_SIZE / 2): Set<string> {
  const blocked = new Set<string>();
  for (let cy = 0; cy < ROWS; cy++) {
    for (let cx = 0; cx < COLS; cx++) {
      const [x, y] = centerOf(cx, cy);
      if (rectBlocked({ x: x - pad, y: y - pad, w: pad * 2, h: pad * 2 }, obstacles)) {
        blocked.add(key(cx, cy));
      }
    }
  }
  return blocked;
}

function nearestFree(cell: [number, number], blocked: Set<string>, maxRadius = 6): [number, number] | null {
  for (let r = 1; r <= maxRadius; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        const c: [number, number] = [cell[0] + dx, cell[1] + dy];
        if (inBounds(c[0], c[1]) && !blocked.has(key(c[0], c[1]))) return c;
      }
    }
  }
  return null;
}

class MinHeap {
  private items: [number, string][] = [];

  push(priority: number, id: string): void {
    this.items.push([priority, id]);
    this.items.sort((a, b) => a[0] - b[0]);
  }

  pop(): [number, string] | undefined {
    return this.items.shift();
  }

  get length(): number {
    return this.items.length;
  }
}

export function astar(
  startXY: [number, number],
  goalXY: [number, number],
  blocked: Set<string>,
): [number, number][] {
  let start = cellOf(...startXY);
  let goal = cellOf(...goalXY);
  if (start[0] === goal[0] && start[1] === goal[1]) return [];

  if (blocked.has(key(...goal))) {
    const free = nearestFree(goal, blocked);
    if (!free) return [];
    goal = free;
  }

  const open = new MinHeap();
  open.push(0, key(...start));
  const gScore = new Map<string, number>([[key(...start), 0]]);
  const cameFrom = new Map<string, [number, number]>();
  const visited = new Set<string>();
  const cellById = new Map<string, [number, number]>([[key(...start), start]]);

  while (open.length > 0) {
    const popped = open.pop()!;
    const currentKey = popped[1];
    if (visited.has(currentKey)) continue;
    visited.add(currentKey);
    const current = cellById.get(currentKey)!;

    if (current[0] === goal[0] && current[1] === goal[1]) {
      const path: [number, number][] = [current];
      let k = currentKey;
      while (cameFrom.has(k)) {
        const prev = cameFrom.get(k)!;
        path.push(prev);
        k = key(...prev);
      }
      path.reverse();
      return path.slice(1).map(([cx, cy]) => centerOf(cx, cy));
    }

    for (const [dx, dy] of NEIGHBORS) {
      const nxt: [number, number] = [current[0] + dx, current[1] + dy];
      const nxtKey = key(...nxt);
      if (!inBounds(nxt[0], nxt[1]) || blocked.has(nxtKey)) continue;
      const stepCost = Math.hypot(dx, dy);
      const tentative = gScore.get(currentKey)! + stepCost;
      if (tentative < (gScore.get(nxtKey) ?? Infinity)) {
        gScore.set(nxtKey, tentative);
        cameFrom.set(nxtKey, current);
        cellById.set(nxtKey, nxt);
        const h = Math.hypot(goal[0] - nxt[0], goal[1] - nxt[1]);
        open.push(tentative + h, nxtKey);
      }
    }
  }
  return [];
}
