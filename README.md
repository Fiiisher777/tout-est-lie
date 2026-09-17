# Tiny Game Starter

A mobile-first Expo SDK 57 / React Native / TypeScript shell for independent casual games. No game mechanics, accounts, backend, analytics collection, or advertising SDK.

## Run

Use Node.js 22.13+ (verified with Node 24) and npm. Run `npm ci`, then `npm start` to start Metro for a development build. `npm run ios` and `npm run android` open an installed development client.

Before building a native client, assign your own `ios.bundleIdentifier` and `android.package` in `app.config.ts`. They are deliberately absent in this reusable template. Then use `npx expo run:ios` / `npx expo run:android`, or configure an EAS project and use a development build. An iOS simulator EAS build additionally needs `ios.simulator: true` in its build profile. Expo Go can be used for a quick smoke test with `npx expo start --go`; development builds are the intended workflow.

`eas.json` includes development (development client), preview (internal distribution), and production (store) profiles. No builds are submitted automatically. Icons, final identifiers, signing, store metadata, and privacy-policy text must be supplied for each released game. Native folders are generated via Expo Prebuild and remain ignored.

## Verify

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run bundle` — production Hermes bundles for iOS and Android in ignored `dist/`.

Jest uses Expo's `jest-expo` preset. Tests cover the player reducer, malformed/default/migrated saves, queued write recovery, and deterministic daily selection. No tests are placed in the Router directory.

## Structure

- `src/app`: thin Expo Router Stack routes.
- `src/screens`: Home, Levels, Game, Results, Settings, Daily Challenge.
- `src/components`: shared screen, text, buttons, level cards, setting rows.
- `src/state`: React Context + reducer, versioned player state, migrations, storage.
- `src/i18n`: typed English/French/Spanish dictionaries, device locale and saved language override.
- `src/game`: placeholder content and the small game/shell interface.
- `src/daily`: deterministic UTC-day selection.
- `src/services`: audio, haptics, analytics, ads, and privacy adapters.
- `src/config`: game identity and visual tokens.

All six placeholder levels are available. Completion uses an explicitly labeled placeholder button worth zero points; it is an integration exercise, not a game mechanic. Results are read from saved state by result ID, never accepted from URL score parameters.

## Player data

AsyncStorage uses `<game id>:player`. Version 1 contains completed level IDs, best scores, daily results, preferences, and the latest result. Normal and daily progression are separate. Higher scores are better in this shell; engines normalize different scoring schemes before reporting completion.

Hydration finishes before interaction. Read errors disable mutations and expose retry. Writes are serialized and persist snapshots immediately after actions; write errors remain visible with retry, and Results navigation waits for a successful save. There is no reliance on an app-exit save. Reset clears progress and the latest result while retaining sound, haptics, and language settings.

The migration function validates saved fields, supports a documented v0-to-v1 migration, and recovers invalid JSON with a visible notice. A save from a newer version is preserved and blocks writes. Add one migration per schema change. Storage is local, unencrypted, and not guaranteed to survive uninstall; no cross-device recovery is provided.

## Localization

`system` selects the first supported device language, falling back to English. A saved French, English, or Spanish selection overrides it. `expo-localization` observes device locale changes. All dictionaries satisfy the English key structure; `i18n-js` handles interpolation and English fallback. Native supported locales are declared in app config.

## Game boundary

`GameLaunch` identifies a normal level or a UTC-dated daily challenge. `GameView` receives `launch` and an asynchronous `onComplete(score)` callback. The shell validates the route, creates a result ID/timestamp, saves completion, and navigates to Results. Repeated taps are guarded; failed saves can be retried without inventing another completion.

To add a game, replace `src/game/GameView.tsx`, update level metadata, and place pure TypeScript rules in `src/game/engine/` when needed. Keep each game's state and actions private to its engine. Inject time and random seeds into rules so they can be unit tested without React Native. Nothing currently implements Tout est lié, Ne touche pas ça, or La Sortie.

## Daily challenge

Selection is `UTC day index modulo catalog length`, with the Unix epoch as its baseline. The same ordered catalog and UTC date always produce the same selection. The daily screen refreshes at UTC midnight, on focus, and on foregrounding. The launch date stays fixed for a session crossing midnight. Catalog changes can alter selection; keep its order stable for a released content version. The device clock is trusted: offline play provides no tamper resistance or shared leaderboard.

## Services

- Audio is a typed no-op adapter because the starter has no sound assets. The preference is persisted; add Expo-compatible `expo-audio` and playback-only configuration when actual sounds are supplied. Stop hooks already exist for leaving the game and backgrounding the app.
- Haptics use `expo-haptics`, respect the preference and app foreground state, and fail harmlessly on unsupported devices.
- Analytics is a typed no-op with no collection, identifiers, or network requests.
- Ads return `unavailable`; there are no live ads and no automatically awarded rewards.
- Privacy reports no ad/analytics permission and no requested tracking. Settings explains current local-only behavior. A later UMP implementation must refresh consent and obtain ad eligibility from the provider; a saved app boolean is not consent. Tracking authorization is a separate concern.

## Duplicate for a game

1. Copy the repository and change the npm package name.
2. Change `src/config/game.ts` (including storage namespace), theme, content, and translations.
3. Change Expo name, slug, scheme, and unique native identifiers in `app.config.ts`.
4. Supply the game's assets/icons and, if using EAS, create its own EAS project and credentials.
5. Replace the placeholder game view and add pure rules and tests.

Keep dependencies compatible with SDK 57 using `npx expo install`. Router's required UI, symbols, glass-effect, linking, constants, screens, and safe-area dependencies are retained. Web/demo-only source and optional direct dependencies have been removed.

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for verification results, known warnings, and the complete changed-file inventory.
