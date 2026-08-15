"use client";

import Card from "@/components/Card";
import {
  computeWeightStats,
  formatWeightDelta,
} from "@/lib/domain/weightStats";
import type { WeightEntry } from "@/lib/domain/types";

type WeightSummaryCardProps = {
  weightHistory: WeightEntry[];
  readOnly?: boolean;
  compact?: boolean;
  showEditor?: boolean;
  newWeight?: string;
  onToggleEditor?: () => void;
  onNewWeightChange?: (value: string) => void;
  onSave?: () => void;
};

export default function WeightSummaryCard({
  weightHistory,
  readOnly = false,
  showEditor,
  newWeight,
  onToggleEditor,
  onNewWeightChange,
  onSave,
  compact = false,
}: WeightSummaryCardProps) {
  const { currentWeight, dailyChange, monthlyChange, previousDate } =
    computeWeightStats(weightHistory);

  const content = (
    <>
      <p className="text-sm text-gray-500">Current Weight</p>

      <p className={compact ? "text-3xl font-bold" : "text-3xl font-bold"}>
        {currentWeight}
        {currentWeight !== "--" ? " lbs" : ""}
      </p>

      <div className="mt-1 space-y-1">
        {dailyChange !== null && (
          <p
            className={`text-sm font-medium ${
              dailyChange > 0
                ? "text-green-600"
                : dailyChange < 0
                  ? "text-red-600"
                  : "text-gray-500"
            }`}
          >
            {formatWeightDelta(dailyChange)}
            lbs since {previousDate}
          </p>
        )}

        {monthlyChange !== null && (
          <p
            className={`text-sm font-medium ${
              monthlyChange > 0
                ? "text-green-600"
                : monthlyChange < 0
                  ? "text-red-600"
                  : "text-gray-500"
            }`}
          >
            {monthlyChange > 0 ? "+" : ""}
            {monthlyChange.toFixed(1)}
            lbs (30d)
          </p>
        )}
      </div>

      {!readOnly && onToggleEditor && (
        <button
          type="button"
          onClick={onToggleEditor}
          className="mt-3 w-full rounded-xl bg-blue-500 py-2 text-sm font-medium text-white"
        >
          Update Weight
        </button>
      )}

      {showEditor && !readOnly && onNewWeightChange && onSave && (
        <div className="mt-3 space-y-2">
          <input
            type="number"
            step="0.1"
            value={newWeight ?? ""}
            onChange={(event) => onNewWeightChange(event.target.value)}
            placeholder="182.4"
            className="w-full rounded-xl border p-2"
          />

          <button
            type="button"
            onClick={onSave}
            className="w-full rounded-xl bg-green-500 py-2 text-white"
          >
            Save
          </button>
        </div>
      )}
    </>
  );

  if (compact) {
    return content;
  }

  return <Card className="mb-4">{content}</Card>;
}
