"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EditWeekPanel from "@/components/program/EditWeekPanel";
import ScheduleDaySection from "@/components/program/ScheduleDaySection";
import ScheduleWeekOverview from "@/components/program/ScheduleWeekOverview";
import type { WorkoutToggleParams } from "@/lib/hooks/useProgramState";
import { getTodayPlannerDayName } from "@/lib/domain/todayTraining";
import {
  getAdjacentPlannerDay,
  getEmptyDailyPlan,
  getInitialScheduleViewDay,
  isPlannerDayName,
  type ScheduleViewMode,
} from "@/lib/domain/programScheduleView";
import {
  plannerDays,
  type GeneratedWeekSchedule,
  type PlannerDay,
  type TrainingType,
} from "@/lib/trainingProgram";
import {
  segmentedIdleClassName,
  segmentedSelectedClassName,
  navButtonClassName,
  todayBadgeClassName,
} from "@/lib/ui/componentStyles";

type GeneratedScheduleCardProps = {
  readOnly: boolean;
  canModifySchedule?: boolean;
  planningWeek: number;
  currentWeek: number;
  generatedSchedule: GeneratedWeekSchedule;
  weekPlanner: Record<string, PlannerDay>;
  completedWorkouts: Record<string, boolean>;
  confirmingKey: string | null;
  onConfirmWorkout: (params: WorkoutToggleParams) => void;
  onSetConfirmingKey: (key: string | null) => void;
  onTogglePlanner: (day: string, type: TrainingType) => void;
  onRegenerate: () => void;
  onReset: () => void;
};

export default function GeneratedScheduleCard({
  readOnly,
  canModifySchedule = true,
  planningWeek,
  currentWeek,
  generatedSchedule,
  weekPlanner,
  completedWorkouts,
  confirmingKey,
  onConfirmWorkout,
  onSetConfirmingKey,
  onTogglePlanner,
  onRegenerate,
  onReset,
}: GeneratedScheduleCardProps) {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("day");
  const [selectedDay, setSelectedDay] = useState(() =>
    getInitialScheduleViewDay(planningWeek, currentWeek, generatedSchedule)
  );
  const [showEditWeek, setShowEditWeek] = useState(false);

  const todayName =
    planningWeek === currentWeek ? getTodayPlannerDayName() : null;
  const isViewingToday = Boolean(todayName && selectedDay === todayName);

  useEffect(() => {
    const view = searchParams.get("view");
    const dayParam = searchParams.get("day");

    if (view === "day" && isPlannerDayName(dayParam)) {
      setViewMode("day");
      setSelectedDay(dayParam);
    }
  }, [searchParams]);

  useEffect(() => {
    setSelectedDay(
      getInitialScheduleViewDay(planningWeek, currentWeek, generatedSchedule)
    );
  }, [planningWeek, currentWeek, generatedSchedule]);

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
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="grid flex-1 grid-cols-2 gap-2">
          {(["day", "week"] as const).map((mode) => {
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
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  selected
                    ? segmentedSelectedClassName
                    : segmentedIdleClassName
                }`}
              >
                {mode === "day" ? "Daily View" : "Weekly View"}
              </button>
            );
          })}
        </div>

        {!readOnly && canModifySchedule && (
          <button
            type="button"
            onClick={() => setShowEditWeek(true)}
            className="shrink-0 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            Edit Week
          </button>
        )}
      </div>

      {viewMode === "day" && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-2">
          <button
            type="button"
            onClick={() =>
              setSelectedDay(getAdjacentPlannerDay(selectedDay, -1))
            }
            disabled={!canGoPrevious}
            className={navButtonClassName}
          >
            ←
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="font-semibold text-foreground">{selectedDay}</p>
              {isViewingToday && (
                <span className={todayBadgeClassName}>Today</span>
              )}
            </div>
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
            className={navButtonClassName}
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
          confirmingKey={confirmingKey}
          onConfirmWorkout={onConfirmWorkout}
          onSetConfirmingKey={onSetConfirmingKey}
        />
      )}

      {showEditWeek && (
        <EditWeekPanel
          readOnly={readOnly}
          planningWeek={planningWeek}
          weekPlanner={weekPlanner}
          onToggle={onTogglePlanner}
          onRegenerate={() => {
            setShowEditWeek(false);
            onRegenerate();
          }}
          onReset={() => {
            setShowEditWeek(false);
            onReset();
          }}
          onClose={() => setShowEditWeek(false)}
        />
      )}
    </div>
  );
}
