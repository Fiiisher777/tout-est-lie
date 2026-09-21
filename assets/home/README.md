# Approved Home artwork slots

The approved local PNG files are connected. Slots remain nullable for fallback testing; no stock or generated art is included.

Asset paths and general export recommendations:

| Slot | Filename | Recommended export |
| --- | --- | --- |
| Library | `assets/home/library-background.png` | Portrait 1080 × 1920, sRGB JPEG, preferably under 700 KB |
| Professor | `assets/home/professor.png` | Transparent PNG, approximately 720 × 1000, preferably under 700 KB |
| Logo | `assets/home/nodi-logo.png` | Transparent PNG, tightly cropped horizontal mark, about 960 × 312, preferably under 200 KB |

Keep original masters separately. These are export recommendations, not instructions to destructively resize original artwork. Optimize approved exports before importing; transparency must be retained for Professor/logo. No remote URLs, SVG renderer or new image library is needed.

The slots in `src/screens/homePresentation.ts` use static local requires:

```ts
logo: require('../../assets/home/nodi-logo.png'),
libraryBackground: require('../../assets/home/library-background.png'),
professorIllustration: require('../../assets/home/professor.png'),
```

Do not add a require before its file exists: Metro resolves static assets at build time. Slots accept local asset module IDs only.

Library uses full-screen cover (crop, never stretch), followed by the independently adjustable `homeTheme.overlayOpacity` (0.70 Midnight). No blur or baked-in overlay. Logo uses contain in a maximum 240 × 78 point frame, exposes the accessibility label NODI, and leaves the tagline separate. Missing logo uses the existing wordmark.

Professor uses contain at the lower right of the *remaining empty space* below navigation. It never adds content height, captures touches, or enters the screen-reader tree. Slight right/bottom cropping makes it environmental. It hides below 350-point screen width, below 150 points of spare height, or above 1.3 text scale. Artwork cannot overlap controls even when content grows; the decorative region clips it. The library remains behind all functional UI.

Verify actual crops, transparent margins and contrast on device after approved artwork is supplied. Automated checks exercise fallback/layout/navigation; device crop review remains necessary.

## Approved files now connected

The Home slots now use `library-background.png` (1154 × 1363), `professor.png` (1086 × 1448), and `nodi-logo.png` (1254 × 1254). The supplied PNG is used directly rather than converting it to JPEG. Originals are unchanged. Combined source size is approximately 5.2 MB; no lossy optimization was applied.

The square logo's transparent vertical padding is compensated with a centered 128-point image inside the existing 78-point clipped logo slot. Its tagline remains separate. Professor positioning compensates the transparent right margin by moving the canvas slightly farther right, preserving aspect ratio and the existing noninteractive, clipped region below controls. The 70% Midnight background overlay is unchanged.
