
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";
export type AccentColor = "green" | "blue" | "violet" | "amber";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const validAccents: AccentColor[] = [
  "green",
  "blue",
  "violet",
  "amber",
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [accent, setAccent] = useState<AccentColor>("green");
  const [ready, setReady] = useState(false);

  // Switch between light and dark mode.
  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  // Restore the user's saved preferences when the page loads.
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("safar-theme");
      const savedAccent = localStorage.getItem("safar-accent");

      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }

      if (
        savedAccent &&
        validAccents.includes(savedAccent as AccentColor)
      ) {
        setAccent(savedAccent as AccentColor);
      }
    } catch {
      // Use the defaults when browser storage is unavailable.
    }

    setReady(true);
  }, []);

  // Apply and save the selected preferences.
  useEffect(() => {
    if (!ready) return;

    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.accent = accent;

    try {
      localStorage.setItem("safar-theme", theme);
      localStorage.setItem("safar-accent", accent);
    } catch {
      // Theme changes still work for the current page.
    }
  }, [theme, accent, ready]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, accent, setAccent }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useSafarTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useSafarTheme must be used inside a ThemeProvider.",
    );
  }

  return context;
}

// Keep the alternative hook name available too.
export const useTheme = useSafarTheme;
