# Results: an archived observation

Results alone uses Midnight surroundings and a Paper heading surface with restrained Brass, followed by the same `SolvedArchive` rows rendered by Game. No art or new dependencies. The success heading is Observation consignée, the final-failure heading Observation interrompue; functional equivalents are localized in FR/EN/ES. Exactly one existing victory/timeout Professor reaction component is used, with its existing locale/environment eligibility. No new Professor lore was translated or authored.

A successful recap resolves through the existing runtime puzzle loader and requires the saved locale/revision to match. It shows four groups in authored order; the result format does not store solve order. Unavailable historical revisions show a localized unavailable message instead of displaying newer answers. No persistence schema or production loader changes.

Next Level uses `nextUnlockedLevel` and the existing `next_level_continued` event. A synchronous navigation ref prevents repeated taps from navigating or emitting that event twice. Completed tester level 35 has no Next action; replay, levels and Home remain available. Replay does not write player progress.

Final failure remains downstream of the existing timeout/rewarded-continue flow. Results does not settle or consume lives. It reads the already-settled economy via the existing hook/indicator. Normal Retry is disabled during unavailable storage or zero lives and rechecks `economyStore.canStart()` before routing; the game route retains its own guard. Existing premium behavior and daily replay rules remain. The existing life indicator supplies waiting/regeneration/reward recovery. Settings, economy, timers, progression and analytics semantics are untouched.

The footer stays outside the scrollable recap, with 48-point minimum controls. Text scales, archive rows wrap, and long content scrolls. Recap opacity settles over 220 ms when motion is allowed; reduced motion keeps content visible, and controls are never delayed by animation. Results includes no time/mistake score, ratings, XP, stars or ranking. Actual time/mistake fields remain in existing records for internal use.

Tests cover success/failure presentation, four-row reuse, optional authored reactions, next/replay/levels behavior, duplicate taps, level 35, zero-life and asynchronous retry gates, revision mismatch and reduced-motion behavior. Existing timeout, reward and exactly-once failure-settlement tests remain unchanged. Device visual QA remains recommended.
