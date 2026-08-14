import { plannerDays, type GeneratedWeekSchedule } from "@/lib/trainingProgram";
import type { WeekScheduleSnapshot } from "@/lib/storage/programStore";

export function getTodayPlannerDayName(date: Date = new Date()): string {
  const todayIndex = (date.getDay() + 6) % 7;
  return plannerDays[todayIndex];
}

export function getTodayWorkoutPlan(
  scheduleSnapshotsByWeek: Record<number, WeekScheduleSnapshot>,
  currentWeek: number,
  date: Date = new Date()
): {
  todayName: string;
  snapshot: WeekScheduleSnapshot | null;
  dailyPlan: GeneratedWeekSchedule[string] | undefined;
} {
  const todayName = getTodayPlannerDayName(date);
  const snapshot = scheduleSnapshotsByWeek[currentWeek] ?? null;
  const dailyPlan = snapshot?.schedule[todayName];

  return { todayName, snapshot, dailyPlan };
}
