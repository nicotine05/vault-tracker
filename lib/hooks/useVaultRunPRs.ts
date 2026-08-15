"use client";

import { useEffect, useState } from "react";
import type { RunPRs } from "@/lib/domain/types";
import { loadVaultRunPRs, subscribeVaultRunPRs } from "@/lib/storage/logStore";

export function useVaultRunPRs() {
  const [runPRs, setRunPRs] = useState<RunPRs>(() => loadVaultRunPRs());

  useEffect(() => {
    const refresh = () => setRunPRs(loadVaultRunPRs());
    refresh();

    const unsubscribe = subscribeVaultRunPRs(refresh);
    return unsubscribe;
  }, []);

  return runPRs;
}
