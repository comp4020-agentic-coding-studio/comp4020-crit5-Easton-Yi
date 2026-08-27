# CRIT_QA_NOTES.md — Living Verification Record (Crit 5)

> Evidence only. Requirements live in `CRIT_BRIEF.md`; intended design lives in
> `CONTENT_SOURCE.md`. Do not mark anything ✅ here without an actual command
> run or an actual manual check performed — this file records what has been
> verified, not what is planned.

Status legend: ⬜ not started · 🔶 in progress / partially verified · ✅ verified · ❌ failing

## Traceability: spec item → implementation → evidence

| # | Spec item (from `CRIT_BRIEF.md`) | Implementation status | Verification method | Result |
|---|---|---|---|---|
| 1 | Deployed live at a public GitHub Pages URL by the cutoff | ⬜ not started | CI deploy + visit deployed URL | not yet run |
| 2 | Losable: a wrong move must be possible, and play must end (win/loss/finish) | ⬜ not started (see `CONTENT_SOURCE.md` §"Win / loss / finish" — lives system proposed, needs confirmation) | manual playthrough to an ending | not yet run |
| 3 | Self-teaching: zero instructions anywhere; opening screen invites the first move | ⬜ not started | manual: fresh load, no prior context, first move attempted cold | not yet run |
| 4 | A stranger can reach an ending within 5 minutes | ⬜ not started | manual playtest, timed | not yet run |
| 5 | One rule under a focused automated test, **and** one change traced to actual play | ⬜ not started | `pnpm check` output + a documented before/after change below | not yet run |
| 6 | Repo shows process: incremental commits, `PROCESS.md`, `reflections/crit-5.md` | ⬜ not started | `git log`, file existence | not yet run |
| 7 | Presenter can explain AI direction/grounding/correction | ⬜ n/a until build exists | crit conversation | n/a |

## Automated checks

Command(s) run and actual output go here as implementation proceeds. Do not
pre-fill expected results.

```
(none run yet)
```

## Manual QA — both marking viewports

Per root `CLAUDE.md`: both 1920×1080 and 390×844 must be actually played, not
just automated-checked.

| Viewport | Checked? | Notes |
|---|---|---|
| 1920×1080 (desktop) | ⬜ not yet | |
| 390×844 (phone) | ⬜ not yet | keyboard-only input on a phone viewport needs a decision — see open question below |

## Playtesting-driven change (spec item 5, second half)

Spec requires at least one real design change that came from actually playing
the finished build, not from reading the code. Record it here once it
happens — include what was played, what felt wrong, and the concrete change
made in response. Empty until a playable build exists.

- (none yet)

## Known issues / open questions

- Fire control mechanism not yet decided — see `CONTENT_SOURCE.md` §"Decisions
  requiring confirmation" item 1.
- Lives count / win condition not yet decided — item 2–3 in the same section.
- Whether keyboard-only controls need any on-screen affordance change for the
  390×844 phone viewport (root `CLAUDE.md` requires keyboard reachability,
  not touch support, but a phone visitor with no keyboard attached may not be
  able to play at all — flag for discussion, not yet resolved).
- No deadline date is recorded in `CRIT_BRIEF.md` itself — confirm the actual
  cutoff from the course Assessments page before relying on any assumed date.

## Corrections log

Record here if evidence later contradicts an earlier ✅, or if a requirement
in `CRIT_BRIEF.md`/`CONTENT_SOURCE.md` turns out to be stale/wrong — do not
silently edit those files to make them agree with the implementation.

- (none yet)
