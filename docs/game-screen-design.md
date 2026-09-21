# N.O.D.I. at work — Game visual pass

GameView now uses the existing NODI palette through scoped puzzle tokens. Home, its artwork, and the other shell screens retain their presentation. No engine, puzzle data, save format, economy, progression or editorial loader changed.

## Hierarchy and controls

The compact header shows the authored progression zone (French where authored), level or Daily title, connection count and optional countdown. Untimed puzzles have no timer placeholder. Lives remain available only in the pre-attempt blocked state, not active play. The archive of solved groups precedes the remaining four-column grid.

Persistent bottom controls are Indice and Valider. Exactly four selected cards enable Validate; selecting the fourth never submits. Shuffle, Clear, Settings and confirmed Restart remain in a quiet modal menu. An app-owned menu is used rather than an Android Alert with more than three buttons.

Indice opens a modal with localized Pair and Category choices, disabled individually when unavailable. The only session-hook adaptation is an optional requested kind in `requestHint`; it selects an eligible hint of that kind before entering the unchanged rewarded-hint, pause, persistence and analytics path. Choosing a hint still uses the existing simulated reward flow. The choice sheet itself does not pause time, matching the existing menu behavior; background/ad pauses remain unchanged.

## Cards and feedback

Cards use Paper/Ink; selected cards use Ink/Ivory with a thicker Brass border and accessible selected state. Press feedback scales to 0.98 when motion is allowed. Existing long-label word-boundary splitting and one-line fitting are retained, including full accessibility labels and capped text scaling. No puzzle text is shortened.

Incorrect submissions still use the engine's configured penalty and selection clearing. The affected cards shake by at most three points for 260 ms. A short penalty label appears beside the timer for 3.5 seconds; untimed puzzles instead show the normal error feedback. Under 20 seconds the timer uses Error on Paper for readable urgency; there is no pulsing timer. Professor reaction timing/frequency is unchanged; only its text color is adapted for the dark Game environment.

A solved group retains a brief presentation snapshot of the four selected cards, contracts them slightly and fades them over 340 ms, then shows a Sage archive row (serif category, sans-serif items). Engine transitions, saving and timer progression happen immediately. Only the final successful completion callback now waits for the existing animation to finish and the fourth archive row to commit. Persistence remains immediate; there is no independent timeout or extra delay. Reduced motion commits directly and releases completion immediately. Repeated completion requests share one promise, while failed callbacks retain the existing retry path. Reduced motion skips transitions. The resolution callback uses the existing no-op `audio.play('complete', enabled)` adapter as a future CLAC integration point; no sound asset or dependency was added.

## Validation and limits

GameView presentation tests cover lives visibility, timer omission/presence, explicit submission, penalty presentation, hint choices, archive order and unchanged timeout continuation. Existing engine, persistence, progression, reward and content validation suites still run. Phone layouts retain safe areas, scroll overflow, four columns and minimum 48-point controls. Real-device animation and long-label visual QA remain recommended. The Expo Go-compatible status-bar setup is unchanged; no native-stack appearance overrides were added.
