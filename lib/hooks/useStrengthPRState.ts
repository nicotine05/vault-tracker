"use client";

import { useEffect, useState } from "react";
import type { StrengthPRs } from "@/lib/domain/types";
import {
  applyPRUpdates,
  emptyInputs,
  STRENGTH_PR_FIELDS,
} from "@/lib/domain/prLog";
import {
  EMPTY_STRENGTH_PRS,
  loadStrengthPRs,
  saveStrengthPRs,
} from "@/lib/storage/logStore";

export function useStrengthPRState() {
  const [prs, setPrs] = useState<StrengthPRs>(EMPTY_STRENGTH_PRS);
  const [inputs, setInputs] = useState(() => emptyInputs(STRENGTH_PR_FIELDS));

  useEffect(() => {
    setPrs(loadStrengthPRs());
  }, []);

  function updateInput(inputKey: string, value: string) {
    setInputs((prev) => ({ ...prev, [inputKey]: value }));
  }

  function savePRs() {
    const updated = applyPRUpdates(prs, inputs, STRENGTH_PR_FIELDS) as StrengthPRs;
    setPrs(updated);
    saveStrengthPRs(updated);
    setInputs(emptyInputs(STRENGTH_PR_FIELDS));
  }

  function clearPRs() {
    if (!confirm("Delete all strength PRs?")) {
      return;
    }

    setPrs(EMPTY_STRENGTH_PRS);
    saveStrengthPRs(EMPTY_STRENGTH_PRS);
  }

  return {
    prs,
    inputs,
    updateInput,
    savePRs,
    clearPRs,
  };
}
