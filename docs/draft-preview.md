# Development-only Draft Preview

Start the development server from the project directory:

```sh
npx expo start --go --port 8083
```

Open that project in Expo Go on the iPhone (scan the terminal QR code with the
Camera app; phone and computer should be on the same network). If this server is
already running, reload the app instead of launching another server on that port.

On **Home**, tap **Draft Preview**, then **Play FR 1** through **Play FR 10**.
The list is ordered by French positions 1–10 first, then other French drafts,
then other locales. Each row shows position, puzzle ID, difficulty, and status.
French puzzle text is available regardless of the app's interface language.

The ordinary GameView, engine, hints, timer and session transitions are reused.
The game header identifies the playtest as `DRAFT · FR · position`. Completion
shows a preview-only result and offers replay or return to the draft list.
Restart remains in the game settings menu with the existing confirmation.

## Isolation and limits

- No puzzle is approved or edited by previewing it.
- Preview never inserts drafts into the normal content catalog or release loader.
- Preview uses a separate in-memory session adapter. Leaving and reopening a
  preview during the same app run can resume it. App reload/process termination
  clears preview state. Normal persistent session and player-progress storage
  are never written by preview play.
- Results remain in preview memory; completion never dispatches a normal player
  completion or unlocks a level.
- Home's entry exists only under `__DEV__`. A direct preview route redirects home
  in production. The screen, draft resolver, session adapter and GameView's
  preview injection also reject production use.
- No environment variable enables preview in release builds. Production approval
  filtering is unchanged. The normal `/game` route cannot resolve these drafts.

The only shared-session change is an optional development-only puzzle/storage
injection. Its default still uses the exact existing normal catalog lookup and
active-session load/save functions. Engine rules, normal persistence formats,
analytics semantics, production content and release filtering are unchanged.
