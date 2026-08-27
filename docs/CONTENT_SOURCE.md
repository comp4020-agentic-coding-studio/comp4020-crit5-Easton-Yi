# CONTENT_SOURCE.md — Product & Implementation Authority (Crit 5)

> This file is the intended design within the contract set by `docs/CRIT_BRIEF.md`.
> It guides implementation; where a call had to be made that the user didn't
> specify explicitly, it is marked **[PROPOSED — confirm]** rather than baked
> in silently. See "Decisions requiring confirmation" at the end.

## Concept

A top-down maze tank battle. **Design source:** `~/comp4020_agentic_coding/Tank_Battalion`
(a pygame prototype, algorithm-vs-algorithm). This crit reuses that project's
**visual design in full** and its **enemy AI algorithm in full**, but replaces
the player side: instead of an AI-controlled player, a human drives the tank
with the keyboard while the enemy AI is unchanged. That swap — human hands on
the stick the algorithm used to hold — is the whole design delta from the
source project.

## Visual design (ported verbatim from Tank_Battalion)

**Palette** (`settings.py` `COLOR_*`, RGB):

| Element | Color | Notes |
|---|---|---|
| Background | `#FFFFFF` | flat white arena floor |
| Grid (unused in current draw calls, kept for reference) | `#F0F0F0` | |
| Path (unused in current draw calls, kept for reference) | `#00823C` | green; likely a debug leftover for A* path visualization, never wired to a draw call |
| Player tank fill | `#C81E1E` | red |
| Player tank edge | `#190F0F` | near-black outline, 2px |
| Enemy tank fill | `#0F0F0F` | near-black |
| Enemy tank edge | `#0F0F0F` | same, 2px outline |
| Bullet | `#0F0F0F` | small filled circle |
| Wall fill | `#232323` | |
| Wall edge | `#232323` | 2px outline, same tone |
| HUD text | `#191919` | |
| State/status text | `#AA2828` | source-only debug label color; **not ported** — the HUD line it was used for is dropped (see "No-tutorial / affordance plan" → HUD) |
| Explosion ring | `#EB8C1E` | orange, drawn as a growing unfilled circle |
| Explosion core | `#C81E1E` | red filled circle, shrinks relative to ring |

**Shapes, not sprites** — everything is vector-drawn each frame:

- **Tank chassis:** a rectangle (`length = TANK_SIZE * 1.1`, `width = TANK_SIZE * 0.75`)
  built from the tank's forward vector and its perpendicular, filled then
  outlined 2px, oriented to the tank's current heading angle.
- **Barrel:** a single 3px line from the tank's center out to
  `length * 0.75` along the heading — this is what visually communicates
  "front of tank" (the affordance for which way is forward / which way a key
  press will turn).
- **Walls:** a randomized depth-first "recursive backtracker" perfect maze
  (`obstacles.py`), 10×7 cells, rendered as thick rectangles (`WALL_THICK = 14 * SCALE`)
  per standing wall segment — filled + outlined, same dark tone.
- **Bullets:** small filled circles (`BULLET_RADIUS = 4 * SCALE`), travel in a
  straight line and **reflect off walls** (mirror the velocity component
  blocked by the collision) rather than disappearing — this is core to the
  enemy AI's blind-fire behavior (see below) and should be kept.
- **Explosion:** on a hit, an expanding orange ring plus a shrinking red core,
  over `EXPLODE_DURATION = 0.6s`, in place of the tank sprite.
- **HUD — not a direct port; see "Settled" below.** The source's plain
  top-left text stack (HP, kill count, death count, current AI state label,
  difficulty %) doesn't carry over as-is: the state-label line was a
  *debug* readout for the algorithm demo (it showed what the FSM was
  doing), and has no meaning once a human drives the tank.
