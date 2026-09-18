# French production batch 01 — import audit

Source: `~/Downloads/tout-est-lie-fr-batch-01.json`

Source SHA-256: `55a1b5daa6434fa162991f2f016a6eb5243f93d80d0c0511827531df8f7b16e1`

Imported 15 first-import French production records. Every record remains `draft`
and revision `1`; no approval command was run. Original level IDs and position
mapping were preserved, including IDs whose numeric suffix differs from position.
The original Downloads file was not modified.

## Schema preflight and exact transformations

Preflight used the current TypeScript `validateProduction` and `importDrafts`
implementations, transpiled in memory exactly as the existing CLI does. The raw
batch reported 60 errors: missing root `intendedReason`, `knownDecoys`, and
`ambiguityNotes` on 15 records each, plus 15 invalid production `review` objects.

For each of the 15 records, and only for schema compatibility:

- Moved `editorial.intendedReason` to root `intendedReason`, unchanged.
- Moved `editorial.knownDecoys` to root `knownDecoys`, unchanged.
- Moved `editorial.ambiguityNotes` to root `ambiguityNotes`, unchanged.
- Removed the now-empty `editorial` wrapper.
- Removed fixture-only `review: {"status":"draft"}`. Production requires root
  `status` and does not define `review.status`. Production `review` is optional
  on drafts; when present it must contain the full approval metadata shape.
- Removed fixture-only `localization: {"kind":"original"}`. Every record already
  has the equivalent production `concept.relationship: "original"`; this retained
  production field is the source of truth.

The validator permits unknown keys; that does not make engine-only fields part of
`ProductionPuzzle`. The importer drops external review/rejection metadata but does
not relocate nested editorial notes. Normalization was explicit before import,
not a change to the importer/schema.

A deep comparison verified all imported objects equal their source objects after
exactly the transformations above. No card text, accent, group, label, explanation,
hint, ID, position, difficulty, rationale, concept, or editorial note was changed.
The standard importer then appended the normalized records as drafts.

## Sample handling

Only `sample-fr-001`, explicitly labelled SAMPLE DRAFT ONLY, conflicted with French
position 1. Its complete original record was archived in
`content/archive/sample-fr-001.json` and removed from the working catalog.
`sample-en-001` and `sample-es-001` remain unchanged, with their valid source link.
No real production content, development fixture, or release baseline was removed
or changed.

Pipeline unit tests previously imported the live three-record sample catalog.
Their unchanged sample data now lives in
`src/game/content/production/__fixtures__/samples.json` so importing real content
does not break those synthetic approval/equivalence tests. Separate batch tests
verify the real catalog and release exclusion.

## Verification

- Exactly 15 French production drafts; 17 total records including two EN/ES samples.
- French positions: 1–11 and 21–24; unique IDs and locale/position pairs.
- Difficulty 1 at positions 1–11; difficulty 2 at positions 21–24.
- Each puzzle: 16 unique visible cards, four groups of four, exactly one intended
  assignment per card, valid hint references. Semantic uniqueness is not claimed.
- All 15 imported statuses remain draft; all revisions remain 1.
- Both release loader APIs return zero playable puzzles and zero level entries.
- Typecheck, lint, full tests, `puzzles:validate`, and `puzzles:report` passed.
- Full test suite: 176 tests passed across 14 suites.
- iOS and Android technical bundles passed and exported to `dist/`.
- Remaining build warning: `NO_COLOR` is ignored when `FORCE_COLOR` is set.
- `puzzles:release-check` exited 1 as expected with exactly 300 blockers:
  283 missing positions (85 FR, 99 EN, 99 ES) and 17 unapproved records.
  Structural errors: zero. All 100 approved positions are still missing per locale.

The generated `report.md` and `report.json` contain the current editorial report.
No gameplay, UI, persistence, analytics, ads, schema, importer, or release-loader
implementation changed. No commit or push was performed.
