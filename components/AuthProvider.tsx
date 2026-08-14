"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AthleteSummary, PublicUser } from "@/lib/server/types";
import {
  getCoachViewingAthleteId,
  pullRemoteSync,
  pushRemoteSync,
  setCoachViewingAthleteId,
  setSyncEnabled,
} from "@/lib/sync/syncClient";
import { setCoachReadOnly } from "@/lib/sync/readOnly";

type AuthContextValue = {
  user: PublicUser | null;
  athletes: AthleteSummary[];
  loading: boolean;
  viewingAthleteId: string | null;
  isCoachReadOnly: boolean;
  refreshSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<string | null>;
  registerCoach: (
    name: string,
    email: string,
    password: string
  ) => Promise<string | null>;
  logout: () => Promise<void>;
  selectAthlete: (athleteId: string | null) => Promise<void>;
  createAthlete: (params: {
    name: string;
    email: string;
    password: string;
  }) => Promise<string | null>;
  syncNow: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [athletes, setAthletes] = useState<AthleteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingAthleteId, setViewingAthleteId] = useState<string | null>(
    null
  );

  const refreshSession = useCallback(async () => {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!response.ok) {
      setUser(null);
      setAthletes([]);
      setSyncEnabled(false);
      setCoachReadOnly(false);
      return;
    }

    const payload = (await response.json()) as {
      user: PublicUser | null;
      athletes?: AthleteSummary[];
    };

    if (!payload.user) {
      setUser(null);
      setAthletes([]);
      setSyncEnabled(false);
      setCoachReadOnly(false);
      return;
    }

    setUser(payload.user);
    setAthletes(payload.athletes ?? []);
    setSyncEnabled(true);
    setCoachReadOnly(payload.user.role === "coach");

    if (payload.user.role === "coach") {
      const storedAthleteId = getCoachViewingAthleteId();
      const validAthlete =
        storedAthleteId &&
        (payload.athletes ?? []).some(
          (athlete) => athlete.id === storedAthleteId
        )
          ? storedAthleteId
          : payload.athletes?.[0]?.id ?? null;

      setViewingAthleteId(validAthlete);
      setCoachViewingAthleteId(validAthlete);
    } else {
      setViewingAthleteId(payload.user.id);
      setCoachViewingAthleteId(null);
    }

    await pullRemoteSync();
  }, []);

  useEffect(() => {
    void refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        return payload.error ?? "Login failed";
      }

      await refreshSession();
      return null;
    },
    [refreshSession]
  );

  const registerCoach = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "coach" }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        return payload.error ?? "Registration failed";
      }

      await refreshSession();
      return null;
    },
    [refreshSession]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setAthletes([]);
    setViewingAthleteId(null);
    setCoachViewingAthleteId(null);
    setSyncEnabled(false);
    setCoachReadOnly(false);
  }, []);

  const selectAthlete = useCallback(
    async (athleteId: string | null) => {
      setViewingAthleteId(athleteId);
      setCoachViewingAthleteId(athleteId);
      await pullRemoteSync();
    },
    []
  );

  const createAthlete = useCallback(
    async (params: { name: string; email: string; password: string }) => {
      const response = await fetch("/api/athletes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        return payload.error ?? "Failed to create athlete";
      }

      await refreshSession();
      return null;
    },
    [refreshSession]
  );

  const syncNow = useCallback(async () => {
    if (user?.role === "coach") {
      await pullRemoteSync();
      return;
    }

    await pushRemoteSync(true);
    await pullRemoteSync();
  }, [user?.role]);

  const isCoachReadOnly = user?.role === "coach";

  const value = useMemo(
    () => ({
      user,
      athletes,
      loading,
      viewingAthleteId,
      isCoachReadOnly,
      refreshSession,
      login,
      registerCoach,
      logout,
      selectAthlete,
      createAthlete,
      syncNow,
    }),
    [
      user,
      athletes,
      loading,
      viewingAthleteId,
      isCoachReadOnly,
      refreshSession,
      login,
      registerCoach,
      logout,
      selectAthlete,
      createAthlete,
      syncNow,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
