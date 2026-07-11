// MovieFlix color palette — synced from the sibling web artifact (index.css).
// Primary: hsl(348 83% 47%) ≈ #DB143C
// Background dark: hsl(0 0% 4%) = #0a0a0a
// The app is always dark-themed, so both light and dark use the same values.

const PALETTE = {
  text: '#fafafa',
  tint: '#DB143C',
  background: '#0a0a0a',
  foreground: '#fafafa',
  card: '#121212',
  cardForeground: '#fafafa',
  primary: '#DB143C',
  primaryForeground: '#ffffff',
  secondary: '#1f1f1f',
  secondaryForeground: '#fafafa',
  muted: '#1f1f1f',
  mutedForeground: '#999999',
  accent: '#1f1f1f',
  accentForeground: '#fafafa',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  border: '#1f1f1f',
  input: '#262626',
};

const colors = {
  light: PALETTE,
  dark: PALETTE,
  // Border radius synced from --radius: 0.5rem → 8px
  radius: 8,
};

export default colors;
