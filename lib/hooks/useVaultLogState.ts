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
  carryForwardJumpForm,
  createJump,
  createVaultSession,
  emptyJumpForm,
  isVaultSessionDraftEmpty,
  updateRunPR,
} from "@/lib/domain/vaultLog";
import {
  formatPolePickerLabel,
  getPoleById,
  updateRecentPoleIds,
} from "@/lib/domain/poleInventory";
import {
  EMPTY_RUN_PRS,
  EMPTY_STEP_REFS,
  clearVaultSessionDraft,
  loadVaultPRHistory,
  loadVaultRunPRs,
  loadVaultSessionDraft,
  loadVaultSessions,
  loadVaultStepReferences,
  saveVaultPRHistory,
  saveVaultRunPRs,
  saveVaultSessionDraft,
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
  const [competitionMode, setCompetitionMode] = useState(false);
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

      const draft = loadVaultSessionDraft();
      if (draft) {
        setKeys(draft.keys);
        setJumps(draft.jumps);
        setJumpForm(draft.jumpForm);
        setCompetitionMode(draft.competitionMode);
      }
    } catch (error) {
      console.error("Failed to load vault logs", error);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveVaultSessionDraft({ keys, jumps, jumpForm, competitionMode });
  }, [keys, jumps, jumpForm, competitionMode, loaded]);

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
    if (competitionMode && !jumpForm.result) {
      return;
    }

    const selectedPole = getPoleById(poles, jumpForm.poleId);

    setJumps((prev) => [
      ...prev,
      createJump({
        run: jumpForm.run,
        grip: jumpForm.grip,
        takeoff: jumpForm.takeoff,
        comment: jumpForm.comment,
        poleId: jumpForm.poleId,
        poleLabel: selectedPole
          ? formatPolePickerLabel(selectedPole)
          : undefined,
        ...(competitionMode
          ? {
              result: jumpForm.result,
              standards: jumpForm.standards,
            }
          : {
              grade: jumpForm.grade,
            }),
      }),
    ]);

    if (jumpForm.poleId) {
      setRecentPoleIds((prev) => {
        const next = updateRecentPoleIds(prev, jumpForm.poleId!);
        saveRecentPoleIds(next);
        return next;
      });
    }

    setJumpForm(carryForwardJumpForm(jumpForm));
  }

  function removeJump(jumpId: string) {
    setJumps((prev) => prev.filter((jump) => jump.id !== jumpId));
  }

  function resetUnsavedSession() {
    setKeys([""]);
    setJumps([]);
    setJumpForm(emptyJumpForm());
    setCompetitionMode(false);
    clearVaultSessionDraft();
  }

  function saveSession() {
    if (jumps.length === 0) {
      return;
    }

    setSessions((prev) => [
      createVaultSession({
        keys,
        jumps,
        mode: competitionMode ? "competition" : "practice",
      }),
      ...prev,
    ]);
    resetUnsavedSession();
  }

  function clearSession() {
    if (
      isVaultSessionDraftEmpty({
        keys,
        jumps,
        jumpForm,
        competitionMode,
      })
    ) {
      return;
    }

    resetUnsavedSession();
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

  function updateCompetitionMode(enabled: boolean) {
    if (enabled === competitionMode) {
      return;
    }

    if (jumps.length > 0) {
      if (
        !confirm(
          "Switching between practice and competition clears jumps in the current draft. Continue?"
        )
      ) {
        return;
      }
      setJumps([]);
    }

    setCompetitionMode(enabled);
    setJumpForm((prev) => ({
      ...emptyJumpForm(),
      run: prev.run,
      grip: prev.grip,
      takeoff: prev.takeoff,
      poleId: prev.poleId,
      standards: enabled ? prev.standards : "",
    }));

    if (!enabled) {
      setKeys((prev) => (prev.length > 0 ? prev : [""]));
    }
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
    competitionMode,
    setCompetitionMode: updateCompetitionMode,
    addJump,
    removeJump,
    clearSession,
    canClearSession: !isVaultSessionDraftEmpty({
      keys,
      jumps,
      jumpForm,
      competitionMode,
    }),
    saveSession,
    deleteSession,
    saveHeightPRs,
    updateRunPRField,
    poles,
    recentPoleIds,
  };
}
