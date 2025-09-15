import { createContext, useContext, useState, ReactNode } from "react";
import { Colors } from "@/constants/Colors";

type Theme = "light" | "dark";

import type { ColorValue } from "react-native";

type ThemeColors = {
  icon: ColorValue | undefined;
  background: string;
  text: string;
  card: string;
  border: string;
  primary: string;
  secondary: string;
};

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);


export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const colors = theme === "light" ? Colors.light : Colors.dark;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
