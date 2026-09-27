import {
  isWishlistPole,
  migrateLegacyPoleRecord,
} from "@/lib/domain/poleInventory";
import {
  mergeOwnedPoles,
  normalizePoleRecords,
  splitPolesByKind,
} from "@/lib/domain/sharedPoleStorage";
import type { Pole, PoleBag } from "@/lib/domain/types";
import { getItem, setItem } from "@/lib/storage/localStore";
import { STORAGE_KEYS } from "@/lib/storage/keys";

function hasLocalStorageKey(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(key) !== null;
}

function loadLegacyPoleInventory(): Pole[] {
  const legacy = getItem<unknown[]>(STORAGE_KEYS.POLE_INVENTORY, []);
  if (!Array.isArray(legacy)) {
    return [];
  }

  return legacy
    .map((value) =>
      value && typeof value === "object"
        ? migrateLegacyPoleRecord(value as Record<string, unknown>)
        : null
    )
    .filter((pole): pole is Pole => pole !== null);
}

export function loadSharedOwnedPoles(): Pole[] {
  const stored = getItem<unknown[]>(STORAGE_KEYS.SHARED_POLE_INVENTORY, []);
  if (hasLocalStorageKey(STORAGE_KEYS.SHARED_POLE_INVENTORY)) {
    return normalizePoleRecords(stored);
  }

  const legacy = loadLegacyPoleInventory();
  return legacy.filter((pole) => !isWishlistPole(pole));
}

export function loadWishlistPoles(): Pole[] {
  const stored = getItem<unknown[]>(STORAGE_KEYS.POLE_WISHLIST, []);
  if (hasLocalStorageKey(STORAGE_KEYS.POLE_WISHLIST)) {
    return normalizePoleRecords(stored).filter((pole) => isWishlistPole(pole));
  }

  const legacy = loadLegacyPoleInventory();
  return legacy.filter((pole) => isWishlistPole(pole));
}

export function loadPoles(): Pole[] {
  return [...loadSharedOwnedPoles(), ...loadWishlistPoles()];
}

export function savePoles(poles: Pole[]): void {
  const { owned, wishlist } = splitPolesByKind(poles);

  setItem(STORAGE_KEYS.SHARED_POLE_INVENTORY, owned);
  setItem(STORAGE_KEYS.POLE_WISHLIST, wishlist);
  setItem(STORAGE_KEYS.POLE_INVENTORY, []);
}

export function saveSharedOwnedPoles(poles: Pole[]): void {
  setItem(
    STORAGE_KEYS.SHARED_POLE_INVENTORY,
    mergeOwnedPoles(normalizePoleRecords(poles))
  );
}

export function saveWishlistPoles(poles: Pole[]): void {
  setItem(
    STORAGE_KEYS.POLE_WISHLIST,
    normalizePoleRecords(poles).filter((pole) => isWishlistPole(pole))
  );
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
