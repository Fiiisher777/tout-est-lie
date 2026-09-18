export const theme = {
    background: '#F8FAFC', surface: '#FFFFFF', text: '#172033', muted: '#526078',
    primary: '#2459B8', border: '#CBD5E1', danger: '#B42318', spacing: 16,
} as const;

// Puzzle surfaces: scoped so the shared shell keeps its existing appearance.
export const puzzleTheme = {
  background: '#F6F3ED', surface: '#FFFDFA', textPrimary: '#202B2A',
  textSecondary: '#58635E', accent: '#285C4D', accentSoft: '#E4EEE7',
  border: '#DDDCD3', successSurface: '#E8EDE3', hintSurface: '#EFE9DA',
  onAccent: '#FFFFFF', disabledSurface: '#E4E2DB', disabledText: '#696E67',
  danger: '#9F392E', shadow: '#183B30',
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
  radius: { card: 10, panel: 12, button: 14 },
  tapTarget: 44,
} as const;