- **Scale:** everything spatial multiplies by a single `SCALE = 1.2` constant
  — worth carrying over as a pattern (one scale knob, not scattered magic
  numbers) even though the marking viewports (1920×1080 / 390×844) differ
  from the source's fixed `960×720` canvas and will need their own responsive
  sizing, not a literal pixel port.

## Interaction model — the actual delta from the source project

Source project: the player tank was itself algorithm-driven (an FSM:
EXPLORE → AIM → FIRE, with DODGE/TURN preempting). **This crit replaces that
FSM with direct human keyboard input**, using the same underlying drive
model the source already encodes in `Tank._turn_toward` / `Tank._move_forward`
— a tank can only rotate in place or drive forward along its current heading,
never strafe or snap to an arbitrary direction:

- **Direction keys: both arrow keys and WASD, mapped to the same four turn
  intents simultaneously.** No on-screen hint can tell a stranger which
  convention this game uses, and the two conventions split player muscle
  memory roughly evenly — supporting both costs nothing to implement (map
  both to the same four intents) and removes a coin-flip guess the
  no-tutorial constraint would otherwise force on the player.
  - Pressing a direction that **differs from the tank's current heading**
    turns the tank toward that heading (rotate in place, at a turn rate
    analogous to `TANK_TURN_SPEED`). It does not move while turning.
  - **Holding down** a direction key that **matches** the current heading
    drives the tank forward continuously along that heading (at a speed
    analogous to `TANK_SPEED`), for as long as the key stays held.
  - **Releasing the key** stops the tank in place immediately — no drift,
    no momentum.
  - There is no reverse/back-up control and no strafing; every direction
    change goes through a turn first, exactly like the source's player FSM
    already enforced for itself.
- **Firing is manual, not automatic** (the source player fired autonomously;
  this crit does not). Fire control: **left mouse click, or the spacebar**.
  Spacebar over `F`: click needs no convention at all, and spacebar is the
  much more established browser/arcade-game fire key than `F` (which more
  commonly means "interact/use" in other genres) — a stranger relying on
  keyboard alone is more likely to try space unprompted.
  Each press fires one shot in the tank's current heading, subject to a
  cooldown analogous to the source's rate limiting
  (`PLAYER_FIRE_COOLDOWN_*`, `PLAYER_MAX_BULLETS_ALIVE`) so holding the
  key/button down doesn't turn into a spam stream — confirm on first
  playtest whether the cooldown should gate repeat fire on a held key, or
  only fire on each fresh press/click (edge-triggered), since "press to
  fire" reads more naturally as one shot per press than as full-auto.

## Enemy AI — ported in full (`EnemyTank` in `tank.py`)

The "machine player" in this crit **is** the enemy algorithm from the source,
unchanged in behavior:

1. **Line-of-sight check** each frame (`segment_blocked` against maze walls).
2. **If it has LOS and the player is within `FIRE_RANGE`:** turn to face the
   player directly, close distance if farther than `TANK_SIZE * 3`, and fire
   on cooldown (`ENEMY_BULLET_COOLDOWN = 1.1s`) regardless of aim quality —
   it "sprays," relying on wall-bounced bullets to land hits it can't see.
3. **If it has no LOS:** recompute an A* path (`pathfinding.py`, 8-directional
   grid over the maze, recalculated every `PATH_RECALC_INTERVAL = 0.5s`) to
   the player's last known position and follows the path's waypoints,
   turning and driving exactly like the player's own drive model (turn
   toward waypoint, then move forward).
4. Bullets it fires bounce off walls like the player's, so a spraying enemy
   can hit the player indirectly even without sight — keep this bullet
   physics, since the enemy AI's design depends on it.
5. Difficulty ramps over `DIFFICULTY_RAMP_TIME = 90s`: spawn interval shrinks
   (`WAVE_INTERVAL_START 5.0s → WAVE_INTERVAL_MIN 1.2s`), enemy speed rises
   (`ENEMY_SPEED_START 80·SCALE → ENEMY_SPEED_MAX 150·SCALE`), and the cap on
   simultaneously-alive enemies rises (`WAVE_MAX_ALIVE_START 4 → WAVE_MAX_ALIVE_MAX 7`).

