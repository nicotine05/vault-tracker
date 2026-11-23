"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { VaultSession } from "@/lib/domain/types";
import { STORAGE_EVENTS } from "@/lib/storage/keys";
import { loadVaultSessions } from "@/lib/storage/logStore";

/**
 * Vault sessions for the currently active vaulter/account sync context.
 * Reloads when the viewed athlete changes or synced vault logs refresh.
 */
export function useAccountVaultSessions() {
  const { viewingAthleteId, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<VaultSession[]>([]);

  const refresh = useCallback(() => {
    try {
      setSessions(loadVaultSessions());
    } catch (error) {
      console.error("Failed to load account vault sessions", error);
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    refresh();

    window.addEventListener(STORAGE_EVENTS.VAULT_LOGS_CHANGED, refresh);
    return () => {
      window.removeEventListener(STORAGE_EVENTS.VAULT_LOGS_CHANGED, refresh);
    };
  }, [authLoading, viewingAthleteId, refresh]);

  return sessions;
}
