import {
  normalizeScheduledMeets,
  type ScheduledMeet,
} from "@/lib/domain/meetSchedule";
import { getItem, setItem } from "@/lib/storage/localStore";
import { STORAGE_EVENTS, STORAGE_KEYS } from "@/lib/storage/keys";

export function loadScheduledMeets(): ScheduledMeet[] {
  return normalizeScheduledMeets(getItem<unknown[]>(STORAGE_KEYS.MEET_SCHEDULE, []));
}

export function saveScheduledMeets(meets: ScheduledMeet[]): void {
  setItem(STORAGE_KEYS.MEET_SCHEDULE, normalizeScheduledMeets(meets));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORAGE_EVENTS.MEET_SCHEDULE_CHANGED));
  }
}

export function addScheduledMeet(meet: ScheduledMeet): ScheduledMeet[] {
  const next = [...loadScheduledMeets(), meet];
  saveScheduledMeets(next);
  return next;
}

export function deleteScheduledMeet(meetId: string): ScheduledMeet[] {
  const next = loadScheduledMeets().filter((meet) => meet.id !== meetId);
  saveScheduledMeets(next);
  return next;
}
