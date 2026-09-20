# Puzzle production guide

The game rules and mobile UI are unchanged. This is a JSON-and-Markdown editorial
workflow, not a CMS. It supports 100 positions **per language**, not 300 necessarily
unrelated concepts. Structural checks cannot prove a puzzle has only one plausible
solution. A reviewer must make that judgment.

## Where content lives

- `content/production/puzzles.json`: the working production catalog, including drafts.
- `content/production/released.json`: the last explicitly recorded release baseline.
- `src/game/content/development/`: existing playable development/test fixtures.
- `content/archive/`: rejected/obsolete material, never loaded by the game.
- `docs/editorial/report.md`: readable editorial review report.
- `docs/editorial/report.json`: machine-readable counts, coverage and all errors.

The remaining `sample-en-001` and `sample-es-001` records are **SAMPLE DRAFTS**,
copied from fixtures to demonstrate the tooling. The conflicting French sample
was moved intact to `content/archive/sample-fr-001.json` when the first real French
batch was imported. Pipeline unit tests use a separate frozen sample fixture. Their provisional equivalence claims still need editorial review.
They are not approved, not production quality claims, and not playable release content.
Remove/replace them before producing the real catalog. Do not approve them merely
to make a build pass.

## IDEA → DRAFT → STRUCTURAL VALIDATION → EDITORIAL REVIEW → APPROVAL → RELEASE

1. **Idea.** Decide the four intended categories, audience and language. Check that
   each category has exactly four suitable items, and consider alternate readings.
2. **Draft.** Copy a sample record, assign a permanent `levelId` (the puzzle ID),
   `position`, `locale`, `revision: 1` and `status: "draft"`. Replace all sample words,
   groups, clues and rationale. Do not copy `review` data, including fixture-only `review.status`. IDs stay stable across
   revisions. All content is Unicode; keep accents.
3. **Structural validation.** Run `npm run puzzles:validate` in the project folder.
   It validates the entire current production catalog. Fix each reported path.
   A successful check changes no files and confers no editorial approval. After
   reading the results, explicitly set the status to `structurally_valid`.
4. **Editorial review.** Set `status: "editorial_review"`, then run
   `npm run puzzles:report`. Open `docs/editorial/report.md` in a Markdown viewer
   or give the report to another reviewer/AI. Review the visible cards, all intended
   groups, competing interpretations, familiarity, hints and cross-locale claims.
   Record rationale and ambiguity decisions in the content. AI review is advisory;
   an accountable editor must explicitly accept its conclusions.
5. **Approval.** After the editor has accepted the current content, run:

   ```sh
   npm run puzzles:approve -- puzzle-en-001 --reviewer "Editor name"
   ```

   This is an explicit editorial action, not a validation shortcut. It requires
   `editorial_review`, a valid catalog and a named reviewer. It records `reviewedBy`,
   the current UTC `reviewedAt`, `approvedRevision`, and an exact canonical
   `approvedContent` snapshot. Commit the content and review data together.
6. **Release.** Run `npm run puzzles:release-check`. Only when it passes, run
   `npm run puzzles:record-release` to lock the approved revision baseline, commit
   that baseline, then use `npm run bundle:release` for the final release build.
   The final build command reruns the strict check before bundling iOS and Android.

To reject a puzzle, explicitly set `status: "rejected"` and write a specific
`rejectionReason`. It remains visible in reports but never playable. Move it to
`content/archive/` when replacing its position, and update affected references.
Rework rejected content as a new draft; repeat validation and review.

## Exact status rules

| Status | Meaning and requirement |
| --- | --- |
| `draft` | Unreviewed work; may have errors while being written. The validation command reports those errors and exits unsuccessfully until fixed. Never playable. |
| `structurally_valid` | Author explicitly records a successful structural check. It is a claim, rechecked by tooling, not a cached guarantee. Never playable. |
| `editorial_review` | Structurally valid candidate submitted for ambiguity/language/difficulty review. Only this status can use the approval command. Never playable. |
| `approved` | Explicit named, dated approval of the exact current revision and content; all current structural/catalog checks still apply. Only these records are eligible to play. |
| `rejected` | Editor declined the puzzle and supplied a reason. Never playable; keep it for learning or archive it. |

Validation is read-only; it never promotes any status. Setting the string
`approved` alone is insufficient. Approval data is trusted editorial data under
version control, not authentication or a cryptographic identity system.

## Authoring fields

Use the sample JSON as a copyable template. Production uses the existing engine
shape (`schemaVersion`, `levelId`, `locale`, `difficulty`, `revision`, `cards`,
`groups`, `hints`) plus the editorial fields below. The loader projects approved
records to the unchanged engine schema; fixture-only `review`/`localization`
formats are not the production approval mechanism.

- `position`: integer 1–100, unique within its locale.
- `difficulty`: 1 for positions 1–10; 2 for 11–35; 3 for 36–60;
  4 for 61–80; 5 for 81–100.
  The shared source is `src/game/content/difficulty.ts` (10/25/25/20/20 levels per locale).
- `revision`: positive integer. Increment whenever revising reviewed/published content.
- `cards`: exactly 16 `{id, text}` objects, with unique IDs and visible text.
  Duplicate checks normalize Unicode NFC, whitespace and locale-aware case;
  accents are preserved, not stripped.
- `groups`: exactly four `{id, label, cardIds, explanation, intendedReason}` objects.
  Each references four distinct cards; every card belongs to exactly one group.
- `hints`: at least one PAIR (`kind: "pair"`, two distinct member `cardIds`) and
  one CATEGORY (`kind: "category"`, nonempty `text`) hint. Each has a unique `id`
  and a valid `groupId`. Additional hints may cover other groups.
