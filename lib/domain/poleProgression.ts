import type { Pole } from "@/lib/domain/types";
import { getBrandColor } from "@/lib/poleCatalog";

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

export type ProgressionGrid = Map<ProgressionCellKey, Pole[]>;

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

  const legacy = compact.match(/^(\d+)ft(\d)?$/i);
  if (legacy) {
    return `${legacy[1]}'${legacy[2] ?? "0"}`;
  }

  return length.trim();
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

export function buildProgressionGrid(poles: Pole[]): ProgressionGrid {
  const grid: ProgressionGrid = new Map();

  for (const pole of poles) {
    const key = getProgressionCellKey(pole.length, pole.weightRating);
    if (!key) {
      continue;
    }

    const existing = grid.get(key) ?? [];
    grid.set(key, [...existing, pole]);
  }

  return grid;
}

export function getPrimaryCellBrandColor(poles: Pole[]): string | null {
  return poles[0] ? getBrandColor(poles[0].brandId) : null;
}
