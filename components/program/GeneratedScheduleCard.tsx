"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Card from "@/components/Card";
import ScheduleDaySection from "@/components/program/ScheduleDaySection";
import ScheduleWeekOverview from "@/components/program/ScheduleWeekOverview";
import type { WorkoutToggleParams } from "@/lib/hooks/useProgramState";
import {
  getAdjacentPlannerDay,
  getEmptyDailyPlan,
  getInitialScheduleViewDay,
  isPlannerDayName,
  type ScheduleViewMode,
} from "@/lib/domain/programScheduleView";
import { plannerDays, type GeneratedWeekSchedule } from "@/lib/trainingProgram";

type GeneratedScheduleCardProps = {
  readOnly: boolean;
  planningWeek: number;
  currentWeek: number;
  generatedSchedule: GeneratedWeekSchedule;
  completedWorkouts: Record<string, boolean>;
  expandedWorkouts: Record<string, boolean>;
  confirmingKey: string | null;
  onToggleExpanded: (key: string) => void;
  onConfirmWorkout: (params: WorkoutToggleParams) => void;
  onSetConfirmingKey: (key: string | null) => void;
  onReset: () => void;
};

export default function GeneratedScheduleCard({
  readOnly,
  planningWeek,
  currentWeek,
  generatedSchedule,
  completedWorkouts,
  expandedWorkouts,
  confirmingKey,
  onToggleExpanded,
  onConfirmWorkout,
  onSetConfirmingKey,
  onReset,
}: GeneratedScheduleCardProps) {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("week");
  const [selectedDay, setSelectedDay] = useState(() =>
    getInitialScheduleViewDay(planningWeek, currentWeek, generatedSchedule)
  );

  useEffect(() => {
    const view = searchParams.get("view");
    const dayParam = searchParams.get("day");

    if (view === "day" && isPlannerDayName(dayParam)) {
      setViewMode("day");
      setSelectedDay(dayParam);
      return;
    }

    setViewMode("week");
    setSelectedDay(
      getInitialScheduleViewDay(planningWeek, currentWeek, generatedSchedule)
    );
  }, [planningWeek, currentWeek, generatedSchedule, searchParams]);

  const canGoPrevious = selectedDay !== plannerDays[0];
  const canGoNext = selectedDay !== plannerDays[plannerDays.length - 1];
  const selectedDailyPlan =
    generatedSchedule[selectedDay] ?? getEmptyDailyPlan();

  function openDailyView(day: string) {
    setSelectedDay(day);
    setViewMode("day");
    onSetConfirmingKey(null);
  }

  return (
    <div className="mt-4">
      <Card title="Generated Schedule">
        <div className="mb-4 grid grid-cols-2 gap-2">
          {(["week", "day"] as const).map((mode) => {
            const selected = viewMode === mode;

            return (
              <button
                key={mode}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  onSetConfirmingKey(null);
                  setViewMode(mode);
                }}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition ${
                  selected
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-border bg-surface text-foreground hover:bg-surface-muted"
                }`}
              >
                {mode === "week" ? "Weekly View" : "Daily View"}
              </button>
            );
          })}
        </div>

        {viewMode === "day" && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface p-2">
            <button
              type="button"
              onClick={() =>
                setSelectedDay(getAdjacentPlannerDay(selectedDay, -1))
              }
              disabled={!canGoPrevious}
              className="rounded-lg border px-3 py-1 disabled:opacity-40"
            >
              ←
            </button>

            <div className="text-center">
              <p className="font-semibold text-foreground">{selectedDay}</p>
              <p className="text-xs text-muted">
                {selectedDailyPlan.sessions.length} workout
                {selectedDailyPlan.sessions.length === 1 ? "" : "s"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedDay(getAdjacentPlannerDay(selectedDay, 1))
              }
              disabled={!canGoNext}
              className="rounded-lg border px-3 py-1 disabled:opacity-40"
            >
              →
            </button>
          </div>
        )}

        {viewMode === "week" ? (
          <ScheduleWeekOverview
            planningWeek={planningWeek}
            currentWeek={currentWeek}
            generatedSchedule={generatedSchedule}
            completedWorkouts={completedWorkouts}
            onSelectDay={openDailyView}
          />
        ) : (
          <ScheduleDaySection
            day={selectedDay}
            planningWeek={planningWeek}
            dailyPlan={selectedDailyPlan}
            readOnly={readOnly}
            completedWorkouts={completedWorkouts}
            expandedWorkouts={expandedWorkouts}
            confirmingKey={confirmingKey}
            onToggleExpanded={onToggleExpanded}
            onConfirmWorkout={onConfirmWorkout}
            onSetConfirmingKey={onSetConfirmingKey}
          />
        )}
      </Card>

      {!readOnly && (
        <button
          type="button"
          onClick={onReset}
          className="mt-3 w-full rounded-xl border border-border bg-surface p-2 text-sm text-muted"
        >
          Reset
        </button>
      )}
    </div>
  );
}
