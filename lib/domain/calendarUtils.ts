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
