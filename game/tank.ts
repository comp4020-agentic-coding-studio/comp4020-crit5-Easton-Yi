import * as s from "./settings.ts";
import * as vec from "./vec.ts";
import { rectBlocked, segmentBlocked, type Rect } from "./maze.ts";
import * as pf from "./pathfinding.ts";
import { Bullet, type Owner } from "./bullet.ts";
import type { InputState } from "./input.ts";

const PATH_RECALC_INTERVAL = 0.5;
const WAYPOINT_RADIUS = 14 * s.SCALE;

export function tankRect(t: Tank): Rect {
  const half = s.TANK_SIZE / 2;
  return { x: t.x - half, y: t.y - half, w: s.TANK_SIZE, h: s.TANK_SIZE };
}

export abstract class Tank {
  x: number;
  y: number;
  angle: number; // degrees, 0 = facing +x
  alive = true;

  constructor(x: number, y: number, angle: number) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  protected moveVector(vx: number, vy: number, dt: number, obstacles: Rect[]): void {
    const half = s.TANK_SIZE / 2;
    const nx = vec.clamp(this.x + vx * dt, half, s.WIDTH - half);
    const ny = vec.clamp(this.y + vy * dt, half, s.HEIGHT - half);

    const fullRect: Rect = { x: nx - half, y: ny - half, w: s.TANK_SIZE, h: s.TANK_SIZE };
    if (!rectBlocked(fullRect, obstacles)) {
      this.x = nx;
      this.y = ny;
      return;
    }
    const xRect: Rect = { x: nx - half, y: this.y - half, w: s.TANK_SIZE, h: s.TANK_SIZE };
    const yRect: Rect = { x: this.x - half, y: ny - half, w: s.TANK_SIZE, h: s.TANK_SIZE };
    if (!rectBlocked(xRect, obstacles)) {
      this.x = nx;
    } else if (!rectBlocked(yRect, obstacles)) {
      this.y = ny;
    }
  }

  protected moveForward(speed: number, dt: number, obstacles: Rect[]): void {
    const [dx, dy] = vec.vecFromAngle(this.angle);
    this.moveVector(dx * speed, dy * speed, dt, obstacles);
  }

  protected turnToward(targetAngle: number, turnSpeed: number, dt: number): void {
    const diff = vec.angleDiffDeg(targetAngle, this.angle);
    const step = turnSpeed * dt;
    if (Math.abs(diff) <= step) {
      this.angle = targetAngle;
    } else {
      this.angle += diff > 0 ? step : -step;
    }
    this.angle = ((this.angle % 360) + 360) % 360;
  }

  protected wallAhead(distance: number, obstacles: Rect[], angle = this.angle): boolean {
    const [dx, dy] = vec.vecFromAngle(angle);
    const half = s.TANK_SIZE / 2;
    const px = this.x + dx * distance;
    const py = this.y + dy * distance;
    if (px < half || px > s.WIDTH - half || py < half || py > s.HEIGHT - half) return true;
    return rectBlocked({ x: px - half, y: py - half, w: s.TANK_SIZE, h: s.TANK_SIZE }, obstacles);
  }

