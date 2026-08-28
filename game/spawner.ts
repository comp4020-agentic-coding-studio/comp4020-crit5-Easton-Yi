import * as s from "./settings.ts";
import * as vec from "./vec.ts";
import { EnemyTank } from "./tank.ts";
import { cellCenters, segmentBlocked, type Rect } from "./maze.ts";

function pickSpawnCell(
  cells: [number, number][],
  enemies: EnemyTank[],
  player: { x: number; y: number },
  rand: () => number,
): [number, number] {
  const occupied: [number, number][] = [[player.x, player.y], ...enemies.filter((e) => e.alive).map((e): [number, number] => [e.x, e.y])];

  let candidates = cells.filter(
    (c) =>
      vec.dist(c[0], c[1], player.x, player.y) > s.MIN_SPAWN_DIST_FROM_PLAYER &&
      occupied.every(([ox, oy]) => vec.dist(c[0], c[1], ox, oy) > s.MIN_SPAWN_DIST_FROM_TANK),
  );
  if (candidates.length === 0) {
    candidates = cells.filter((c) => occupied.every(([ox, oy]) => vec.dist(c[0], c[1], ox, oy) > s.MIN_SPAWN_DIST_FROM_TANK));
  }
  if (candidates.length === 0) candidates = cells;

  return candidates[Math.floor(rand() * candidates.length)]!;
}

// Spawns the opening-screen enemy: present the instant the player takes
// control, so the maze's one immediately-visible tank tells a stranger what
// to do without a word of instruction (the no-tutorial affordance plan in
// docs/CONTENT_SOURCE.md).
export function spawnInitialEnemy(
  player: { x: number; y: number },
  obstacles: Rect[],
  rand: () => number = Math.random,
): EnemyTank {
  const cells = cellCenters();
  const visible = cells.filter(
    (c) =>
      vec.dist(c[0], c[1], player.x, player.y) <= s.FIRE_RANGE &&
      !segmentBlocked(c[0], c[1], player.x, player.y, obstacles),
  );
  const [x, y] = visible.length > 0 ? visible[Math.floor(rand() * visible.length)]! : pickSpawnCell(cells, [], player, rand);
  const angle = vec.angleTo(player.x - x, player.y - y);
  return new EnemyTank(x, y, angle, s.ENEMY_SPEED_START);
}

export class Spawner {
  private timer = 0;
  private cells = cellCenters();

  update(
    dt: number,
    enemies: EnemyTank[],
    elapsed: number,
    player: { x: number; y: number },
    rand: () => number = Math.random,
  ): EnemyTank | null {
    this.timer += dt;
    const t = s.difficultyProgress(elapsed);
    const interval = s.lerp(s.WAVE_INTERVAL_START, s.WAVE_INTERVAL_MIN, t);
    const maxAlive = s.maxAliveEnemies(elapsed);
    const enemySpeed = s.lerp(s.ENEMY_SPEED_START, s.ENEMY_SPEED_MAX, t);

    if (this.timer < interval) return null;
    const alive = enemies.filter((e) => e.alive).length;
    if (alive >= maxAlive) return null;

    const [x, y] = pickSpawnCell(this.cells, enemies, player, rand);
    this.timer = 0;
    return new EnemyTank(x, y, rand() * 360, enemySpeed);
  }
}
