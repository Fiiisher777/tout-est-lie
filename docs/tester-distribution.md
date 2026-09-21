# NODI Beta — Android tester distribution

This is a private playtest, not a store release. Testers install **NODI Beta**, open
it, tap **Jouer**, and choose levels 1–35. No Expo Go or development computer is
needed. This first batch is French-only (including the interface). Rewards are
labelled as free beta test rewards; there are no advertisements or payments.

## First-time setup (build owner only)

The repository is not yet linked to an Expo/EAS project and EAS CLI is not installed
in the current shell. Install EAS CLI with `npm install --global eas-cli`, then run
`eas login` using your Expo account. Run `eas init` to create/link the correct project.
If EAS cannot update the dynamic app configuration automatically, copy the project
UUID it prints into `extra.eas.projectId` in `app.config.ts`, preserving
`extra.appVariant`. Do not invent an ID. No cloud project or credentials were
created during this implementation.

## Build and share

1. In the project folder, run:
   ```sh
   eas build --platform android --profile tester
   ```
   On the first build, allow EAS to generate the Android signing key. Keep using
   this project's signing credentials for subsequent builds.
2. EAS prints a build page URL in the terminal. When the build finishes, open that
   page and use its install/share link (also available in the Expo project dashboard).
3. Send testers that link and this message:
   > Open this link on your Android phone, download and install NODI Beta, then tap
   > Jouer. If Android asks, allow this browser to install the downloaded app. This
   > is our private French puzzle playtest. No purchase or real advertisement is used.
4. Testers download the APK, open it, accept the installation prompt, and launch
   **NODI Beta**. They can turn off the browser's install permission afterward.
   Share the link only with intended testers; default internal links can be opened
   by anyone who has the URL.
5. After code/content changes, run the same build command again and send the new
   build's link. Install over the existing beta to keep progress. Uninstalling
   deletes its local progress. There is no automatic update service configured.

## Environment boundaries (maintainer reference)

- `tester` profile: internal distribution, `developmentClient: false`, Android APK,
  EAS environment `preview`, `APP_VARIANT=tester`. JavaScript is embedded in the APK.
- `app.config.ts` embeds this variant in Expo `extra`; runtime uses that embedded
  value. `__DEV__` is not required for tester content/economy/rewards.
- Default Expo Go development retains fixtures and its guarded Draft Preview.
- Production/unrecognized runtime variants fail closed for tester access. The
  production EAS profile rejects `APP_VARIANT=tester`. Its existing profile and
  approved-only loader have not been changed.
- Tester uses a separate validated source: exactly the 35 French draft positions
  1–35. It clones engine data; approval metadata/catalog files are never written.
  Normal screens, engine, local player persistence and economy are reused.
- Tester has no additional route. Play opens Levels. Draft Preview entry, route and
  injection access are blocked in tester, including when locally using Expo Go.
- Tester and Draft Preview share `src/config/playtest.ts`: positions 1–3 are
  untimed; difficulties 1–5 use 60/75/90/105/120 seconds for new attempts. One
  rewarded timeout continue still adds 30 seconds. Life and attempt rules are unchanged.
- Android tester package is **`com.nodi.playtest.tester`**, with scheme `noditester`.
  There was no existing Android package or iOS bundle ID to suffix. Development and
  production identifiers remain unset and unchanged. Reserve this package for beta;
  choose a different production package later. Android's separate app sandbox keeps
  beta saves out of production without changing persistence keys or behavior.
- iOS bundle identifier/provisioning remains unconfigured. No native iOS tester
  distribution was configured or built; an iOS JavaScript export is only validation.
- Public launcher name is **NODI Beta**; in-app name remains **NODI**, with a small BETA
  label on Home. No analytics event definitions or economy/grouping rules changed.

## Future iPhone distribution

An Android APK cannot install on iPhone. A future iOS internal build would need a
paid Apple Developer account, a separate beta bundle ID, registered tester devices
and ad-hoc signing. Alternatively, TestFlight can be set up later. Neither path is
configured here. See [Expo internal distribution](https://docs.expo.dev/build/internal-distribution/)
and [app variants](https://docs.expo.dev/build-reference/variants/) for that later setup.

## Changed files

- `app.config.ts`
- `docs/playtest-economy.md`
- `docs/tester-distribution.md`
- `eas.json`
- `src/app/draft-preview.tsx`
- `src/config/environment.ts`
- `src/config/playtest.ts`
- `src/config/tester.test.ts`
- `src/game/content.ts`
- `src/game/content/tester.ts`
- `src/game/preview/drafts.ts`
- `src/game/sessionAccess.ts`
- `src/i18n/index.ts`
- `src/i18n/tester.ts`
- `src/screens/DraftPreviewScreen.tsx`
- `src/screens/HomeScreen.tsx`
- `src/screens/SettingsScreen.tsx`
- `src/services/ads.ts`