  drawShape(ctx: CanvasRenderingContext2D, fill: string, edge: string): void {
    const [dx, dy] = vec.vecFromAngle(this.angle);
    const px = -dy;
    const py = dx;

    const length = s.TANK_SIZE * 1.1;
    const width = s.TANK_SIZE * 0.75;
    const hl = length / 2;
    const hw = width / 2;

    const frontX = this.x + dx * hl;
    const frontY = this.y + dy * hl;
    const backX = this.x - dx * hl;
    const backY = this.y - dy * hl;

    ctx.beginPath();
    ctx.moveTo(frontX + px * hw, frontY + py * hw);
    ctx.lineTo(backX + px * hw, backY + py * hw);
    ctx.lineTo(backX - px * hw, backY - py * hw);
    ctx.lineTo(frontX - px * hw, frontY - py * hw);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 2;
    ctx.stroke();

    const tipX = this.x + dx * length * 0.75;
    const tipY = this.y + dy * length * 0.75;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = edge;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

/** Chases the player through the maze via A* when it has no line of sight.
 * Fires blindly on cooldown regardless of sight or aim — bullets bounce far
 * enough off walls that spraying constantly still lands hits. Unchanged from
 * the reference project's EnemyTank. */
export class EnemyTank extends Tank {
  speed: number;
  cooldown = 0;
  private path: [number, number][] = [];
  private pathTimer = 0;

  constructor(x: number, y: number, angle: number, speed: number) {
    super(x, y, angle);
    this.speed = speed;
  }

  takeHit(): void {
    this.alive = false;
  }

  private followPath(dt: number, obstacles: Rect[]): void {
    while (this.path.length > 0 && vec.dist(this.x, this.y, this.path[0]![0], this.path[0]![1]) < WAYPOINT_RADIUS) {
      this.path.shift();
    }
    if (this.path.length === 0) return;
    const [wx, wy] = this.path[0]!;
    this.turnToward(vec.angleTo(wx - this.x, wy - this.y), s.ENEMY_TURN_SPEED, dt);
    this.moveForward(this.speed, dt, obstacles);
  }

  update(
    dt: number,
    player: { x: number; y: number; alive: boolean },
    enemies: EnemyTank[],
    bullets: Bullet[],
    obstacles: Rect[],
  ): Bullet | null {
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.pathTimer = Math.max(0, this.pathTimer - dt);
    const hasLos = !segmentBlocked(this.x, this.y, player.x, player.y, obstacles);
    const d = vec.dist(this.x, this.y, player.x, player.y);

    const moveBlockers: Rect[] = [...obstacles];
    if (player.alive) moveBlockers.push({ x: player.x - s.TANK_SIZE / 2, y: player.y - s.TANK_SIZE / 2, w: s.TANK_SIZE, h: s.TANK_SIZE });
    for (const e of enemies) {
      if (e !== this && e.alive) moveBlockers.push(tankRect(e));
    }

    if (hasLos && d <= s.FIRE_RANGE) {
      this.path = [];
      const ang = vec.angleTo(player.x - this.x, player.y - this.y);
      this.turnToward(ang, s.ENEMY_TURN_SPEED, dt);
      if (d > s.TANK_SIZE * 3) this.moveForward(this.speed, dt, moveBlockers);
    } else {
      if (this.path.length === 0 || this.pathTimer <= 0) {
        const blocked = pf.buildBlockedGrid(obstacles);
        this.path = pf.astar([this.x, this.y], [player.x, player.y], blocked);
        this.pathTimer = PATH_RECALC_INTERVAL;
      }
      this.followPath(dt, moveBlockers);
    }

    return this.tryFire(bullets);
  }

  private tryFire(bullets: Bullet[]): Bullet | null {
    if (this.cooldown > 0) return null;
    const alive = bullets.filter((b) => b.owner === "enemy" && b.alive).length;
    if (alive >= s.ENEMY_MAX_BULLETS_ALIVE) return null;
    this.cooldown = s.ENEMY_BULLET_COOLDOWN;
    return new Bullet(this.x, this.y, this.angle, "enemy");
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawShape(ctx, s.COLOR_ENEMY_FILL, s.COLOR_ENEMY_EDGE);
  }
}

/** Human-controlled tank: direction keys map to the four cardinal headings.
 * Pressing a direction that differs from the current heading turns the tank
 * in place; holding a direction that matches the current heading drives
 * forward; releasing stops immediately. Firing is manual (left-click /
 * spacebar), never automatic. */
export class PlayerTank extends Tank {
  cooldown = 0;
  lives = s.PLAYER_LIVES;
  kills = 0;
  exploding = false;
  private explodeTimer = 0;
  private turning = false;

  private static readonly TURN_ALIGN_TOLERANCE_DEG = 1.0;

  constructor(x: number, y: number, angle: number) {
    super(x, y, angle);
  }

  private respawn(spawnPoint: [number, number]): void {
    this.x = spawnPoint[0];
    this.y = spawnPoint[1];
    this.exploding = false;
    this.turning = false;
  }

  takeHit(): "hit" | "gameover" {
    if (this.exploding) return "hit";
    this.exploding = true;
    this.explodeTimer = s.EXPLODE_DURATION;
    this.lives -= 1;
    return this.lives <= 0 ? "gameover" : "hit";
  }

  update(
    dt: number,
    input: InputState,
    enemies: EnemyTank[],
    bullets: Bullet[],
    obstacles: Rect[],
    respawnPoint: [number, number],
  ): Bullet | null {
    this.cooldown = Math.max(0, this.cooldown - dt);

    if (this.exploding) {
      this.explodeTimer -= dt;
      if (this.explodeTimer <= 0) this.respawn(respawnPoint);
      return null;
    }

    const moveBlockers: Rect[] = [...obstacles];
    for (const e of enemies) {
      if (e.alive) moveBlockers.push(tankRect(e));
    }

    const targetAngle = input.activeDirection();
    if (targetAngle !== null) {
      const aligned = Math.abs(vec.angleDiffDeg(targetAngle, this.angle)) < PlayerTank.TURN_ALIGN_TOLERANCE_DEG;
      if (!aligned) {
        this.turnToward(targetAngle, s.TANK_TURN_SPEED, dt);
        this.turning = true;
      } else {
        this.turning = false;
        this.moveForward(s.TANK_SPEED, dt, moveBlockers);
      }
    } else {
      this.turning = false;
    }

    if (input.consumeFire()) {
      return this.tryFire(bullets);
    }
    return null;
  }

  private tryFire(bullets: Bullet[]): Bullet | null {
    if (this.cooldown > 0) return null;
    const alive = bullets.filter((b) => b.owner === "player" && b.alive).length;
    if (alive >= s.PLAYER_MAX_BULLETS_ALIVE) return null;
    this.cooldown = s.PLAYER_FIRE_COOLDOWN;
    return new Bullet(this.x, this.y, this.angle, "player");
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.exploding) {
      const t = 1 - Math.max(0, this.explodeTimer) / s.EXPLODE_DURATION;
      const rOut = s.TANK_SIZE * (0.5 + 1.4 * t);
      const rIn = Math.max(2, rOut * 0.55);
      ctx.strokeStyle = s.COLOR_EXPLODE_RING;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, rOut, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = s.COLOR_EXPLODE_CORE;
      ctx.beginPath();
      ctx.arc(this.x, this.y, rIn, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    this.drawShape(ctx, s.COLOR_PLAYER, s.COLOR_PLAYER_EDGE);
  }
}
