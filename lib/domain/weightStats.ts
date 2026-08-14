import type { WeightEntry } from "@/lib/domain/types";

export type WeightStats = {
  currentWeight: string;
  dailyChange: number | null;
  monthlyChange: number | null;
  previousDate: string | null;
};

export function computeWeightStats(
  weightHistory: WeightEntry[]
): WeightStats {
  const latestWeightEntry =
    weightHistory.length > 0
      ? weightHistory[weightHistory.length - 1]
      : null;

  const currentWeight = latestWeightEntry
    ? latestWeightEntry.weight.toFixed(1)
    : "--";

  const previousWeightEntry =
    weightHistory.length > 1
      ? weightHistory[weightHistory.length - 2]
      : null;

  const dailyChange =
    latestWeightEntry && previousWeightEntry
      ? latestWeightEntry.weight - previousWeightEntry.weight
      : null;

  const previousDate = previousWeightEntry
    ? new Date(previousWeightEntry.date).toLocaleDateString()
    : null;

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const comparisonWeight = weightHistory.find(
    (entry) => new Date(entry.date).getTime() >= thirtyDaysAgo
  );

  const monthlyChange =
    latestWeightEntry && comparisonWeight
      ? latestWeightEntry.weight - comparisonWeight.weight
      : null;

  return {
    currentWeight,
    dailyChange,
    monthlyChange,
    previousDate,
  };
}

export function formatWeightDelta(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}`;
}
