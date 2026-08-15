"use client";

import { useEffect, useState } from "react";
import type { SprintPRs } from "@/lib/domain/types";
import {
  applyPRUpdates,
  emptyInputs,
  SPRINT_PR_FIELDS,
} from "@/lib/domain/prLog";
import {
  EMPTY_SPRINT_PRS,
  loadSprintPRs,
  saveSprintPRs,
} from "@/lib/storage/logStore";

export function useSprintPRState() {
  const [prs, setPrs] = useState<SprintPRs>(EMPTY_SPRINT_PRS);
  const [inputs, setInputs] = useState(() => emptyInputs(SPRINT_PR_FIELDS));

  useEffect(() => {
    setPrs(loadSprintPRs());
  }, []);

  function updateInput(inputKey: string, value: string) {
    setInputs((prev) => ({ ...prev, [inputKey]: value }));
  }

  function savePRs() {
    const updated = applyPRUpdates(prs, inputs, SPRINT_PR_FIELDS) as SprintPRs;
    setPrs(updated);
    saveSprintPRs(updated);
    setInputs(emptyInputs(SPRINT_PR_FIELDS));
  }

  function clearPRs() {
    if (!confirm("Delete all sprint PRs?")) {
      return;
    }

    setPrs(EMPTY_SPRINT_PRS);
    saveSprintPRs(EMPTY_SPRINT_PRS);
  }

  return {
    prs,
    inputs,
    updateInput,
    savePRs,
    clearPRs,
  };
}
