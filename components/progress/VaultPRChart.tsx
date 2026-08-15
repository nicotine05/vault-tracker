"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildVaultPRChartData,
  getVaultPRChartDomain,
  type VaultRunChartKey,
} from "@/lib/domain/vaultProgress";
import type { HeightPREntry } from "@/lib/domain/types";
import { metersToFeetInches } from "@/lib/domain/vaultUnits";

type VaultPRChartProps = {
  prHistory: HeightPREntry[];
  selectedRun: VaultRunChartKey;
  onRunChange: (run: VaultRunChartKey) => void;
};

export default function VaultPRChart({
  prHistory,
  selectedRun,
  onRunChange,
}: VaultPRChartProps) {
  const chartData = buildVaultPRChartData(prHistory, selectedRun);
  const [minPR, maxPR] = getVaultPRChartDomain(chartData);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold">Vault PR Progression</p>

        <select
          value={selectedRun}
          onChange={(event) =>
            onRunChange(event.target.value as VaultRunChartKey)
          }
          className="rounded-lg border px-2 py-1"
        >
          <option value="threeL">3L</option>
          <option value="fourL">4L</option>
          <option value="fiveL">5L</option>
          <option value="sixL">6L</option>
          <option value="sevenL">7L</option>
        </select>
      </div>

      {chartData.length < 2 ? (
        <p className="text-gray-500">
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
                  metersToFeetInches(Number(value))
                }
              />
              <Tooltip
                formatter={(value) => [
                  metersToFeetInches(Number(value)),
                  "PR",
                ]}
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
