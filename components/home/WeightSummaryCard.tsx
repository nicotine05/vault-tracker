"use client";

import Card from "@/components/Card";
import {
  computeWeightStats,
  formatWeightDelta,
} from "@/lib/domain/weightStats";
import type { WeightEntry } from "@/lib/domain/types";
import {
  fieldClassNameSm,
  negativeDeltaClassName,
  positiveDeltaClassName,
  primaryButtonClassNameSm,
} from "@/lib/ui/componentStyles";

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
      <p className="text-sm text-muted">Current Weight</p>

      <p className={compact ? "text-3xl font-bold" : "text-3xl font-bold"}>
        {currentWeight}
        {currentWeight !== "--" ? " lbs" : ""}
      </p>

      <div className="mt-1 space-y-1">
        {dailyChange !== null && (
          <p
            className={`text-sm font-medium ${
              dailyChange > 0
                ? positiveDeltaClassName
                : dailyChange < 0
                  ? negativeDeltaClassName
                  : "text-muted"
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
                ? positiveDeltaClassName
                : monthlyChange < 0
                  ? negativeDeltaClassName
                  : "text-muted"
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
          className={`mt-3 ${primaryButtonClassNameSm}`}
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
            className={fieldClassNameSm}
          />

          <button
            type="button"
            onClick={onSave}
            className={primaryButtonClassNameSm}
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
