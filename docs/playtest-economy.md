# NODI — countdown and lives playtest

This loop is enabled in development and the explicit tester build variant.
See [tester distribution](tester-distribution.md) for standalone beta builds. Production approval filtering,
puzzle data, and editorial status are unchanged. There is no ad SDK, billing SDK,
backend, subscription, purchase UI or pricing.

## Tunable values

Edit `src/config/playtest.ts` only to tune the experiment:

- `maxLives`: 5.
- `lifeRegenMinutes`: 30.
- `relaxedPositions`: 3 (normal and preview positions 1–3 have no countdown).
- `countdownSeconds`: difficulty 1 = 120, 2 = 150, 3 = 180, 4 = 210, 5 = 240.
- `extensionSeconds`: 30, once per attempt.
- `urgencySeconds`: 20; a restrained text color change, no flashing/animation.
- `tickMs`: 250; `checkpointMs`: 1000. Meaningful transitions save immediately.

Countdown uses the existing injected monotonic active-time clock. App inactivity,
backgrounding, navigation suspension and rewarded dialogs pause active time. UTC
completion timestamps remain separate. Results retain elapsed active milliseconds.
Persisted attempts retain their granted time budget if configuration later changes.
Legacy unfinished saves acquire a budget without resetting previously elapsed time.

## Attempt rules

Four mistakes still lose; individual wrong submissions cost no life. A first
countdown expiry freezes the existing puzzle and offers one simulated rewarded
extension or End attempt. Completed reward adds the configured extension without
changing layout, solved groups, mistakes, hints or session ID. Dismissal leaves the
choice available; unavailable ads end the attempt. A second expiry finally fails.
No solved group is granted by a reward.

Manual Restart restarts the board **inside the same attempt**: clear selection,
reset solved groups and shuffle all cards. Preserve session ID, mistakes, used
hints, elapsed active time, remaining budget and rewarded-continue eligibility.
It costs no life and cannot restore resources. Restart is unavailable during a
timeout decision or after the attempt ends. This intentionally replaces the old
full-resource reset to prevent a lives/timer loophole.

A new normal attempt requires at least one life. Resuming the same unfinished
attempt is allowed even at zero lives. A final normal failure consumes one life;
a win does not. Choosing another level retains the existing abandonment semantics.
Daily mode has the same difficulty-based timer but no life gate/debit (no daily
hard lock). Informational screens and settings are always available.

## Economy and crash recovery

The pure economy model clamps lives to 0…maxLives, schedules one regeneration per
configured interval and computes all missed intervals on reopening the app. The
first loss from full starts the regeneration clock; subsequent losses do not reset
its progress. At maximum lives no next-life countdown appears. A backward device
clock grants no early regeneration. Offline operation trusts the device's wall
clock; there is no server-based anti-clock-tampering system.

A separate versioned `tiny-game-starter:economy` save holds lives, next regeneration
timestamp and settled failure IDs. Old player saves need no destructive migration:
an absent economy save starts full; malformed/future economy saves fail closed.
Progress reset does not refill lives. Writes are serialized; failures are retryable.

A terminal active-session snapshot is written before life settlement and retained
until its debit commits. Settled failure IDs prevent duplicate charges on repeated
save callbacks or process recovery. Loading a pending terminal loss also settles
it before another puzzle can replace it. Terminal snapshots are then cleared as
before. Tests cover failed cleanup and retry. Abrupt OS termination can still lose
uncommitted writes or active time since the latest checkpoint; no async local store
can guarantee a write the OS has not completed.

At zero lives Home/Levels show the next regeneration and a simulated +1 life button.
Only a completed reward grants one life, capped at maximum; duplicate taps share
one in-flight operation. Cancel/dismiss/unavailable grants none. A persistent write
failure is reported and requires retry; it never creates an in-memory-only life.

`src/services/entitlements.ts` exposes `isPremium: false`. The pure gating/settlement
functions accept a premium flag. Premium bypasses life gates/debits and allows the
same one-per-attempt time extension without a rewarded dialog. There is no purchase
flow or hidden premium toggle.

## Ads, analytics and preview

