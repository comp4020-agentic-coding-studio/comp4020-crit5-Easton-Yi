import * as s from "./settings.ts";
import * as vec from "./vec.ts";
import { buildMaze, cellCenters, drawMaze, type Rect } from "./maze.ts";
import { Bullet } from "./bullet.ts";
import { EnemyTank, PlayerTank } from "./tank.ts";
import { Spawner, spawnInitialEnemy } from "./spawner.ts";
import { InputState } from "./input.ts";

export type GameState = "playing" | "won" | "lost";

export interface HudRefs {
  livesEl: HTMLElement;
  killsEl: HTMLElement;
  endScreenEl: HTMLElement;
  endMessageEl: HTMLElement;
}

function pickRespawnPoint(cells: [number, number][], enemies: EnemyTank[], rand: () => number): [number, number] {
  const aliveEnemies = enemies.filter((e) => e.alive).map((e): [number, number] => [e.x, e.y]);
  let candidates = cells.filter((c) => aliveEnemies.every(([ex, ey]) => vec.dist(c[0], c[1], ex, ey) > s.RESPAWN_MIN_DIST_FROM_ENEMY));
  if (candidates.length === 0) candidates = cells;
  return candidates[Math.floor(rand() * candidates.length)]!;
}

export class Game {
  private ctx: CanvasRenderingContext2D;
  private obstacles: Rect[];
  private cells: [number, number][];
  private player: PlayerTank;
  private enemies: EnemyTank[] = [];
  private bullets: Bullet[] = [];
  private spawner = new Spawner();
  private input: InputState;
  private elapsed = 0;
  private state: GameState = "playing";
  private hud: HudRefs;
  private rand: () => number;
  private lastTime = 0;
  private rafId = 0;

  constructor(canvas: HTMLCanvasElement, hud: HudRefs, rand: () => number = Math.random) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    this.ctx = ctx;
    this.hud = hud;
    this.rand = rand;
    this.input = new InputState(canvas.ownerDocument.defaultView ?? window);

    const { obstacles, start } = buildMaze(rand);
    this.obstacles = obstacles;
    this.cells = cellCenters();
    this.player = new PlayerTank(start[0], start[1], 0);
    this.enemies.push(spawnInitialEnemy(this.player, this.obstacles, rand));

    hud.endScreenEl.addEventListener("click", () => this.restart());
    window.addEventListener("keydown", (e) => {
      if (this.state !== "playing" && e.code === "Space") this.restart();
    });

    this.renderHud();
  }

  restart(): void {
    const { obstacles, start } = buildMaze(this.rand);
    this.obstacles = obstacles;
    this.cells = cellCenters();
    this.player = new PlayerTank(start[0], start[1], 0);
    this.enemies = [spawnInitialEnemy(this.player, this.obstacles, this.rand)];
    this.bullets = [];
    this.spawner = new Spawner();
    this.elapsed = 0;
    this.state = "playing";
    this.hud.endScreenEl.hidden = true;
    this.renderHud();
  }

  start(): void {
    this.lastTime = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.tick(dt);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    cancelAnimationFrame(this.rafId);
  }

  private checkHits(): void {
    for (const b of this.bullets) {
      if (!b.alive) continue;
      const hurtsPlayer = b.owner === "enemy" || (b.owner === "player" && b.bounces > 0);
      if (hurtsPlayer && !this.player.exploding && vec.dist(b.x, b.y, this.player.x, this.player.y) < s.TANK_SIZE / 2) {
        const outcome = this.player.takeHit();
        b.alive = false;
        if (outcome === "gameover") this.endGame("lost");
        continue;
      }
      if (b.owner === "player") {
        for (const e of this.enemies) {
          if (e.alive && vec.dist(b.x, b.y, e.x, e.y) < s.TANK_SIZE / 2) {
            e.takeHit();
            b.alive = false;
            this.player.kills += 1;
            if (this.player.kills >= s.WIN_KILLS) this.endGame("won");
            break;
          }
        }
      }
    }
  }

  private endGame(state: "won" | "lost"): void {
    this.state = state;
    this.hud.endMessageEl.textContent =
      state === "won"
        ? `Battalion cleared — Kills: ${this.player.kills}. Click or press space to play again.`
        : `Destroyed — Kills: ${this.player.kills}. Click or press space to play again.`;
    this.hud.endScreenEl.hidden = false;
  }

  private tick(dt: number): void {
    if (this.state !== "playing") return;
    this.elapsed += dt;

    const newEnemy = this.spawner.update(dt, this.enemies, this.elapsed, this.player, this.rand);
    if (newEnemy) this.enemies.push(newEnemy);

    const respawnPoint = pickRespawnPoint(this.cells, this.enemies, this.rand);
    const playerBullet = this.player.update(dt, this.input, this.enemies, this.bullets, this.obstacles, respawnPoint);
    if (playerBullet) this.bullets.push(playerBullet);

    for (const e of this.enemies) {
      if (!e.alive) continue;
      const bullet = e.update(dt, this.player, this.enemies, this.bullets, this.obstacles);
      if (bullet) this.bullets.push(bullet);
    }

    for (const b of this.bullets) b.update(dt, this.obstacles);

    this.checkHits();

    this.enemies = this.enemies.filter((e) => e.alive);
    this.bullets = this.bullets.filter((b) => b.alive);

    this.render();
    this.renderHud();
  }

  private renderHud(): void {
    this.hud.livesEl.textContent = "●".repeat(Math.max(0, this.player.lives)) + "○".repeat(Math.max(0, s.PLAYER_LIVES - this.player.lives));
    this.hud.livesEl.setAttribute("aria-label", `${this.player.lives} of ${s.PLAYER_LIVES} lives remaining`);
    this.hud.killsEl.textContent = `Kills: ${this.player.kills} / ${s.WIN_KILLS}`;
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.fillStyle = s.COLOR_BG;
    ctx.fillRect(0, 0, s.WIDTH, s.HEIGHT);
    drawMaze(ctx, this.obstacles);
    for (const e of this.enemies) e.draw(ctx);
    this.player.draw(ctx);
    for (const b of this.bullets) b.draw(ctx);
  }
}
