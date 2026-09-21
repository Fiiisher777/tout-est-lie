# French curated difficulty-2 import — 2026-09-21

Authoritative source: `nodi-fr-11-35-curated-source.json` (unchanged). The 25 active
positions 11–35 are French, difficulty 2, draft/unapproved. FR 1–10 and every EN/ES
record are unchanged. No source card, label, grouping, group intendedReason, decoy,
ambiguity note or editorial note was edited. Structural validity does not prove
semantic uniqueness; generated hints still need editorial playtesting.

## Schema adaptation

- Preserve card order and exact strings; assign local card IDs `c0`…`c15`.
- Preserve group order/labels and membership; assign group IDs `g0`…`g3`.
- Copy each group intendedReason verbatim into both intendedReason and explanation.
- Preserve editorialNotes in a new optional author-only field; copy it verbatim to
  the required rationale. Required puzzle-level intendedReason joins the four
  supplied group reasons in order with newlines, without adding a new claim.
- Preserve knownDecoys and ambiguityNotes exactly. Source candidate goes into the
  optional author-only `provenance` object alongside the source filename.
- Assign independent original concept IDs `concept-fr-curated-NNN` by position;
  no translation/equivalence claims were inferred. No approval metadata added.
- User explicitly authorized 25 PAIR and 25 CATEGORY hints after the source was
  found to omit hints. Pairs are two official members, prioritizing less-obvious
  connections; category text derives only from the chosen label/reason. Lexical
  clues remain lexical, property clues retain their property, and no clue lists
  the four answers. These hints are authored draft metadata, not approvals.

## History and revisions

The existing workflow retains previous content in Git and revises an existing ID
in place. The full pre-import catalog is additionally preserved verbatim at
`content/production/history/catalog-before-fr-curated-11-35.json`. This snapshot
is not imported by runtime, report or release loaders. It also provides a baseline
for tests proving FR 1–10 and EN/ES are unchanged.

| Position | Retained ID | Previous revision | Active revision |
| --- | --- | ---: | ---: |
| 11 | puzzle-fr-015 | 2 | 3 |
| 21 | puzzle-fr-009 | 1 | 2 |
| 22 | puzzle-fr-004 | 1 | 2 |
| 23 | puzzle-fr-006 | 1 | 2 |
| 24 | puzzle-fr-007 | 1 | 2 |

New positions 12–20 and 25–35 use `puzzle-fr-curated-NNN` and revision 1.
All active replacements are draft. The generic importer rejects duplicate
positions by design: this import adapted source data and revised existing records
in place, then applied the same shared TypeScript structural/catalog validation.
No release baseline was changed. Existing revision-aware session loading rejects
stale unfinished saves without any persistence-rule changes.

## Access

Tester allowlist now requires exactly French draft positions 1–35. Existing normal
Levels and Results navigation supplies consecutive play, including 11 → 35.
Draft Preview automatically lists all current drafts under its unchanged guards.
Production still uses the unchanged approved-only loader; none of this batch is
release-playable. Countdown stays 75 seconds for difficulty 2; positions 1–3 remain
untimed. No engine, progression, lives, ads, analytics or EAS changes.

## Validation results

Typecheck and lint passed. All 285 tests across 24 suites passed. Both Android and
iOS tester bundles exported successfully. Puzzle validation reports 37 records,
zero structural errors and zero approved playable puzzles. Reports were regenerated.
Release-check exits 1 as expected: 263 missing positions and 37 unapproved records;
there are no other release errors. Only Metro warning: NO_COLOR ignored because
FORCE_COLOR is set. Real-device editorial/hint review remains pending.

Source SHA-256: `ab9e2b0edef58812d951c2fda29a7e22009cf49f006527e815fd2b52df0f1f2d`.
The history snapshot matches the pre-import committed catalog byte-for-byte.
No commit, push, approval or native/cloud build was performed.