Existing `AdsService.showRewarded()` remains the replaceable boundary. DEV presents
an explicit simulation dialog with Complete ad and Cancel. Release does not claim
simulated ad availability. No external provider is called.

Internal typed no-op analytics add timer_expired, rewarded_continue_requested,
rewarded_continue_completed, rewarded_life_requested, rewarded_life_completed,
life_consumed, life_regenerated. There are no timer-tick analytics.

Draft Preview runs the same countdown/session implementation with its existing
isolated in-memory store and preview-only completion callback. Failures never reach
normal life settlement, and time rewards never grant normal lives. Preview remains
accessible at zero normal lives and guarded in production. App reload clears its
preview-only state.

## iPhone playtest steps

1. In the project folder run `npx expo start --go --port 8083` (or reload that
   existing server). Open the QR code in Expo Go on the same network.
2. Home shows hearts. In normal Play, submit four incorrect groups. Hearts must
   decrease once, not once per mistake. Replay and repeat to reach zero.
3. At zero, normal Play stops at the life gate. Home, Settings and Draft Preview
   remain usable. Complete the **Simulated ad · +1 life** dialog; cancel once first
   to verify no reward. One completion gives exactly one life and permits play.
4. Open Home → Draft Preview → FR position 1, 2 or 3: there is no countdown.
   Open FR position 4: it starts at 2:00. FR position 21 starts at 2:30.
5. Solve a group, make a mistake, then background the app briefly. Return and
   confirm time did not tick in the background. The existing Hint reward dialog
   must also suspend time.
6. Let FR 4 reach zero. Verify the grid freezes and the solved-group count remains.
   Tap simulated +30 sec, wait inside the dialog, then Complete ad. Verify 0:30
   resumes with the same mistakes/layout/groups. Another timeout loses without
   another extension, and normal Home hearts are unchanged by preview play.
7. Repeat and choose End attempt at the first timeout. Normal hearts must again be
   unchanged. Restart a board partway through an attempt: solved groups reset,
   but time, mistakes, used hints and extension eligibility do not refill.
8. Test offline regeneration by leaving the app below full for 30/90 minutes. For
   a faster local experiment temporarily set `lifeRegenMinutes: 1`; set countdown
   seconds to a short value to test timeouts. New attempts use the new budget.
   To test a timed *normal development fixture* (the fixture catalog currently has
   only positions 1–2), temporarily set `relaxedPositions: 0`. Restore the approved
   playtest constants afterward. No puzzle data needs to change.

Native iPhone interaction/accessibility verification remains a real-device task;
unit tests and bundle exports do not substitute for it.

## Validation and changed files

Final verification: typecheck passed; lint passed; all 231 tests across 21 suites
passed; iOS and Android bundles exported successfully. The only bundle warning was
`NO_COLOR` being ignored because `FORCE_COLOR` was set. No unresolved check failures.
No commit or push was performed.

Exact files added or modified for this implementation:

- `docs/playtest-economy.md`
- `src/components/LifeIndicator.tsx`
- `src/config/playtest.ts`
- `src/economy/model.test.ts`
- `src/economy/model.ts`
- `src/economy/store.test.ts`
- `src/economy/store.ts`
- `src/economy/useEconomy.ts`
- `src/game/GameView.tsx`
- `src/game/engine/countdown.test.ts`
- `src/game/engine/countdown.ts`
- `src/game/engine/engine.ts`
- `src/game/preview/drafts.test.ts`
- `src/game/preview/entry.test.ts`
- `src/game/types.ts`
- `src/game/usePuzzleSession.ts`
- `src/i18n/en.ts`
- `src/i18n/es.ts`
- `src/i18n/fr.ts`
- `src/screens/HomeScreen.tsx`
- `src/screens/LevelsScreen.tsx`
- `src/services/ads.ts`
- `src/services/analytics.ts`
- `src/services/entitlements.ts`
- `src/state/activeSession.test.ts`
- `src/state/activeSession.ts`
- `src/state/economySettlement.test.ts`
- `src/state/migrations.test.ts`
- `src/state/migrations.ts`
- `src/state/player.test.ts`
- `src/state/player.ts`
