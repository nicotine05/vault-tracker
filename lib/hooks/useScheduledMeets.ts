"use client";

import { useCallback, useEffect, useState } from "react";
import type { ScheduledMeet } from "@/lib/domain/meetSchedule";
import { STORAGE_EVENTS } from "@/lib/storage/keys";
import {
  addScheduledMeet,
  deleteScheduledMeet,
  loadScheduledMeets,
} from "@/lib/storage/meetStore";

export function useScheduledMeets() {
  const [meets, setMeets] = useState<ScheduledMeet[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setMeets(loadScheduledMeets());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();

    const onChange = () => refresh();
    window.addEventListener(STORAGE_EVENTS.MEET_SCHEDULE_CHANGED, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(STORAGE_EVENTS.MEET_SCHEDULE_CHANGED, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  const addMeet = useCallback((meet: ScheduledMeet) => {
    setMeets(addScheduledMeet(meet));
  }, []);

  const removeMeet = useCallback((meetId: string) => {
    setMeets(deleteScheduledMeet(meetId));
  }, []);

  return {
    meets,
    ready,
    addMeet,
    removeMeet,
    refresh,
  };
}
