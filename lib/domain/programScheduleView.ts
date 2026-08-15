import { getTodayPlannerDayName } from "@/lib/domain/todayTraining";
import {
  plannerDays,
  type GeneratedWeekSchedule,
} from "@/lib/trainingProgram";

export type ScheduleViewMode = "week" | "day";

export type PlannerDayName = (typeof plannerDays)[number];

export function isPlannerDayName(
  value: string | null | undefined
): value is PlannerDayName {
  return plannerDays.includes(value as PlannerDayName);
}

export function buildProgramDayHref(day: string, week: number): string {
  const params = new URLSearchParams({
    view: "day",
    day,
    week: String(week),
  });

  return `/program?${params.toString()}`;
}

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
