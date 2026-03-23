const primary = "#1B6CA8";
const primaryLight = "#2E8FCF";
const accent = "#F5A623";
const background = "#F7F9FC";
const backgroundDark = "#0D1B2A";
const surface = "#FFFFFF";
const surfaceDark = "#1A2B3C";
const textPrimary = "#1A2535";
const textSecondary = "#6B7B8D";
const textLight = "#FFFFFF";
const success = "#2ECC71";
const danger = "#E74C3C";
const warning = "#F39C12";
const border = "#E4EAF0";
const borderDark = "#243447";

export default {
  primary,
  primaryLight,
  accent,
  success,
  danger,
  warning,
  light: {
    text: textPrimary,
    textSecondary,
    textLight,
    background,
    surface,
    border,
    tint: primary,
    tabIconDefault: "#A0AFBF",
    tabIconSelected: primary,
  },
  dark: {
    text: "#E8EFF5",
    textSecondary: "#8BA0B5",
    textLight,
    background: backgroundDark,
    surface: surfaceDark,
    border: borderDark,
    tint: primaryLight,
    tabIconDefault: "#506070",
    tabIconSelected: primaryLight,
  },
};
