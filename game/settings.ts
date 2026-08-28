// Ported from the Tank_Battalion reference project's settings.py, with the
// arena resized for a canvas game (960x600 vs. the source's 960x720) and the
// maze grid resized to match. Colors and physical ratios are unchanged.

export const SCALE = 1.2;

export const WIDTH = 960;
export const HEIGHT = 600;

export const MAZE_COLS = 8;
export const MAZE_ROWS = 5;
export const WALL_THICK = 14 * SCALE;

export const TANK_SIZE = 32 * SCALE;
export const TANK_SPEED = 150.0 * SCALE; // px/sec
export const TANK_TURN_SPEED = 220.0; // deg/sec
export const ENEMY_TURN_SPEED = 170.0;
export const BULLET_SPEED = 260.0 * SCALE;
export const ENEMY_BULLET_COOLDOWN = 1.1;
export const PLAYER_FIRE_COOLDOWN = 0.35; // fixed cooldown; firing is manual, not on an automatic timer
export const PLAYER_MAX_BULLETS_ALIVE = 3;
export const ENEMY_MAX_BULLETS_ALIVE = 6;
export const BULLET_RADIUS = 4 * SCALE;
export const BULLET_MAX_BOUNCES = 16;
export const BULLET_MAX_LIFETIME = 9.0;
export const BULLET_MAX_DISTANCE = 900.0 * SCALE;

export const PLAYER_LIVES = 3;
export const WIN_KILLS = 15;

export const WAVE_INTERVAL_START = 5.0;
export const WAVE_INTERVAL_MIN = 1.2;
export const WAVE_MAX_ALIVE_START = 4;
export const WAVE_MAX_ALIVE_MAX = 7; // hard cap: never more than 7 enemies alive at once
export const ENEMY_SPEED_START = 80.0 * SCALE;
export const ENEMY_SPEED_MAX = 150.0 * SCALE;
export const DIFFICULTY_RAMP_TIME = 90.0;

export const FIRE_RANGE = 380.0 * SCALE;

export const EXPLODE_DURATION = 0.6;
export const RESPAWN_MIN_DIST_FROM_ENEMY = 200.0 * SCALE;
export const MIN_SPAWN_DIST_FROM_PLAYER = 220.0 * SCALE;
export const MIN_SPAWN_DIST_FROM_TANK = TANK_SIZE * 1.5;

export const COLOR_BG = "#ffffff";
export const COLOR_PLAYER = "#c81e1e";
export const COLOR_PLAYER_EDGE = "#190f0f";
export const COLOR_ENEMY_FILL = "#0f0f0f";
export const COLOR_ENEMY_EDGE = "#0f0f0f";
export const COLOR_BULLET = "#0f0f0f";
export const COLOR_HUD = "#191919";
export const COLOR_WALL = "#232323";
export const COLOR_WALL_EDGE = "#232323";
export const COLOR_EXPLODE_RING = "#eb8c1e";
export const COLOR_EXPLODE_CORE = "#c81e1e";

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function difficultyProgress(elapsedSec: number): number {
  return Math.min(1, Math.max(0, elapsedSec / DIFFICULTY_RAMP_TIME));
}

// Cap on simultaneously-alive enemies at any point in the difficulty ramp.
// Exported as its own pure function so it can be unit tested directly against
// the ≤7 hard cap without spinning up a whole game loop.
export function maxAliveEnemies(elapsedSec: number): number {
  return Math.round(lerp(WAVE_MAX_ALIVE_START, WAVE_MAX_ALIVE_MAX, difficultyProgress(elapsedSec)));
}
