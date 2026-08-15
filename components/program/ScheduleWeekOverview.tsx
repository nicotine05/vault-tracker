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
  linkTextClassName,
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
    <div className="space-y-2">
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
            className={`w-full rounded-xl border p-3 text-left transition hover:shadow-sm ${
              isRestDay
                ? "border-border/70 bg-surface-muted/60 hover:bg-surface-muted/80 [data-theme=dark]:border-border/30 [data-theme=dark]:bg-surface-muted/20 [data-theme=dark]:hover:bg-surface-muted/30"
                : isToday
                  ? todayCardClassName
                  : "border-border bg-surface hover:bg-surface-muted"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{day}</p>
                  {isToday && (
                    <span className={todayBadgeClassName}>
                      Today
                    </span>
                  )}
                </div>

                {isRestDay ? (
                  <p className="mt-1 text-sm text-muted [data-theme=dark]:text-muted/60">
                    Recovery day
                  </p>
                ) : (
                  <>
                    <p className="mt-1 truncate text-sm text-foreground">
                      {sessions.map((session) => session.name).join(" • ")}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {total} workout{total === 1 ? "" : "s"}
                      {allComplete
                        ? " • Complete"
                        : completed > 0
                          ? ` • ${completed}/${total} done`
                          : ""}
                    </p>
                  </>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                {!isRestDay && dailyPlan && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${trafficStyles[dailyPlan.level]}`}
                  >
                    {getTrafficLightSymbol(dailyPlan.level)}
                  </span>
                )}
                <span
                  className={`text-xs font-medium ${
                    isRestDay
                      ? "text-muted/80 [data-theme=dark]:text-muted/50"
                      : linkTextClassName
                  }`}
                >
                  Open →
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
