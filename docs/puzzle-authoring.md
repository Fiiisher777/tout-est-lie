# Tout est lié content

This build contains nine synthetic development puzzles: two normal positions and one dedicated daily puzzle per locale. They are not editorially approved production content. The second position intentionally exercises harder decoys and is exempt from the production difficulty progression gate.

The release target is 100 playable positions per locale, not 300 original concepts. Each locale pack maps numbered positions to concrete puzzle IDs. Direct translations use `translated-equivalent`; adaptations use `adapted-equivalent`, both referencing the source ID and revision. Independent replacements use `original`. All equivalents receive independent native-language review. Never silently fall back to another language.

Each puzzle requires 16 unique visible cards, four groups of four, complete disjoint membership, difficulty 1–5, stable IDs, revision, locale, source metadata, hints, and review status. UI strings belong in i18n; puzzle strings belong in JSON. Group and hint IDs are local to their puzzle; puzzle IDs are globally unique. Production positions 1–20 have difficulty 1, 21–40 difficulty 2, etc.

PAIR identifies two members of an unsolved group. CATEGORY contains an authored partial clue. IDs are once per session, never auto-solve groups, and are granted only after a rewarded outcome from the ads abstraction. V1 has no elimination hint.

Optional `editorial.intendedReason`, `knownDecoys`, `ambiguityNotes`, and group `intendedReason` support author/editor review only. Rendering and rules must not require them.

## Validation and review

`npm run validate:content` structurally validates every development puzzle and catalog and checks malformed fixture rejection. `validateCatalog(packs, true)` additionally requires 100 contiguous positions per locale, production difficulty progression, and revision-matched editorial approval. Development fixtures deliberately fail that production gate.

Structural validity does not establish semantic uniqueness. Before approval:

1. An independent fluent reviewer solves from visible labels alone.
2. Enumerate plausible cross-group links, secondary meanings, broad categories, regional/cultural readings, and visual confusables. Record decoys and ambiguity notes.
3. Reject solutions depending on unsupported hidden metadata.
4. Search for a second complete partition. Human/AI suggestions may supply candidate four-card groups for an exact-cover search; no candidate list can prove semantic uniqueness.
5. Record reviewer and reviewed revision. Re-review after any content or translation edit.

The exact-cover editorial aid is a future authoring tool, not an automated claim in this build.

## Daily development behavior

The development build assigns one fixed dedicated puzzle per locale, repeated each UTC day. The date is still pinned at launch, refreshed at UTC midnight, and progress is keyed by locale/date. This deliberately avoids a catalog-length-dependent rotation. The schedule resolver and validator support immutable date-to-locale-to-puzzle/revision assignments. Before production, supply that schedule instead of the fixed development assignment and present missing dates as unavailable. Device time is trusted offline.

## Session boundaries

Active state lives only in the mounted game view. Pure engine functions return immutable transitions. The seed and shuffle count reproduce layouts. The engine takes injected monotonic/UTC clock samples. Overlapping app, ad, navigation, and manual pause reasons prevent premature timer resumption. UTC timestamps remain independent of active gameplay duration.

Completion freezes an immutable result, emits terminal analytics once, and automatically asks the shell to persist and navigate. A save failure retains the result with an explicit retry button. Restart ends a nonterminal session with one abandonment event and creates a new session. Backgrounding and temporary navigation suspension alone do not abandon a session. No state is persisted mid-puzzle.

Starter save migration preserves preferences and discards demo score/progress data. Daily wins survive failed replays. Normal progress uses concrete puzzle IDs. The storage namespace intentionally remains stable so migration can run.

## Manual acceptance still required

Exercise smallest supported iPhone width, Android, long accented labels, large accessibility fonts, screen readers, reduce motion, app switching during a rewarded dialog, leaving/restarting, and storage failure retries. Bundling and pure unit tests do not replace device acceptance.
