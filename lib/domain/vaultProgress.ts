import type { HeightPREntry, RunPRs } from "@/lib/domain/types";
import {
  highestVaultPRMeters,
  normalizeVaultPR,
  parseVaultPRToMeters,
} from "@/lib/domain/vaultUnits";
import { getVaultHeightPRValues } from "@/lib/storage/logStore";

export const START_PR_METERS = 3.6576;
export const GOAL_PR_METERS = 4.57;

export type VaultRunChartKey =
  | "threeL"
  | "fourL"
  | "fiveL"
  | "sixL"
  | "sevenL";

export type VaultPRChartPoint = {
  date: string;
  pr: number;
};

export function getHighestPRDisplay(runPRs: RunPRs): string {
  const highest =
    getVaultHeightPRValues(runPRs)
      .sort((a, b) => {
        const aMeters = parseVaultPRToMeters(a) || 0;
        const bMeters = parseVaultPRToMeters(b) || 0;
        return bMeters - aMeters;
      })[0] || "";

  return highest ? normalizeVaultPR(highest) : "";
}

export function computeVaultGoalProgress(runPRs: RunPRs): number {
  const currentPRMeters = highestVaultPRMeters(
    getVaultHeightPRValues(runPRs),
    START_PR_METERS
  );

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((currentPRMeters - START_PR_METERS) /
          (GOAL_PR_METERS - START_PR_METERS)) *
          100
      )
    )
  );
}

export function buildVaultPRChartData(
  prHistory: HeightPREntry[],
  selectedRun: VaultRunChartKey
): VaultPRChartPoint[] {
  return prHistory
    .filter((entry) => {
      const value = entry[selectedRun];
      return value && parseVaultPRToMeters(value) !== null;
    })
    .map((entry) => ({
      date: entry.date,
      pr: parseVaultPRToMeters(entry[selectedRun]) || 0,
    }))
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}

export function getVaultPRChartDomain(
  chartData: VaultPRChartPoint[]
): [number | "auto", number | "auto"] {
  if (chartData.length === 0) {
    return ["auto", "auto"];
  }

  const values = chartData.map((point) => point.pr);
  return [
    Math.floor(Math.min(...values) - 0.3),
    Math.ceil(Math.max(...values) + 0.3),
  ];
}
