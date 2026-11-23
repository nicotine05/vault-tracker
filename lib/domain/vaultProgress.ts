import type { HeightPREntry, RunPRs } from "@/lib/domain/types";
import {
  highestVaultPRMeters,
  normalizeVaultPR,
  parseVaultPRToMeters,
} from "@/lib/domain/vaultUnits";
import { getVaultHeightPRValues } from "@/lib/storage/logStore";

export const START_PR_METERS = 3.6576;
/** Default home/progress height goal (~15ft). */
export const DEFAULT_VAULT_HEIGHT_GOAL = "15ft 0in";
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

export function resolveVaultHeightGoalMeters(
  goalHeight?: string | null
): number {
  const parsed = parseVaultPRToMeters(goalHeight);
  return parsed !== null && parsed > START_PR_METERS ? parsed : GOAL_PR_METERS;
}

export function formatVaultHeightGoalDisplay(
  goalHeight?: string | null
): string {
  const normalized = goalHeight?.trim()
    ? normalizeVaultPR(goalHeight)
    : DEFAULT_VAULT_HEIGHT_GOAL;
  const meters = parseVaultPRToMeters(normalized);

  if (meters === null) {
    return "15ft";
  }

  // Prefer a compact label when inches are zero (matches legacy "15ft").
  const match = normalized.match(/^(\d+)ft\s*(\d+)in$/i);
  if (match && Number(match[2]) === 0) {
    return `${match[1]}ft`;
  }

  return normalized;
}

export function computeVaultGoalProgress(
  runPRs: RunPRs,
  goalHeight?: string | null
): number {
  const currentPRMeters = highestVaultPRMeters(
    getVaultHeightPRValues(runPRs),
    START_PR_METERS
  );
  const goalMeters = resolveVaultHeightGoalMeters(goalHeight);
  const span = goalMeters - START_PR_METERS;

  if (span <= 0) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(((currentPRMeters - START_PR_METERS) / span) * 100)
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
