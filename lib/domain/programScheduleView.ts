import { getTodayPlannerDayName } from "@/lib/domain/todayTraining";
import {
  plannerDays,
  type GeneratedWeekSchedule,
} from "@/lib/trainingProgram";

export type ScheduleViewMode = "week" | "day";

export function getInitialScheduleViewDay(
  planningWeek: number,
  currentWeek: number,
  generatedSchedule: GeneratedWeekSchedule
): string {
  if (planningWeek === currentWeek) {
    return getTodayPlannerDayName();
  }

  const firstScheduledDay = plannerDays.find(
    (day) => (generatedSchedule[day]?.sessions.length ?? 0) > 0
  );

  return firstScheduledDay ?? plannerDays[0];
}

export function getAdjacentPlannerDay(
  day: string,
  direction: -1 | 1
): string {
  const currentIndex = plannerDays.indexOf(day as (typeof plannerDays)[number]);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const nextIndex = Math.max(
    0,
    Math.min(plannerDays.length - 1, safeIndex + direction)
  );

  return plannerDays[nextIndex];
}

export function getEmptyDailyPlan() {
  return {
    sessions: [],
    load: 0,
    level: "Green" as const,
  };
}
