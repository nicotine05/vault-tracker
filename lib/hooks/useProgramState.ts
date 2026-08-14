"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlannerDay, TrainingType } from "@/lib/trainingProgram";
import { workoutCompletionKey } from "@/lib/trainingProgram";
import type { WorkoutExecutionRecord } from "@/lib/domain/types";
import { getCalendarDateForProgramDay } from "@/lib/domain/calendarUtils";
import {
  generateScheduleSnapshot,
  getDefaultProgramState,
  loadProgramState,
  saveProgramState,
  subscribeProgramState,
  type ProgramState,
} from "@/lib/storage/programStore";

export type WorkoutToggleParams = {
  weekNumber: number;
  day: string;
  sessionId: string;
  sessionName: string;
  sessionType: TrainingType;
};

export function useProgramState() {
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

    saveProgramState(state);
  }, [state, loaded]);

  const setCurrentWeek = useCallback((week: number) => {
    setState((prev) => ({
      ...prev,
      currentWeek: Math.min(12, Math.max(1, week)),
    }));
  }, []);

  const setSelectedWeek = useCallback((week: number) => {
    setState((prev) => ({
      ...prev,
      selectedWeek: Math.min(12, Math.max(1, week)),
    }));
  }, []);

  const updatePlannerDay = useCallback(
    (weekNumber: number, day: string, type: keyof PlannerDay) => {
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

  const advanceToNextWeek = useCallback(() => {
    setState((prev) => {
      const nextWeek = Math.min(12, prev.currentWeek + 1);
      return {
        ...prev,
        currentWeek: nextWeek,
        selectedWeek: nextWeek,
      };
    });
  }, []);

  const completeWorkout = useCallback((params: WorkoutToggleParams) => {
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

  return {
    ...state,
    loaded,
    setCurrentWeek,
    setSelectedWeek,
    updatePlannerDay,
    generateWeekSchedule,
    resetWeekPlanner,
    advanceToNextWeek,
    completeWorkout,
  };
}
