import type { WeightEntry } from "@/lib/domain/types";
import { getItem, setItem } from "@/lib/storage/localStore";
import { STORAGE_EVENTS, STORAGE_KEYS } from "@/lib/storage/keys";

export function loadWeightHistory(): WeightEntry[] {
  return getItem<WeightEntry[]>(STORAGE_KEYS.WEIGHT_HISTORY, []);
}

export function saveWeightHistory(entries: WeightEntry[]): void {
  setItem(STORAGE_KEYS.WEIGHT_HISTORY, entries);
  window.dispatchEvent(new Event(STORAGE_EVENTS.WEIGHT_CHANGED));
}

export function appendWeightEntry(weight: number): WeightEntry[] {
  const updated = [
    ...loadWeightHistory(),
    {
      weight,
      date: new Date().toISOString(),
    },
  ];

  saveWeightHistory(updated);
  return updated;
}

export function subscribeWeightHistory(listener: () => void): () => void {
  const handler = () => listener();

  window.addEventListener(STORAGE_EVENTS.WEIGHT_CHANGED, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(STORAGE_EVENTS.WEIGHT_CHANGED, handler);
    window.removeEventListener("storage", handler);
  };
}
