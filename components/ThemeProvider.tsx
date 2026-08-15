"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  getThemeStorageKey,
  isThemeId,
  THEME_STORAGE_KEY,
  type ThemeId,
} from "@/lib/ui/themes";

type ThemeContextValue = {
  theme: ThemeId;
  savedTheme: ThemeId;
  hasUnsavedChanges: boolean;
  setTheme: (theme: ThemeId) => void;
  saveTheme: () => Promise<string | null>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(userId?: string | null): ThemeId {
  if (typeof window === "undefined") {
    return "slate";
  }

  const userKey = getThemeStorageKey(userId);
  const userStored = localStorage.getItem(userKey);
  if (isThemeId(userStored)) {
    return userStored;
  }

  const genericStored = localStorage.getItem(THEME_STORAGE_KEY);
  if (isThemeId(genericStored)) {
    return genericStored;
  }

  return "slate";
}

function persistThemeLocally(theme: ThemeId, userId?: string | null): void {
  localStorage.setItem(getThemeStorageKey(userId), theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [theme, setThemeState] = useState<ThemeId>("slate");
  const [savedTheme, setSavedTheme] = useState<ThemeId>("slate");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    setSavedTheme(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || loading) {
      return;
    }

    const accountTheme = isThemeId(user?.theme) ? user.theme : null;
    const nextTheme = accountTheme ?? readStoredTheme(user?.id);

    setThemeState(nextTheme);
    setSavedTheme(nextTheme);
    persistThemeLocally(nextTheme, user?.id);
  }, [user?.id, user?.theme, loading, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    document.documentElement.dataset.theme = theme;
  }, [theme, hydrated]);

  const setTheme = useCallback((nextTheme: ThemeId) => {
    setThemeState(nextTheme);
  }, []);

  const saveTheme = useCallback(async () => {
    if (user) {
      const response = await fetch("/api/auth/preferences", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        return payload.error ?? "Failed to save theme";
      }
    }

    persistThemeLocally(theme, user?.id);
    setSavedTheme(theme);
    return null;
  }, [theme, user]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        savedTheme,
        hasUnsavedChanges: theme !== savedTheme,
        setTheme,
        saveTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
