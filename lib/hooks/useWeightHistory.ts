"use client";

import { useEffect, useState } from "react";
import type { WeightEntry } from "@/lib/domain/types";
import {
  appendWeightEntry,
  loadWeightHistory,
  subscribeWeightHistory,
} from "@/lib/storage/weightStore";

export function useWeightHistory() {
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  useEffect(() => {
    const refresh = () => setWeightHistory(loadWeightHistory());
    refresh();

    const unsubscribe = subscribeWeightHistory(refresh);
    return unsubscribe;
  }, []);

  function saveWeight() {
    const parsed = parseFloat(newWeight);
    if (isNaN(parsed)) {
      return;
    }

    setWeightHistory(appendWeightEntry(parsed));
    setNewWeight("");
    setShowEditor(false);
  }

  return {
    weightHistory,
    showEditor,
    setShowEditor,
    newWeight,
    setNewWeight,
    saveWeight,
  };
}
