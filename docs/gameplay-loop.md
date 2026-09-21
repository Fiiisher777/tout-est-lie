# NODI linear progression and timed wrong answers

## Progression and migration

Player save version 3 adds one unlock boundary per locale:
`highestUnlockedLevel: {fr: 1, en: 1, es: 1}`. `completedLevels` remains the existing
win history, not a second lock mechanism. Launch permission uses the boundary AND
membership in the active runtime catalog. Locale progress is independent.

Version-2 real-game saves retain all completed IDs, valid results, daily wins and
preferences. Migration takes the maximum of the saved boundary and each known
completed position + 1. Sparse free-choice wins therefore keep access through the
highest win; unknown IDs stay in completion history. Metadata can resolve existing
production IDs without making their draft puzzles playable. No progress defaults
to 1. Versions 0/1 keep the pre-existing starter-demo migration (preferences only).
Future player versions remain write-protected. Migration occurs on read; the next
successful player save writes version 3. Reopening before that repeats the same
non-destructive derivation. Explicit Reset Progress still intentionally resets it.

Wins advance the boundary; losses/daily wins do not. Replays never lower it. A win
at currently available level 35 may reserve boundary 36, but no launch or Next
button exists until position 36 is actually available in the runtime catalog.
Levels remain visible with disabled buttons and localized locked labels. GameScreen
also rejects direct links to locked levels. Draft Preview keeps its isolated direct
access. Production uses the same lock checks plus its unchanged approval-only loader.

## Wrong answers and timing

`src/config/playtest.ts` centralizes `wrongAnswerPenaltySeconds: 5`. Existing values
remain 60/75/90/105/120 seconds by difficulty, positions 1–3 untimed, one +30-second
continue, five lives and thirty-minute regeneration.

The pure engine increments the historical `mistakes` field as an unbounded wrong-
submission count. It no longer calculates remaining mistakes or loses at four.
An incorrect selection clears selected cards, preserves board/solved groups and
adds up to five seconds to cumulative `penaltyMs`, capped at the remaining time.
No hidden penalty debt carries into rewarded time. Actual active elapsed time is
kept separately. Untimed wrong answers add no penalty and never create a timer.

Both clock expiry and penalty expiry use the same timeout transition. First expiry
freezes gameplay; declining ends the attempt. A rewarded continuation adds exactly
30 seconds once, and the second expiry ends the attempt. The existing idempotent
normal-life settlement charges only a final loss, never each wrong answer or win.
Restart preserves the same timed attempt's budget, penalties, hints and continue
eligibility. The existing development/tester economy gate is unchanged.

Active-session save version 2 stores penalties; version-1 active saves load with
zero penalty, without retroactively penalizing their old errors. Existing elapsed
time, granted budget, hints, solved groups, order and continuation eligibility stay
intact. Historical terminal losses stay terminal so interrupted life settlement can
finish idempotently. Lives use their existing independent store; player migration
does not touch it. A previously unrestricted unfinished future-level save is retained
but its normal route is locked until progression allows it.

## UI, results and analytics

Mistake dots and remaining-mistake copy are removed. Wrong timed answers show a
short `−5 s` message and negative haptic feedback; untimed answers use ordinary
incorrect feedback. No header redesign. Results retain the wrong-answer count.
Victory places Next Level first, Replay second, and offers Levels; the last
available level has no Next button.

Existing `group_submitted` and `mistake_made` events track wrong answers. The latter
now includes per-answer actual `penaltySeconds` and cumulative `totalPenaltySeconds`,
not remaining mistakes. Completion/failure results include penaltySeconds and
rewardedContinueUsed. Existing timeout, rewarded-continue, failure and victory
events remain. New `level_unlocked` fires after successful player persistence;
`next_level_continued` fires on the Next Level action. No tick analytics or SDK.

## Verification scope

Tests exercise timed/untimed penalties, clamping, two timeout phases, preservation
of real active time, save migration, offline life settlement, unlock/replay rules,
sparse prior wins, storage reloads, actual level-list/direct-route guards and the
actual result button routing, including the final tester level. Real-device feel
and accessibility still require an Expo Go or standalone tester playtest.

## Validation and changed files

Typecheck and lint passed; 311 tests across 27 suites passed. Structural validation
passed for all 37 records (zero approved playable, unchanged). Tester Android and
iOS bundle exports succeeded. The only build warning was NO_COLOR being ignored
because FORCE_COLOR is set. No commit or push was performed.

Exact files added or modified:

- `docs/gameplay-loop.md`
- `docs/playtest-economy.md`
- `docs/tester-distribution.md`
- `src/components/LevelCard.tsx`
- `src/config/playtest.ts`
- `src/config/tester.test.ts`
- `src/game/GameView.tsx`
- `src/game/engine/countdown.ts`
- `src/game/engine/engine.test.ts`
- `src/game/engine/engine.ts`
- `src/game/engine/penalties.test.ts`
- `src/game/preview/entry.test.ts`
- `src/game/types.ts`
- `src/game/usePuzzleSession.ts`
- `src/i18n/en.ts`
- `src/i18n/es.ts`
- `src/i18n/fr.ts`
- `src/screens/GameScreen.tsx`
- `src/screens/HomeScreen.tsx`
- `src/screens/LevelsScreen.tsx`
- `src/screens/ResultsScreen.tsx`
- `src/screens/progressionNavigation.test.ts`
- `src/services/analytics.ts`
- `src/services/haptics.ts`
- `src/state/PlayerProvider.tsx`
- `src/state/activeSession.test.ts`
- `src/state/activeSession.ts`
- `src/state/economySettlement.test.ts`
- `src/state/migrations.test.ts`
- `src/state/migrations.ts`
- `src/state/player.ts`
- `src/state/progression.test.ts`
- `src/state/progression.ts`
