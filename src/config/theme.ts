export const theme = {
    background: '#F8FAFC', surface: '#FFFFFF', text: '#172033', muted: '#526078',
    primary: '#2459B8', border: '#CBD5E1', danger: '#B42318', spacing: 16,
} as const;

// NODI V1 palette. Home opts in; existing screens retain their current tokens.
export const nodiColors = {
  ink: '#172235', midnight: '#0D1728', paper: '#F3E9D5', ivory: '#FFF8E9',
  brass: '#C59A4A', walnut: '#4A3428', brick: '#963F36', sage: '#5E745D', error: '#A84A45',
} as const;
// Puzzle surfaces: scoped so the shared shell keeps its existing appearance.
export const puzzleTheme = {
  background: nodiColors.midnight, surface: nodiColors.paper, textPrimary: nodiColors.ink,
  textSecondary: nodiColors.walnut, environmentText: nodiColors.ivory,
  accent: nodiColors.brass, accentSoft: nodiColors.ink, border: nodiColors.walnut,
  successSurface: nodiColors.sage, solvedText: nodiColors.ivory, hintSurface: nodiColors.paper,
  onAccent: nodiColors.ink, selectedText: nodiColors.ivory,
  disabledSurface: nodiColors.ink, disabledText: nodiColors.paper,
  danger: nodiColors.error, penaltySurface: nodiColors.paper, shadow: nodiColors.midnight,
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
  radius: { card: 13, panel: 12, button: 14 }, tapTarget: 48,
} as const;

export const homeTheme = {
  background: nodiColors.midnight, surface: nodiColors.paper, text: nodiColors.ink,
  onDark: nodiColors.ivory, accent: nodiColors.brass, primary: nodiColors.ink,
  overlayOpacity: 0.70, radius: 14, tapTarget: 48,
  // Bundled system fallbacks; ready for authored font assets without global changes.
  typography: { editorialIOS: 'Baskerville', editorialAndroid: 'serif', functionalIOS: 'System', functionalAndroid: 'sans-serif' },
} as const;
