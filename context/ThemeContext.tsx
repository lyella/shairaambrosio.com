import { useState, useEffect, createContext, useContext, useCallback } from "react";

import { useLocalStorage } from "hooks/useLocalStorage";

type ThemeVariants = "system" | "dark" | "light";
type ResolvedTheme = Exclude<ThemeVariants, "system"> | null;

type ThemeContext = {
  theme: ResolvedTheme;
  setTheme: (theme: Exclude<ThemeVariants, "system">) => void;
  toggleTheme: () => void;
};

type ThemeProviderProps = { children: React.ReactNode };

const ThemeStateContext = createContext<ThemeContext | undefined>(undefined);

const getSystemTheme = (): Exclude<ThemeVariants, "system"> =>
  typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useLocalStorage<ThemeVariants>("theme", "system");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(null);

  // The system preference is external state, so it is read through a subscription
  // instead of being set from inside an effect. Unlike the old version, this also
  // reacts when the OS theme changes while the tab is open.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystemTheme(query.matches ? "dark" : "light");

    sync();
    query.addEventListener("change", sync);

    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (theme) {
      document.body.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const invertTheme = (current: ResolvedTheme) => (current === "dark" ? "light" : "dark");

  const toggleTheme = useCallback(() => {
    setTheme(theme === "system" ? invertTheme(systemTheme) : invertTheme(theme));
  }, [theme, systemTheme, setTheme]);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  return (
    <ThemeStateContext.Provider value={{ theme: resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeStateContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeStateContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
