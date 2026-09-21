# NODI brand and lore prototype

The canonical French source is `nodi-brand-lore-content-pack-v1.json`. Its copy and factual-review flags remain unchanged. `src/lore/content.ts` provides typed cards, reactions, zones, canonical brand fields, daily copy and a future fragment type. Writer-only rules are kept separate from the fields used by screens; no mystery exposition is rendered.

## Editorial boundaries

The current opening pool contains 20 fictional Professor/N.O.D.I. notes in development and tester environments. All 50 source cards remain draft. The 30 factual cards requiring fact checking are excluded. Production excludes every current opening card and all prototype reaction/zone surfaces. English and Spanish omit these surfaces until authored content exists.

Future approved cards require a reviewer, review date and exact reviewed-text snapshot; factual cards additionally require explicit fact-check confirmation. Changing reviewed text invalidates eligibility. This is independent of puzzle approvals and does not modify their loader.

## Ritual and collection

On the first active Home visit of a local calendar day, an inline, nonblocking card appears. Continue dismisses it. Ordinary foregrounding does not select another card that day. A card left undismissed may remain visible. Selection is deterministic by local date and excludes the previous card when alternatives exist. Clock/date rollback does not replay an already recorded day.

Conserver dans le carnet saves the card ID. The collection button on Home opens a simple list with removal actions. Saves are idempotent. No rewards, currency or streaks are attached.

The independent version-1 `${gameConfig.id}:lore` storage record contains:

- `lastShownLocalDate`
- `lastOpeningCardId`
- `savedLoreCardIds`
- `seenZoneEntryIds`
- `lastSeenAt`

Existing installations initialize this record on demand without rewriting player, settings, economy or active-session data. Writes are serialized; failed writes do not publish success. Malformed/future versions are preserved and rejected rather than overwritten. Lore errors do not block gameplay. Backgrounding records last activity; a Home visit after 48 hours may display a return line.

## Gameplay and zones

Reactions are presentation-only. Wrong-answer flavor appears every third new wrong answer, with at least 30 seconds between lines, and disappears after 3.5 seconds. The existing penalty feedback remains first. Hint/continue reactions respond to new transitions, not restored history. Victory, timeout and zero-life surfaces may show a short source reaction. No engine, analytics, timer, hint or life transition is changed.

Zone metadata retains names, purpose, entry line and visual seeds for 1–10, 11–35, 36–60, 61–80 and 81–100. Home/results derive the current zone from existing unlocked progression, capped to available content. The entry line is claimed once and shown briefly. Migrated players see only their current zone entry; earlier zones are marked seen to avoid a backlog. Next Level navigation remains unchanged.

French Daily naming is now **Observation du jour**. UTC daily puzzle selection remains unchanged.

## Verification

`src/lore/lore.test.ts` covers eligibility, factual approval requirements, local dates, repeated visits, deterministic selection, absence, collection persistence, concurrent writes, malformed saves, zone boundaries and migration, source reactions and throttling. Existing progression, engine, timer, life and content-loader tests remain in the full suite.

For device testing, open Home in French in development/tester mode, save the opening card, dismiss it, reopen the app and inspect the collection. It should remain saved without a second ritual that day. English/Spanish and production must omit the prototype surfaces. Real-device layout verification is still recommended; this change adds no artwork or new visual system.
