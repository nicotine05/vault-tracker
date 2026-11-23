export type ScheduledMeet = {
  id: string;
  name: string;
  dateKey: string;
  location: string;
  startTime: string;
  createdAt: string;
};

export type MeetFormValues = {
  name: string;
  dateKey: string;
  location: string;
  startTime: string;
};

export const EMPTY_MEET_FORM: MeetFormValues = {
  name: "",
  dateKey: "",
  location: "",
  startTime: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Accept YYYY-MM-DD only. */
export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && toDateKeyFromLocalDate(date) === value;
}

/** Accept HH:mm (24h). */
export function isValidStartTime(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export function toDateKeyFromLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createMeetId(): string {
  return `meet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeScheduledMeet(value: unknown): ScheduledMeet | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = isNonEmptyString(value.name) ? value.name.trim() : "";
  const dateKey = isNonEmptyString(value.dateKey) ? value.dateKey.trim() : "";
  const location = isNonEmptyString(value.location)
    ? value.location.trim()
    : "";
  const startTime = isNonEmptyString(value.startTime)
    ? value.startTime.trim()
    : "";
  const id = isNonEmptyString(value.id) ? value.id.trim() : "";
  const createdAt = isNonEmptyString(value.createdAt)
    ? value.createdAt
    : new Date().toISOString();

  if (
    !id ||
    !name ||
    !location ||
    !isValidDateKey(dateKey) ||
    !isValidStartTime(startTime)
  ) {
    return null;
  }

  return {
    id,
    name,
    dateKey,
    location,
    startTime,
    createdAt,
  };
}

export function normalizeScheduledMeets(value: unknown): ScheduledMeet[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeScheduledMeet)
    .filter((meet): meet is ScheduledMeet => meet !== null);
}

export function createScheduledMeet(form: MeetFormValues): ScheduledMeet | null {
  const name = form.name.trim();
  const dateKey = form.dateKey.trim();
  const location = form.location.trim();
  const startTime = form.startTime.trim();

  if (
    !name ||
    !location ||
    !isValidDateKey(dateKey) ||
    !isValidStartTime(startTime)
  ) {
    return null;
  }

  return {
    id: createMeetId(),
    name,
    dateKey,
    location,
    startTime,
    createdAt: new Date().toISOString(),
  };
}

export function sortMeetsByDate(meets: ScheduledMeet[]): ScheduledMeet[] {
  return [...meets].sort((a, b) => {
    const byDate = a.dateKey.localeCompare(b.dateKey);
    if (byDate !== 0) {
      return byDate;
    }

    const byTime = a.startTime.localeCompare(b.startTime);
    if (byTime !== 0) {
      return byTime;
    }

    return a.name.localeCompare(b.name);
  });
}

export function getMeetsForDateKey(
  meets: ScheduledMeet[],
  dateKey: string,
): ScheduledMeet[] {
  return sortMeetsByDate(meets.filter((meet) => meet.dateKey === dateKey));
}

export function formatMeetDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateKey;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMeetTimeLabel(startTime: string): string {
  const [hoursRaw, minutesRaw] = startTime.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return startTime;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function partitionMeetsByTiming(
  meets: ScheduledMeet[],
  todayKey: string = toDateKeyFromLocalDate(new Date()),
): { upcoming: ScheduledMeet[]; past: ScheduledMeet[] } {
  const sorted = sortMeetsByDate(meets);
  const upcoming: ScheduledMeet[] = [];
  const past: ScheduledMeet[] = [];

  for (const meet of sorted) {
    if (meet.dateKey >= todayKey) {
      upcoming.push(meet);
    } else {
      past.push(meet);
    }
  }

  return {
    upcoming,
    past: past.reverse(),
  };
}
