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

export function useVaultLogState() {
  const [loaded, setLoaded] = useState(false);
  const [sessions, setSessions] = useState<VaultSession[]>([]);
  const [stepRefs, setStepRefs] =
    useState<VaultStepReferences>(EMPTY_STEP_REFS);
  const [runPRs, setRunPRs] = useState<RunPRs>(EMPTY_RUN_PRS);
  const [prHistory, setPrHistory] = useState<HeightPREntry[]>([]);
  const [keys, setKeys] = useState<string[]>([""]);
  const [jumps, setJumps] = useState<Jump[]>([]);
  const [jumpForm, setJumpForm] = useState(emptyJumpForm);

  useEffect(() => {
    try {
      setSessions(loadVaultSessions());
      setStepRefs(loadVaultStepReferences());
      setRunPRs(loadVaultRunPRs());
      setPrHistory(loadVaultPRHistory());
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
    setJumps((prev) => [...prev, createJump(jumpForm)]);
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
    setPrHistory((prev) => appendHeightPREntry(prev, runPRs));
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
  };
}
