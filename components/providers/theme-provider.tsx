"use client";

import React, { createContext, useContext, useEffect } from "react";

export type P23ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: P23ThemeMode;
  setTheme: (mode: P23ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => undefined,
  toggleTheme: () => undefined,
});

export function P23ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-p23-theme", "light");
    }
    try {
      window.localStorage.setItem("p23-theme-mode", "light");
    } catch {
      // Ignore storage errors
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: "light",
        setTheme: () => undefined,
        toggleTheme: () => undefined,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useP23Theme() {
  return useContext(ThemeContext);
}
