import {
  isWishlistPole,
  migrateLegacyPoleRecord,
} from "@/lib/domain/poleInventory";
import type { Pole } from "@/lib/domain/types";

export function normalizePoleRecords(values: unknown[]): Pole[] {
  return values
    .map((value) =>
      value && typeof value === "object"
        ? migrateLegacyPoleRecord(value as Record<string, unknown>)
        : null
    )
    .filter((pole): pole is Pole => pole !== null);
}

export function splitPolesByKind(poles: Pole[]): {
  owned: Pole[];
  wishlist: Pole[];
} {
  return {
    owned: poles.filter((pole) => !isWishlistPole(pole)),
    wishlist: poles.filter((pole) => isWishlistPole(pole)),
  };
}

export function mergeOwnedPoles(...groups: Pole[][]): Pole[] {
  const merged = new Map<string, Pole>();

  for (const group of groups) {
    for (const pole of group) {
      if (isWishlistPole(pole)) {
        continue;
      }

      const existing = merged.get(pole.id);
      if (!existing || pole.createdAt >= existing.createdAt) {
        merged.set(pole.id, pole);
      }
    }
  }

  return Array.from(merged.values());
}

export function splitUnknownPoleRecords(values: unknown[]): {
  owned: Pole[];
  wishlist: Pole[];
} {
  return splitPolesByKind(normalizePoleRecords(values));
}
