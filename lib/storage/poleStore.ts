import type { Pole, PoleBag } from "@/lib/domain/types";
import { getItem, setItem } from "@/lib/storage/localStore";
import { STORAGE_KEYS } from "@/lib/storage/keys";

export function loadPoles(): Pole[] {
  return getItem<Pole[]>(STORAGE_KEYS.POLE_INVENTORY, []);
}

export function savePoles(poles: Pole[]): void {
  setItem(STORAGE_KEYS.POLE_INVENTORY, poles);
}

export function loadPoleBags(): PoleBag[] {
  return getItem<PoleBag[]>(STORAGE_KEYS.POLE_BAGS, []);
}

export function savePoleBags(bags: PoleBag[]): void {
  setItem(STORAGE_KEYS.POLE_BAGS, bags);
}

export function loadRecentPoleIds(): string[] {
  return getItem<string[]>(STORAGE_KEYS.RECENT_POLE_IDS, []);
}

export function saveRecentPoleIds(poleIds: string[]): void {
  setItem(STORAGE_KEYS.RECENT_POLE_IDS, poleIds);
}
