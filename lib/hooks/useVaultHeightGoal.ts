"use client";

import { useEffect, useState } from "react";
import { DEFAULT_VAULT_HEIGHT_GOAL } from "@/lib/domain/vaultProgress";
import { normalizeVaultPR } from "@/lib/domain/vaultUnits";
import {
  loadVaultHeightGoal,
  saveVaultHeightGoal,
  subscribeVaultHeightGoal,
} from "@/lib/storage/logStore";

export function useVaultHeightGoal() {
  const [goalHeight, setGoalHeight] = useState(DEFAULT_VAULT_HEIGHT_GOAL);

  useEffect(() => {
    const refresh = () => setGoalHeight(loadVaultHeightGoal());
    refresh();

    const unsubscribe = subscribeVaultHeightGoal(refresh);
    return unsubscribe;
  }, []);

  function persistGoalHeight(value?: string) {
    const next = normalizeVaultPR(value ?? goalHeight);
    const safe = next.trim() === "" ? DEFAULT_VAULT_HEIGHT_GOAL : next;
    saveVaultHeightGoal(safe);
    setGoalHeight(safe);
  }

  return {
    goalHeight,
    saveGoalHeight: persistGoalHeight,
  };
}
