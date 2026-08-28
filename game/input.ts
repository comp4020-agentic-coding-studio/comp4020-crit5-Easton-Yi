// Keyboard/mouse input for the player tank: arrow keys and WASD both drive
// the same four cardinal-direction intents (most-recently-pressed still-held
// key wins, so switching direction mid-drive feels immediate); left click or
// spacebar fires, edge-triggered (one shot per press, not a held-repeat).

const DIRECTION_KEYS: Record<string, number> = {
  ArrowRight: 0,
  KeyD: 0,
  ArrowDown: 90,
  KeyS: 90,
  ArrowLeft: 180,
  KeyA: 180,
  ArrowUp: 270,
  KeyW: 270,
};

const FIRE_KEYS = new Set(["Space"]);

export class InputState {
  private heldStack: string[] = [];
  private firePending = false;

  constructor(target: Window | HTMLElement = window) {
    target.addEventListener("keydown", (e) => this.onKeyDown(e as KeyboardEvent));
    target.addEventListener("keyup", (e) => this.onKeyUp(e as KeyboardEvent));
    target.addEventListener("mousedown", (e) => this.onMouseDown(e as MouseEvent));
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.code in DIRECTION_KEYS) {
      if (!this.heldStack.includes(e.code)) this.heldStack.push(e.code);
      e.preventDefault();
    }
    if (FIRE_KEYS.has(e.code)) {
      if (!e.repeat) this.firePending = true;
      e.preventDefault();
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    const idx = this.heldStack.indexOf(e.code);
    if (idx >= 0) this.heldStack.splice(idx, 1);
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button === 0) this.firePending = true;
  }

  /** Target heading in degrees for the most-recently-pressed still-held
   * direction key, or null if none is held. */
  activeDirection(): number | null {
    if (this.heldStack.length === 0) return null;
    return DIRECTION_KEYS[this.heldStack[this.heldStack.length - 1]!]!;
  }

  /** True at most once per press; consumes the pending fire request. */
  consumeFire(): boolean {
    if (!this.firePending) return false;
    this.firePending = false;
    return true;
  }
}
