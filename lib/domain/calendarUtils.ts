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

export function getDefaultCurrentWeekStartDate(date: Date = new Date()): string {
  return toLocalDateKey(getCalendarWeekStart(date));
}

export function shiftWeekStartDate(
  weekStartDate: string,
  weekDelta: number
): string {
  const date = new Date(`${weekStartDate}T00:00:00`);
  date.setDate(date.getDate() + weekDelta * 7);
  return toLocalDateKey(date);
}

export function getCalendarWeeksElapsed(
  weekStartDate: string,
  fromDate: Date = new Date()
): number {
  const programWeekStart = new Date(`${weekStartDate}T00:00:00`);
  const todayWeekStart = getCalendarWeekStart(fromDate);
  const diffMs = todayWeekStart.getTime() - programWeekStart.getTime();

  if (diffMs <= 0) {
    return 0;
  }

  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
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
  currentWeekStartDate?: string
): string {
  const weekStart = currentWeekStartDate
    ? new Date(`${currentWeekStartDate}T00:00:00`)
    : getCalendarWeekStart(new Date());
  const weekOffset = weekNumber - currentWeek;
  const dayIndex = programDayNames.indexOf(
    dayName as (typeof programDayNames)[number]
  );

  if (dayIndex === -1) {
    return toLocalDateKey(new Date());
  }

  const date = new Date(weekStart);
  date.setDate(weekStart.getDate() + weekOffset * 7 + dayIndex);
  return toLocalDateKey(date);
}

export function getRecordCalendarDate(
  record: { scheduledDate?: string; weekNumber: number; day: string; completedAt: string },
  currentWeek: number,
  currentWeekStartDate?: string
): string {
  if (record.scheduledDate) {
    return record.scheduledDate;
  }

  return getCalendarDateForProgramDay(
    record.weekNumber,
    record.day,
    currentWeek,
    currentWeekStartDate
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
  maxPlanAhead: number = 3,
  currentWeekStartDate?: string
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
  const weeksToCheck = new Set<number>();

  for (
    let week = currentWeek;
    week <= Math.min(12, currentWeek + maxPlanAhead);
    week += 1
  ) {
    weeksToCheck.add(week);
  }

  for (const weekKey of Object.keys(schedulesByWeek ?? {})) {
    const week = Number(weekKey);
    if (Number.isFinite(week) && week >= currentWeek) {
      weeksToCheck.add(week);
    }
  }

  for (const week of weeksToCheck) {
    const schedule = schedulesByWeek?.[week];
    if (!schedule) continue;

    for (const dayName of programDayNamesList) {
      const programDate = getCalendarDateForProgramDay(
        week,
        dayName,
        currentWeek,
        currentWeekStartDate
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
