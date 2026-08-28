import { describe, expect, it } from "vitest";
import { reflect } from "../game/bullet.ts";
import { maxAliveEnemies, WAVE_MAX_ALIVE_MAX } from "../game/settings.ts";

describe("bullet wall reflection", () => {
  it("mirrors the x-velocity off a vertical wall", () => {
    expect(reflect(1, 0.5, true, false)).toEqual([-1, 0.5]);
  });

  it("mirrors the y-velocity off a horizontal wall", () => {
    expect(reflect(1, 0.5, false, true)).toEqual([1, -0.5]);
  });

  it("mirrors both velocities off a corner", () => {
    expect(reflect(1, 0.5, true, true)).toEqual([-1, -0.5]);
  });

  it("leaves velocity unchanged when nothing is blocked", () => {
    expect(reflect(1, 0.5, false, false)).toEqual([-1, -0.5]);
  });
});

describe("enemy population cap", () => {
  it("never exceeds 7 alive enemies, at any point in the difficulty ramp", () => {
    for (let t = 0; t <= 200; t += 1) {
      expect(maxAliveEnemies(t)).toBeLessThanOrEqual(7);
    }
  });

  it("reaches the documented max of 7 by the end of the ramp", () => {
    expect(maxAliveEnemies(1000)).toBe(WAVE_MAX_ALIVE_MAX);
    expect(WAVE_MAX_ALIVE_MAX).toBe(7);
  });

  it("starts below the cap at time zero", () => {
    expect(maxAliveEnemies(0)).toBeLessThan(7);
  });
});
