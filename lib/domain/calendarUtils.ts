export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDayName(date: Date): string {
  const weekday = date.getDay();

  if (weekday === 0) return "Sunday";
  if (weekday === 1) return "Monday";
  if (weekday === 2) return "Tuesday";
  if (weekday === 3) return "Wednesday";
  if (weekday === 4) return "Thursday";
  if (weekday === 5) return "Friday";
  return "Saturday";
}

export function getCalendarWeekStart(date: Date): Date {
  const start = new Date(date);
  const dayOffset = (date.getDay() + 6) % 7;
  start.setDate(date.getDate() - dayOffset);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getWeekDateKeys(weekStart: Date): string[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return toLocalDateKey(date);
  });
}

const programDayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** Maps a program week + day (e.g. Week 3, Tuesday) to a real calendar date. */
export function getCalendarDateForProgramDay(
  weekNumber: number,
  dayName: string,
  currentWeek: number,
  anchorDate: Date = new Date()
): string {
  const weekStart = getCalendarWeekStart(anchorDate);
  const weekOffset = weekNumber - currentWeek;
  const dayIndex = programDayNames.indexOf(
    dayName as (typeof programDayNames)[number]
  );

  if (dayIndex === -1) {
    return toLocalDateKey(anchorDate);
  }

  const date = new Date(weekStart);
  date.setDate(weekStart.getDate() + weekOffset * 7 + dayIndex);
  return toLocalDateKey(date);
}

export function getRecordCalendarDate(
  record: { scheduledDate?: string; weekNumber: number; day: string; completedAt: string },
  currentWeek: number
): string {
  if (record.scheduledDate) {
    return record.scheduledDate;
  }

  return getCalendarDateForProgramDay(
    record.weekNumber,
    record.day,
    currentWeek
  );
}

const programDayNamesList = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** Collect scheduled sessions from current week through plan-ahead weeks for one calendar date. */
export function getScheduledSessionsForDate(
  dateKey: string,
  currentWeek: number,
  schedulesByWeek: Record<number, Record<string, { sessions: Array<{ id: string; type: string; name: string; load: number; focus?: string; jumpVolume?: string }> }> | undefined>,
  maxPlanAhead: number = 3
): Array<{ id: string; type: string; name: string; load: number; focus?: string; jumpVolume?: string; weekNumber: number }> {
  const results: Array<{
    id: string;
    type: string;
    name: string;
    load: number;
    focus?: string;
    jumpVolume?: string;
    weekNumber: number;
  }> = [];
  const seen = new Set<string>();

  for (
    let week = currentWeek;
    week <= Math.min(12, currentWeek + maxPlanAhead);
    week += 1
  ) {
    const schedule = schedulesByWeek[week];
    if (!schedule) continue;

    for (const dayName of programDayNamesList) {
      const programDate = getCalendarDateForProgramDay(
        week,
        dayName,
        currentWeek
      );
      if (programDate !== dateKey) continue;

      const daily = schedule[dayName];
      if (!daily?.sessions) continue;

      for (const session of daily.sessions) {
        const key = `${week}-${session.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push({ ...session, weekNumber: week });
      }
    }
  }

  return results;
}
