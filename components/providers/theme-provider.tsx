"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type P23ThemeMode = "dark" | "light";

type ThemeContextValue = {
  theme: P23ThemeMode;
  setTheme: (mode: P23ThemeMode) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "p23-theme-mode";

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => undefined,
  toggleTheme: () => undefined,
});

export function P23ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<P23ThemeMode>("dark");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as P23ThemeMode | null;
      const initial: P23ThemeMode = saved === "light" || saved === "dark" ? saved : "dark";
      setThemeState(initial);
      document.documentElement.setAttribute("data-p23-theme", initial);
    } catch {
      document.documentElement.setAttribute("data-p23-theme", "dark");
    }
  }, []);

  const setTheme = useCallback((mode: P23ThemeMode) => {
    setThemeState(mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors in restricted environments
    }
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-p23-theme", mode);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: P23ThemeMode = prev === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore storage errors
      }
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-p23-theme", next);
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useP23Theme() {
  return useContext(ThemeContext);
}

