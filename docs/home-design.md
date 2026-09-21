# Home visual pass

Home alone opts into the NODI palette in `src/config/theme.ts`: Ink, Midnight, Paper, Ivory, Brass, Walnut, Brick, Sage and Error. Existing shared/puzzle tokens remain unchanged.

Typography uses scoped system fallbacks: Baskerville on iOS / serif on Android for editorial text, System / sans-serif for functional text. No font package, remote download or global font change was introduced. `homeTheme.typography` is the replacement point for future approved Cormorant Garamond and Manrope assets.

Home displays a typographic NODI wordmark, localized tagline, progression-derived French zone, campaign Continue, Daily, Levels/Settings and the existing prototype Carnet. The existing opening card can still appear in the Carnet area; Home suppresses extra return/zone dialogue. Other lore surfaces are unchanged.

Continue resolves the highest unlocked playable level using the existing catalog and progression guard. Its route still passes through existing gameplay/life safeguards. Completed final available content offers replay of that last level. Unavailable content and non-writable saves disable Continue. No progression or save fields changed.

Daily retains `/daily` and existing availability: tester Daily is disabled. Prototype French teaser comes from the lore pack. Carnet remains French prototype-only; development Draft Preview keeps its original guard.

`src/screens/homePresentation.ts` has optional `libraryBackground` and `professorIllustration` image slots. Both are null. Approved local image assets can be added later. Background uses cover beneath a strong Midnight overlay; illustration uses contain, is decorative and takes no space when absent.

Home has safe-area insets, a width cap, scroll overflow, wrapping navigation and text scaling without fixed text heights. Actions have minimum 48-point targets, labels and disabled accessibility state. Status bar styling is scoped to Home focus. No animation is added. Physical-device visual QA remains necessary, particularly with very large accessibility text.

Tests exercise Home composition, no-artwork rendering, current level/zone, highest-unlocked routing, final level fallback, save gating, Daily availability and secondary routes. Existing content/progression/engine tests remain in the full suite.

## Real-device QA refinement

The campaign panel now contains only zone, level and Continue, with reduced padding and a compact lives/regeneration line. The duplicated Continue heading is removed. Unavailable Daily is omitted entirely, including in tester mode. Settings remains a quiet Ivory text action; no floating blue settings control is rendered by Home.

Secondary navigation contains Levels, prototype Carnet and Settings. Carnet opens a dedicated modal collection backed by the same lore store. The first daily card is now a separate scrollable modal ritual, never inline under Home. Continue or Android Back dismisses it. Saved cards show only a subtle saved label on that surface; removal belongs to the collection. Opening and collection are mutually exclusive, so a saved opening card cannot render twice. Existing daily selection, local-date persistence and saved IDs are unchanged. Modal transitions have no animation.

## Artwork integration slots

The approved hierarchy is unchanged. Static local logo, library and Professor slots are documented in `assets/home/README.md`; no approved images were present at implementation time. Background overlay is now 70% Midnight. The optional logo occupies the existing wordmark height. Professor art is clipped into spare space after navigation and disappears when that space is insufficient. Campaign vertical padding is 10 (from 18), gap 4 (from 8), CTA margins 0 (from 4); the 48-point touch target remains. A restrained shadow provides depth. Other screens and behavior are unchanged.

## Final composition QA pass

Home now explicitly suppresses the native header and its right-hand action; the only app-owned Settings entry is the bottom text control. No floating gear exists in the current Home source. The blue floating gear observed in Expo Go is its development overlay, not NODI UI.

Status-bar appearance uses the established global Expo `<StatusBar style="dark" />`. Native-stack appearance overrides are intentionally absent for Expo Go compatibility. Professor canvas is 1.85 times its previous height, with the original aspect ratio, aligned to the top of its clipped lower-right region so the face remains visible and lower coat extends beyond the region. Touch exclusion and small-screen hiding are unchanged. Campaign zone and level share one wrapping metadata row, removing approximately 24 points of default height (about 16%); the 48-point button remains. Background, overlay and logo are unchanged.


## Expo Go iOS status-bar compatibility

The Home and root-stack `statusBarStyle` options were removed after react-native-screens raised an Info.plist assertion in Expo Go. The route-specific light-style helper was also removed. The prototype keeps the existing global Expo status bar without trying to force white icons on Home. No Info.plist or app.config.ts changes are made; Expo Go owns its native configuration. In a future standalone iOS build, `UIViewControllerBasedStatusBarAppearance` can be configured through app.config.ts/native build configuration and validated before reintroducing native-stack appearance overrides. Home layout, imagery and behavior are unchanged by this fix.
