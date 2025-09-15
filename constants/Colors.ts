const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    // Base
    text: "#11181C",
    background: "#ffffff",
    card: "#f9f9f9",
    border: "#dddddd",

    // Branding
    primary: "#21706f",   // teal green
    secondary: "#007AFF", // iOS blue

    // Extras for tabs/icons
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    // Base
    text: "#ECEDEE",
    background: "#151718",
    card: "#1E1E1E",
    border: "#333333",

    // Branding
    primary: "#77bfbe",   // lighter teal
    secondary: "#6096ba", // soft blue

    // Extras for tabs/icons
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};
