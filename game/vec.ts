export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// Smallest signed difference target-current in degrees, range (-180, 180].
export function angleDiffDeg(target: number, current: number): number {
  return ((((target - current + 180) % 360) + 360) % 360) - 180;
}

export function vecFromAngle(deg: number): [number, number] {
  const r = (deg * Math.PI) / 180;
  return [Math.cos(r), Math.sin(r)];
}

export function angleTo(dx: number, dy: number): number {
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx - ax, by - ay);
}
