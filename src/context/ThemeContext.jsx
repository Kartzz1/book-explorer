import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "book-explorer-theme";
const VALID_THEMES = new Set(["day", "dark", "night"]);

function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return VALID_THEMES.has(saved) ? saved : "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme((current) => {
      if (current === "dark") return "night";
      if (current === "night") return "day";
      return "dark";
    });
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: cycleTheme,
      isDay: theme === "day",
      isDark: theme === "dark",
      isNight: theme === "night",
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
