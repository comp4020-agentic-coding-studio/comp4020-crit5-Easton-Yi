# Crit 5 reflection

**What was the breakthrough that moved the work forward?**

The breakthrough wasn't a code trick, it was refusing to trust a green
`pnpm check` as proof the game actually worked. Everything typechecked, built,
and passed its tests on the first try, and it would have been easy to call
that "done." Instead I ran the real build in a browser at both marking
viewports and just looked at it — and the opening screen was empty. The
spawner's first wave didn't fire for five seconds, so a stranger loading the
game for the first time would see a maze with nothing in it and nothing to
react to, which quietly broke the entire no-tutorial premise the spec cared
about most. A shield emoji in the HUD also turned out to render as blank
boxes with no color-emoji font available. Neither of those would ever show up
in a test suite; they only show up when you look at the actual pixels. Fixing
both — spawning one enemy in the player's line of sight at start, swapping the
emoji for plain Unicode glyphs — is what actually made the game playable, not
the tests passing.

**What did this work change about who I want to be as a software developer?**

I want to be someone who treats "the checks pass" as necessary, not
sufficient. It's tempting to stop the moment CI is green, especially under
time pressure. This crit was a concrete case where the gap between "compiles
and passes tests" and "actually works for a real person" was invisible until
someone opened it and looked, and I want that instinct — go look, don't just
trust the dashboard — to be automatic rather than something I have to
remember to do.
