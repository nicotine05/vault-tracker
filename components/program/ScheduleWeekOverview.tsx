"use client";

import { getTodayPlannerDayName } from "@/lib/domain/todayTraining";
import {
  getTrafficLightSymbol,
  plannerDays,
  workoutCompletionKey,
  type GeneratedWeekSchedule,
} from "@/lib/trainingProgram";
import { trafficStyles } from "@/lib/ui/trainingStyles";
import {
  todayBadgeClassName,
  todayCardClassName,
} from "@/lib/ui/componentStyles";

type ScheduleWeekOverviewProps = {
  planningWeek: number;
  currentWeek: number;
  generatedSchedule: GeneratedWeekSchedule;
  completedWorkouts: Record<string, boolean>;
  onSelectDay: (day: string) => void;
};

function getDayAbbreviation(day: string): string {
  return day.slice(0, 3).toUpperCase();
}

function getDayCompletionCount(
  day: string,
  planningWeek: number,
  generatedSchedule: GeneratedWeekSchedule,
  completedWorkouts: Record<string, boolean>
): { completed: number; total: number } {
  const sessions = generatedSchedule[day]?.sessions ?? [];
  const completed = sessions.filter((session) =>
    Boolean(
      completedWorkouts[
        workoutCompletionKey(planningWeek, day, session.id)
      ]
    )
  ).length;

  return { completed, total: sessions.length };
}

export default function ScheduleWeekOverview({
  planningWeek,
  currentWeek,
  generatedSchedule,
  completedWorkouts,
  onSelectDay,
}: ScheduleWeekOverviewProps) {
  const todayName =
    planningWeek === currentWeek ? getTodayPlannerDayName() : null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {plannerDays.map((day) => {
        const dailyPlan = generatedSchedule[day];
        const sessions = dailyPlan?.sessions ?? [];
        const isRestDay = sessions.length === 0;
        const isToday = day === todayName;
        const { completed, total } = getDayCompletionCount(
          day,
          planningWeek,
          generatedSchedule,
          completedWorkouts
        );
        const allComplete = total > 0 && completed === total;

        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelectDay(day)}
            className={`rounded-2xl border p-3 text-left transition hover:shadow-sm ${
              isRestDay
                ? "border-border/70 bg-surface-muted/60 [data-theme=dark]:border-border/30 [data-theme=dark]:bg-surface-muted/20"
                : isToday
                  ? todayCardClassName
                  : allComplete
                    ? "border-emerald-300/50 bg-emerald-500/5 [data-theme=dark]:border-emerald-500/30"
                    : "border-border bg-surface hover:bg-surface-muted"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold tracking-wider text-muted">
                    {getDayAbbreviation(day)}
                  </p>
                  {isToday && (
                    <span className={todayBadgeClassName}>Today</span>
                  )}
                </div>

                {isRestDay ? (
                  <p className="mt-2 text-sm font-medium text-muted">Rest</p>
                ) : (
                  <>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                      {sessions[0]?.name}
                      {sessions.length > 1 ? ` +${sessions.length - 1}` : ""}
                    </p>
                    <p className="mt-1.5 text-[10px] font-medium text-muted">
                      {total} workout{total === 1 ? "" : "s"}
                      {allComplete
                        ? " • Done"
                        : completed > 0
                          ? ` • ${completed}/${total}`
                          : ""}
                    </p>
                  </>
                )}
              </div>

              {!isRestDay && dailyPlan && (
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${trafficStyles[dailyPlan.level]}`}
                >
                  {getTrafficLightSymbol(dailyPlan.level)}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
