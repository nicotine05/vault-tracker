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

const LENGTH_STEP_INCHES = 6;
const WEIGHT_STEP = 10;
const AXIS_PADDING_LENGTH_INCHES = 6;
const AXIS_PADDING_WEIGHT = 10;

/** Default progression ladder lengths (columns). */
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

/** Default progression weight ratings (rows). */
export const PROGRESSION_WEIGHTS = [
  90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
] as const;

export type ProgressionCellKey = `${string}|${number}`;

export type ProgressionCellContents = {
  owned: Pole[];
  wishlist: Pole[];
};

export type ProgressionGrid = Map<ProgressionCellKey, ProgressionCellContents>;

export type ProgressionAxes = {
  lengths: string[];
  weights: number[];
};

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

export function formatLengthFromTotalInches(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}`;
}

export function lengthToTotalInches(length: string): number | null {
  const normalized = normalizeProgressionLength(length);
  const match = normalized.match(/^(\d+)'(\d+)$/);

  if (!match) {
    return null;
  }

  return Number(match[1]) * 12 + Number(match[2]);
}

export function snapLengthToProgressionStep(length: string): string | null {
  const totalInches = lengthToTotalInches(normalizeProgressionLength(length));
  if (totalInches === null || totalInches < 0) {
    return null;
  }

  const snapped = Math.round(totalInches / LENGTH_STEP_INCHES) * LENGTH_STEP_INCHES;
  return formatLengthFromTotalInches(snapped);
}

export function snapWeightToProgression(weight: number): number | null {
  if (!Number.isFinite(weight) || weight <= 0) {
    return null;
  }

  return Math.round(weight / WEIGHT_STEP) * WEIGHT_STEP;
}

export function getProgressionCellKey(
  length: string,
  weightRating: number
): ProgressionCellKey | null {
  const snappedLength = snapLengthToProgressionStep(length);
  const weight = snapWeightToProgression(weightRating);

  if (!snappedLength || weight === null) {
    return null;
  }

  return `${snappedLength}|${weight}`;
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

function generateLengthSteps(minInches: number, maxInches: number): string[] {
  const start =
    Math.floor(minInches / LENGTH_STEP_INCHES) * LENGTH_STEP_INCHES;
  const end = Math.ceil(maxInches / LENGTH_STEP_INCHES) * LENGTH_STEP_INCHES;
  const steps: string[] = [];

  for (let inches = start; inches <= end; inches += LENGTH_STEP_INCHES) {
    steps.push(formatLengthFromTotalInches(inches));
  }

  return steps;
}

function generateWeightSteps(minWeight: number, maxWeight: number): number[] {
  const start = Math.floor(minWeight / WEIGHT_STEP) * WEIGHT_STEP;
  const end = Math.ceil(maxWeight / WEIGHT_STEP) * WEIGHT_STEP;
  const steps: number[] = [];

  for (let weight = start; weight <= end; weight += WEIGHT_STEP) {
    steps.push(weight);
  }

  return steps;
}

export function computeProgressionAxesFromPoles(
  poles: Pole[],
  options: { includeOwned: boolean; includeWishlist: boolean }
): ProgressionAxes {
  let minLengthInches = Number.POSITIVE_INFINITY;
  let maxLengthInches = Number.NEGATIVE_INFINITY;
  let minWeight = Number.POSITIVE_INFINITY;
  let maxWeight = Number.NEGATIVE_INFINITY;
  let hasData = false;

  for (const pole of poles) {
    if (options.includeOwned && isOwnedPole(pole) && !isRetiredPole(pole)) {
      const snappedLength = snapLengthToProgressionStep(pole.length);
      const snappedWeight = snapWeightToProgression(pole.weightRating);

      if (snappedLength) {
        const inches = lengthToTotalInches(snappedLength);
        if (inches !== null) {
          minLengthInches = Math.min(minLengthInches, inches);
          maxLengthInches = Math.max(maxLengthInches, inches);
          hasData = true;
        }
      }

      if (snappedWeight !== null) {
        minWeight = Math.min(minWeight, snappedWeight);
        maxWeight = Math.max(maxWeight, snappedWeight);
        hasData = true;
      }
    }

    if (options.includeWishlist && isWishlistPole(pole)) {
      if (pole.length.trim()) {
        const minLen = lengthToTotalInches(pole.length);
        const maxLen = pole.lengthMax
          ? lengthToTotalInches(pole.lengthMax)
          : minLen;

        if (minLen !== null) {
          minLengthInches = Math.min(minLengthInches, minLen);
          maxLengthInches = Math.max(maxLengthInches, maxLen ?? minLen);
          hasData = true;
        }
      }

      const weightMin = pole.weightRating > 0 ? pole.weightRating : null;
      const weightMax = pole.weightMax ?? weightMin;

      if (weightMin !== null) {
        minWeight = Math.min(minWeight, weightMin);
        maxWeight = Math.max(maxWeight, weightMax ?? weightMin);
        hasData = true;
      }
    }
  }

  if (!hasData) {
    return {
      lengths: [...PROGRESSION_LENGTHS],
      weights: [...PROGRESSION_WEIGHTS],
    };
  }

  minLengthInches = Math.max(0, minLengthInches - AXIS_PADDING_LENGTH_INCHES);
  maxLengthInches += AXIS_PADDING_LENGTH_INCHES;
  minWeight = Math.max(WEIGHT_STEP, minWeight - AXIS_PADDING_WEIGHT);
  maxWeight += AXIS_PADDING_WEIGHT;

  return {
    lengths: generateLengthSteps(minLengthInches, maxLengthInches),
    weights: generateWeightSteps(minWeight, maxWeight),
  };
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

export function buildProgressionGrid(
  poles: Pole[],
  axes?: ProgressionAxes
): ProgressionGrid {
  const grid: ProgressionGrid = new Map();
  const resolvedAxes =
    axes ??
    computeProgressionAxesFromPoles(poles, {
      includeOwned: true,
      includeWishlist: true,
    });

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

    for (const length of resolvedAxes.lengths) {
      for (const weight of resolvedAxes.weights) {
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
