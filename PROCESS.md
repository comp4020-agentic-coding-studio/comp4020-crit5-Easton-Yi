# Process overview

## Deployed game url:

https://comp4020-agentic-coding-studio.github.io/comp4020-crit5-Easton-Yi/

## What I built

**Maze Standoff**, a top-down maze tank game: the player steers a tank with
arrow keys/WASD (pressing a direction that differs from the current heading
turns in place; holding the matching direction drives forward; releasing
stops immediately, no drift) and fires with click or spacebar, while up to
seven AI tanks — reusing verbatim the line-of-sight/A\*-chase/wall-bouncing
enemy algorithm from an earlier solo pygame prototype,
[Tank_Battalion](https://github.com/comp4020-agentic-coding-studio/Tank_Battalion) —
hunt the player down. The idea was to keep everything about that prototype's
visual design and enemy AI unchanged, and change only the one thing the brief
required: replace its autonomous player-FSM with a human at the keyboard.

## The moments that mattered

1. **Porting a design "verbatim" turned out to need an actual verification
   pass, not just a read-through.** After writing the visual-design section
   of `docs/CONTENT_SOURCE.md` from memory of the reference repo, I asked
   Claude to check it against the reference repo's real settings — not trust
   its own summary. That check found a genuinely missed constant
   (`COLOR_PATH`) that had been skipped in the first pass. The lesson carried
   forward: "ported verbatim" is a claim that needs grepping the source, not
   just remembering it.
   [`48e158c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-Easton-Yi/commit/48e158cddce80b8bedfc1cbc7f854d30eb06d7ee)

2. **The no-tutorial constraint forced real design decisions, not just
   implementation ones.** Two choices — whether to bind both arrow
   keys/WASD or force a pick, and whether to keep the reference project's
   debug HUD state-label line — only have a right answer once you take "no
   instructions anywhere" seriously as a constraint on a stranger's first
   ten seconds. I asked for game-design reasoning rather than accepting the
   first plausible answer, which is what surfaced the actual argument
   (binding both costs nothing and removes a guess; a repurposed debug label
   risks reading as an implicit hint). I also reconsidered the `F` fire key
   against the same constraint mid-conversation and swapped it for spacebar,
   the more established convention, before any of it was built.
   [`7961d57`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-Easton-Yi/commit/7961d571dcee63c7d5fef3e3bb841a4435b84e0e)

3. **A green `pnpm check` said nothing about whether the game was actually
   playable, and looking caught two real bugs.** After `pnpm typecheck` /
   `build` / `vitest run` all passed, I ran the actual dev build in
   Playwright's Chromium at both marking viewports and looked at
   screenshots instead of accepting the green check. That surfaced two bugs
   no automated check could have found: the opening screen spawned no enemy
   for the first five seconds (silently breaking the "opening screen
   invites the first move" requirement, since there was nothing on screen to
   react to), and the lives HUD's shield emoji rendered as empty tofu boxes
   with no color-emoji font available. Both are fixed in the same commit —
   `spawnInitialEnemy()` now places one enemy in the player's line of sight
   at spawn/restart, and the HUD glyph is a plain Unicode `●`/`○` instead of
   an emoji.
   [`910895f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-Easton-Yi/commit/910895fa27e182871bc840bedcb008f0de659126)

## Still open

- Spec item 5's playtesting-driven change hasn't happened yet: the two bugs
  above were caught during my own manual QA pass, before anyone else played
  the build, so they don't count as a change traced to someone else's actual
  play. A real playtest is still needed, along with tuning the 3-lives/15-kill
  numbers from it.
- The player's direction control was implemented as four discrete cardinal
  headings rather than continuous free-angle steering — a reasonable reading
  of `CONTENT_SOURCE.md`'s wording, but an architectural call made during
  implementation rather than one explicitly confirmed beforehand. Recorded in
  `docs/CRIT_QA_NOTES.md` for follow-up.
