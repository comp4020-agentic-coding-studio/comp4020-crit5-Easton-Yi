# CRIT_BRIEF.md — Crit 5 · Week 6: A Game

> Authoritative snapshot. Source: https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/05-game/
> Fetched: 2026-08-28. If this may be stale, re-check the live page before treating it as ground truth — do not
> silently reinterpret or weaken anything below to fit whatever gets implemented.

## The brief (task framing)

Build a tiny browser game — one mechanic is usually enough — obvious in ten
seconds, still interesting at five minutes, no tutorial in sight.

- **Context vs. C4 (the instrument):** C4 couldn't be "played wrong." This
  crit inverts that — a game needs rules, stakes, and an ending, so failure
  must be possible and play must conclude.
- **Scope:** Open to interpretation — an arcade loop, a puzzle, or a
  Twine-style narrative experience all qualify, as long as it invites play.
- **Central constraint — no tutorial:** References Bushnell's law (easy to
  learn, difficult to master), but the "learning half" must happen
  wordlessly. Explicitly banned: a how-to-play modal, an instructions page,
  or README text that substitutes for either. The game may be named, but the
  opening screen alone must make the first move obvious (the design concept
  of *affordance* — World 1-1 of Super Mario Bros. is the canonical
  example). After the first move, play teaches whatever comes next.
- **On depth:** The five-minute engagement window demands depth beneath a
  simple surface — a skill that sharpens, a choice that matters, or a thread
  worth pulling. One mechanic is generally sufficient; two interacting
  mechanics are "the harder, better move" if a stranger can still finish
  within five minutes.
- **Testing vs. playtesting:** One rule must sit under a focused automated
  test, but the game must also be played at both marking viewports. A test
  can confirm "a collision ends the round," but only human play reveals
  "whether the collision feels fair."
- **Technical constraint:** Must stay static/client-side (a game or branching
  Twine-style story needs no backend), deploying directly to GitHub Pages.
- **Pod playtesting process:** Same format as C4 — your pod plays the game
  cold. This week's key rule: presenters must stay quiet until someone has
  finished it or given up. The no-tutorial requirement can't be tested or
  faked — real hands on a real keyboard reveal the truth in about ten
  seconds.

## The spec (marking contract — non-negotiable checks)

The brief poses an open problem; this is the fixed contract the tutor checks
against. Some items are mechanically verifiable, others require human
judgment at the crit.

1. Deployed live at a public GitHub Pages URL by the cutoff.
2. **Losable:** a wrong move must be possible, and play must end (win, loss,
   or finish).
3. **Self-teaching:** zero instructions anywhere (on-screen or off); the
   opening screen must invite the first move, with subsequent play teaching
   the rest.
4. A stranger can pick it up and reach an ending within five minutes.
5. One game rule has a focused automated test, **and** one change made
   originated from actually playing the finished build rather than reading
   its code.
6. Repo shows process: incremental commits, a `PROCESS.md` overview, and
   `reflections/crit-5.md` reflection.
7. You (the presenter) can explain how you directed, grounded, and
   corrected the AI-assisted work.

## Deadline

No specific calendar date/cutoff time is stated on the crit page itself —
only "by the cutoff" is referenced. **The actual deadline lives on the
course Assessments page, not here — check it there rather than assuming.**

## Non-negotiables for implementation

- Do not add a tutorial, instructions modal, help page, or README text that
  substitutes for one, under any framing (tooltip, "how to play" link,
  onboarding overlay). This is explicitly banned by the brief.
- The game must be losable — an unlosable toy does not satisfy the spec,
  no matter how polished.
- Must ship as static/client-side only — no backend/server dependency.
- Must deploy to GitHub Pages at this repo's Pages base path (see root
  `CLAUDE.md` — base path is a known footgun from Assignment 1).
- At least one game rule needs a focused automated test AND at least one
  real design change must trace back to actual playtesting, not
  code-reading alone (record this trace in `CRIT_QA_NOTES.md`).
- Both marking viewports (1920×1080 and 390×844) must be played, not just
  automated-checked, per root `CLAUDE.md` convention.
