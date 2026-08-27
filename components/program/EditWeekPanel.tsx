"use client";

import TargetIndicators from "@/components/program/TargetIndicators";
import WeeklyPlannerCard from "@/components/program/WeeklyPlannerCard";
import {
  countPlannerSessions,
  getPlannerHealthMetrics,
  isPlannerComplete,
} from "@/lib/domain/plannerHealth";
import type { PlannerDay } from "@/lib/trainingProgram";
import type { TrainingType } from "@/lib/trainingProgram";

type EditWeekPanelProps = {
  readOnly: boolean;
  planningWeek: number;
  weekPlanner: Record<string, PlannerDay>;
  onToggle: (day: string, type: TrainingType) => void;
  onRegenerate: () => void;
  onReset: () => void;
  onClose: () => void;
};

export default function EditWeekPanel({
  readOnly,
  planningWeek,
  weekPlanner,
  onToggle,
  onRegenerate,
  onReset,
  onClose,
}: EditWeekPanelProps) {
  const counts = countPlannerSessions(weekPlanner);
  const plannerComplete = isPlannerComplete(counts, planningWeek);
  const healthMetrics = getPlannerHealthMetrics(counts, planningWeek);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="flex w-full max-w-md flex-col rounded-t-2xl border border-border bg-surface shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-base font-bold text-foreground">Edit Week</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-muted transition hover:bg-surface-muted hover:text-foreground"
          >
            Done
          </button>
        </div>

        <div className="px-3 py-3">
          <TargetIndicators metrics={healthMetrics} />

          <div className="mt-3">
            <WeeklyPlannerCard
              compact
              readOnly={readOnly}
              weekPlanner={weekPlanner}
              onToggle={onToggle}
            />
          </div>
        </div>

        {!readOnly && (
          <div className="space-y-2 border-t border-border px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onRegenerate}
              disabled={!plannerComplete}
              className="w-full rounded-xl bg-accent p-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Regenerate Schedule
            </button>

            {!plannerComplete && (
              <p className="text-center text-xs text-muted">
                Meet all session targets above to regenerate.
              </p>
            )}

            <button
              type="button"
              onClick={onReset}
              className="w-full rounded-xl border border-border bg-surface p-2 text-sm text-muted transition hover:bg-surface-muted"
            >
              Reset Week
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
