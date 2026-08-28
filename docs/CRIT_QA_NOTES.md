# CRIT_QA_NOTES.md — Living Verification Record (Crit 5)

> Evidence only. Requirements live in `CRIT_BRIEF.md`; intended design lives in
> `CONTENT_SOURCE.md`. Do not mark anything ✅ here without an actual command
> run or an actual manual check performed — this file records what has been
> verified, not what is planned.

Status legend: ⬜ not started · 🔶 in progress / partially verified · ✅ verified · ❌ failing

## Traceability: spec item → implementation → evidence

| # | Spec item (from `CRIT_BRIEF.md`) | Implementation status | Verification method | Result |
|---|---|---|---|---|
| 1 | Deployed live at a public GitHub Pages URL by the cutoff | ⬜ not started | CI deploy + visit deployed URL | not yet run — nothing pushed/deployed yet |
| 2 | Losable: a wrong move must be possible, and play must end (win/loss/finish) | 🔶 implemented (3 lives → loss screen, 15 kills → win screen, click/space restarts) | Playwright: idle 25s under active enemy fire → reached loss screen; clicked it → state reset (lives 3/3, kills 0) | ✅ loss path verified end-to-end; win path (15 kills) not yet manually reached, only code-reviewed |
| 3 | Self-teaching: zero instructions anywhere; opening screen invites the first move | 🔶 implemented (opening screen always spawns one enemy within line of sight of the player, no on-screen text beyond HUD numbers and the post-game message) | manual screenshot inspection at both viewports on fresh load | ✅ enemy visibly present on load at both viewports (confirmed via screenshot); "first move is discoverable cold" not tested with an actual naive human yet |
| 4 | A stranger can reach an ending within 5 minutes | ⬜ not started | manual playtest, timed, with a real player | not yet run — only scripted/idle Playwright runs so far |
| 5 | One rule under a focused automated test, **and** one change traced to actual play | 🔶 automated test done; playtesting-driven change not yet done | `pnpm check` (includes `spec/game-rules.test.ts`) | ✅ `spec/game-rules.test.ts` passes — covers `reflect()` wall-bounce logic and the `maxAliveEnemies()` ≤7 cap across the whole difficulty ramp; second half (a change traced to actual play) still open, see below |
| 6 | Repo shows process: incremental commits, `PROCESS.md`, `reflections/crit-5.md` | ⬜ not started | `git log`, file existence | not yet run — no commits made this session, `PROCESS.md`/`reflections/crit-5.md` not yet filled |
| 7 | Presenter can explain AI direction/grounding/correction | ⬜ n/a until build exists | crit conversation | n/a |

## Automated checks

```
$ pnpm check
$ tsc --noEmit
$ vite build
✓ built in ~45ms (dist/index.html 1.48kB, dist/assets/*.css 0.96kB, dist/assets/*.js 13.6kB)
Test Files  3 passed (3)
     Tests  24 passed (24)
```

Run twice this session (once before, once after the opening-affordance/HUD-glyph
fixes below); both runs green, no typecheck/build/test failures.

## Manual QA — both marking viewports

Per root `CLAUDE.md`: both 1920×1080 and 390×844 must be actually played, not
just automated-checked. Done via `pnpm dev` + Playwright's Chromium (no
interactive display available), driving real keyboard/mouse events and
screenshotting the actual rendered canvas — not just reading the code.

| Viewport | Checked? | Notes |
|---|---|---|
| 1920×1080 (desktop) | ✅ done | `scrollWidth - clientWidth` = 0 (no horizontal overflow); drove tank with arrow keys, fired with spacebar, screenshots show correct maze/tank/bullet rendering, HUD, and end screen; no console/page errors |
| 390×844 (phone) | ✅ done | same checks as desktop: no horizontal overflow, canvas scales down via `aspect-ratio`+`width:100%`, HUD readable, enemy visible on load. **Not yet resolved:** this was driven by synthetic keyboard events, not an actual touchscreen — a real phone visitor with no physical keyboard has no way to play at all (see open question below, this is a real, unresolved gap, not just a caveat) |

### Bugs found and fixed during this manual pass (not caught by `pnpm check`)

- **Opening screen had no enemy.** On first load, the spawner's first wave
  didn't fire for `WAVE_INTERVAL_START` (5s), so the opening screen showed an
  empty maze — directly undermining spec item 3 (the screen must invite the
  first move with nothing visible to react to). Fixed by adding
  `spawnInitialEnemy()` in `game/spawner.ts`, called from `Game`'s constructor
  and `restart()`, which places one enemy within line-of-sight/fire-range of
  the player's start cell (falling back to the normal distance-based pick if
  no LOS cell exists). Confirmed visually in follow-up screenshots at both
  viewports.
- **Lives HUD rendered as tofu boxes.** The "🛡" filled-life glyph in
  `game/game.ts`'s `renderHud()` had no color-emoji font available in the
  headless Chromium environment used for testing, so it rendered as empty
  boxes instead of a shield. Swapped to plain Unicode `●`/`○` (filled/hollow
  circle), which rendered correctly. This is exactly the kind of thing a
  green `pnpm check` cannot catch — only found by actually looking at a
  screenshot.

## Playtesting-driven change (spec item 5, second half)

Spec requires at least one real design change that came from actually playing
the finished build, not from reading the code. Record it here once it
happens — include what was played, what felt wrong, and the concrete change
made in response. Empty until a playable build exists.

- (none yet — the opening-screen enemy fix and HUD glyph fix above were both
  found during implementation/manual-QA, before any playtest by a person
  other than the implementer, so neither counts as spec item 5's
  playtesting-driven change. That still needs to happen with a real player.)

## Known issues / open questions

- Lives (3) and win threshold (15 kills) are settled but explicitly marked as
  **initial, tunable** numbers in `CONTENT_SOURCE.md` — the first real
  playtest should confirm or adjust them, and that adjustment is the
  intended candidate for spec item 5's "change traced to actual play" (see
  section below once it happens).
- All design decisions in `CONTENT_SOURCE.md` §"Decisions requiring
  confirmation" are now resolved (fire control, lives, win condition, key
  scheme, HUD). None remain open pending user input.
- Whether keyboard-only controls need any on-screen affordance change for the
  390×844 phone viewport (root `CLAUDE.md` requires keyboard reachability,
  not touch support, but a phone visitor with no keyboard attached may not be
  able to play at all — flag for discussion, not yet resolved).
- No deadline date is recorded in `CRIT_BRIEF.md` itself — confirm the actual
  cutoff from the course Assessments page before relying on any assumed date.
- **Implementation call not explicitly confirmed with the user:** the player's
  direction-key control was built as exactly four cardinal headings
  (0°/90°/180°/270°, `game/tank.ts`'s `PlayerTank`), not a continuous
  free-angle heading. `CONTENT_SOURCE.md`'s wording ("pressing a direction key
  different from the tank's current heading turns the tank") is consistent
  with this reading and it matches classic arcade tank games, but it was my
  architectural choice during implementation, not a decision spelled out and
  confirmed in `CONTENT_SOURCE.md` beforehand. Flagging for confirmation now
  that a playable build exists.

## Corrections log

Record here if evidence later contradicts an earlier ✅, or if a requirement
in `CRIT_BRIEF.md`/`CONTENT_SOURCE.md` turns out to be stale/wrong — do not
silently edit those files to make them agree with the implementation.

- (none yet)
