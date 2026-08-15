"use client";

import { useEffect, useState } from "react";
import type { StrengthPREntry, StrengthPRs } from "@/lib/domain/types";
import {
  applyPRUpdates,
  appendStrengthPREntry,
  emptyInputs,
  STRENGTH_PR_FIELDS,
} from "@/lib/domain/prLog";
import {
  EMPTY_STRENGTH_PRS,
  loadStrengthPRHistory,
  loadStrengthPRs,
  saveStrengthPRHistory,
  saveStrengthPRs,
} from "@/lib/storage/logStore";

export function useStrengthPRState() {
  const [prs, setPrs] = useState<StrengthPRs>(EMPTY_STRENGTH_PRS);
  const [prHistory, setPrHistory] = useState<StrengthPREntry[]>([]);
  const [inputs, setInputs] = useState(() => emptyInputs(STRENGTH_PR_FIELDS));

  useEffect(() => {
    setPrs(loadStrengthPRs());
    setPrHistory(loadStrengthPRHistory());
  }, []);

  function updateInput(inputKey: string, value: string) {
    setInputs((prev) => ({ ...prev, [inputKey]: value }));
  }

  function savePRs() {
    const updated = applyPRUpdates(prs, inputs, STRENGTH_PR_FIELDS) as StrengthPRs;
    const { history, changed } = appendStrengthPREntry(prHistory, prs, updated);

    setPrs(updated);
    saveStrengthPRs(updated);

    if (changed) {
      setPrHistory(history);
      saveStrengthPRHistory(history);
    }

    setInputs(emptyInputs(STRENGTH_PR_FIELDS));
  }

  function clearPRs() {
    if (!confirm("Delete all strength PRs?")) {
      return;
    }

    setPrs(EMPTY_STRENGTH_PRS);
    setPrHistory([]);
    saveStrengthPRs(EMPTY_STRENGTH_PRS);
    saveStrengthPRHistory([]);
  }

  return {
    prs,
    inputs,
    updateInput,
    savePRs,
    clearPRs,
  };
}
