import type { HeightPREntry, SprintPREntry, StrengthPREntry } from "@/lib/domain/types";
import {
  buildVaultPRChartData,
  getVaultPRChartDomain,
  type VaultRunChartKey,
} from "@/lib/domain/vaultProgress";
import { metersToFeetInches } from "@/lib/domain/vaultUnits";

export type PRChartTab =
  | VaultRunChartKey
  | "sprint"
  | "strength";

export type SprintChartKey = "tenMeter" | "twentyMeter" | "thirtyMeter";

export type StrengthChartKey = "bench" | "squat" | "pullup";

export type PRChartPoint = {
  date: string;
  pr: number;
};

const SPRINT_CHART_LABELS: Record<SprintChartKey, string> = {
  tenMeter: "10m",
  twentyMeter: "20m",
  thirtyMeter: "30m",
};

const STRENGTH_CHART_LABELS: Record<StrengthChartKey, string> = {
  bench: "Bench",
  squat: "Squat",
  pullup: "Pullup",
};

export function getSprintChartLabel(key: SprintChartKey): string {
  return SPRINT_CHART_LABELS[key];
}

export function getStrengthChartLabel(key: StrengthChartKey): string {
  return STRENGTH_CHART_LABELS[key];
}

export function buildSprintPRChartData(
  prHistory: SprintPREntry[],
  selectedMetric: SprintChartKey
): PRChartPoint[] {
  return prHistory
    .filter((entry) => {
      const value = entry[selectedMetric];
      return value !== "" && Number.isFinite(Number(value));
    })
    .map((entry) => ({
      date: entry.date,
      pr: Number(entry[selectedMetric]),
    }))
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}

export function buildStrengthPRChartData(
  prHistory: StrengthPREntry[],
  selectedMetric: StrengthChartKey
): PRChartPoint[] {
  return prHistory
    .filter((entry) => {
      const value = entry[selectedMetric];
      return value !== "" && Number.isFinite(Number(value));
    })
    .map((entry) => ({
      date: entry.date,
      pr: Number(entry[selectedMetric]),
    }))
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}

export function getNumericPRChartDomain(
  chartData: PRChartPoint[],
  padding: number
): [number | "auto", number | "auto"] {
  if (chartData.length === 0) {
    return ["auto", "auto"];
  }

  const values = chartData.map((point) => point.pr);
  return [
    Math.max(0, Math.min(...values) - padding),
    Math.max(...values) + padding,
  ];
}

export function formatVaultPRChartValue(value: number): string {
  return metersToFeetInches(value);
}

export function formatSprintPRChartValue(value: number): string {
  return `${value.toFixed(2)}s`;
}

export function formatStrengthPRChartValue(
  value: number,
  metric: StrengthChartKey
): string {
  if (metric === "pullup") {
    return `${value} reps`;
  }

  return `${value} lbs`;
}

export function buildPRChartData(params: {
  tab: PRChartTab;
  vaultHistory: HeightPREntry[];
  sprintHistory: SprintPREntry[];
  strengthHistory: StrengthPREntry[];
  sprintMetric: SprintChartKey;
  strengthMetric: StrengthChartKey;
}): PRChartPoint[] {
  if (params.tab === "sprint") {
    return buildSprintPRChartData(params.sprintHistory, params.sprintMetric);
  }

  if (params.tab === "strength") {
    return buildStrengthPRChartData(
      params.strengthHistory,
      params.strengthMetric
    );
  }

  return buildVaultPRChartData(params.vaultHistory, params.tab);
}

export function getPRChartDomain(
  tab: PRChartTab,
  chartData: PRChartPoint[]
): [number | "auto", number | "auto"] {
  if (tab === "sprint") {
    return getNumericPRChartDomain(chartData, 0.15);
  }

  if (tab === "strength") {
    return getNumericPRChartDomain(chartData, 5);
  }

  return getVaultPRChartDomain(chartData);
}

export function formatPRChartValue(
  tab: PRChartTab,
  value: number,
  strengthMetric: StrengthChartKey
): string {
  if (tab === "sprint") {
    return formatSprintPRChartValue(value);
  }

  if (tab === "strength") {
    return formatStrengthPRChartValue(value, strengthMetric);
  }

  return formatVaultPRChartValue(value);
}

export function isVaultChartTab(tab: PRChartTab): tab is VaultRunChartKey {
  return tab !== "sprint" && tab !== "strength";
}