- `rationale`: why the puzzle and its difficulty are appropriate.
- `intendedReason`: the intended overall partition logic.
- `knownDecoys`: array of plausible alternate readings, or `[]` after consideration.
- `ambiguityNotes`: explicit review notes; say what remains uncertain. Do not
  claim semantic uniqueness merely because validation passes.
- `concept`: relationship described below.
- `status`, optional `review`, optional `rejectionReason`: governed by the rules above.

**Production status and metadata shape:** root `status` is required. Do not add
`review.status`: it is an engine/development-fixture field, not a production field.
Production `review` is optional for drafts; when present it must contain all four
approval fields (`reviewedBy`, `reviewedAt`, `approvedRevision`, `approvedContent`).
The importer removes external `review` and `rejectionReason` data and forces draft
status. It does not translate engine-fixture metadata into production metadata.

Production editorial notes belong at the root: `intendedReason`, `knownDecoys`,
`ambiguityNotes`. A batch using an `editorial` wrapper must move these values
unchanged to the root before import. Do not discard notes or overwrite conflicting
root values. Production uses `concept`, not fixture `localization`. The current
runtime validator is not an exact-key validator: unknown extra fields may survive
import, but that does not make them part of the TypeScript production schema.
Remove only demonstrably redundant fixture fields, and document every conversion.


All editorial fields and group explanations are required by structural validation,
including for a draft to pass. A draft can be stored incomplete, but it will fail
validation until those fields are filled in.

## Equivalence across languages

Use one stable `concept.id` for related puzzle concepts. The first record has
`relationship: "original"` and no source. Each related record has
`source: {"puzzleId": "source-id", "revision": 1}` and exactly one of:

- `direct-equivalent`: the same underlying concept and category logic work naturally.
- `adapted-equivalent`: the concept is retained with language/cultural adaptation.
- `locale-replacement`: a different puzzle replaces that conceptual slot for the
  target locale; explain why in `rationale` and `ambiguityNotes`.

No shared visible words are required. References must point to an existing record
of another locale, with the same concept ID and the exact current source revision.
Cycles and multiple original roots for one concept are rejected. Independent
locale-specific concepts can instead have their own original concept ID.
Full cross-locale concept coverage is reported, but is not a release requirement:
the requirement is 100 approved positions in **each** locale, with valid links
where links are declared. A source does not itself have to be approved to review
an independently approved adaptation; its reference must still resolve.

## Editing reviewed content

Change the status back to `draft` or `editorial_review`, increment `revision`, and
repeat the workflow. Old review metadata may remain as history until reapproval.
Changing the revision makes approval stale. Changing any authored content also
invalidates the snapshot even if someone forgets to increment the revision.
The runtime excludes these records immediately; the validator reports stale
approval if their status still says `approved`. Update dependent equivalence
source revisions only after reviewing whether the adaptation is still valid;
that reference edit invalidates the dependent record's approval too.

The release baseline additionally rejects removed published IDs, revision
regressions and edits that reuse a published revision. Do not hand-edit the
baseline to bypass these checks. Git retains previous content and review history.

## Importing batches from Claude, ChatGPT or another author

1. Give the author this guide and a sample JSON record. Request a **JSON array** of
   records with reserved unique IDs/positions, the required fields and `draft`
   status. Supply source records/revisions for claimed equivalents. Ask explicitly
   for decoys and ambiguity notes, not unsupported guarantees of uniqueness.
2. Save the response as a UTF-8 `.json` file without Markdown code fences. Reserve
   positions beforehand; imported records do not silently overwrite existing ones.
3. Run `npm run puzzles:import -- /path/to/batch.json`. The importer strips any
   external approval claims and forces every imported record to `draft`. It checks
   the combined catalog before writing. A failed import leaves the catalog intact.
4. Fix the reported paths in the batch and retry. Include referenced new originals
   in the same batch, or reference existing catalog records.
5. Run `npm run puzzles:report`, review every imported puzzle, and follow the normal
   status/approval workflow. Importing is never approval.

For revisions to existing IDs, edit the existing record rather than importing a
second copy. Increment its revision and obtain a new approval.

## Commands and development behavior

| Command | Purpose |
| --- | --- |
| `npm run puzzles:validate` | Structural/catalog/revision checks for whatever production content exists; partial catalogs are allowed. |
| `npm run puzzles:report` | Regenerate Markdown + JSON review reports without approving or changing puzzles. |
| `npm run puzzles:release-check` | Fail unless all 300 positions (100 each FR/EN/ES) are approved, correctly graded, and structurally valid. |
| `npm run puzzles:approve -- ID --reviewer "Name"` | Record an explicit editor's approval of one reviewed puzzle. |
| `npm run puzzles:import -- batch.json` | Validate and append a batch as drafts, dropping external approval metadata. |
| `npm run puzzles:record-release` | After a successful strict check, record the release revision baseline. |
| `npm run bundle:release` | Strict check followed by both mobile bundles. |

Ordinary `npm start` uses the unchanged development fixtures, so an empty or partial
production catalog never prevents local gameplay. To inspect approved production
content during development, start with:

```sh
EXPO_PUBLIC_PUZZLE_CONTENT=production npm start
```

Only approved records appear in this preview, even for partial packs. Release
builds always use production approval filtering, regardless of this variable.
`npm run bundle` remains available for technical bundle validation of a partial
catalog; it is **not** a content release-readiness check. Use `bundle:release` when
shipping. With only the sample drafts, the production level list is empty and
Play is disabled. Development daily fixtures never become production dailies;
a production daily schedule/content is outside this 100-normal-position task.
The daily entry is unavailable in release content until that is supplied.

Keep reports in version control alongside editorial changes. The generated JSON
includes missing approved positions and detailed release blockers. Missing
positions, missing locales and unapproved samples are expected before production
is complete; they are not permission to bypass the final release gate.
