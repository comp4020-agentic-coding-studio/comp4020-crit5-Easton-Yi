# Crit 5 · Week 6: A Game

Source: https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/05-game/

## The brief

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

## The spec (marking contract)

The brief poses an open problem; this is the fixed contract the tutor checks
against — some items mechanically verifiable, others requiring human judgment.

- [ ] Deployed live at a public GitHub Pages URL by the cutoff
- [ ] Losable: a wrong move must be possible, and play must end (win, loss,
      or finish)
- [ ] Self-teaching: zero instructions anywhere (on-screen or off); the
      opening screen must invite the first move, with subsequent play
      teaching the rest
- [ ] A stranger can pick it up and reach an ending within five minutes
- [ ] One game rule has a focused automated test, **and** one change made
      originated from actually playing the finished build rather than
      reading its code
- [ ] Repo shows process: incremental commits, a `PROCESS.md` overview, and
      `reflections/crit-5.md` reflection
- [ ] You can explain how you directed, grounded, and corrected the
      AI-assisted work

## Notes

- No specific calendar date/cutoff time is stated on the crit page itself —
  only "by the cutoff" is referenced; check the Assessments page on the
  course website for the actual deadline.
- Related course topics referenced from this page: Backpressure, The studio
  crit model, Assessment, and the Week 5 lecture (Verification).
