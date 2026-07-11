/**
 * MovieFlix design tokens — synced from the web app's index.css.
 * Primary: HSL 348° 83% 47% → #DC143C (Crimson red)
 * Dark background: 0 0% 4% → #0a0a0a
 */

const colors = {
  light: {
    text: '#0a0a0a',
    tint: '#DC143C',
    background: '#ffffff',
    foreground: '#0a0a0a',
    card: '#ffffff',
    cardForeground: '#0a0a0a',
    primary: '#DC143C',
    primaryForeground: '#ffffff',
    secondary: '#f5f5f5',
    secondaryForeground: '#171717',
    muted: '#f5f5f5',
    mutedForeground: '#737373',
    accent: '#f5f5f5',
    accentForeground: '#171717',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#e5e5e5',
    input: '#e5e5e5',
  },
  dark: {
    text: '#fafafa',
    tint: '#DC143C',
    background: '#0a0a0a',
    foreground: '#fafafa',
    card: '#121212',
    cardForeground: '#fafafa',
    primary: '#DC143C',
    primaryForeground: '#ffffff',
    secondary: '#1f1f1f',
    secondaryForeground: '#fafafa',
    muted: '#1f1f1f',
    mutedForeground: '#999999',
    accent: '#1f1f1f',
    accentForeground: '#fafafa',
    destructive: '#7f1d1d',
    destructiveForeground: '#fafafa',
    border: '#1f1f1f',
    input: '#262626',
  },
  // Sync from web app's --radius: 0.5rem = 8px
  radius: 8,
};

export default colors;
