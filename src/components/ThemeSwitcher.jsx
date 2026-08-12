import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-switcher"
      type="button"
      onClick={toggleTheme}
    >
      {theme === "day" ? (
        <>
          <Sun size={16} />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Moon size={16} />
          <span>Light</span>
        </>
      )}
    </button>
  );
}