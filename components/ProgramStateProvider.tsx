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
import { getCalendarDateForProgramDay } from "@/lib/domain/calendarUtils";
import {
  clampPlanningWeek,
  generateScheduleSnapshot,
  getDefaultProgramState,
  loadProgramState,
  saveProgramState,
  subscribeProgramState,
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
  advanceToNextWeek: () => void;
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
    setState(loadProgramState());
    setLoaded(true);

    return subscribeProgramState(() => {
      skipNextSave.current = true;
      setState(loadProgramState());
    });
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
      return {
        ...prev,
        currentWeek,
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

  const advanceToNextWeek = useCallback(() => {
    if (isCoachReadOnly()) return;
    setState((prev) => {
      const nextWeek = Math.min(12, prev.currentWeek + 1);
      return {
        ...prev,
        currentWeek: nextWeek,
        planningWeek: nextWeek,
      };
    });
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
        prev.currentWeek
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
      advanceToNextWeek,
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
      advanceToNextWeek,
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
