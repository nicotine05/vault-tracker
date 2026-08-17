"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PlannerDay, TrainingType } from "@/lib/trainingProgram";
import { workoutCompletionKey } from "@/lib/trainingProgram";
import type { WorkoutExecutionRecord } from "@/lib/domain/types";
import { getCalendarDateForProgramDay, getDefaultCurrentWeekStartDate, shiftWeekStartDate } from "@/lib/domain/calendarUtils";
import {
  clampPlanningWeek,
  generateScheduleSnapshot,
  getDefaultProgramState,
  loadProgramState,
  saveProgramState,
  subscribeProgramState,
  syncProgramWeekToCalendar,
  type ProgramState,
} from "@/lib/storage/programStore";
import { isCoachReadOnly } from "@/lib/sync/readOnly";

export type WorkoutToggleParams = {
  weekNumber: number;
  day: string;
  sessionId: string;
  sessionName: string;
  sessionType: TrainingType;
};

type ProgramStateContextValue = ProgramState & {
  loaded: boolean;
  setCurrentWeek: (week: number) => void;
  setPlanningWeek: (week: number) => void;
  planAhead: (week: number) => void;
  updatePlannerDay: (
    weekNumber: number,
    day: string,
    type: keyof PlannerDay
  ) => void;
  generateWeekSchedule: (weekNumber: number) => void;
  resetWeekPlanner: (weekNumber: number) => void;
  completeWorkout: (params: WorkoutToggleParams) => void;
};

const ProgramStateContext = createContext<ProgramStateContextValue | null>(null);

export function ProgramStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<ProgramState>(getDefaultProgramState);
  const [loaded, setLoaded] = useState(false);
  const skipNextSave = useRef(false);

  useEffect(() => {
    setState(syncProgramWeekToCalendar(loadProgramState()));
    setLoaded(true);

    return subscribeProgramState(() => {
      skipNextSave.current = true;
      setState(syncProgramWeekToCalendar(loadProgramState()));
    });
  }, []);

  useEffect(() => {
    function syncWeekFromCalendar() {
      setState((prev) => {
        const synced = syncProgramWeekToCalendar(prev);
        return synced === prev ? prev : synced;
      });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        syncWeekFromCalendar();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!loaded || skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (isCoachReadOnly()) {
      return;
    }

    saveProgramState(state);
  }, [state, loaded]);

  const setCurrentWeek = useCallback((week: number) => {
    if (isCoachReadOnly()) return;
    setState((prev) => {
      const currentWeek = Math.min(12, Math.max(1, week));
      const weekDelta = currentWeek - prev.currentWeek;
      const anchor =
        prev.currentWeekStartDate || getDefaultCurrentWeekStartDate();

      return {
        ...prev,
        currentWeek,
        currentWeekStartDate: shiftWeekStartDate(anchor, weekDelta),
        planningWeek: clampPlanningWeek(prev.planningWeek, currentWeek),
      };
    });
  }, []);

  const setPlanningWeek = useCallback((week: number) => {
    setState((prev) => ({
      ...prev,
      planningWeek: clampPlanningWeek(week, prev.currentWeek),
    }));
  }, []);

  const planAhead = useCallback((week: number) => {
    if (isCoachReadOnly()) return;
    setState((prev) => ({
      ...prev,
      planningWeek: clampPlanningWeek(week, prev.currentWeek),
    }));
  }, []);

  const updatePlannerDay = useCallback(
    (weekNumber: number, day: string, type: keyof PlannerDay) => {
      if (isCoachReadOnly()) return;
      setState((prev) => {
        if (weekNumber < prev.currentWeek) {
          return prev;
        }

        const weekPlanner = prev.plannerByWeek[weekNumber] ?? {};
        const dayPlanner = weekPlanner[day] ?? {
          vault: false,
          strength: false,
          speed: false,
        };

        return {
          ...prev,
          plannerByWeek: {
            ...prev.plannerByWeek,
            [weekNumber]: {
              ...weekPlanner,
              [day]: {
                ...dayPlanner,
                [type]: !dayPlanner[type],
              },
            },
          },
        };
      });
    },
    []
  );

  const generateWeekSchedule = useCallback((weekNumber: number) => {
    if (isCoachReadOnly()) return;
    setState((prev) => {
      if (weekNumber < prev.currentWeek) {
        return prev;
      }

      const planner = prev.plannerByWeek[weekNumber] ?? {};
      const snapshot = generateScheduleSnapshot(weekNumber, planner);

      return {
        ...prev,
        scheduleSnapshotsByWeek: {
          ...prev.scheduleSnapshotsByWeek,
          [weekNumber]: snapshot,
        },
      };
    });
  }, []);

  const resetWeekPlanner = useCallback((weekNumber: number) => {
    if (isCoachReadOnly()) return;
    setState((prev) => {
      if (weekNumber < prev.currentWeek) {
        return prev;
      }

      const nextSnapshots = { ...prev.scheduleSnapshotsByWeek };
      delete nextSnapshots[weekNumber];

      return {
        ...prev,
        plannerByWeek: {
          ...prev.plannerByWeek,
          [weekNumber]: {},
        },
        scheduleSnapshotsByWeek: nextSnapshots,
      };
    });
  }, []);

  const completeWorkout = useCallback((params: WorkoutToggleParams) => {
    if (isCoachReadOnly()) return;
    const completionKey = workoutCompletionKey(
      params.weekNumber,
      params.day,
      params.sessionId
    );

    setState((prev) => {
      if (prev.completedWorkouts[completionKey]) {
        return prev;
      }

      const scheduledDate = getCalendarDateForProgramDay(
        params.weekNumber,
        params.day,
        prev.currentWeek,
        prev.currentWeekStartDate
      );

      const record: WorkoutExecutionRecord = {
        completionKey,
        weekNumber: params.weekNumber,
        day: params.day,
        sessionId: params.sessionId,
        sessionName: params.sessionName,
        sessionType: params.sessionType,
        completedAt: new Date().toISOString(),
        scheduledDate,
      };

      return {
        ...prev,
        completedWorkouts: {
          ...prev.completedWorkouts,
          [completionKey]: true,
        },
        executionHistory: {
          ...prev.executionHistory,
          [completionKey]: record,
        },
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      loaded,
      setCurrentWeek,
      setPlanningWeek,
      planAhead,
      updatePlannerDay,
      generateWeekSchedule,
      resetWeekPlanner,
      completeWorkout,
    }),
    [
      state,
      loaded,
      setCurrentWeek,
      setPlanningWeek,
      planAhead,
      updatePlannerDay,
      generateWeekSchedule,
      resetWeekPlanner,
      completeWorkout,
    ]
  );

  return (
    <ProgramStateContext.Provider value={value}>
      {children}
    </ProgramStateContext.Provider>
  );
}

export function useProgramStateContext() {
  const context = useContext(ProgramStateContext);
  if (!context) {
    throw new Error(
      "useProgramState must be used within ProgramStateProvider"
    );
  }

  return context;
}
