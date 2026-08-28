import * as s from "./settings.ts";
import * as vec from "./vec.ts";
import { pointBlocked, type Rect } from "./maze.ts";

export type Owner = "player" | "enemy";

// Pure step function so the wall-reflection rule can be unit tested without a
// whole Bullet instance: given a blocked-probe test, decide how a bullet's
// velocity should reflect off the axis (or axes) that are blocked. Mirrors
// Bullet.update's reflection logic in the reference project's bullet.py.
export function reflect(
  dx: number,
  dy: number,
  blockedX: boolean,
  blockedY: boolean,
): [number, number] {
  if (blockedX && !blockedY) return [-dx, dy];
  if (blockedY && !blockedX) return [dx, -dy];
  return [-dx, -dy];
}

export class Bullet {
  x: number;
  y: number;
  dx: number;
  dy: number;
  owner: Owner;
  alive = true;
  bounces = 0;
  age = 0;
  distance = 0;

  constructor(x: number, y: number, angleDeg: number, owner: Owner) {
    this.x = x;
    this.y = y;
    const [dx, dy] = vec.vecFromAngle(angleDeg);
    this.dx = dx;
    this.dy = dy;
    this.owner = owner;
  }

  private blockedAt(x: number, y: number, obstacles: Rect[]): boolean {
    return pointBlocked(x, y, obstacles, s.BULLET_RADIUS);
  }

  update(dt: number, obstacles: Rect[]): void {
    this.age += dt;
    if (this.age > s.BULLET_MAX_LIFETIME) {
      this.alive = false;
      return;
    }

    const step = s.BULLET_SPEED * dt;
    const nx = this.x + this.dx * step;
    const ny = this.y + this.dy * step;

    if (nx < 0 || nx > s.WIDTH || ny < 0 || ny > s.HEIGHT) {
      this.alive = false;
      return;
    }

    if (!this.blockedAt(nx, ny, obstacles)) {
      this.x = nx;
      this.y = ny;
      this.distance += step;
      if (this.distance > s.BULLET_MAX_DISTANCE) this.alive = false;
      return;
    }

    const blockedX = this.blockedAt(nx, this.y, obstacles);
    const blockedY = this.blockedAt(this.x, ny, obstacles);
    [this.dx, this.dy] = reflect(this.dx, this.dy, blockedX, blockedY);

    this.bounces += 1;
    if (this.bounces > s.BULLET_MAX_BOUNCES) this.alive = false;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = s.COLOR_BULLET;
    ctx.beginPath();
    ctx.arc(this.x, this.y, s.BULLET_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
}
