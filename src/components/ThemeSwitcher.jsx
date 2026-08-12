import { Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  const config = {
    day: {
      icon: <Sun size={16} />,
      text: "Dark",
      label: "Switch to Dark Mode",
    },
    dark: {
      icon: <Moon size={16} />,
      text: "Night",
      label: "Switch to Night Mode",
    },
    night: {
      icon: <Sparkles size={16} />,
      text: "Day",
      label: "Switch to Day Mode",
    },
  }[theme];

  return (
    <button className="theme-switcher" type="button" onClick={toggleTheme} aria-label={config.label}>
      <span className="theme-icon" aria-hidden="true">
        {config.icon}
      </span>
      <span>{config.text}</span>
    </button>
  );
}
