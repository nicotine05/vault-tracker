"use client";

import { useEffect, useState } from "react";
import type {
  HeightPREntry,
  Jump,
  RunPRs,
  VaultSession,
  VaultStepReferences,
} from "@/lib/domain/types";
import {
  appendHeightPREntry,
  createJump,
  createVaultSession,
  emptyJumpForm,
  updateRunPR,
} from "@/lib/domain/vaultLog";
import { updateRecentPoleIds, formatPolePickerLabel, getPoleById } from "@/lib/domain/poleInventory";
import {
  EMPTY_RUN_PRS,
  EMPTY_STEP_REFS,
  loadVaultPRHistory,
  loadVaultRunPRs,
  loadVaultSessions,
  loadVaultStepReferences,
  saveVaultPRHistory,
  saveVaultRunPRs,
  saveVaultSessions,
  saveVaultStepReferences,
} from "@/lib/storage/logStore";
import { loadPoles, loadRecentPoleIds, saveRecentPoleIds } from "@/lib/storage/poleStore";
import type { Pole } from "@/lib/domain/types";

export function useVaultLogState() {
  const [loaded, setLoaded] = useState(false);
  const [sessions, setSessions] = useState<VaultSession[]>([]);
  const [stepRefs, setStepRefs] =
    useState<VaultStepReferences>(EMPTY_STEP_REFS);
  const [runPRs, setRunPRs] = useState<RunPRs>(EMPTY_RUN_PRS);
  const [lastSavedRunPRs, setLastSavedRunPRs] = useState<RunPRs>(EMPTY_RUN_PRS);
  const [prHistory, setPrHistory] = useState<HeightPREntry[]>([]);
  const [keys, setKeys] = useState<string[]>([""]);
  const [jumps, setJumps] = useState<Jump[]>([]);
  const [jumpForm, setJumpForm] = useState(emptyJumpForm);
  const [poles, setPoles] = useState<Pole[]>([]);
  const [recentPoleIds, setRecentPoleIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      setSessions(loadVaultSessions());
      setStepRefs(loadVaultStepReferences());
      setRunPRs(loadVaultRunPRs());
      setLastSavedRunPRs(loadVaultRunPRs());
      setPrHistory(loadVaultPRHistory());
      setPoles(loadPoles());
      setRecentPoleIds(loadRecentPoleIds());
    } catch (error) {
      console.error("Failed to load vault logs", error);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveVaultSessions(sessions);
  }, [sessions, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveVaultStepReferences(stepRefs);
  }, [stepRefs, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveVaultRunPRs(runPRs);
  }, [runPRs, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveVaultPRHistory(prHistory);
  }, [prHistory, loaded]);

  function addJump() {
    const selectedPole = getPoleById(poles, jumpForm.poleId);

    setJumps((prev) => [
      ...prev,
      createJump({
        ...jumpForm,
        poleLabel: selectedPole
          ? formatPolePickerLabel(selectedPole)
          : undefined,
      }),
    ]);

    if (jumpForm.poleId) {
      setRecentPoleIds((prev) => {
        const next = updateRecentPoleIds(prev, jumpForm.poleId!);
        saveRecentPoleIds(next);
        return next;
      });
    }

    setJumpForm(emptyJumpForm());
  }

  function removeJump(jumpId: string) {
    setJumps((prev) => prev.filter((jump) => jump.id !== jumpId));
  }

  function saveSession() {
    if (jumps.length === 0) {
      return;
    }

    setSessions((prev) => [
      createVaultSession({ keys, jumps }),
      ...prev,
    ]);
    setKeys([""]);
    setJumps([]);
    setJumpForm(emptyJumpForm());
  }

  function deleteSession(sessionId: string) {
    if (!confirm("Delete this vault session?")) {
      return;
    }

    setSessions((prev) =>
      prev.filter((session) => session.id !== sessionId)
    );
  }

  function saveHeightPRs() {
    const { history, changed } = appendHeightPREntry(
      prHistory,
      lastSavedRunPRs,
      runPRs
    );

    if (!changed) {
      return;
    }

    setPrHistory(history);
    setLastSavedRunPRs(runPRs);
  }

  function updateRunPRField(key: keyof RunPRs, value: string) {
    setRunPRs((prev) => updateRunPR(prev, key, value));
  }

  return {
    sessions,
    stepRefs,
    setStepRefs,
    runPRs,
    prHistory,
    keys,
    setKeys,
    jumps,
    jumpForm,
    setJumpForm,
    addJump,
    removeJump,
    saveSession,
    deleteSession,
    saveHeightPRs,
    updateRunPRField,
    poles,
    recentPoleIds,
  };
}
