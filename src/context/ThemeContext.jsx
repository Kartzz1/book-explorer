import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "book-explorer-theme";
const VALID_THEMES = new Set(["day", "dark", "night"]);

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return VALID_THEMES.has(saved) ? saved : "dark";
  } catch {
    return "dark";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = theme;

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage may be unavailable in some browser environments.
    }
  }, [theme]);

  const cycleTheme = () => {
    setTheme((current) => {
      switch (current) {
        case "dark":
          return "night";

        case "night":
          return "day";

        default:
          return "dark";
      }
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

  return (
    <ThemeContext.Provider value={value}>
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