**Explicit constraint from the user for this crit: no more than 7 enemies
alive together, at any difficulty.** This already matches the source's
`WAVE_MAX_ALIVE_MAX = 7` ceiling — keep that ceiling as a hard cap, don't let
a reinterpretation of difficulty push it higher.

Enemies spawn at open maze-cell centers, biased away from the player and
away from other tanks (`spawner.py`'s distance-filtered candidate selection)
— port this spawn-placement logic too, since "no more than 7 enemies" only
feels fair if they don't spawn on top of the player.

## No-tutorial / affordance plan

The brief bans any instructions, on-screen or off. The source project has no
tutorial either (it's a demo, not built for a stranger), so this needs new
design, not porting:

- Opening screen: the maze, the player tank (red, barrel visible = facing
  direction), and — per spec item 3 — the very first frame must make the
  first move obvious. The tank's barrel line already visually signals
  "this is the front," which pairs naturally with "press a direction to turn
  the barrel that way, hold it to drive."
  Concretely: spawn the player already facing an open corridor with a
  visible enemy in view, so an untouched screen shows the shape of the
  danger and the tank's implied "front" is legible before any key is
  pressed.
- No modal, no help page, no README substituting for in-game teaching. Any
  text on screen must be status (HUD), not instruction.

**HUD — settled:** drop the source's debug state-label line entirely, don't
repurpose it. Showing a human player their own intent back at them (`AIM`,
`FIRE`, ...) is dead weight, and unexplained text sitting on screen risks
being misread as a hint — working against the no-instructions constraint
even unintentionally. Replace it with HUD lines that matter for a losable,
winnable game:
- **Lives remaining** — as simple pips/icons (e.g. three tank-silhouette
  icons, filled/greyed as they're lost), more legible at a glance during
  play than a bare number.
- **Kills / win target** — e.g. `Kills: 4 / 15`.
- Difficulty % may be kept if useful for QA, but HP and death-count as
  separate lines are dropped — lives already cover that ground.

## Win / loss / finish — required by the spec, absent from the source

**This is the largest gap between the source project and this crit's
contract**, and needs explicit reporting rather than silent invention:

The source project is an infinite algorithm-vs-algorithm demo — the player
tank explodes on any hit and **always respawns** (`PlayerTank._respawn`),
forever, with `deaths` just an incrementing counter. There is no game-over,
no win, nothing that ends play. Spec item 2 requires the opposite: "a wrong
move must be possible, and play must end (win, loss, or finish)." Porting
the respawn-forever behavior as-is would fail the spec outright.

**Settled:**
- **Lives: 3.** Each hit is one life (no partial-HP scaling — a hit is a
  hit; keeps the source's one-hit-kill feel for both sides). On a hit:
  explode (keep the source's explosion animation), respawn (source's
  fresh-ground respawn-point logic) if lives remain. On the third hit, the
  explosion is final and the game ends in a **loss** screen (e.g. "You were
  destroyed — Kills: N").
- **Win condition: reach 15 kills** before running out of lives → **victory**
  screen (e.g. "Battalion cleared — Kills: 15"). Kills are already tracked
  (`score` in the source's main loop) so this only needs a threshold check,
  not new state.
- **Both numbers are initial, not final** — they're deliberately the kind of
  thing that only actual play reveals ("3 lives felt cheap because the AI
  sprays blindly through walls" / "15 kills took 9 minutes, not 5"). Tune
  them from a real playtest and record that tuning as the spec-item-5
  playtesting-driven change in `CRIT_QA_NOTES.md` — don't just pick numbers
  once and leave them unexamined.
- A stranger must still be able to reach *some* ending — win or lose —
  within five minutes (spec item 4). If early playtesting shows 15 kills
  routinely takes longer than that even for a competent stranger, lower it
  rather than leaving both a slow win and a hard-to-reach loss.

## Technical direction

- This repo (unlike the source) is a static HTML/CSS/TypeScript site
  building to plain HTML/CSS/JS for GitHub Pages (per root `CLAUDE.md`) —
  the source's `pygame` drawing/update loop is a **reference for behavior
  and visuals, not code to reuse directly**. Re-implement the render loop on
  `<canvas>` (2D context) with the same shape-drawing approach (polygons for
  the chassis, a line for the barrel, circles for bullets/explosion,
  filled rects for walls) and the same colors.
- Must remain fully static/client-side, no backend — consistent with the
  source, which already has no networking.
- Must respect the production base path for GitHub Pages (see root
  `CLAUDE.md` — this bit a prior assignment when unset).
- Canvas/arena sizing must work at both marking viewports (1920×1080 and
  390×844), not just the source's fixed 960×720 — needs responsive
  scaling of the maze grid and HUD layout, and keyboard controls need a
  sensible on-screen story at 390×844 too (touch equivalents are not
  required by the spec, which only asks for keyboard reachability per root
  `CLAUDE.md`, but the phone viewport must still not overflow horizontally).

## Scope / definition of done for this crit

- [ ] Maze arena, wall rendering, tank rendering (player + enemy), bullet
      rendering and wall-bounce physics, explosion animation — ported to
      match the source project's visual design.
- [ ] Player control: direction-key turn/hold-to-drive/release-to-stop
      exactly as specified above, on both arrow keys and WASD; manual fire
      on left-click or spacebar.
- [ ] HUD: lives (pips/icons) + kills-toward-win-target; no debug state
      label, no separate HP/death lines.
- [ ] Enemy AI: LOS check, direct-fire-in-range behavior, A* chase when out
      of sight, wall-bounced blind fire, spawn placement — ported to match
      the source's `EnemyTank`/`Spawner`/`pathfinding` behavior.
- [ ] Hard cap: no more than 7 enemies alive simultaneously, at any point in
      the difficulty curve.
- [ ] Opening screen makes the first move obvious with zero on-screen or
      off-screen instructions (see affordance plan above).
- [ ] A finite lives/loss/win system replacing the source's infinite-respawn
      demo loop: 3 lives, loss on the third hit, win at 15 kills — tuned so
      a stranger reaches an ending within five minutes (numbers subject to
      playtest-driven adjustment).
- [ ] One game rule under a focused automated test (candidate: bullet
      wall-reflection, or the turn-before-move drive-model constraint, or
      the ≤7-enemies cap) — see `spec/` conventions in root `CLAUDE.md`.
- [ ] At least one traceable design change that came from actually playing
      the build, recorded in `CRIT_QA_NOTES.md`.

## Decisions requiring confirmation

1. ~~Fire control~~ — **resolved:** manual fire only, on left mouse click or
   spacebar; no automatic firing. One remaining sub-question: edge-triggered
   (one shot per press) vs. cooldown-gated-while-held — default to
   edge-triggered unless playtesting says otherwise.
2. ~~Lives count~~ — **resolved:** 3 lives, one hit each (see "Win / loss /
   finish" above). `PLAYER_MAX_HP` from the source is not ported — a hit is
   a hit, no partial-HP scaling.
3. ~~Win/finish condition~~ — **resolved:** 15 kills = victory. Both this
   and the lives count are flagged as initial numbers to tune from real
   play, not final.
4. ~~Key scheme~~ — **resolved:** both arrow keys and WASD, mapped to the
   same four turn intents.
5. ~~HUD state-label line~~ — **resolved:** dropped. HUD becomes lives
   (pips/icons) + kills-toward-win-target, difficulty % optional; HP and
   death-count lines are not ported.

All open decisions from this section are now resolved.
