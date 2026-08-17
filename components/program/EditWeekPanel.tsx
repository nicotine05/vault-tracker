"use client";

import WeeklyPlannerCard from "@/components/program/WeeklyPlannerCard";
import type { PlannerDay } from "@/lib/trainingProgram";
import type { TrainingType } from "@/lib/trainingProgram";

type EditWeekPanelProps = {
  readOnly: boolean;
  weekPlanner: Record<string, PlannerDay>;
  onToggle: (day: string, type: TrainingType) => void;
  onRegenerate: () => void;
  onReset: () => void;
  onClose: () => void;
  canRegenerate: boolean;
};

export default function EditWeekPanel({
  readOnly,
  weekPlanner,
  onToggle,
  onRegenerate,
  onReset,
  onClose,
  canRegenerate,
}: EditWeekPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-t-2xl border border-border bg-surface shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-lg font-bold text-foreground">Edit Week</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-muted transition hover:bg-surface-muted hover:text-foreground"
          >
            Done
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <WeeklyPlannerCard
            readOnly={readOnly}
            weekPlanner={weekPlanner}
            onToggle={onToggle}
          />

          {!readOnly && (
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={onRegenerate}
                disabled={!canRegenerate}
                className="w-full rounded-xl bg-accent p-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Regenerate Schedule
              </button>

              <button
                type="button"
                onClick={onReset}
                className="w-full rounded-xl border border-border bg-surface p-2.5 text-sm text-muted transition hover:bg-surface-muted"
              >
                Reset Week
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
