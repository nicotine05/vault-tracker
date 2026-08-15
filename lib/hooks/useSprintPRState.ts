"use client";

import { useEffect, useState } from "react";
import type { SprintPREntry, SprintPRs } from "@/lib/domain/types";
import {
  applyPRUpdates,
  appendSprintPREntry,
  emptyInputs,
  SPRINT_PR_FIELDS,
} from "@/lib/domain/prLog";
import {
  EMPTY_SPRINT_PRS,
  loadSprintPRHistory,
  loadSprintPRs,
  saveSprintPRHistory,
  saveSprintPRs,
} from "@/lib/storage/logStore";

export function useSprintPRState() {
  const [prs, setPrs] = useState<SprintPRs>(EMPTY_SPRINT_PRS);
  const [prHistory, setPrHistory] = useState<SprintPREntry[]>([]);
  const [inputs, setInputs] = useState(() => emptyInputs(SPRINT_PR_FIELDS));

  useEffect(() => {
    setPrs(loadSprintPRs());
    setPrHistory(loadSprintPRHistory());
  }, []);

  function updateInput(inputKey: string, value: string) {
    setInputs((prev) => ({ ...prev, [inputKey]: value }));
  }

  function savePRs() {
    const updated = applyPRUpdates(prs, inputs, SPRINT_PR_FIELDS) as SprintPRs;
    const { history, changed } = appendSprintPREntry(prHistory, prs, updated);

    setPrs(updated);
    saveSprintPRs(updated);

    if (changed) {
      setPrHistory(history);
      saveSprintPRHistory(history);
    }

    setInputs(emptyInputs(SPRINT_PR_FIELDS));
  }

  function clearPRs() {
    if (!confirm("Delete all sprint PRs?")) {
      return;
    }

    setPrs(EMPTY_SPRINT_PRS);
    setPrHistory([]);
    saveSprintPRs(EMPTY_SPRINT_PRS);
    saveSprintPRHistory([]);
  }

  return {
    prs,
    inputs,
    updateInput,
    savePRs,
    clearPRs,
  };
}
