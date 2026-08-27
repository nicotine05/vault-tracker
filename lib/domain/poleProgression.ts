import type { Pole } from "@/lib/domain/types";
import { getBrandColor } from "@/lib/poleCatalog";

function isRetiredPole(pole: Pole): boolean {
  return pole.retired === true;
}

function isOwnedPole(pole: Pole): boolean {
  return pole.kind !== "wishlist";
}

function isWishlistPole(pole: Pole): boolean {
  return pole.kind === "wishlist";
}

/** Standard progression ladder lengths (columns). */
export const PROGRESSION_LENGTHS = [
  "10'6",
  "11'0",
  "11'6",
  "12'0",
  "12'6",
  "13'0",
  "13'6",
  "14'0",
  "14'6",
  "15'0",
  "15'6",
  "16'0",
] as const;

/** Standard progression weight ratings (rows). */
export const PROGRESSION_WEIGHTS = [
  90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
] as const;

export type ProgressionCellKey = `${string}|${number}`;

export type ProgressionCellContents = {
  owned: Pole[];
  wishlist: Pole[];
};

export type ProgressionGrid = Map<ProgressionCellKey, ProgressionCellContents>;

export function normalizeProgressionLength(length: string): string {
  const compact = length.trim().replace(/\s+/g, "");

  const feetInches = compact.match(/^(\d+)[''′](\d)?$/);
  if (feetInches) {
    return `${feetInches[1]}'${feetInches[2] ?? "0"}`;
  }

  const feetOnly = compact.match(/^(\d+)[''′]?$/);
  if (feetOnly) {
    return `${feetOnly[1]}'0`;
  }

  const legacy = compact.match(/^(\d+)ft(\d+)?in?$/i);
  if (legacy) {
    return `${legacy[1]}'${legacy[2] ?? "0"}`;
  }

  const legacyFtOnly = compact.match(/^(\d+)ft$/i);
  if (legacyFtOnly) {
    return `${legacyFtOnly[1]}'0`;
  }

  return length.trim();
}

export function lengthToTotalInches(length: string): number | null {
  const normalized = normalizeProgressionLength(length);
  const match = normalized.match(/^(\d+)'(\d+)$/);

  if (!match) {
    return null;
  }

  return Number(match[1]) * 12 + Number(match[2]);
}

export function snapWeightToProgression(weight: number): number | null {
  if (!Number.isFinite(weight)) {
    return null;
  }

  const rounded = Math.round(weight / 10) * 10;
  if (PROGRESSION_WEIGHTS.includes(rounded as (typeof PROGRESSION_WEIGHTS)[number])) {
    return rounded;
  }

  return null;
}

export function getProgressionCellKey(
  length: string,
  weightRating: number
): ProgressionCellKey | null {
  const normalizedLength = normalizeProgressionLength(length);
  const weight = snapWeightToProgression(weightRating);

  if (!weight) {
    return null;
  }

  if (
    !PROGRESSION_LENGTHS.includes(
      normalizedLength as (typeof PROGRESSION_LENGTHS)[number]
    )
  ) {
    return null;
  }

  return `${normalizedLength}|${weight}`;
}

function emptyCellContents(): ProgressionCellContents {
  return { owned: [], wishlist: [] };
}

function addPoleToCell(
  grid: ProgressionGrid,
  key: ProgressionCellKey,
  pole: Pole,
  bucket: keyof ProgressionCellContents
): void {
  const existing = grid.get(key) ?? emptyCellContents();
  grid.set(key, {
    ...existing,
    [bucket]: [...existing[bucket], pole],
  });
}

export function wishlistMatchesProgressionCell(
  pole: Pole,
  length: string,
  weight: number
): boolean {
  const hasLengthSpec = Boolean(pole.length.trim());
  const hasWeightSpec = pole.weightRating > 0 || (pole.weightMax ?? 0) > 0;

  if (!hasLengthSpec && !hasWeightSpec) {
    return false;
  }

  if (hasLengthSpec) {
    const cellLengthInches = lengthToTotalInches(length);
    const minLengthInches = lengthToTotalInches(pole.length);
    const maxLengthInches = pole.lengthMax
      ? lengthToTotalInches(pole.lengthMax)
      : minLengthInches;

    if (
      cellLengthInches === null ||
      minLengthInches === null ||
      maxLengthInches === null
    ) {
      return false;
    }

    if (
      cellLengthInches < minLengthInches ||
      cellLengthInches > maxLengthInches
    ) {
      return false;
    }
  }

  if (hasWeightSpec) {
    const minWeight = pole.weightRating || 0;
    const maxWeight = pole.weightMax ?? pole.weightRating;

    if (minWeight > 0 && weight < minWeight) {
      return false;
    }

    if (maxWeight > 0 && weight > maxWeight) {
      return false;
    }
  }

  return true;
}

export function getOwnedProgressionCellKey(pole: Pole): ProgressionCellKey | null {
  if (!isOwnedPole(pole)) {
    return null;
  }

  return getProgressionCellKey(pole.length, pole.weightRating);
}

export function buildProgressionGrid(poles: Pole[]): ProgressionGrid {
  const grid: ProgressionGrid = new Map();

  for (const pole of poles) {
    if (isOwnedPole(pole)) {
      if (isRetiredPole(pole)) {
        continue;
      }

      const key = getOwnedProgressionCellKey(pole);
      if (!key) {
        continue;
      }

      addPoleToCell(grid, key, pole, "owned");
      continue;
    }

    if (!isWishlistPole(pole)) {
      continue;
    }

    for (const length of PROGRESSION_LENGTHS) {
      for (const weight of PROGRESSION_WEIGHTS) {
        if (!wishlistMatchesProgressionCell(pole, length, weight)) {
          continue;
        }

        const key = `${length}|${weight}` as ProgressionCellKey;
        addPoleToCell(grid, key, pole, "wishlist");
      }
    }
  }

  return grid;
}

export function gridHasVisibleEntries(
  grid: ProgressionGrid,
  options: { includeOwned: boolean; includeWishlist: boolean }
): boolean {
  for (const cell of grid.values()) {
    if (options.includeOwned && cell.owned.length > 0) {
      return true;
    }

    if (options.includeWishlist && cell.wishlist.length > 0) {
      return true;
    }
  }

  return false;
}

export function getPrimaryCellBrandColor(poles: Pole[]): string | null {
  return poles[0] ? getBrandColor(poles[0].brandId) : null;
}

export function getCellBrandColors(poles: Pole[]): string[] {
  const colors: string[] = [];
  const seen = new Set<string>();

  for (const pole of poles) {
    if (!pole.brandId) {
      continue;
    }

    const color = getBrandColor(pole.brandId);
    if (seen.has(color)) {
      continue;
    }

    seen.add(color);
    colors.push(color);
  }

  return colors;
}

export function getUniqueBrandColorCount(poles: Pole[]): number {
  return getCellBrandColors(poles).length;
}
