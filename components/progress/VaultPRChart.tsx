"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HeightPREntry, SprintPREntry, StrengthPREntry } from "@/lib/domain/types";
import {
  buildPRChartData,
  formatPRChartValue,
  getPRChartDomain,
  getSprintChartLabel,
  getStrengthChartLabel,
  type PRChartTab,
  type SprintChartKey,
  type StrengthChartKey,
} from "@/lib/domain/prProgress";
import {
  segmentedIdleClassName,
  segmentedSelectedClassName,
} from "@/lib/ui/componentStyles";

type VaultPRChartProps = {
  vaultHistory: HeightPREntry[];
  sprintHistory: SprintPREntry[];
  strengthHistory: StrengthPREntry[];
  selectedTab: PRChartTab;
  onTabChange: (tab: PRChartTab) => void;
  sprintMetric: SprintChartKey;
  onSprintMetricChange: (metric: SprintChartKey) => void;
  strengthMetric: StrengthChartKey;
  onStrengthMetricChange: (metric: StrengthChartKey) => void;
};

const VAULT_TABS: { id: PRChartTab; label: string }[] = [
  { id: "threeL", label: "3L" },
  { id: "fourL", label: "4L" },
  { id: "fiveL", label: "5L" },
  { id: "sixL", label: "6L" },
  { id: "sevenL", label: "7L" },
  { id: "sprint", label: "Sprint" },
  { id: "strength", label: "Strength" },
];

const SPRINT_METRICS: SprintChartKey[] = ["tenMeter", "twentyMeter", "thirtyMeter"];
const STRENGTH_METRICS: StrengthChartKey[] = ["bench", "squat", "pullup"];

export default function VaultPRChart({
  vaultHistory,
  sprintHistory,
  strengthHistory,
  selectedTab,
  onTabChange,
  sprintMetric,
  onSprintMetricChange,
  strengthMetric,
  onStrengthMetricChange,
}: VaultPRChartProps) {
  const chartData = buildPRChartData({
    tab: selectedTab,
    vaultHistory,
    sprintHistory,
    strengthHistory,
    sprintMetric,
    strengthMetric,
  });
  const [minPR, maxPR] = getPRChartDomain(selectedTab, chartData);

  return (
    <>
      <div className="mb-4">
        <p className="font-semibold">PR Progression</p>
      </div>

      <div className="mb-3 flex gap-1 overflow-x-auto pb-1">
        {VAULT_TABS.map((tab) => {
          const selected = selectedTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onTabChange(tab.id)}
              className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                selected ? segmentedSelectedClassName : segmentedIdleClassName
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {selectedTab === "sprint" && (
        <div className="mb-3 flex gap-1">
          {SPRINT_METRICS.map((metric) => {
            const selected = sprintMetric === metric;

            return (
              <button
                key={metric}
                type="button"
                aria-pressed={selected}
                onClick={() => onSprintMetricChange(metric)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  selected ? segmentedSelectedClassName : segmentedIdleClassName
                }`}
              >
                {getSprintChartLabel(metric)}
              </button>
            );
          })}
        </div>
      )}

      {selectedTab === "strength" && (
        <div className="mb-3 flex gap-1">
          {STRENGTH_METRICS.map((metric) => {
            const selected = strengthMetric === metric;

            return (
              <button
                key={metric}
                type="button"
                aria-pressed={selected}
                onClick={() => onStrengthMetricChange(metric)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                  selected ? segmentedSelectedClassName : segmentedIdleClassName
                }`}
              >
                {getStrengthChartLabel(metric)}
              </button>
            );
          })}
        </div>
      )}

      {chartData.length < 2 ? (
        <p className="text-muted">
          Log at least two PR entries to display a chart.
        </p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis
                domain={[minPR, maxPR]}
                tickFormatter={(value) =>
                  formatPRChartValue(selectedTab, Number(value), strengthMetric)
                }
                width={72}
              />
              <Tooltip
                formatter={(value) => [
                  formatPRChartValue(selectedTab, Number(value), strengthMetric),
                  "PR",
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="pr"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
